import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Does StudyMate AI really only answer from my own material?", a: "Yes. Every uploaded PDF is chunked, embedded, and stored as vectors. The AI uses RAG so answers are grounded in your textbooks with citations." },
  { q: "Which AI model powers StudyMate?", a: "We use Google's Gemini family by default with semantic retrieval over your documents. Pro plans get priority access to the latest models." },
  { q: "Is my data private?", a: "Your uploads are private by default and encrypted at rest. We never train on your content." },
  { q: "Does it work on mobile?", a: "Yes — the app is fully responsive and a native mobile experience is on the roadmap." },
  { q: "Can I cancel anytime?", a: "Of course. Pro is month-to-month with no lock-in." },
];

export function FAQ() {
  return (
    <section id="faq" className="py-28">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-aurora-2 mb-4">FAQ</p>
          <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight">
            Questions, <span className="text-gradient">answered</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="glass rounded-2xl px-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
              <AccordionTrigger className="text-left font-display font-medium hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
