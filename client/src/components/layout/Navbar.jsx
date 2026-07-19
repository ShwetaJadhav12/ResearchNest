import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-violet-100">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight"
        >
          <span className="text-slate-900">Research</span>
          <span className="text-violet-600">Nest</span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-slate-600 transition hover:text-violet-600"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-slate-600 transition hover:text-violet-600"
          >
            How it Works
          </a>

          <a
            href="#ai"
            className="text-slate-600 transition hover:text-violet-600"
          >
            AI
          </a>

          <a
            href="#pricing"
            className="text-slate-600 transition hover:text-violet-600"
          >
            Pricing
          </a>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-5 py-2 text-slate-700 transition hover:bg-violet-50"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}