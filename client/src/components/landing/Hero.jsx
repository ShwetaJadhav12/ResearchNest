import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Compass,
  Database,
  Quote,
} from "lucide-react";
import HeroPreview from "./HeroPreview";

export default function Hero() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* SaaS mesh gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none -z-10">
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-violet-400/15 blur-[100px]" />
        <div className="absolute top-12 right-1/4 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          
          {/* Left Column: Hero Text & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 xl:col-span-7"
          >
            {/* Pill Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-3.5 py-1 text-xs font-semibold text-violet-800 shadow-xs backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-violet-700">AI-Powered</span>
              <span className="text-slate-300">•</span>
              <span>Academic Research Workspace</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Research smarter.{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Write with citations.
              </span>
            </h1>

            {/* Subhead - Short, clean, punchy */}
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Discover papers across 200M+ sources, organize into smart workspaces, read with AI assistance, and generate publication-ready drafts.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/25 hover:from-violet-700 hover:to-fuchsia-700 transition active:scale-[0.98]"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/features/upload-organize"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:border-violet-300 hover:text-violet-700 transition"
              >
                <Upload size={15} className="text-violet-600" />
                Upload & Organize
              </Link>

              <Link
                to="/discovery"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-600 hover:text-violet-700 transition"
              >
                <Compass size={15} className="text-emerald-600" />
                Discover Papers
              </Link>
            </div>

            {/* Minimal Metrics Row */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Database size={14} className="text-emerald-600" />
                200M+ Academic Papers
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Quote size={14} className="text-violet-600" />
                IEEE & APA Citations
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles size={14} className="text-fuchsia-600" />
                Gemini 2.5 Flash
              </span>
            </div>
          </motion.div>

          {/* Right Column: Interactive SaaS Window Preview */}
          <div className="lg:col-span-6 xl:col-span-5">
            <HeroPreview />
          </div>

        </div>
      </div>
    </section>
  );
}