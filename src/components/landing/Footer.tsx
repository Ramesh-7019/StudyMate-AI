import { Sparkles } from "lucide-react";

export function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer className="border-t border-border/40 py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <a href="#top" className="inline-flex items-center gap-2 font-display font-semibold text-lg">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-aurora animate-aurora">
                <Sparkles className="w-4 h-4 text-background" />
              </span>
              StudyMate <span className="text-gradient">AI</span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              The AI-powered learning OS for students who refuse to study the old way.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 StudyMate AI. All rights reserved.</p>
          <p>Made with care for students worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
