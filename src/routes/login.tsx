import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({ email, password, options: { emailRedirectTo: window.location.origin + "/chat" } } as never);
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "signup") toast.success("Check your email to confirm your account.");
    else navigate({ to: "/chat" });
  }

  async function handleGoogle() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/chat" });
    if (r.error) toast.error(r.error.message);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elegant">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-semibold mb-6">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-aurora animate-aurora">
            <Sparkles className="w-4 h-4 text-background" />
          </span>
          StudyMate <span className="text-gradient">AI</span>
        </Link>
        <h1 className="text-3xl font-display font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="text-sm text-muted-foreground mt-1">Chat with your PDFs in seconds.</p>

        <button onClick={handleGoogle} className="mt-6 w-full glass rounded-full py-3 font-medium hover:bg-white/5 transition-colors">
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input type="email" required placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full glass rounded-xl px-4 py-3 outline-none focus:ring-aurora" />
          <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full glass rounded-xl px-4 py-3 outline-none focus:ring-aurora" />
          <button type="submit" disabled={busy} className="w-full bg-foreground text-background font-medium rounded-full py-3 hover:opacity-90 disabled:opacity-50 shadow-glow transition-all">
            {busy ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center">
          {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
