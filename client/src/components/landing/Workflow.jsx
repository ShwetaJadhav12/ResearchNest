import { motion } from "framer-motion";
import {
  Compass,
  FileText,
  Brain,
  BookOpen,
  Sparkles,
  Users,
  ArrowRight,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    step: "01",
    title: "Discover",
    description: "Search 200M+ real papers across OpenAlex & arXiv.",
    icon: Compass,
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    link: "/discovery",
  },
  {
    step: "02",
    title: "Organize",
    description: "Upload PDFs with automatic topic clustering.",
    icon: FileText,
    bgColor: "bg-violet-50 text-violet-700 border-violet-200",
    link: "/features/upload-organize",
  },
  {
    step: "03",
    title: "Understand",
    description: "Instant AI explanations, jargon breakdown & methodology.",
    icon: Brain,
    bgColor: "bg-blue-50 text-blue-700 border-blue-200",
    link: "/research",
  },
  {
    step: "04",
    title: "Read",
    description: "In-line multi-color highlights & copilot reading.",
    icon: BookOpen,
    bgColor: "bg-amber-50 text-amber-700 border-amber-200",
    link: "/dashboard",
  },
  {
    step: "05",
    title: "Write",
    description: "Draft literature reviews with IEEE & APA citations.",
    icon: Sparkles,
    bgColor: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    link: "/research",
  },
  {
    step: "06",
    title: "Collaborate",
    description: "Shared lab workspaces with roles & discussion threads.",
    icon: Users,
    bgColor: "bg-purple-50 text-purple-700 border-purple-200",
    link: "/projects",
  },
];

export default function Workflow() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-violet-50/20 to-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/90 px-3.5 py-1 text-xs font-semibold text-violet-700">
            <WorkflowIcon size={13} />
            Research Loop
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How it works
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Every discovery, paper, highlight, and citation connects to your workspace.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-violet-300 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.bgColor}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {item.step}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Explore <ArrowRight size={13} />
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
