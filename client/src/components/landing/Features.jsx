import {
  Brain,
  FileText,
  Sparkles,
  BookOpen,
  Compass,
  Users,
  ArrowRight,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const CORE_FEATURES = [
  {
    id: "f1",
    icon: FileText,
    badge: "Feature 01",
    tag: "PDF & Metadata",
    title: "Upload & Organize",
    path: "/features/upload-organize",
    description: "Ingest PDF papers with automated DOI, author & abstract extraction and smart workspace topic clustering.",
    tags: ["PDF Auto-Parser", "Topic Grouping", "BibTeX Export"],
    theme: {
      bg: "from-violet-500/10 to-purple-500/5",
      border: "hover:border-violet-400/80",
      iconBg: "bg-violet-600 text-white shadow-violet-500/25",
      badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
      accent: "text-violet-600",
      btnBg: "hover:bg-violet-600 hover:text-white",
    },
  },
  {
    id: "f2",
    icon: Sparkles,
    badge: "Feature 02",
    tag: "Multi-turn Copilot",
    title: "AI Research Assistant",
    path: "/research",
    description: "Generate literature reviews, detect research gaps, and synthesize academic sections with verified IEEE & APA citations.",
    tags: ["Literature Review", "Research Gap Finder", "IEEE/APA Citations"],
    theme: {
      bg: "from-fuchsia-500/10 to-pink-500/5",
      border: "hover:border-fuchsia-400/80",
      iconBg: "bg-fuchsia-600 text-white shadow-fuchsia-500/25",
      badgeColor: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
      accent: "text-fuchsia-600",
      btnBg: "hover:bg-fuchsia-600 hover:text-white",
    },
  },
  {
    id: "f3",
    icon: BookOpen,
    badge: "Feature 03",
    tag: "Interactive Reader",
    title: "AI Research Reader",
    path: "/reader",
    description: "Read papers with in-line Gemini explanations, 5-color semantic highlights, and margin notes directly attached to text.",
    tags: ["5-Color Highlights", "Margin Notes", "In-line Explainer"],
    theme: {
      bg: "from-amber-500/10 to-orange-500/5",
      border: "hover:border-amber-400/80",
      iconBg: "bg-amber-600 text-white shadow-amber-500/25",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      accent: "text-amber-600",
      btnBg: "hover:bg-amber-600 hover:text-white",
    },
  },
  {
    id: "f4",
    icon: Compass,
    badge: "Feature 04",
    tag: "Global Discovery",
    title: "Research Discovery",
    path: "/discovery",
    description: "Explore 200M+ research papers across OpenAlex & arXiv with semantic search, topic filters, and 1-click workspace import.",
    tags: ["200M+ Papers", "OpenAlex & arXiv", "1-Click Import"],
    theme: {
      bg: "from-emerald-500/10 to-teal-500/5",
      border: "hover:border-emerald-400/80",
      iconBg: "bg-emerald-600 text-white shadow-emerald-500/25",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accent: "text-emerald-600",
      btnBg: "hover:bg-emerald-600 hover:text-white",
    },
  },
  {
    id: "f5",
    icon: Users,
    badge: "Feature 05",
    tag: "Lab Collaboration",
    title: "Team Collaboration",
    path: "/projects",
    description: "Share research project rooms, invite lab collaborators with role permissions, and track real-time activity feeds.",
    tags: ["Lab Workspaces", "Role Permissions", "Activity Audit"],
    theme: {
      bg: "from-indigo-500/10 to-blue-500/5",
      border: "hover:border-indigo-400/80",
      iconBg: "bg-indigo-600 text-white shadow-indigo-500/25",
      badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
      accent: "text-indigo-600",
      btnBg: "hover:bg-indigo-600 hover:text-white",
    },
  },
  {
    id: "f6",
    icon: Brain,
    badge: "Feature 06",
    tag: "Visual Intelligence",
    title: "Research Horizon & Hypothesis Matrix",
    path: "/knowledge-graph",
    description: "Active innovation matrix comparing paper methodologies, scanning cross-paper contradictions, and formulating breakthrough AI research hypotheses.",
    tags: ["Tech Matrix", "Contradiction Scanner", "AI Hypotheses"],
    theme: {
      bg: "from-sky-500/10 to-cyan-500/5",
      border: "hover:border-sky-400/80",
      iconBg: "bg-sky-600 text-white shadow-sky-500/25",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
      accent: "text-sky-600",
      btnBg: "hover:bg-sky-600 hover:text-white",
    },
  },
];

export default function Features({ title = "Platform Capabilities", subtitle = "6 Core Research Features" }) {
  return (
    <section id="features" className="relative py-8 sm:py-12 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-xs font-bold text-violet-700 shadow-xs backdrop-blur-md">
            <Layers size={14} className="text-violet-600" />
            <span>{title}</span>
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            <span className="text-slate-500 font-medium">All-in-One AI Suite</span>
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            {subtitle}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Engineered to streamline every phase of academic research: discovery, organization, deep reading, writing, and collaboration.
          </p>
        </div>

        {/* Feature Cards Grid (3 Columns) */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={`group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-gradient-to-br ${feature.theme.bg} bg-white p-6 sm:p-7 shadow-xs ${feature.theme.border} hover:shadow-xl hover:shadow-violet-950/5 transition-all duration-300`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ${feature.theme.iconBg} transition-transform group-hover:scale-105 duration-200`}>
                      <Icon size={22} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${feature.theme.badgeColor}`}>
                        {feature.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category Tag */}
                  <div className="mt-5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {feature.tag}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-violet-700 transition leading-snug">
                      {feature.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>

                  {/* Capability Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {feature.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-white/90 border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-2xs"
                      >
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Launch Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Ready to use
                  </span>
                  
                  <Link
                    to={feature.path}
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition group-hover:border-violet-300 ${feature.theme.btnBg} group-hover:shadow`}
                  >
                    <span>Launch Tool</span>
                    <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}