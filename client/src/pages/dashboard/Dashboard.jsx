import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Plus,
  Search,
  Brain,
  Quote,
  Filter,
  Copy,
  Clock,
  X,
  Target,
  Play,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/landing/Footer";
import Features from "../../components/landing/Features";
import DemoModal from "../../components/common/DemoModal";
import AuthPromptModal from "../../components/common/AuthPromptModal";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState("library"); // "library", "global", "ai"
  const [selectedTopic, setSelectedTopic] = useState("All");

  // AI Copilot prompt box
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // New Workspace Modal
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsTopic, setNewWsTopic] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/api/papers").catch(() => ({ data: { papers: [] } })),
      api.get("/api/workspaces").catch(() => ({ data: { workspaces: [] } })),
      api.get("/api/workspaces/activities/recent").catch(() => ({ data: { activities: [] } })),
    ])
      .then(([papersRes, wsRes, actRes]) => {
        const livePapers = papersRes.data?.papers || [];
        setPapers(livePapers);
        setWorkspaces(wsRes.data?.workspaces || []);
        setActivities(actRes.data?.activities || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Display papers: strictly user's real uploaded papers
  const displayPapers = papers;

  // Unique topics for pills
  const availableTopics = useMemo(() => {
    const set = new Set();
    displayPapers.forEach((p) => {
      if (p.topic) set.add(p.topic);
      else if (p.folder) set.add(p.folder);
    });
    return ["All", ...Array.from(set)];
  }, [displayPapers]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return displayPapers.filter((p) => {
      const matchTopic =
        selectedTopic === "All" ||
        p.topic === selectedTopic ||
        p.folder === selectedTopic;
      const title = (p.title || p.filename || "").toLowerCase();
      const authors = (Array.isArray(p.authors) ? p.authors.join(" ") : p.authors || "").toLowerCase();
      const topic = (p.topic || p.folder || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query || title.includes(query) || authors.includes(query) || topic.includes(query);
      return matchTopic && matchQuery;
    });
  }, [displayPapers, selectedTopic, searchQuery]);

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
      toast.success("Paper uploaded and organized into your research workspace!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    try {
      await api.post("/api/workspaces", {
        name: newWsName.trim(),
        topic: newWsTopic.trim() || "General Research",
        description: newWsDesc.trim(),
      });
      toast.success("Workspace created successfully!");
      setShowNewWorkspaceModal(false);
      setNewWsName("");
      setNewWsTopic("");
      setNewWsDesc("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create workspace");
    }
  };

  const copyCitation = (paper, format = "IEEE") => {
    let authorsStr = "Unknown Authors";
    if (Array.isArray(paper.authors) && paper.authors.length > 0) {
      authorsStr = paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "");
    } else if (typeof paper.authors === "string" && paper.authors.trim()) {
      authorsStr = paper.authors.trim();
    }

    const titleStr = paper.title || paper.filename || "Untitled Research Paper";
    const journalStr = paper.journal || "ResearchNest Repository";
    const yearStr = paper.year || new Date().getFullYear();

    let citation = `${authorsStr}, "${titleStr}," ${journalStr}, ${yearStr}.`;

    if (format === "APA") {
      citation = `${authorsStr} (${yearStr}). ${titleStr}. ${journalStr}.`;
    } else if (format === "BibTeX") {
      const key = (Array.isArray(paper.authors) && paper.authors[0] ? paper.authors[0].split(" ").pop() : "paper") + yearStr;
      citation = `@article{${key},\n  title={${titleStr}},\n  author={${Array.isArray(paper.authors) ? paper.authors.join(" and ") : authorsStr}},\n  journal={${journalStr}},\n  year={${yearStr}}\n}`;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(citation);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = citation;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success(`${format} Citation copied to clipboard!`);
    } catch (err) {
      console.error("Copy citation error:", err);
      toast.error("Failed to copy. Standard IEEE: " + citation.slice(0, 40) + "...");
    }
  };

  const handleQuickAsk = async (promptText) => {
    if (!papers.length) {
      toast.error("Upload at least one paper to your library to query with AI Copilot.");
      return;
    }

    setAiPrompt(promptText);
    setAiThinking(true);
    setAiResponse(null);

    try {
      const targetIds = papers.slice(0, 5).map((p) => p._id);
      const { data } = await api.post("/api/ai/ask-across", {
        paperIds: targetIds,
        question: promptText,
      });

      setAiResponse({
        query: promptText,
        answer: data.result?.answer || "Synthesized answer from your library.",
        sources: data.result?.sources?.map((s) => s.title) || [papers[0].title || papers[0].filename],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "AI synthesis failed");
    } finally {
      setAiThinking(false);
    }
  };

  const handleHeroSearchSubmit = (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      toast.error("Please enter a paper title, topic, or question.");
      return;
    }

    if (searchTarget === "global") {
      navigate(`/discovery?q=${encodeURIComponent(query)}`);
    } else if (searchTarget === "ai") {
      handleQuickAsk(query);
    } else {
      const el = document.getElementById("library-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalPaperCount = papers.length;
  const totalWorkspaceCount = workspaces.length;
  const totalTopicCount = Math.max(0, availableTopics.length - 1);

  const activityMeta = {
    upload: { icon: Upload, tint: "bg-violet-100 text-violet-700" },
    ai: { icon: Sparkles, tint: "bg-fuchsia-100 text-fuchsia-700" },
    reader: { icon: Highlighter, tint: "bg-amber-100 text-amber-700" },
    writer: { icon: Quote, tint: "bg-sky-100 text-sky-700" },
    team: { icon: Users, tint: "bg-emerald-100 text-emerald-700" },
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F6F3FF] text-slate-900 selection:bg-violet-200 selection:text-violet-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-[22rem] w-[22rem] rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* =====================================================
            HERO SECTION (Matching Landing Page Styling)
        ====================================================== */}
        {/* =====================================================
            SIMPLE HERO SECTION
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
          {/* Ambient soft background blur */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Clean Top Title & Subtitle telling what ResearchNest does */}
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
                <Sparkles size={13} className="text-violet-400" />
                <span>ResearchNest • AI Research OS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {user?.name ? `Welcome back, ${user.name}` : "Your All-in-One AI Platform for Scientific Discovery"}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                ResearchNest helps researchers discover 200M+ papers, pinpoint unaddressed research gaps, read with inline AI assistance, and draft publication-ready surveys with IEEE & APA citations.
              </p>
            </div>

            {/* Primary Action Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-700 active:scale-95">
                <Upload size={15} />
                <span>{uploading ? "Uploading Paper..." : "Upload Paper PDF"}</span>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={uploading}
                  onChange={handleDirectUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowNewWorkspaceModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <Plus size={15} />
                New Workspace
              </button>

              <Link
                to="/discovery"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <Compass size={15} />
                Search 200M+ Papers
              </Link>
            </div>

            {/* Simple Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-violet-400 shrink-0" />
                <span><strong>{totalPaperCount}</strong> Saved Papers</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderKanban size={15} className="text-fuchsia-400 shrink-0" />
                <span><strong>{totalWorkspaceCount}</strong> Active Workspaces</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={15} className="text-amber-400 shrink-0" />
                <span>AI Gap Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Quote size={15} className="text-emerald-400 shrink-0" />
                <span>IEEE & APA Citations</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Library papers", value: totalPaperCount, hint: "Indexed full text", icon: FileText, wrap: "from-violet-50 to-white", iconWrap: "bg-violet-100 text-violet-700" },
            { label: "Lab workspaces", value: totalWorkspaceCount, hint: "Shared collections", icon: FolderKanban, wrap: "from-fuchsia-50 to-white", iconWrap: "bg-fuchsia-100 text-fuchsia-700" },
            { label: "Research topics", value: totalTopicCount, hint: "Auto-clustered", icon: Compass, wrap: "from-emerald-50 to-white", iconWrap: "bg-emerald-100 text-emerald-700" },
            { label: "Citation styles", value: "6", hint: "IEEE, APA & more", icon: Quote, wrap: "from-amber-50 to-white", iconWrap: "bg-amber-100 text-amber-700" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-3xl border border-white/80 bg-gradient-to-br ${stat.wrap} p-5 shadow-[0_10px_40px_-24px_rgba(76,29,149,0.35)] transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.iconWrap}`}>
                  <stat.icon size={18} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">Collaborative rooms</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Active research workspaces</h2>
              <p className="mt-1 text-sm text-slate-500">Papers, notes, AI chats, and team activity in one lab.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewWorkspaceModal(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700"
              >
                <Plus size={14} />
                New Workspace
              </button>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.length > 0 ? (
              workspaces.map((ws) => (
                <Link
                  key={ws._id}
                  to={`/projects/${ws._id}`}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
                >
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-100/70 blur-2xl transition group-hover:bg-violet-200/80" />
                  <div className="relative">
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-full bg-violet-50 px-3 py-1 font-bold text-violet-700">{ws.topic || "Research"}</span>
                      <span className="rounded-lg bg-slate-50 px-2 py-0.5 font-semibold text-slate-400">{ws.papersCount || 0} papers</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900 transition group-hover:text-violet-700">{ws.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {ws.description || "Active collaborative research collection."}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
                        <Users size={13} /> {ws.members?.length || 1} collaborator{(ws.members?.length || 1) !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-violet-600">
                        Open lab <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-[1.75rem] border-2 border-dashed border-violet-200 bg-white/70 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 mb-3 shadow-xs">
                  <FolderKanban size={26} />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Research Workspaces Yet</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
                  Create your first collaborative lab workspace to organize research papers, shared notes, and team milestones.
                </p>
                <button
                  onClick={() => setShowNewWorkspaceModal(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 transition"
                >
                  <Plus size={15} /> Create First Workspace
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(76,29,149,0.45)] backdrop-blur sm:p-7">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Research library</h2>
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">{filteredPapers.length}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Open a paper to read the PDF, highlight, and ask AI Assistant about the methods.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/discovery" className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
                    <Compass size={14} /> Search 200M+
                  </Link>
                  <Link to="/features/upload-organize" className="inline-flex items-center gap-1.5 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100">
                    <Upload size={14} /> Organize
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <Filter size={12} /> Topic
                </span>
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      selectedTopic === topic
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-16 text-violet-600">
                    <LoaderCircle className="animate-spin" size={36} />
                  </div>
                ) : filteredPapers.length > 0 ? (
                  filteredPapers.map((paper) => (
                    <div
                      key={paper._id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50/80 to-white p-5 transition hover:border-violet-300 hover:shadow-lg"
                    >
                      <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-violet-500 to-fuchsia-400 opacity-0 transition group-hover:opacity-100" />
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                              {paper.topic || paper.folder || "Research"}
                            </span>
                            {paper.year && <span className="text-[11px] font-semibold text-slate-400">{paper.year}</span>}
                            {paper.journal && <span className="text-[11px] text-slate-500">• {paper.journal}</span>}
                            {paper.citationCount !== undefined && (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                {paper.citationCount.toLocaleString()} citations
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 transition group-hover:text-violet-700">
                            <Link to={`/reader/${paper._id}`}>{paper.title || paper.filename}</Link>
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors || "Unknown authors"}
                          </p>
                          {paper.abstract && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{paper.abstract}</p>
                          )}
                          {paper.tags?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {paper.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-wrap items-end gap-2 sm:flex-col">
                          <Link
                            to={`/reader/${paper._id}`}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700"
                          >
                            <BookOpen size={14} />
                            Read PDF
                          </Link>
                          <button
                            onClick={() => copyCitation(paper)}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50"
                          >
                            <Copy size={13} className="text-violet-600" />
                            Cite IEEE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : papers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 mb-3">
                      <FileText size={22} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">No Research Papers in Your Library</p>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                      Upload a research PDF or search through 200M+ open-access papers on Discovery.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition">
                        <Upload size={14} /> Upload PDF
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
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Compass size={14} /> Discover Papers
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                    <p className="text-sm font-semibold text-slate-600">No papers matched your search.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTopic("All");
                      }}
                      className="mt-4 rounded-xl bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="overflow-hidden rounded-[1.75rem] border border-violet-200/60 bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-violet-500/15">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black">AI Copilot</h3>
                  <p className="text-[11px] text-violet-100">Ask across your library</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-violet-100">
                Extract methods, compare findings, or draft a literature summary from the papers you already have.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  "Find research gaps & missing benchmarks",
                  "Synthesize key innovations across papers",
                  "Compare methodology differences",
                  "Draft literature review in IEEE format",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickAsk(prompt)}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-left text-xs text-violet-50 transition hover:bg-white/20"
                  >
                    <span className="truncate pr-2">{prompt}</span>
                    <ArrowRight size={12} className="shrink-0 transition group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
              {aiThinking && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-black/20 p-3 text-xs text-violet-100">
                  <LoaderCircle className="animate-spin" size={15} />
                  Synthesizing library knowledge...
                </div>
              )}
              {aiResponse && (
                <div className="mt-4 space-y-2 rounded-2xl bg-white p-4 text-xs text-slate-900 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-violet-900">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={12} className="text-violet-600" />
                      AI synthesis
                    </span>
                    <button onClick={() => setAiResponse(null)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="font-serif leading-relaxed text-slate-600">{aiResponse.answer}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-semibold text-slate-400">Grounded in: {aiResponse.sources[0]}</span>
                    <Link to="/research" className="text-[11px] font-bold text-violet-600">
                      Open writer →
                    </Link>
                  </div>
                </div>
              )}
              <Link to="/research" className="mt-4 inline-flex items-center gap-1 border-t border-white/15 pt-3 text-xs font-bold text-white hover:text-violet-100">
                Full AI research assistant <ArrowRight size={13} />
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
                  <Clock size={16} className="text-violet-600" />
                  Recent activity
                </h3>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">Live</span>
              </div>
              <div className="mt-4 space-y-4">
                {activities.length > 0 ? (
                  activities.map((act) => {
                    const meta = activityMeta[act.type] || activityMeta.ai;
                    const Icon = meta.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-3 text-xs">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${meta.tint}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-tight text-slate-800">{act.action}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{act.user}</span>
                            <span>•</span>
                            <span>{act.time ? new Date(act.time).toLocaleDateString() : "Recent"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                    <p className="text-xs font-medium text-slate-500">No activity recorded yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Upload papers or create workspaces to build your audit timeline.</p>
                  </div>
                )}
              </div>
              <Link
                to="/projects"
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <Users size={14} />
                View workspace audits
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-slate-200/80 pt-10">
          <Features title="Platform Capabilities" subtitle="Explore the 6 Research Features" />
        </section>
      </main>

      {showNewWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Research Workspace</h3>
                <p className="text-xs text-slate-500">Group related papers and collaborate with team members</p>
              </div>
              <button
                onClick={() => setShowNewWorkspaceModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateWorkspace} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Workspace Title *</label>
                <input
                  type="text"
                  required
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="e.g. LLM Reasoning & Chain of Thought"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Research Topic / Discipline</label>
                <input
                  type="text"
                  value={newWsTopic}
                  onChange={(e) => setNewWsTopic(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">Description / Goals</label>
                <textarea
                  rows={3}
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="Briefly outline what research questions this workspace investigates..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewWorkspaceModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700">
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
