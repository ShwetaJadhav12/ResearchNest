import {
  Brain,
  FileText,
  Sparkles,
  PenTool,
  BarChart3,
  Users,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "Upload & Organize",
    slug: "upload-organize",
    description:
      "Keep your research papers neatly organized with folders, tags, and projects.",
    color: "bg-violet-100 text-violet-700",
  },
  {
  icon: Sparkles,
  title: "AI Research Assistant",
  slug: "ai-research-assistant",
  path: "/research",
  description:
    "Summarize papers, answer questions, compare studies, and generate literature reviews instantly.",
  color: "bg-pink-100 text-pink-600",
  featured: true,
},
  {
    icon: Brain,
    title: "Knowledge Graph",
    slug: "knowledge-graph",
    description:
      "Automatically connect concepts, authors, and research topics into one visual network.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: PenTool,
    title: "Smart Notes",
    slug: "smart-notes",
    description:
      "Highlight PDFs, write notes, and connect ideas without switching applications.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: BarChart3,
    title: "Research Insights",
    slug: "research-insights",
    description:
      "Track reading progress, AI summaries, citations, and productivity in one place.",
    color: "bg-sky-100 text-sky-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    slug: "team-collaboration",
    description:
      "Share projects, review papers together, and collaborate with your research team.",
    color: "bg-purple-100 text-purple-600",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full bg-violet-100 px-5 py-2 text-sm font-semibold text-violet-700">
            FEATURES
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900 leading-tight">
            Everything You Need
            <br />
            For Smarter Research
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-500">
            Stop switching between PDFs, notes, AI chats, and folders.
            ResearchNest brings your entire research workflow into one
            intelligent workspace.
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  slug,
  path,
  description,
  color,
  featured,
})  {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.3,
      }}
      className={`group rounded-[28px] border border-violet-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-2xl ${
        featured ? "xl:scale-105" : ""
      }`}
    >
      <div
        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${color}`}
      >
        <Icon size={30} />
      </div>

      <h3 className="text-2xl font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-500">
        {description}
      </p>

      <Link
to={path || `/features/${slug}`}        className="mt-8 inline-flex items-center gap-2 font-semibold text-violet-600 transition-all duration-300 group-hover:gap-4"
      >
        Learn More
        <ArrowRight size={18} />
      </Link>
    </motion.div>
  );
}