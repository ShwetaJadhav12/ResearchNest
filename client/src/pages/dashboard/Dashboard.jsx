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
  ExternalLink,
  Plus,
  Search,
  CheckCircle2,
  Brain,
  Quote,
  Layers,
  Filter,
  Copy,
  Clock,
  Zap,
  Tag,
  Share2,
  FolderOpen,
  Bot,
  BarChart3,
  X,
  MessageSquare,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/landing/Footer";
import Features from "../../components/landing/Features";
import api from "../../api/axios";
import toast from "react-hot-toast";

const SEED_PAPERS = [
  {
    _id: "seed-1",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones"],
    year: 2017,
    topic: "Transformers & LLMs",
    citationCount: 128450,
    journal: "NeurIPS 2017",
    doi: "10.48550/arXiv.1706.03762",
    abstract: "We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.",
    source: "discovery",
    pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
    tags: ["Self-Attention", "NLP", "Sequence Transduction"],
  },
  {
    _id: "seed-2",
    title: "Deep Residual Learning for Image Recognition",
    authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
    year: 2016,
    topic: "Computer Vision",
    citationCount: 194300,
    journal: "CVPR 2016",
    doi: "10.1109/CVPR.2016.90",
    abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.",
    source: "upload",
    tags: ["ResNet", "Skip Connections", "Deep Architecture"],
  },
  {
    _id: "seed-3",
    title: "Language Models are Few-Shot Learners",
    authors: ["Tom B. Brown", "Benjamin Mann", "Nick Ryder", "Melanie Subbiah", "Jared Kaplan"],
    year: 2020,
    topic: "Generative AI",
    citationCount: 42100,
    journal: "NeurIPS 2020",
    doi: "10.48550/arXiv.2005.14165",
    abstract: "We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even becoming competitive with prior state-of-the-art fine-tuning approaches.",
    source: "discovery",
    tags: ["GPT-3", "In-Context Learning", "Scaling Laws"],
  },
  {
    _id: "seed-4",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    authors: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus", "Fabio Petroni"],
    year: 2020,
    topic: "Information Retrieval",
    citationCount: 14800,
    journal: "NeurIPS 2020",
    doi: "10.48550/arXiv.2005.11401",
    abstract: "Large pre-trained language models store factual knowledge in their parameters. We explore general-purpose fine-tuning recipes for retrieval-augmented generation (RAG).",
    source: "upload",
    tags: ["RAG", "Vector Search", "Dense Retrieval"],
  },
];

const SEED_ACTIVITIES = [
  {
    id: "act-1",
    action: "Uploaded Attention Is All You Need.pdf",
    time: "10 minutes ago",
    type: "upload",
    user: "Shweta (You)",
  },
  {
    id: "act-2",
    action: "AI generated research summary on Transformer Architectures",
    time: "1 hour ago",
    type: "ai",
    user: "Gemini 2.5 Flash",
  },
  {
    id: "act-3",
    action: "Highlighted 4 methodology sentences in ResNet study",
    time: "3 hours ago",
    type: "reader",
    user: "Shweta (You)",
  },
  {
    id: "act-4",
    action: "Synthesized IEEE literature review with 6 citations",
    time: "Yesterday",
    type: "writer",
    user: "AI Assistant",
  },
  {
    id: "act-5",
    action: "Invited Dr. Robert Chen as Editor to 'Autonomous Agents' workspace",
    time: "2 days ago",
    type: "team",
    user: "Shweta (You)",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [papers, setPapers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'papers' | 'workspaces' | 'ai'

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
    ])
      .then(([papersRes, wsRes]) => {
        const livePapers = papersRes.data?.papers || [];
        setPapers(livePapers);
        setWorkspaces(wsRes.data?.workspaces || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Display papers: combine live papers with seed papers if library is small
  const displayPapers = useMemo(() => {
    if (papers.length > 0) {
      return papers;
    }
    return SEED_PAPERS;
  }, [papers]);

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
      const authors = (p.authors || []).join(" ").toLowerCase();
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

  const copyCitation = (paper) => {
    const authorsStr = (paper.authors || []).slice(0, 3).join(", ") + ((paper.authors?.length || 0) > 3 ? " et al." : "");
    const citation = `${authorsStr}, "${paper.title || paper.filename}," ${paper.journal || "ResearchNest Repository"}, ${paper.year || new Date().getFullYear()}.`;
    navigator.clipboard.writeText(citation);
    toast.success("IEEE Citation copied to clipboard!");
  };

  const handleQuickAsk = (promptText) => {
    setAiPrompt(promptText);
    setAiThinking(true);
    setTimeout(() => {
      setAiThinking(false);
      setAiResponse({
        query: promptText,
        answer: `Based on the papers in your research library (including ${displayPapers[0]?.title || "Attention Is All You Need"}): Key breakthroughs center on removing recurrent computational bottlenecks through self-attention, enabling high degree of parallelization and state-of-the-art sequence modeling across downstream tasks.`,
        sources: [displayPapers[0]?.title || "Attention Is All You Need"],
      });
    }, 1200);
  };

  const totalPaperCount = papers.length > 0 ? papers.length : 4;
  const totalWorkspaceCount = workspaces.length > 0 ? workspaces.length : 2;
  const totalTopicCount = availableTopics.length - 1 || 3;

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 selection:bg-purple-200 selection:text-purple-900 pb-20">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* TOP HERO & SEARCH APP BAR */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-900 via-purple-800 to-slate-950 p-6 sm:p-10 text-white shadow-2xl shadow-violet-950/20">
          {/* Ambient Glows */}
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Bar with User Greeting & Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold border border-white/15 backdrop-blur-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {user?.name ? `Welcome, ${user.name}` : "Research Workspace"}
                  </h1>
                  <p className="text-xs text-violet-200/80 font-medium">
                    Connected papers, notes, citations, and workspaces
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini Active
                </span>
              </div>
            </div>

            {/* Central Unified Search Bar */}
            <div className="mt-6 relative max-w-2xl">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-4 text-violet-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by title, author, or topic..."
                  className="w-full rounded-xl bg-white/10 border border-white/20 pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-violet-200/60 outline-none backdrop-blur-md transition focus:border-white focus:bg-white/15"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-violet-300 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
              <Link
                to="/features/upload-organize"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-violet-900 px-3.5 py-1.5 text-xs font-bold shadow hover:bg-violet-50 transition"
              >
                <FileText size={14} className="text-violet-700" />
                <span>Upload & Organize</span>
              </Link>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/25 transition">
                <Upload size={13} />
                <span>{uploading ? "Analyzing..." : "Quick Upload"}</span>
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/25 transition"
              >
                <Compass size={13} className="text-emerald-300" />
                <span>Discovery</span>
              </Link>

              <Link
                to="/research"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/25 transition"
              >
                <Sparkles size={13} className="text-fuchsia-300" />
                <span>AI Writer</span>
              </Link>

              <Link
                to="/knowledge-graph"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/25 transition"
              >
                <Brain size={13} className="text-sky-300" />
                <span>Knowledge Graph</span>
              </Link>

              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/25 transition"
              >
                <Users size={13} className="text-purple-300" />
                <span>Workspaces</span>
              </Link>
            </div>
          </div>
        </section>

        {/* METRICS ROW */}
        <section className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Library Papers</span>
              <FileText size={16} className="text-violet-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalPaperCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Workspaces</span>
              <FolderKanban size={16} className="text-fuchsia-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalWorkspaceCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Topics</span>
              <Compass size={16} className="text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{totalTopicCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Citation Formats</span>
              <Quote size={16} className="text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">6 Styles</p>
          </div>
        </section>

        {/* WORKSPACE & COLLABORATION HUBS PREVIEW */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Active Research Workspaces
              </h2>
              <p className="text-xs text-slate-500">
                All papers, notes, AI chats, and team activities connected in shared hubs
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewWorkspaceModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 px-3.5 py-1.5 text-xs font-bold transition"
              >
                <Plus size={15} />
                <span>New Workspace</span>
              </button>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 transition"
              >
                View all ({totalWorkspaceCount}) →
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.length > 0 ? (
              workspaces.map((ws) => (
                <Link
                  key={ws._id}
                  to={`/projects/${ws._id}`}
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5 font-bold text-violet-700">
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
                    {ws.description || "Active collaborative research collection."}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">
                      {ws.members?.length || 1} team member{ws.members?.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-bold text-violet-600 inline-flex items-center gap-1">
                      Open Project <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              // Default seed workspace cards for immediate rich look
              <>
                <Link
                  to="/projects"
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5 font-bold text-violet-700">
                      LLM Reasoning
                    </span>
                    <span className="font-semibold text-slate-400">4 papers</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-violet-700 transition">
                    Transformer Architectures & Reasoning
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    Surveying modern self-attention, in-context learning, and retrieval augmentation.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">2 collaborators</span>
                    <span className="font-bold text-violet-600 inline-flex items-center gap-1">
                      Open Project <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>

                <Link
                  to="/projects"
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 font-bold text-emerald-700">
                      Computer Vision
                    </span>
                    <span className="font-semibold text-slate-400">3 papers</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    Visual Representation & Deep ResNets
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                    Residual learning frameworks, vision transformers, and multi-modal feature extractors.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">1 collaborator</span>
                    <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                      Open Project <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>

                <div
                  onClick={() => setShowNewWorkspaceModal(true)}
                  className="cursor-pointer rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50/40 p-6 flex flex-col items-center justify-center text-center hover:bg-violet-50 transition"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 mb-2">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-violet-900">Create New Workspace</h3>
                  <p className="text-xs text-violet-600 mt-1">
                    Group papers, notes, and team members into a focused lab space.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* MAIN WORKFLOW GRID: PAPERS LIBRARY + AI COPILOT & ACTIVITY */}
        <section className="mt-10 grid gap-8 lg:grid-cols-12">
          
          {/* LEFT 8 COLUMNS: PAPERS LIBRARY & FILTERS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header with Topic Filters */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    Research Papers Library
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                      {filteredPapers.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any paper to read with in-line AI assistance, or copy academic citations
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/discovery"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 transition"
                  >
                    <Compass size={14} />
                    Search 200M+ Papers
                  </Link>

                  <Link
                    to="/features/upload-organize"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 text-xs font-bold hover:bg-violet-100 transition"
                  >
                    <Upload size={14} />
                    Upload & Organize (F1)
                  </Link>
                </div>
              </div>

              {/* Topic Filter Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter size={12} /> Filter:
                </span>
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                      selectedTopic === topic
                        ? "bg-violet-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Papers List */}
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12 text-violet-600">
                    <LoaderCircle className="animate-spin" size={32} />
                  </div>
                ) : filteredPapers.length > 0 ? (
                  filteredPapers.map((paper) => (
                    <div
                      key={paper._id}
                      className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 hover:bg-white hover:border-violet-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                              {paper.topic || paper.folder || "Research"}
                            </span>
                            {paper.year && (
                              <span className="text-[11px] font-semibold text-slate-400">
                                {paper.year}
                              </span>
                            )}
                            {paper.journal && (
                              <span className="text-[11px] font-medium text-slate-500">
                                • {paper.journal}
                              </span>
                            )}
                            {paper.citationCount !== undefined && (
                              <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                                {paper.citationCount.toLocaleString()} Citations
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-violet-700 transition leading-snug">
                            {paper.title || paper.filename}
                          </h3>

                          {/* Authors */}
                          <p className="mt-1 text-xs text-slate-500 font-medium">
                            {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors || "Unknown Authors"}
                          </p>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0 pt-2 sm:pt-0">
                          <Link
                            to={`/reader/${paper._id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:shadow transition"
                          >
                            <BookOpen size={14} />
                            Read with AI
                          </Link>

                          <button
                            onClick={() => copyCitation(paper)}
                            className="inline-flex items-center gap-1 rounded-xl bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 px-2.5 py-1.5 text-xs font-semibold shadow-xs transition"
                            title="Copy IEEE Citation"
                          >
                            <Copy size={13} className="text-violet-600" />
                            Cite IEEE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                    <p className="text-sm font-semibold text-slate-600">No papers matched your search.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTopic("All");
                      }}
                      className="mt-4 rounded-xl bg-violet-50 text-violet-700 px-4 py-2 text-xs font-bold hover:bg-violet-100 transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: AI COPILOT QUERY + RECENT ACTIVITY STREAM */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* AI Research Companion Box */}
            <div className="rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-violet-500/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Gemini 2.5 Flash Copilot</h3>
                  <p className="text-[11px] text-violet-100">Live Research Assistant</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-violet-100 leading-relaxed">
                Query across all papers in your library to extract methodology, compare findings, or synthesize summaries.
              </p>

              {/* Quick Prompt Pills */}
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-200">
                  Instant Prompts
                </p>
                {[
                  "Synthesize key innovations across papers",
                  "Compare methodology differences",
                  "Draft literature review in IEEE format",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAsk(prompt)}
                    className="w-full text-left rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2 text-xs text-violet-50 transition flex items-center justify-between"
                  >
                    <span className="truncate pr-2">{prompt}</span>
                    <ArrowRight size={12} className="shrink-0 text-violet-200" />
                  </button>
                ))}
              </div>

              {/* Live Answer Box */}
              {aiThinking && (
                <div className="mt-4 rounded-xl bg-black/20 p-3 text-xs text-violet-100 flex items-center gap-2">
                  <LoaderCircle className="animate-spin" size={15} />
                  <span>Synthesizing library knowledge...</span>
                </div>
              )}

              {aiResponse && (
                <div className="mt-4 rounded-xl bg-white text-slate-900 p-4 text-xs shadow-lg space-y-2">
                  <div className="flex items-center justify-between font-bold text-violet-900 border-b border-slate-100 pb-1.5">
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} className="text-violet-600" />
                      Gemini Synthesis
                    </span>
                    <button
                      onClick={() => setAiResponse(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-serif">
                    {aiResponse.answer}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Grounded in: {aiResponse.sources[0]}
                    </span>
                    <Link
                      to="/research"
                      className="text-[11px] font-bold text-violet-600 hover:text-violet-800"
                    >
                      Open in Writer →
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                <Link
                  to="/research"
                  className="font-bold text-white hover:text-violet-200 flex items-center gap-1"
                >
                  Full AI Writer <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Recent Activity Feed (Integrated from Home Page) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-violet-600" />
                  Recent Research Activity
                </h3>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {SEED_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                      <CheckCircle2 size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 leading-tight">
                        {act.action}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{act.user}</span>
                        <span>•</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  to="/projects"
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-violet-50 hover:text-violet-700 text-slate-600 py-2 text-xs font-semibold transition"
                >
                  <Users size={14} />
                  <span>View All Workspace Audits</span>
                </Link>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* CREATE WORKSPACE MODAL */}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Workspace Title *
                </label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Research Topic / Discipline
                </label>
                <input
                  type="text"
                  value={newWsTopic}
                  onChange={(e) => setNewWsTopic(e.target.value)}
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Description / Goals
                </label>
                <textarea
                  rows={3}
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="Briefly outline what research questions this workspace investigates..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewWorkspaceModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-violet-500/20 transition"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-20">
        <Footer />
      </div>

    </div>
  );
}
