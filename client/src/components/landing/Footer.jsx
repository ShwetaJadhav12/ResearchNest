import { Link } from "react-router-dom";
import { Sparkles, Layers, ArrowUpRight, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 text-sm font-black text-white shadow-md shadow-violet-300/40">
                R
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Research<span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Nest</span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-sm">
              The all-in-one AI operating system for academic research. Search papers, cluster topics, read with in-line AI assistance, generate citations, and collaborate with your lab.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                OpenAlex & arXiv Live
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-semibold text-violet-700">
                <Sparkles size={12} className="text-violet-600" />
                AI Engine v2.5
              </span>
            </div>
          </div>

          {/* Product Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform Features
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/features/upload-organize" className="text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-1">
                  Upload & Organize
                  <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-1.5 py-0.2 rounded">F1</span>
                </Link>
              </li>
              <li>
                <Link to="/research" className="text-slate-500 hover:text-violet-600 transition-colors">
                  AI Paper Writer
                </Link>
              </li>
              <li>
                <Link to="/discovery" className="text-slate-500 hover:text-violet-600 transition-colors">
                  Paper Discovery
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-500 hover:text-violet-600 transition-colors">
                  AI Research Reader
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-slate-500 hover:text-violet-600 transition-colors">
                  Team Workspaces
                </Link>
              </li>
              <li>
                <Link to="/knowledge-graph" className="text-slate-500 hover:text-violet-600 transition-colors">
                  Knowledge Graph
                </Link>
              </li>
            </ul>
          </div>

          {/* Workflow & Citations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Citation Standards
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-slate-500 hover:text-slate-800 transition-colors">IEEE [1] Numbered</li>
              <li className="text-slate-500 hover:text-slate-800 transition-colors">APA 7th Edition</li>
              <li className="text-slate-500 hover:text-slate-800 transition-colors">MLA 9th Edition</li>
              <li className="text-slate-500 hover:text-slate-800 transition-colors">Chicago Manual</li>
              <li className="text-slate-500 hover:text-slate-800 transition-colors">Harvard Referencing</li>
              <li className="text-slate-500 hover:text-slate-800 transition-colors">BibTeX Raw Export</li>
            </ul>
          </div>

          {/* Connected Data */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Data & Sources
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="https://openalex.org" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-1">
                  OpenAlex Catalog
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a href="https://arxiv.org" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-violet-600 transition-colors flex items-center gap-1">
                  arXiv Open Access
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <span className="text-slate-500 flex items-center gap-1">
                  Advanced AI Engine
                </span>
              </li>
              <li>
                <Link to="/projects" className="text-slate-500 hover:text-violet-600 transition-colors">
                  Project Hubs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ResearchNest. Built for modern researchers, labs, and students.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Engineered with <Heart size={13} className="text-fuchsia-500 fill-fuchsia-500" /> for Academic Integrity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
