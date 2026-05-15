import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="py-28">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="relative overflow-hidden glass-strong rounded-3xl p-12 md:p-20 text-center shadow-elegant">
          <div className="absolute -inset-1 bg-aurora animate-aurora opacity-30 blur-3xl -z-10" />
          <div className="absolute inset-0 bg-grid opacity-30 -z-10" />
          <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight max-w-2xl mx-auto">
            Ready to study like the <span className="text-gradient">top 1%</span>?
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
            Join 200,000+ students already learning faster with StudyMate AI. Free forever for the essentials.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <a href="#" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-medium hover:scale-[1.02] transition-transform shadow-glow">
              Start free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a href="#pricing" className="inline-flex items-center justify-center px-8 py-4 rounded-full glass font-medium hover:bg-white/5 transition-colors">
              See pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
