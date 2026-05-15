import { Upload, Cpu, GraduationCap } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload your material", desc: "Drop PDFs, slides, or scanned notes. We OCR, chunk, and embed everything." },
  { icon: Cpu, title: "AI indexes & understands", desc: "Vector embeddings let the AI reason over your material with citations." },
  { icon: GraduationCap, title: "Learn 10× faster", desc: "Chat, quiz yourself, generate notes, and track progress in one OS." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-28 relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-xs uppercase tracking-[0.2em] text-aurora-2 mb-4">How it works</p>
          <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight">
            From upload to <span className="text-gradient">mastery</span> in 3 steps
          </h2>
        </div>
        <div className="relative grid md:grid-cols-3 gap-6">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-aurora-1/40 to-transparent" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="glass rounded-2xl p-8 h-full text-center hover:ring-aurora transition-all">
                <div className="relative inline-grid place-items-center w-20 h-20 rounded-2xl bg-aurora animate-aurora mb-6 shadow-glow">
                  <s.icon className="w-9 h-9 text-background" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full glass-strong grid place-items-center text-xs font-semibold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold">{s.title}</h3>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
