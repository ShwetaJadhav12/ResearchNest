import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  BookOpen,
  FileText,
  Users,
  Compass,
  Download,
  ExternalLink,
  Plus,
  BookmarkPlus,
  LoaderCircle,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  ArrowRight,
  Database,
  Building2,
  Award,
  Globe,
  Tag,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const SUGGESTED_TOPICS = [
  "AI for Alzheimer's diagnosis",
  "Graph Neural Networks drug discovery",
  "Quantum error correction surface codes",
  "Multimodal large language models",
  "CRISPR Cas9 off-target reduction",
  "Climate change predictive carbon sequestration",
];

export default function ResearchDiscovery() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [source, setSource] = useState("all");
  const [yearFilter, setYearFilter] = useState("");
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState({
    keyAuthors: [],
    researchAreas: [],
    journals: [],
    datasets: [],
  });

  // Active Category Tab: "papers", "authors", "areas", "journals", "datasets"
  const [activeCategoryTab, setActiveCategoryTab] = useState("papers");

  // AI Research Overview state
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [aiOverview, setAiOverview] = useState(null);
  const [overviewExpanded, setOverviewExpanded] = useState(true);

  // Add to Workspace modal state
  const [workspaces, setWorkspaces] = useState([]);
  const [targetPaper, setTargetPaper] = useState(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [addingToWs, setAddingToWs] = useState(false);

  // Load user's workspaces for the "Add to Workspace" dropdown
  useEffect(() => {
    api
      .get("/api/workspaces")
      .then(({ data }) => setWorkspaces(data.workspaces || []))
      .catch((err) => console.warn("Failed to load workspaces:", err));
  }, []);

  // ----------------------------------------------------
  // SEARCH PAPERS
  // ----------------------------------------------------
  const handleSearch = async (e, topicQuery = "") => {
    if (e) e.preventDefault();
    const q = (topicQuery || query).trim();
    if (!q) return;

    setLoading(true);
    setActiveQuery(q);
    setAiOverview(null);

    try {
      const params = {
        q,
        source,
        year: yearFilter || undefined,
        openAccess: openAccessOnly ? "true" : undefined,
      };

      const { data } = await api.get("/api/discovery/search", { params });

      setPapers(data.papers || []);
      setCategories(
        data.categories || {
          keyAuthors: [],
          researchAreas: [],
          journals: [],
          datasets: [],
        }
      );
      setActiveCategoryTab("papers");

      if ((data.papers || []).length > 0) {
        toast.success(`Found ${data.papers.length} real academic papers.`);
        // Automatically trigger AI overview synthesis in background
        fetchAiOverview(q, data.papers);
      } else {
        toast("No papers found matching query.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // FETCH AI RESEARCH OVERVIEW
  // ----------------------------------------------------
  const fetchAiOverview = async (topic, papersList) => {
    if (!papersList?.length) return;
    setOverviewLoading(true);

    try {
      const { data } = await api.post("/api/discovery/overview", {
        topic,
        papers: papersList.slice(0, 15),
      });

      setAiOverview(data.overview);
    } catch (err) {
      console.warn("AI overview generation failed:", err.message);
    } finally {
      setOverviewLoading(false);
    }
  };

  // ----------------------------------------------------
  // ADD PAPER TO WORKSPACE
  // ----------------------------------------------------
  const handleAddToWorkspace = async () => {
    if (!targetPaper) return;

    let wsId = selectedWorkspaceId;

    setAddingToWs(true);
    try {
      // If user wants to create a new workspace right here
      if (showCreateWs && newWorkspaceName.trim()) {
        const wsRes = await api.post("/api/workspaces", {
          name: newWorkspaceName.trim(),
          topic: targetPaper.topics?.[0] || activeQuery || "Research",
          description: `Created for research on ${activeQuery}`,
        });
        wsId = wsRes.data.workspace._id;
        setWorkspaces([wsRes.data.workspace, ...workspaces]);
      }

      if (!wsId) {
        toast.error("Please select or create a workspace.");
        setAddingToWs(false);
        return;
      }

      const { data } = await api.post("/api/discovery/add-to-workspace", {
        workspaceId: wsId,
        paperData: targetPaper,
      });

      toast.success(
        <div className="flex items-center gap-2">
          <span>Added to workspace!</span>
          <button
            onClick={() => navigate(`/reader/${data.paper._id}`)}
            className="rounded bg-violet-700 px-2 py-0.5 text-xs font-bold text-white hover:bg-violet-800"
          >
            Open in Reader
          </button>
        </div>,
        { duration: 5000 }
      );

      // Close modal
      setTargetPaper(null);
      setShowCreateWs(false);
      setNewWorkspaceName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add paper to workspace.");
    } finally {
      setAddingToWs(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------- */}
        {/* HERO SEARCH HEADER */}
        {/* ---------------------------------------------------- */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200">
              <Compass size={14} /> Real Academic Research Discovery
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Discover real academic papers.
              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">
                Bring them into your workspace.
              </span>
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
              Search millions of peer-reviewed articles across OpenAlex, Semantic Scholar, and arXiv.
              Organize real citations, synthesize insights with Gemini, and add papers directly into your research projects.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search size={22} className="text-violet-600 shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter a research topic, DOI, or concept (e.g. AI for Alzheimer's diagnosis)..."
                    className="w-full bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.02] disabled:opacity-40"
                >
                  {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Search size={18} />}
                  <span>{loading ? "Searching..." : "Search Research"}</span>
                </button>
              </div>
            </form>

            {/* Suggested Topic Chips */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Try searching:</span>
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    setQuery(topic);
                    handleSearch(null, topic);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 hover:border-violet-400 hover:bg-violet-600/30 transition"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* FILTER CONTROLS BAR */}
        {/* ---------------------------------------------------- */}
        {papers.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1 text-slate-400">
                <Filter size={14} /> Filter by:
              </span>

              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  handleSearch(null, activeQuery);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 outline-none focus:border-violet-500"
              >
                <option value="all">All Academic Sources</option>
                <option value="openalex">OpenAlex (Peer-reviewed)</option>
                <option value="arxiv">arXiv Preprints</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  handleSearch(null, activeQuery);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 outline-none focus:border-violet-500"
              >
                <option value="">Any Publication Year</option>
                <option value="2025">2025 & Newer</option>
                <option value="2023">2023 & Newer</option>
                <option value="2020">2020 & Newer</option>
                <option value="2015">2015 & Newer</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={openAccessOnly}
                  onChange={(e) => {
                    setOpenAccessOnly(e.target.checked);
                    handleSearch(null, activeQuery);
                  }}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span>Open Access PDFs Only</span>
              </label>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-slate-700">{papers.length}</strong> academic publications
            </p>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* AI RESEARCH OVERVIEW (GROUNDED IN RETRIEVED PAPERS) */}
        {/* ---------------------------------------------------- */}
        {activeQuery && (
          <section className="mt-7 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-purple-50/40 to-white p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-200">
                  <Sparkles size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">AI Research Overview</h2>
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                      Grounded in {papers.length} papers
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gemini strategic intelligence synthesized from retrieved academic literature for "{activeQuery}".
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOverviewExpanded(!overviewExpanded)}
                className="flex items-center gap-1 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50"
              >
                {overviewExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>{overviewExpanded ? "Collapse" : "Expand"}</span>
              </button>
            </div>

            {overviewLoading ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/80 p-5 text-sm font-semibold text-violet-700 border border-violet-100">
                <LoaderCircle size={18} className="animate-spin" />
                Synthesizing state of the art from {papers.length} publications...
              </div>
            ) : aiOverview && overviewExpanded ? (
              <div className="mt-6 space-y-6">
                {/* Executive Summary */}
                {aiOverview.executiveSummary && (
                  <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-700 border border-violet-100 shadow-sm">
                    <span className="font-bold text-violet-700 uppercase tracking-wider text-xs block mb-1">
                      State of the Art Synthesis
                    </span>
                    {aiOverview.executiveSummary}
                  </div>
                )}

                {/* Grid of Synthesis Categories */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Major Research Areas */}
                  <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                      <Compass size={16} className="text-violet-600" /> Major Research Areas
                    </h3>
                    <ul className="space-y-3">
                      {(aiOverview.majorResearchAreas || []).map((area, idx) => (
                        <li key={idx} className="text-xs">
                          <span className="font-bold text-slate-800">{area.name}</span>
                          <span className="ml-1.5 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-600">
                            {area.trend || "Active"}
                          </span>
                          <p className="mt-1 text-slate-500 leading-relaxed">{area.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common Methods */}
                  <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                      <BookOpen size={16} className="text-fuchsia-600" /> Common Methods
                    </h3>
                    <ul className="space-y-3">
                      {(aiOverview.commonMethods || []).map((m, idx) => (
                        <li key={idx} className="text-xs">
                          <span className="font-bold text-slate-800">{m.method}</span>
                          <p className="mt-1 text-slate-500 leading-relaxed">{m.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Emerging Directions & Opportunities */}
                  <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                      <Award size={16} className="text-emerald-600" /> Emerging Opportunities
                    </h3>
                    <ul className="space-y-3">
                      {(aiOverview.researchOpportunities || []).map((opp, idx) => (
                        <li key={idx} className="text-xs">
                          <span className="font-bold text-slate-800">{opp.opportunity}</span>
                          <p className="mt-1 text-slate-500 leading-relaxed">{opp.potentialImpact}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* ---------------------------------------------------- */}
        {/* DISCOVERY CATEGORY NAVIGATION TABS */}
        {/* ---------------------------------------------------- */}
        {papers.length > 0 && (
          <div className="mt-8 border-b border-slate-200">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "papers", label: `Relevant Papers (${papers.length})`, icon: FileText },
                { id: "authors", label: `Key Authors (${categories.keyAuthors?.length || 0})`, icon: Users },
                { id: "areas", label: `Research Areas (${categories.researchAreas?.length || 0})`, icon: Compass },
                { id: "journals", label: `Journals & Conferences (${categories.journals?.length || 0})`, icon: Building2 },
                { id: "datasets", label: `Datasets (${categories.datasets?.length || 0})`, icon: Database },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeCategoryTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                      active
                        ? "border-violet-600 text-violet-700"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* CATEGORY TAB CONTENT */}
        {/* ---------------------------------------------------- */}
        <div className="mt-8">
          {/* TAB 1: RELEVANT PAPERS */}
          {activeCategoryTab === "papers" && (
            <div className="space-y-4">
              {!papers.length && !loading ? (
                <div className="rounded-3xl border border-dashed border-violet-200 bg-white p-16 text-center">
                  <Compass size={38} className="mx-auto text-violet-300" />
                  <h3 className="mt-4 text-lg font-bold text-slate-800">Discover Academic Research</h3>
                  <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                    Type a research question or topic above to retrieve real academic literature from global research sources.
                  </p>
                </div>
              ) : (
                papers.map((paper) => (
                  <article
                    key={paper.id}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 md:p-7 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {paper.isOpenAccess ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700">
                              <CheckCircle2 size={12} /> Open Access
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
                              Publisher Access
                            </span>
                          )}

                          {paper.year && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-700">
                              {paper.year}
                            </span>
                          )}

                          {paper.journal && (
                            <span className="rounded-full bg-violet-50 px-2.5 py-0.5 font-medium text-violet-700">
                              {paper.journal}
                            </span>
                          )}

                          {paper.citationCount > 0 && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">
                              {paper.citationCount} Citations
                            </span>
                          )}

                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                            Source: {paper.source}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-violet-700 transition leading-snug">
                          {paper.title}
                        </h2>

                        {/* Authors */}
                        <p className="mt-2 text-xs text-slate-600">
                          {paper.authors?.length
                            ? paper.authors.join(", ")
                            : "Author details unavailable"}
                        </p>

                        {/* Abstract */}
                        {paper.abstract && (
                          <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">
                            {paper.abstract}
                          </p>
                        )}

                        {/* Topics & Concepts */}
                        {paper.topics?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {paper.topics.map((t, idx) => (
                              <span
                                key={idx}
                                className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-end">
                        {/* 1-CLICK ADD TO WORKSPACE */}
                        <button
                          onClick={() => {
                            setTargetPaper(paper);
                            if (workspaces.length > 0) {
                              setSelectedWorkspaceId(workspaces[0]._id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-200 transition hover:scale-105"
                        >
                          <FolderPlus size={15} /> Add to Workspace
                        </button>

                        {/* Official Paper / Publisher Link */}
                        {paper.officialUrl && (
                          <a
                            href={paper.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <ExternalLink size={13} /> View Paper
                          </a>
                        )}

                        {/* Download PDF if available */}
                        {paper.isOpenAccess && paper.pdfUrl && (
                          <a
                            href={paper.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <Download size={13} /> Free PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* TAB 2: KEY AUTHORS */}
          {activeCategoryTab === "authors" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.keyAuthors?.map((author, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-violet-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700 text-sm">
                      {author.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{author.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {author.papersCount} {author.papersCount === 1 ? "paper" : "papers"} in results
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setQuery(author.name);
                      handleSearch(null, author.name);
                    }}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-violet-600 hover:border-violet-200"
                    title={`Search more papers by ${author.name}`}
                  >
                    <Search size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: RESEARCH AREAS */}
          {activeCategoryTab === "areas" && (
            <div className="flex flex-wrap gap-2.5">
              {categories.researchAreas?.map((area, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(area.name);
                    handleSearch(null, area.name);
                  }}
                  className="group flex items-center gap-2 rounded-2xl border border-violet-100 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50 transition"
                >
                  <Tag size={13} className="text-violet-500" />
                  <span>{area.name}</span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                    {area.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 4: JOURNALS & CONFERENCES */}
          {activeCategoryTab === "journals" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.journals?.map((venue, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Building2 size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate text-xs font-bold text-slate-800">{venue.name}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {venue.count} {venue.count === 1 ? "publication" : "publications"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: DATASETS */}
          {activeCategoryTab === "datasets" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.datasets?.length ? (
                categories.datasets.map((dataset, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Database size={18} className="text-violet-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-slate-800">{dataset}</p>
                      <span className="text-[10px] text-slate-400">Identified in literature</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-8">No specific named datasets extracted from this search query.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* "ADD TO WORKSPACE" MODAL */}
      {/* ---------------------------------------------------- */}
      {targetPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Feature 1 & 4 Connected
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Add Paper to Workspace</h3>
              </div>
              <button
                onClick={() => setTargetPaper(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Paper Info */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900 truncate">{targetPaper.title}</p>
              <p className="mt-1 text-slate-500 truncate">
                {targetPaper.authors?.join(", ") || "Unknown authors"}
              </p>
            </div>

            {/* Workspace Selection */}
            <div className="mt-5">
              {!showCreateWs ? (
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Select Target Workspace
                  </label>
                  <select
                    value={selectedWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws._id} value={ws._id}>
                        {ws.name} ({ws.topic || "Research"})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowCreateWs(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800"
                  >
                    <Plus size={14} /> Or create a new workspace for this
                  </button>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    New Workspace Name
                  </label>
                  <input
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="e.g. Medical Imaging AI"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreateWs(false)}
                    className="mt-2 text-xs text-slate-500 hover:underline"
                  >
                    Choose an existing workspace instead
                  </button>
                </div>
              )}
            </div>

            {/* Information Alert */}
            <div className="mt-5 rounded-xl bg-violet-50 p-3 text-xs leading-relaxed text-violet-800 flex items-start gap-2">
              <Sparkles size={16} className="text-violet-600 shrink-0 mt-0.5" />
              <span>
                Once added, this paper is immediately connected across your entire workspace: available in your
                <strong> Research Library</strong>, ready for <strong>AI Assistant</strong>, and readable in the
                <strong> AI Research Reader</strong>.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTargetPaper(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addingToWs || (!selectedWorkspaceId && !newWorkspaceName.trim())}
                onClick={handleAddToWorkspace}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-200 hover:scale-105 disabled:opacity-40"
              >
                {addingToWs ? <LoaderCircle size={15} className="animate-spin" /> : <FolderPlus size={15} />}
                <span>{addingToWs ? "Adding..." : "Add to Workspace"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
