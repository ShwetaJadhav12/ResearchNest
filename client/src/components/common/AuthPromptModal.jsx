import { X, Lock, ArrowRight, Sparkles, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthPromptModal({ isOpen, onClose, featureName = "this feature" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        >
          <X size={18} />
        </button>

        {/* Modal Content */}
        <div className="text-center space-y-4 pt-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
            <Lock size={26} />
          </div>

          <h3 className="text-xl font-black tracking-tight text-slate-900">
            Sign Up Required
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            Please sign up or log in to access <strong className="text-violet-700 font-bold">{featureName}</strong> and unlock the full ResearchNest AI platform.
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-2">
            <Link
              to="/register"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-fuchsia-700 transition"
            >
              <UserPlus size={16} />
              <span>Create Free Account</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/login"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <LogIn size={16} />
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
