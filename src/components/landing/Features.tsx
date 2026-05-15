import { Brain, FileText, MessageSquare, Sparkles, BarChart3, Calendar, Layers, Zap } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "AI PDF Chat", desc: "Ask anything about your textbooks. Cited answers from your own material via RAG.", span: "md:col-span-2 md:row-span-2", accent: "from-aurora-1 to-aurora-3" },
  { icon: FileText, title: "AI Notes", desc: "Summary, detailed, exam-ready, or beginner — 8 distinct note styles.", span: "md:col-span-2", accent: "from-aurora-2 to-aurora-1" },
  { icon: Brain, title: "Smart Quizzes", desc: "MCQs, T/F, scenario questions with AI explanations.", span: "", accent: "from-aurora-3 to-aurora-2" },
  { icon: Layers, title: "Flashcards", desc: "Spaced repetition that adapts to you.", span: "", accent: "from-aurora-1 to-aurora-2" },
  { icon: Calendar, title: "Study Planner", desc: "Personalized schedules with exam countdowns and smart reminders.", span: "md:col-span-2", accent: "from-aurora-2 to-aurora-3" },
  { icon: BarChart3, title: "Analytics", desc: "Heatmaps, streaks, XP and weekly insights.", span: "", accent: "from-aurora-3 to-aurora-1" },
  { icon: Zap, title: "Lightning fast", desc: "Streaming UI, optimistic updates, instant search.", span: "", accent: "from-aurora-1 to-aurora-3" },
];

export function Features() {
  return (
    <section id="features" className="py-28 relative">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-aurora-1 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Features
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-semibold tracking-tight">
            Everything you need to <span className="text-gradient">ace exams</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Seven AI-native tools that work together as one cohesive learning OS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-4">
          {features.map((f) => (
            <div key={f.title} className={`group relative glass rounded-2xl p-6 overflow-hidden hover:ring-aurora transition-all hover:-translate-y-0.5 ${f.span}`}>
              <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${f.accent} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`} />
              <div className="relative h-full flex flex-col">
                <div className="w-10 h-10 rounded-xl glass-strong grid place-items-center mb-4">
                  <f.icon className="w-5 h-5 text-aurora-1" />
                </div>
                <h3 className="text-xl font-display font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
