import { useState, useRef } from "react";
import {
  X,
  Play,
  Pause,
  Sparkles,
  BookOpen,
  Target,
  Upload,
  Users,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const DEMO_STEPS = [
  {
    id: 1,
    title: "1. Upload & Instant AI Organization",
    desc: "Drag & drop research PDFs. Our AI automatically extracts titles, authors, and organizes them into workspace topics.",
    color: "from-violet-500 to-purple-600",
    badge: "AI Extraction",
  },
  {
    id: 2,
    title: "2. Deep AI Paper Reader",
    desc: "Read PDFs with inline AI explanations, 5-color semantic highlights, and margin notes attached directly to paragraphs.",
    color: "from-amber-500 to-orange-600",
    badge: "Interactive Reader",
  },
  {
    id: 3,
    title: "3. Research Gap Finder & Horizon Matrix",
    desc: "Pinpoint unaddressed methodologies and open research questions across 200M+ academic papers instantly.",
    color: "from-emerald-500 to-teal-600",
    badge: "Gap Detection",
  },
  {
    id: 4,
    title: "4. Real-Time Team Collaboration & Citations",
    desc: "Invite co-authors via email, receive instant WebSocket alerts, and format publication-ready IEEE & APA citations.",
    color: "from-sky-500 to-blue-600",
    badge: "Real-Time Sync",
  },
];

export default function DemoModal({ isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  const current = DEMO_STEPS[activeStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-slate-900 text-white shadow-2xl shadow-violet-950/50">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-md">
              <Play size={14} className="fill-white text-white ml-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ResearchNest Product Demo</h3>
              <p className="text-[11px] text-slate-400">Interactive Feature Walkthrough & Video Tour</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-400 transition hover:bg-white/20 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Player Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          {/* Animated Video Simulation Stage */}
          <div className="relative h-full w-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-950">
            {/* Ambient Animated Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_40%,rgba(124,58,237,0.25),transparent_60%)]" />

            {/* Top Bar inside Video Display */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                {current.badge}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Step {activeStep + 1} of {DEMO_STEPS.length}
              </span>
            </div>

            {/* Center Animated Demonstration Screen */}
            <div className="relative z-10 mx-auto max-w-2xl text-center space-y-4 py-4">
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${current.color} shadow-lg shadow-violet-500/30`}>
                {activeStep === 0 && <Upload size={30} className="text-white" />}
                {activeStep === 1 && <BookOpen size={30} className="text-white" />}
                {activeStep === 2 && <Target size={30} className="text-white" />}
                {activeStep === 3 && <Users size={30} className="text-white" />}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {current.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                {current.desc}
              </p>
            </div>

            {/* Simulated Player Controls Overlay */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md hover:bg-violet-500 transition"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20 transition"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>

              {/* Step Navigation Dots */}
              <div className="flex items-center gap-2">
                {DEMO_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeStep === idx
                        ? "w-8 bg-violet-500"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % DEMO_STEPS.length)}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <span>Next Feature</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/10 bg-slate-950 px-6 py-4 gap-3">
          <p className="text-xs text-slate-400">
            Ready to accelerate your research workflow with ResearchNest?
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500 transition"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
