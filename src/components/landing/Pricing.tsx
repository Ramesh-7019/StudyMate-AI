import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free", price: "$0", desc: "Perfect to try it out",
    features: ["3 PDF uploads", "100 AI messages / mo", "Basic notes & quizzes", "Flashcards"],
    cta: "Get started", featured: false,
  },
  {
    name: "Pro", price: "$12", desc: "For serious students",
    features: ["Unlimited PDFs", "Unlimited AI chat", "All 8 note styles", "Advanced quizzes & analytics", "Study planner & reminders", "Priority Gemini 3 model"],
    cta: "Start 7-day trial", featured: true,
  },
  {
    name: "Campus", price: "Custom", desc: "Universities & schools",
    features: ["SSO + admin panel", "Org-wide analytics", "Bulk seats", "Dedicated support"],
    cta: "Contact sales", featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-aurora-1 mb-4">Pricing</p>
          <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight">
            Simple, <span className="text-gradient">student-friendly</span>
          </h2>
          <p className="mt-5 text-muted-foreground">Start free. Upgrade when you're ready to crush exams.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {tiers.map((t) => (
            <div key={t.name}
              className={`relative rounded-2xl p-8 transition-all hover:-translate-y-1 ${
                t.featured
                  ? "glass-strong ring-aurora shadow-glow"
                  : "glass hover:ring-aurora"
              }`}>
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-aurora animate-aurora text-background">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-display font-semibold">{t.price}</span>
                {t.price !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
              </div>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-aurora-2 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#cta"
                className={`mt-8 inline-flex w-full justify-center px-4 py-3 rounded-full font-medium transition-all ${
                  t.featured
                    ? "bg-foreground text-background hover:opacity-90"
                    : "glass-strong hover:bg-white/5"
                }`}>
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
