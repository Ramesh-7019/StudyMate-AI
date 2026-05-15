const logos = ["Stanford", "MIT", "Harvard", "Oxford", "Cambridge", "Berkeley", "ETH", "NUS"];

export function Trust() {
  return (
    <section className="py-16 border-y border-border/40">
      <div className="container mx-auto px-6 max-w-6xl">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-10">
          Trusted by 200,000+ students at top universities
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
          {logos.map((name) => (
            <span key={name} className="font-display text-xl md:text-2xl font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
