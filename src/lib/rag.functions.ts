import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { embed, chatStream, parseSSEDeltas } from "./ai-gateway.server";

// Chunk text by ~1000 chars with overlap
function chunkText(text: string, size = 1000, overlap = 150): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    out.push(clean.slice(i, i + size));
    i += size - overlap;
  }
  return out;
}

export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { documentId: string }) => z.object({ documentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc, error: docErr } = await supabase
      .from("documents").select("*").eq("id", data.documentId).single();
    if (docErr || !doc) throw new Error("Document not found");

    try {
      const { data: file, error: dlErr } = await supabase.storage.from("pdfs").download(doc.file_path);
      if (dlErr || !file) throw new Error(dlErr?.message ?? "Download failed");
      const buf = new Uint8Array(await file.arrayBuffer());

      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(buf);
      const { text, totalPages } = await extractText(pdf, { mergePages: false });
      const pages = Array.isArray(text) ? text : [text];
      const fullText = pages.map((t) => (t ?? "").trim()).join("\n\n").trim();

      if (!fullText || fullText.length < 20) {
        throw new Error(
          "This PDF has no extractable text. It looks like a scanned or image-only document. Please upload a text-based PDF (one where you can select text in a viewer).",
        );
      }

      const chunks = chunkText(fullText);
      if (!chunks.length) throw new Error("No text extracted from PDF");

      // Batch embed in groups of 50
      const rows: { document_id: string; user_id: string; chunk_index: number; content: string; embedding: string }[] = [];
      for (let i = 0; i < chunks.length; i += 50) {
        const batch = chunks.slice(i, i + 50);
        const vecs = await embed(batch);
        batch.forEach((content, j) => {
          rows.push({
            document_id: doc.id,
            user_id: userId,
            chunk_index: i + j,
            content,
            embedding: `[${vecs[j].join(",")}]`,
          });
        });
      }
      const { error: insErr } = await supabase.from("document_chunks").insert(rows);
      if (insErr) throw insErr;

      await supabase.from("documents")
        .update({ status: "ready", page_count: totalPages })
        .eq("id", doc.id);
      return { ok: true, chunks: rows.length };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabase.from("documents").update({ status: "failed", error: msg }).eq("id", doc.id);
      throw new Error(msg);
    }
  });

export const askDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { documentId: string; conversationId: string; question: string }) =>
    z.object({
      documentId: z.string().uuid(),
      conversationId: z.string().uuid(),
      question: z.string().min(1).max(2000),
    }).parse(d),
  )
  .handler(async function* ({ data, context }) {
    const { supabase, userId } = context;

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "user",
      content: data.question,
    });

    // Embed question + retrieve
    const [qVec] = await embed([data.question]);
    const { data: matches, error: mErr } = await supabase.rpc("match_document_chunks", {
      query_embedding: `[${qVec.join(",")}]` as unknown as string,
      match_document_id: data.documentId,
      match_count: 6,
    });
    if (mErr) throw mErr;

    const context_text = (matches ?? [])
      .map((m: { content: string; page: number | null; chunk_index: number }, i: number) =>
        `[#${i + 1}${m.page ? ` p.${m.page}` : ""}] ${m.content}`,
      )
      .join("\n\n");

    const system = `You are StudyMate AI, a precise study tutor. Answer ONLY using the provided context from the student's document. If the answer is not in the context, say "I couldn't find that in your uploaded material." Cite sources inline as [#1], [#2] matching the context blocks. Be clear, structured, and use markdown.`;

    const userPrompt = `CONTEXT:\n${context_text || "(no context)"}\n\nQUESTION: ${data.question}`;

    const res = await chatStream({
      system,
      messages: [{ role: "user", content: userPrompt }],
    });

    let buffer = "";
    const decoder = new TextDecoder();
    let pending = "";
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      pending += decoder.decode(chunk, { stream: true });
      const lastNl = pending.lastIndexOf("\n");
      if (lastNl === -1) continue;
      const ready = pending.slice(0, lastNl);
      pending = pending.slice(lastNl + 1);
      for (const delta of parseSSEDeltas(ready)) {
        buffer += delta;
        yield { delta };
      }
    }
    if (pending) for (const delta of parseSSEDeltas(pending)) { buffer += delta; yield { delta }; }

    await supabase.from("messages").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "assistant",
      content: buffer,
      citations: matches ?? [],
    });
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", data.conversationId);
  });
