// Server-only helper for Lovable AI Gateway calls.
const BASE = "https://ai.gateway.lovable.dev/v1";

function key() {
  const k = process.env.LOVABLE_API_KEY;
  if (!k) throw new Error("Missing LOVABLE_API_KEY");
  return k;
}

export async function embed(texts: string[]): Promise<number[][]> {
  const res = await fetch(`${BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key()}`,
    },
    body: JSON.stringify({
      model: "openai/text-embedding-3-small",
      input: texts,
    }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

export async function chatStream(opts: {
  system: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  signal?: AbortSignal;
}): Promise<Response> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key()}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      stream: true,
      messages: [
        { role: "system", content: opts.system },
        ...opts.messages,
      ],
    }),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status} ${await res.text()}`);
  return res;
}

// Parse OpenAI-compatible SSE stream chunks into delta strings
export function* parseSSEDeltas(text: string): Generator<string> {
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("data:")) continue;
    const payload = t.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const json = JSON.parse(payload);
      const delta = json?.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta.length) yield delta;
    } catch {
      // ignore partial chunks
    }
  }
}
