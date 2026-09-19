import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Compass,
  Database,
  Quote,
  Target,
  BrainCircuit,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import HeroPreview from "./Heropreview";

export default function Hero() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* SaaS mesh gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-violet-400/20 blur-[120px]" />
        <div className="absolute top-12 right-1/4 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-[120px]" />
        <div className="absolute top-36 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-amber-400/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          
          {/* Left Column: Hero Text & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 xl:col-span-7 space-y-6"
          >
            {/* Pill Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/90 bg-white/95 px-4 py-1.5 text-xs font-bold text-violet-800 shadow-xs backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="bg-gradient-to-r from-violet-700 to-fuchsia-700 bg-clip-text text-transparent">AI Engine Active</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Unified AI Research OS</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Accelerate research.{" "}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Find gaps & write with citations.
              </span>
            </h1>

            {/* Subhead - Short, clean, punchy */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              The all-in-one AI platform for researchers. Discover 200M+ papers, pinpoint unaddressed research gaps, read with in-line AI assistance, and draft publication-ready surveys with IEEE & APA citations.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-fuchsia-700 transition active:scale-[0.98]"
              >
                {user ? "Go to Dashboard" : "Start Researching Free"}
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/research?tool=gap_finder"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/80 px-4 py-3.5 text-xs sm:text-sm font-bold text-amber-900 shadow-xs transition active:scale-[0.98]"
              >
                <Target size={16} className="text-amber-600" />
                <span>Research Gap Finder</span>
              </Link>

              <Link
                to="/discovery"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 px-4 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-800 transition"
              >
                <Compass size={16} className="text-emerald-600" />
                <span>Discover 200M+ Papers</span>
              </Link>
            </div>

            {/* Minimal Capabilities Row */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold">
                <Target size={15} className="text-amber-600 shrink-0" />
                <span>Gap Detection</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <Database size={15} className="text-emerald-600 shrink-0" />
                <span>200M+ Papers</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <Quote size={15} className="text-violet-600 shrink-0" />
                <span>IEEE / APA Citations</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <BookOpen size={15} className="text-fuchsia-600 shrink-0" />
                <span>AI Deep Reader</span>
              </div>
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