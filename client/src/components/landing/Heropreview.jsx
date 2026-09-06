import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  BookOpen,
  Quote,
  CheckCircle2,
  BrainCircuit,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="relative mx-auto w-full max-w-xl"
    >
      {/* Decorative ambient glows behind preview card */}
      <div className="absolute -inset-1 rounded-[36px] bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-indigo-600/30 blur-2xl opacity-60" />

      {/* Main SaaS Window Frame */}
      <div className="relative rounded-[28px] border border-slate-200/80 bg-white/95 backdrop-blur-xl p-5 sm:p-6 shadow-2xl shadow-violet-900/10">
        
        {/* Top Window Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400/80"></span>
            <span className="h-3 w-3 rounded-full bg-amber-400/80"></span>
            <span className="h-3 w-3 rounded-full bg-emerald-400/80"></span>
            <span className="ml-2 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Layers size={13} className="text-violet-600" />
              Project: LLM Reasoning & Retrieval
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced
            </span>
          </div>
        </div>

        {/* Mock Search & Command Bar */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-xs text-slate-400 shadow-inner">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <span className="text-slate-600 font-medium">Search 200M+ papers or ask Gemini...</span>
          </div>
          <kbd className="rounded bg-white border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Paper Card with In-Line Highlights */}
        <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/30 p-4 transition-all hover:bg-violet-50/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  NeurIPS
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Vaswani et al. • 2017
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  128k+ Citations
                </span>
              </div>
              <h4 className="mt-1.5 text-sm font-bold text-slate-900 leading-snug">
                Attention Is All You Need
              </h4>
            </div>
            <Link
              to="/dashboard"
              className="shrink-0 flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-violet-700 shadow-xs hover:border-violet-300"
            >
              <BookOpen size={12} />
              Read
            </Link>
          </div>

          {/* Paper abstract excerpt with highlight */}
          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-serif">
            "The dominant sequence transduction models are based on complex recurrent networks... We propose the{" "}
            <mark className="bg-yellow-200/80 text-slate-900 px-1 rounded">
              Transformer, a model architecture eschewing recurrence and relying entirely on attention
            </mark>{" "}
            mechanisms to draw global dependencies."
          </p>

          {/* Interactive AI Floating Annotation Pill */}
          <div className="mt-3 rounded-xl border border-purple-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <Sparkles size={14} className="text-purple-600" />
              Gemini 2.5 Flash • Key Innovation Dissected
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-snug">
              Eliminates sequential \(O(n)\) recurrent bottlenecks, enabling massive parallelization during training across large corpora.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                <Quote size={10} />
                IEEE: [1]
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-fuchsia-700 bg-fuchsia-50 px-2 py-0.5 rounded-md">
                <BrainCircuit size={10} />
                Methodology: Multi-Head
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={10} />
                Saved to Workspace
              </span>
            </div>
          </div>
        </div>

        {/* Live Workspace Footer Info */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-white">
                SJ
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-fuchsia-600 text-[10px] font-bold text-white ring-2 ring-white">
                AI
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              2 active researchers in workspace
            </span>
          </div>

          <Link
            to="/features/upload-organize"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-700"
          >
            Upload Papers (Feature 1)
            <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
