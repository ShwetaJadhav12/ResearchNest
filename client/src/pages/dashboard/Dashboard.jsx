import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  FolderKanban,
  LoaderCircle,
  Sparkles,
  Upload,
  Compass,
  Users,
  Highlighter,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "Recently";

export default function Dashboard() {
  const [papers, setPapers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get("/api/papers"), api.get("/api/workspaces")])
      .then(([papersRes, wsRes]) => {
        setPapers(papersRes.data.papers || []);
        setWorkspaces(wsRes.data.workspaces || []);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load dashboard data.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      await api.post("/api/papers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Paper uploaded and organized by AI!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const topics = useMemo(
    () =>
      new Set(
        papers.map((paper) => paper.topic || paper.folder).filter(Boolean)
      ).size,
    [papers]
  );
  const recentPapers = papers.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-700 via-purple-700 to-slate-950 p-8 text-white shadow-xl shadow-violet-200 md:p-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
              Connected Research Operating System
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              All your academic research, in one workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-violet-100/90 md:text-base">
              Discover peer-reviewed literature, organize papers in collaborative workspaces,
              read interactively with AI assistance, and draft academic papers with real citations.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-violet-700 shadow-md transition hover:bg-violet-50">
                <Upload size={17} />
                <span>{uploading ? "Analyzing PDF..." : "Upload Paper"}</span>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={uploading}
                  onChange={handleDirectUpload}
                  className="hidden"
                />
              </label>

              <Link
                to="/discovery"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur hover:bg-white/20 transition"
              >
                <Compass size={17} />
                <span>Discover Research</span>
              </Link>

              <Link
                to="/research"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur hover:bg-white/20 transition"
              >
                <Sparkles size={17} />
                <span>AI Assistant</span>
              </Link>
            </div>
          </div>
        </section>

        {/* METRICS ROW */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [FileText, "Research Papers", papers.length, "In your library"],
            [FolderKanban, "Workspaces", workspaces.length, "Active research projects"],
            [Compass, "Topics / Disciplines", topics, "Organized domains"],
            [Users, "Collaborations", workspaces.reduce((acc, w) => acc + (w.membersCount || 1), 0), "Researchers connected"],
          ].map(([Icon, label, value, detail]) => (
            <div
              key={label}
              className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <Icon size={20} className="text-violet-600" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{detail}</p>
            </div>
          ))}
        </section>

        {/* WORKSPACES CAROUSEL / PREVIEW */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Research Workspaces</h2>
              <p className="text-xs text-slate-500">Collaborative project spaces</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-violet-600 hover:text-violet-800"
            >
              View all workspaces →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.slice(0, 3).map((ws) => (
              <Link
                key={ws._id}
                to={`/projects/${ws._id}`}
                className="group rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-bold text-violet-700">
                    {ws.topic || "Research"}
                  </span>
                  <span className="font-semibold text-slate-400">
                    {ws.papersCount || 0} papers
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-violet-700 transition">
                  {ws.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                  {ws.description || "Research collection"}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-violet-600">
                  Open Project <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT SPLIT */}
        <section className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          {/* RECENT PAPERS WITH DIRECT READER LINK */}
          <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent Papers</h2>
                <p className="text-xs text-slate-500">Read in AI Reader or cite in writing</p>
              </div>
              <Link
                to="/discovery"
                className="text-xs font-bold text-violet-600 hover:text-violet-800"
              >
                + Find more papers
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12 text-violet-600">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : error ? (
              <p className="rounded-2xl bg-rose-50 p-4 text-xs text-rose-700">{error}</p>
            ) : recentPapers.length ? (
              <div className="divide-y divide-slate-100">
                {recentPapers.map((paper) => (
                  <div
                    key={paper._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                          {paper.topic || "Research"}
                        </span>
                        {paper.source === "discovery" && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Discovered
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm truncate group-hover:text-violet-700 transition">
                        {paper.title || paper.filename}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {paper.authors?.join(", ") || "Unknown authors"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/reader/${paper._id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-600 hover:text-white transition"
                      >
                        <BookOpen size={13} /> Read in AI Reader
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No papers uploaded yet. Upload a PDF to begin!
              </div>
            )}
          </div>

          {/* AI SUITE SHOWCASE ASIDE */}
          <div className="space-y-6">
            {/* AI Research Reader Card */}
            <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-purple-50/50 to-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <BookOpen size={18} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">AI Research Reader</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Read academic papers with interactive AI. Highlight difficult text, get instant contextual explanations, simplify jargon, and save research ideas.
              </p>
              {recentPapers.length > 0 && (
                <Link
                  to={`/reader/${recentPapers[0]._id}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <span>Open Latest Paper</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {/* AI Writing Engine Card */}
            <div className="rounded-3xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50/60 to-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-600 text-white">
                <Sparkles size={18} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">Academic Writing & Citations</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Generate literature reviews, abstracts, or entire survey sections with IEEE, APA 7, or BibTeX references based on your real papers.
              </p>
              <Link
                to="/research"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-fuchsia-600 px-4 py-2 text-xs font-bold text-white hover:bg-fuchsia-700"
              >
                <span>Launch AI Assistant</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
