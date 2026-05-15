const items = [
  { quote: "StudyMate replaced 4 study apps. The AI chat over my anatomy textbook is unreal.", name: "Aanya P.", role: "Med student, Stanford" },
  { quote: "I went from a B to an A in 6 weeks. The quiz generator is scarily accurate.", name: "Marcus L.", role: "CS major, MIT" },
  { quote: "It feels like having a private tutor that has read every page of my notes.", name: "Sofia R.", role: "Law, Oxford" },
  { quote: "The flashcards with spaced repetition single-handedly carried my finals.", name: "Kenji T.", role: "Physics, ETH Zürich" },
];

export function Testimonials() {
  return (
    <section className="py-28">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-aurora-3 mb-4">Loved by students</p>
          <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight">
            The new way to <span className="text-gradient">study</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((t) => (
            <figure key={t.name} className="glass rounded-2xl p-6 hover:ring-aurora transition-all">
              <blockquote className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-aurora animate-aurora" />
                <div className="text-xs">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
