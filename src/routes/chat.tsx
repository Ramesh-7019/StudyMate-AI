import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { processDocument, askDocument } from "@/lib/rag.functions";
import { FileText, Loader2, Send, Sparkles, Upload, LogOut, MessageSquare, Plus, Square, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/chat")({ component: ChatPage });

type Doc = { id: string; title: string; status: string; page_count: number };
type Citation = { content: string; page: number | null; chunk_index: number };
type Msg = { id: string; role: "user" | "assistant"; content: string; citations?: Citation[] };

function ChatPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const askFn = useServerFn(askDocument);
  const processFn = useServerFn(processDocument);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const loadDocs = useCallback(async () => {
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    setDocs((data ?? []) as Doc[]);
    if (data && data.length && !activeDoc) setActiveDoc(data[0] as Doc);
  }, [activeDoc]);

  useEffect(() => { if (user) loadDocs(); }, [user, loadDocs]);

  // Open or create conversation when active doc changes
  useEffect(() => {
    if (!activeDoc || !user) return;
    (async () => {
      const { data: existing } = await supabase
        .from("conversations").select("*")
        .eq("document_id", activeDoc.id).order("updated_at", { ascending: false }).limit(1);
      let cid = existing?.[0]?.id as string | undefined;
      if (!cid) {
        const { data: created } = await supabase.from("conversations")
          .insert({ user_id: user.id, document_id: activeDoc.id, title: activeDoc.title }).select().single();
        cid = created?.id;
      }
      setConvId(cid ?? null);
      const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", cid!).order("created_at");
      setMessages((msgs ?? []) as Msg[]);
    })();
  }, [activeDoc, user]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, streamingText]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.type !== "application/pdf") return toast.error("Only PDF files are supported");
    if (file.size > 25 * 1024 * 1024) return toast.error("Max file size is 25MB");

    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const up = await supabase.storage.from("pdfs").upload(path, file, { contentType: "application/pdf" });
    if (up.error) return toast.error(up.error.message);

    const { data: doc, error } = await supabase.from("documents")
      .insert({ user_id: user.id, title: file.name.replace(/\.pdf$/i, ""), file_path: path, status: "processing" })
      .select().single();
    if (error || !doc) return toast.error(error?.message ?? "Insert failed");

    setDocs((d) => [doc as Doc, ...d]);
    setActiveDoc(doc as Doc);
    toast.message("Processing PDF…", { description: "Extracting text and indexing." });

    try {
      await processFn({ data: { documentId: doc.id } });
      toast.success("Ready to chat!");
      loadDocs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Processing failed");
      loadDocs();
    }
  }

  async function send() {
    const q = input.trim();
    if (!q || !activeDoc || !convId || activeDoc.status !== "ready") return;
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: q }]);
    setStreaming(true); setStreamingText("");
    abortRef.current = new AbortController();
    try {
      const stream = await askFn({ data: { documentId: activeDoc.id, conversationId: convId, question: q }, signal: abortRef.current.signal });
      let acc = "";
      for await (const chunk of stream as AsyncIterable<{ delta: string }>) {
        acc += chunk.delta;
        setStreamingText(acc);
      }
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: acc }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Chat failed";
      if (!/abort/i.test(msg)) toast.error(msg);
    } finally {
      setStreaming(false); setStreamingText("");
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  async function deleteDoc(d: Doc) {
    if (!confirm(`Delete "${d.title}"? This removes the PDF and all chats for it.`)) return;
    await supabase.storage.from("pdfs").remove([d.id]).catch(() => {});
    await supabase.from("documents").delete().eq("id", d.id);
    setDocs((arr) => arr.filter((x) => x.id !== d.id));
    if (activeDoc?.id === d.id) { setActiveDoc(null); setMessages([]); setConvId(null); }
    toast.success("Deleted");
  }

  const suggestions = [
    "Summarize this document in 5 bullet points",
    "What are the key concepts I must know?",
    "Generate 5 quiz questions with answers",
    "Explain the hardest section like I'm 12",
  ];

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border/40 flex flex-col p-4 gap-3">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold px-2 py-1">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-aurora animate-aurora">
            <Sparkles className="w-4 h-4 text-background" />
          </span>
          StudyMate <span className="text-gradient">AI</span>
        </Link>

        <button onClick={() => fileRef.current?.click()} className="flex items-center justify-center gap-2 bg-foreground text-background rounded-full py-2.5 font-medium hover:opacity-90 shadow-glow transition-all">
          <Upload className="w-4 h-4" /> Upload PDF
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={handleUpload} />

        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-2 px-2">Your documents</div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {docs.length === 0 && <p className="text-sm text-muted-foreground px-2 py-6 text-center">No PDFs yet. Upload one to start.</p>}
          {docs.map((d) => (
            <button key={d.id} onClick={() => setActiveDoc(d)}
              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-2 transition-all ${activeDoc?.id === d.id ? "glass-strong ring-aurora" : "hover:bg-white/5"}`}>
              <FileText className="w-4 h-4 mt-0.5 text-aurora-1 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{d.title}</div>
                <div className="text-xs text-muted-foreground">
                  {d.status === "ready" ? `${d.page_count} pages` :
                   d.status === "processing" ? <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing…</span> :
                   <span className="text-destructive">Failed</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/login" }))}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="border-b border-border/40 px-6 py-3 flex items-center gap-3">
          <MessageSquare className="w-4 h-4 text-aurora-1" />
          <div className="font-medium truncate">{activeDoc?.title ?? "Select a document"}</div>
          {activeDoc?.status === "ready" && <span className="text-xs text-muted-foreground">· {activeDoc.page_count} pages indexed</span>}
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {!activeDoc && (
              <div className="text-center py-20">
                <div className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-aurora animate-aurora mb-4 shadow-glow">
                  <Plus className="w-7 h-7 text-background" />
                </div>
                <h2 className="text-2xl font-display font-semibold">Upload a PDF to get started</h2>
                <p className="text-muted-foreground mt-2">Your AI tutor will read it and answer questions with citations.</p>
              </div>
            )}
            {activeDoc && messages.length === 0 && !streaming && activeDoc.status === "ready" && (
              <div className="grid sm:grid-cols-2 gap-3 pt-4">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-left glass rounded-2xl p-4 hover:bg-white/5 transition-colors flex items-start gap-3">
                    <BookOpen className="w-4 h-4 mt-0.5 text-aurora-1 shrink-0" />
                    <span className="text-sm">{s}</span>
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => <Bubble key={m.id} role={m.role} text={m.content} />)}
            {streaming && <Bubble role="assistant" text={streamingText || "…"} streaming />}
          </div>
        </div>

        <div className="border-t border-border/40 p-4">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="max-w-3xl mx-auto flex gap-2 glass-strong rounded-2xl p-2">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={activeDoc?.status === "ready" ? "Ask anything about this document…" : "Upload and index a PDF first"}
              disabled={!activeDoc || activeDoc.status !== "ready" || streaming}
              className="flex-1 bg-transparent px-3 py-2 outline-none disabled:opacity-50"
            />
            {streaming ? (
              <button type="button" onClick={stop}
                className="grid place-items-center w-10 h-10 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim() || activeDoc?.status !== "ready"}
                className="grid place-items-center w-10 h-10 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity">
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

function Bubble({ role, text, streaming }: { role: "user" | "assistant"; text: string; streaming?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser ? "bg-foreground text-background" : "glass"
      }`}>
        {isUser ? (
          <span className="whitespace-pre-wrap">{text}</span>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-pre:bg-black/40 prose-code:text-aurora-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            {streaming && <span className="inline-block w-1.5 h-4 align-middle bg-aurora-1 animate-pulse ml-0.5" />}
          </div>
        )}
      </div>
    </div>
  );
}
