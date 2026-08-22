import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, FolderKanban, LoaderCircle, Sparkles, Upload } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value)) : "Recently";

export default function Dashboard() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/api/papers")
      .then(({ data }) => active && setPapers(data.papers || []))
      .catch((err) => active && setError(err.response?.data?.message || "Unable to load your papers."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const topics = useMemo(() => new Set(papers.map((paper) => paper.topic || paper.folder).filter(Boolean)).size, [papers]);
  const recent = papers.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-violet-200 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-100">Research workspace</p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div><h1 className="text-4xl font-bold tracking-tight">Your research, in one place.</h1><p className="mt-3 max-w-2xl text-violet-100">Organize papers, explore topics, and turn dense reading into clear insights.</p></div>
            <Link to="/features/paper-management" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"><Upload size={18} /> Upload paper</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[[FileText, "Papers", papers.length, "In your library"], [FolderKanban, "Topics", topics, "Organized collections"], [BookOpen, "Recent", recent.length, "Added lately"]].map(([Icon, label, value, detail]) => (
            <div key={label} className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><Icon size={20} className="text-violet-600" /></div><p className="mt-4 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>
          ))}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">Recent papers</h2><p className="mt-1 text-sm text-slate-500">Your latest additions.</p></div><Link to="/projects" className="text-sm font-semibold text-violet-600 hover:text-violet-800">View projects</Link></div>
            {loading ? <div className="flex justify-center py-12 text-violet-600"><LoaderCircle className="animate-spin" /></div> : error ? <p className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : recent.length ? <div className="mt-5 divide-y divide-slate-100">{recent.map((paper) => <div key={paper._id} className="flex gap-4 py-4"><div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><FileText size={20} /></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-slate-800">{paper.title || paper.filename}</h3><p className="mt-1 truncate text-sm text-slate-500">{paper.authors?.join(", ") || "Author information unavailable"}</p></div><div className="text-right text-xs text-slate-400"><p>{paper.topic || paper.folder || "Research"}</p><p className="mt-1">{formatDate(paper.createdAt)}</p></div></div>)}</div> : <EmptyState />}
          </div>
          <aside className="rounded-3xl border border-fuchsia-100 bg-gradient-to-b from-fuchsia-50 to-white p-6 shadow-sm"><Sparkles className="text-fuchsia-600" /><h2 className="mt-4 text-xl font-bold text-slate-900">Need a quick read?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Select an uploaded paper and let ResearchNest create a structured academic summary.</p><Link to="/research" className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Open research assistant</Link></aside>
        </section>
      </main>
    </div>
  );
}

function EmptyState() { return <div className="mt-5 rounded-2xl border border-dashed border-violet-200 p-8 text-center"><FileText className="mx-auto text-violet-400" /><p className="mt-3 font-semibold text-slate-700">Your library is ready</p><p className="mt-1 text-sm text-slate-500">Upload a PDF to start building your research collection.</p></div>; }
