import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-dashboard.jpg";

export function Hero() {
  return (
    <section id="top" className="relative pt-36 pb-24 md:pt-44 md:pb-36 overflow-hidden">
      {/* Aurora glow */}
      <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-aurora animate-aurora opacity-30 blur-3xl -z-10" />

      <div className="container mx-auto px-6 max-w-6xl text-center">
        <a href="#features" className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground mb-8 hover:text-foreground transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-aurora-1" />
          Now powered by Gemini 3 — RAG over your PDFs
          <ArrowRight className="w-3.5 h-3.5" />
        </a>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-semibold leading-[0.95] tracking-tight">
          Your personal
          <br />
          <span className="text-gradient bg-aurora animate-aurora bg-clip-text text-transparent">AI learning OS</span>
        </h1>

        <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Chat with your PDFs, generate notes, quizzes, and flashcards. StudyMate AI turns every textbook into a private tutor that knows your material cold.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link to="/login" className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-medium hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-glow">
            Start studying free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="#how" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full glass text-foreground font-medium hover:bg-white/5 transition-colors">
            <Zap className="w-4 h-4" />
            See how it works
          </a>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">Free forever for students • No credit card required</p>

        {/* Hero visual */}
        <div className="relative mt-20 mx-auto max-w-5xl animate-float-slow">
          <div className="absolute -inset-6 bg-aurora animate-aurora opacity-40 blur-3xl rounded-[2rem] -z-10" />
          <div className="glass-strong rounded-3xl p-2 shadow-elegant ring-aurora">
            <img
              src={heroImg}
              alt="StudyMate AI dashboard preview with AI chat, notes and analytics"
              width={1600}
              height={1000}
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
