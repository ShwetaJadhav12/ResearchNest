import {
  Brain,
  FileText,
  Sparkles,
  BookOpen,
  Compass,
  Users,
  ArrowRight,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    badge: "Feature 1",
    title: "Upload & Organize",
    path: "/features/upload-organize",
    description: "Upload PDFs, auto-extract metadata, and cluster papers into smart workspaces.",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    icon: Sparkles,
    badge: "Feature 2",
    title: "AI Research Assistant",
    path: "/research",
    description: "Draft literature reviews and academic sections with verified IEEE & APA citations.",
    color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  {
    icon: Compass,
    badge: "Feature 4",
    title: "Research Discovery",
    path: "/discovery",
    description: "Query 200M+ papers across OpenAlex & arXiv and add directly to your workspace.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    icon: BookOpen,
    badge: "Feature 3",
    title: "AI Research Reader",
    path: "/reader/seed-1",
    description: "Read with in-line AI assistance, 5-color highlights, and interactive margin notes.",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: Users,
    badge: "Feature 5",
    title: "Team Collaboration",
    path: "/projects",
    description: "Share project workspaces, assign roles, and discuss papers with lab teammates.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    icon: Brain,
    badge: "Feature 6",
    title: "Knowledge Graph",
    path: "/knowledge-graph",
    description: "Visualize conceptual relationships between papers, topics, and author networks.",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-8 sm:py-12 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/80 px-3.5 py-1 text-xs font-semibold text-violet-700">
            <Layers size={13} />
            Platform Capabilities
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Core Research Features
          </h2>

          <p className="mt-1.5 text-xs text-slate-500">
            All 6 features connected seamlessly through your project workspaces.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-violet-300 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${feature.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-violet-700 transition">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to={feature.path}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition"
                  >
                    Open Feature <ArrowRight size={13} />
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