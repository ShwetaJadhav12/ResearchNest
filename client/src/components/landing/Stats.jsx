import { motion } from "framer-motion";
import { Database, Quote, Zap, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Database,
    value: "200M+",
    label: "Academic Papers",
    sub: "OpenAlex & arXiv",
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  {
    icon: Quote,
    value: "6 Styles",
    label: "Citation Formats",
    sub: "IEEE, APA 7, BibTeX",
    color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200",
  },
  {
    icon: Zap,
    value: "10x",
    label: "Faster Synthesis",
    sub: "AI Literature Reviews",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Grounded AI",
    sub: "Source-anchored claims",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
];

export default function Stats() {
  return (
    <section className="relative border-y border-slate-200/70 bg-white/60 backdrop-blur-md py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="flex flex-col items-center text-center p-3 rounded-2xl transition hover:bg-slate-50/80"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${stat.color} shadow-xs mb-2`}>
                  <Icon size={18} />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-slate-700 mt-0.5">
                  {stat.label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {stat.sub}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
