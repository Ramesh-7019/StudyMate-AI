import { Sparkles } from "lucide-react";

export function Nav() {
  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];
  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <nav className="glass-strong rounded-full px-3 py-2 flex items-center gap-1 shadow-elegant w-full max-w-3xl">
        <a href="#top" className="flex items-center gap-2 px-3 py-1.5 font-display font-semibold">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-aurora animate-aurora">
            <Sparkles className="w-4 h-4 text-background" />
          </span>
          <span>StudyMate <span className="text-gradient">AI</span></span>
        </a>
        <div className="hidden md:flex items-center gap-1 ml-2">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-full transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a href="#cta" className="hidden sm:inline-flex text-sm px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">Sign in</a>
          <a href="#cta" className="inline-flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}
