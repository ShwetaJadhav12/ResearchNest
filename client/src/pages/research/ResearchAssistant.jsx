import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  BrainCircuit,
  Check,
  ChevronRight,
  Clipboard,
  Download,
  FileText,
  Lightbulb,
  LoaderCircle,
  MessageSquare,
  Scale,
  Search,
  Sparkles,
  Target,
  X,
  PenTool,
  Database,
  Quote,
  Layers,
  FolderPlus,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const historyKey = "researchnest_ai_history";

const tools = [
  {
    id: "paper_writer",
    label: "Academic Paper Writer",
    description: "Draft sections with IEEE, APA, MLA citations",
    icon: PenTool,
    color: "fuchsia",
    min: 1,
    max: 8,
  },
  {
    id: "review",
    label: "Literature Review",
    description: "Synthesize multiple studies with citations",
    icon: BookOpenCheck,
    color: "emerald",
    min: 2,
    max: 6,
  },
  {
    id: "extract",
    label: "Component Extractor",
    description: "Extract datasets, methods, models, timelines",
    icon: Database,
    color: "sky",
    min: 1,
    max: 6,
  },
  {
    id: "summary",
    label: "AI Summary",
    description: "Understand one paper quickly",
    icon: Sparkles,
    color: "violet",
    min: 1,
    max: 1,
  },
  {
    id: "compare",
    label: "Compare Papers",
    description: "Compare research evidence side-by-side",
    icon: Scale,
    color: "purple",
    min: 2,
    max: 4,
  },
  {
    id: "ask",
    label: "Ask Paper",
    description: "Ask questions about one paper",
    icon: MessageSquare,
    color: "blue",
    min: 1,
    max: 1,
  },
  {
    id: "cross",
    label: "Cross-Paper Q&A",
    description: "Ask questions across multiple studies",
    icon: Search,
    color: "amber",
    min: 2,
    max: 6,
  },
];

const CITATION_STYLES = ["IEEE", "APA 7", "MLA", "Chicago", "Harvard", "BibTeX"];

const SECTIONS = [
  "Full Paper / Survey",
  "Abstract",
  "Introduction",
  "Literature Review",
  "Methodology",
  "Results & Discussion",
  "Conclusion",
  "Future Work",
];

const COMPONENT_TYPES = [
  { id: "datasets", label: "Datasets & Benchmarks" },
  { id: "methodologies", label: "Core Methodologies" },
  { id: "models", label: "Models & Architectures" },
  { id: "timelines", label: "Research Timeline" },
  { id: "limitations", label: "Limitations & Gaps" },
];

export default function ResearchAssistant() {
  const [papers, setPapers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [workspaceId, setWorkspaceId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [tool, setTool] = useState("paper_writer");

  // Options for tools
  const [citationStyle, setCitationStyle] = useState("IEEE");
  const [targetSection, setTargetSection] = useState("Literature Review");
  const [componentType, setComponentType] = useState("datasets");
  const [paperTopic, setPaperTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [focus, setFocus] = useState("");

  const [result, setResult] = useState(null);
  const [summaryResult, setSummaryResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------
  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem(historyKey) || "[]"));
    } catch {
      setHistory([]);
    }

    Promise.all([api.get("/api/papers"), api.get("/api/workspaces")])
      .then(([papersResponse, workspaceResponse]) => {
        setPapers(papersResponse.data.papers || []);
        setWorkspaces(workspaceResponse.data.workspaces || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load research library.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter papers by workspace
  const visiblePapers = useMemo(() => {
    if (!workspaceId) return papers;
    return papers.filter(
      (paper) => String(paper.workspace?._id || paper.workspace || "") === String(workspaceId)
    );
  }, [papers, workspaceId]);

  const activeTool = tools.find((item) => item.id === tool);

  const changeWorkspace = (value) => {
    setWorkspaceId(value);
    setSelectedIds([]);
    setSummaryResult(null);
    setResult(null);
    setError("");
  };

  const changeTool = (id) => {
    setTool(id);
    setSelectedIds([]);
    setSummaryResult(null);
    setResult(null);
    setError("");
  };

  const togglePaper = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((paperId) => paperId !== id);
      }
      if (activeTool?.max && current.length >= activeTool.max) {
        return current;
      }
      return [...current, id];
    });

    setSummaryResult(null);
    setResult(null);
    setError("");
  };

  const canRun =
    selectedIds.length >= (activeTool?.min || 1) &&
    selectedIds.length <= (activeTool?.max || 999);

  // --------------------------------------------------
  // RUN ANALYSIS / GENERATION
  // --------------------------------------------------
  const run = async () => {
    if (!canRun || working) return;

    setWorking(true);
    setError("");
    setResult(null);
    setSummaryResult(null);

    try {
      let data;

      // 1. Academic Paper / Survey Writer with Citations
      if (tool === "paper_writer") {
        ({ data } = await api.post("/api/ai/paper-writer", {
          paperIds: selectedIds,
          topic: paperTopic.trim(),
          section: targetSection,
          citationStyle,
          focus: focus.trim(),
          workspaceId: workspaceId || undefined,
        }));

        setResult({
          type: "academic_writing",
          value: data.writing,
          sourcePapers: data.sourcePapers,
        });

        toast.success(`Generated ${targetSection} with ${citationStyle} citations.`);
      }

      // 2. Component Extractor
      else if (tool === "extract") {
        ({ data } = await api.post("/api/ai/extract-components", {
          paperIds: selectedIds,
          componentType,
        }));

        setResult({
          type: "component_extraction",
          value: data.data,
        });
      }

      // 3. AI Summary
      else if (tool === "summary") {
        const paperId = selectedIds[0];
        ({ data } = await api.post(`/api/ai/summarize/${paperId}`));

        const entry = {
          paper: data.paper,
          summary: data.summary,
          createdAt: new Date().toISOString(),
        };

        setSummaryResult(entry);

        const next = [
          entry,
          ...history.filter((item) => item.paper.id !== entry.paper.id),
        ].slice(0, 5);

        setHistory(next);
        localStorage.setItem(historyKey, JSON.stringify(next));
      }

      // 4. Ask Single Paper
      else if (tool === "ask") {
        if (!question.trim()) throw new Error("Enter a question about the paper.");
        ({ data } = await api.post(`/api/ai/ask/${selectedIds[0]}`, {
          question: question.trim(),
        }));

        setResult({ type: "rag", value: data.result });
      }

      // 5. Compare Papers
      else if (tool === "compare") {
        ({ data } = await api.post("/api/ai/compare", {
          paperIds: selectedIds,
        }));

        setResult({ type: "compare", value: data.comparison });
      }

      // 6. Literature Review
      else if (tool === "review") {
        ({ data } = await api.post("/api/ai/literature-review", {
          paperIds: selectedIds,
          focus: focus.trim(),
        }));

        setResult({ type: "review", value: data.review });
      }

      // 7. Cross-Paper Q&A
      else if (tool === "cross") {
        if (!question.trim()) throw new Error("Enter a question across the papers.");
        ({ data } = await api.post("/api/ai/ask-across", {
          paperIds: selectedIds,
          question: question.trim(),
        }));

        setResult({ type: "rag", value: data.result });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Unable to complete the analysis."
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl md:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200">
              <BrainCircuit size={14} /> AI Research Copilot & Writing Engine
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
              Academic writing with
              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">
                real citations.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              Select papers from your workspace and let ResearchNest draft publication-ready sections,
              generate literature reviews with IEEE, APA 7, or BibTeX references, extract empirical datasets, and synthesize findings.
            </p>
          </div>
        </section>

        {/* WORKSPACE & TOOL SELECTION */}
        <section className="mt-8 grid gap-7 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            {/* STEP 1: SELECT WORKSPACE & PAPERS */}
            <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                    Step 1 • Research Context
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Select Research Workspace & Papers
                  </h2>
                </div>

                <div className="rounded-2xl bg-violet-50 px-4 py-2.5 text-right">
                  <p className="text-xs text-violet-600 font-medium">Selected</p>
                  <p className="text-xl font-black text-violet-800">{selectedIds.length}</p>
                </div>
              </div>

              {/* Workspace Selector */}
              <div className="mt-6">
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Target Workspace
                </label>
                <select
                  value={workspaceId}
                  onChange={(e) => changeWorkspace(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">All Workspaces ({papers.length} total papers)</option>
                  {workspaces.map((ws) => (
                    <option key={ws._id} value={ws._id}>
                      {ws.name} ({ws.topic || "Research"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Papers Grid */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Papers Available ({visiblePapers.length})
                  </p>
                  {selectedIds.length > 0 && (
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs font-semibold text-slate-400 hover:text-violet-600"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {!visiblePapers.length ? (
                  <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-8 text-center">
                    <FileText size={28} className="mx-auto text-violet-300" />
                    <p className="mt-2 text-sm font-bold text-slate-700">No papers in this workspace</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload PDFs or add papers from Discovery to analyze.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {visiblePapers.map((paper) => {
                      const isSelected = selectedIds.includes(paper._id);
                      return (
                        <button
                          key={paper._id}
                          type="button"
                          onClick={() => togglePaper(paper._id)}
                          className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition ${
                            isSelected
                              ? "border-violet-400 bg-violet-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              isSelected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {isSelected ? <Check size={16} /> : <FileText size={16} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {paper.title || paper.filename}
                            </p>
                            <p className="truncate text-[11px] text-slate-500 mt-0.5">
                              {paper.authors?.join(", ") || "Unknown authors"}
                              {paper.year ? ` • ${paper.year}` : ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: TOOL & CITATION SETTINGS */}
            <section className="mt-7 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Step 2 • Select Research Tool
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Configure AI Research Engine</h2>

              {/* Tool Cards */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === tool;
                  return (
                    <button
                      key={item.id}
                      onClick={() => changeTool(item.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-violet-500 bg-violet-50/80 shadow-sm"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          active ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={19} />
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.description}</p>
                      <p className="mt-2 text-[11px] font-bold text-violet-600">
                        {item.min === item.max ? `${item.min} paper` : `${item.min}–${item.max} papers`}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* TOOL SPECIFIC CONFIGURATIONS */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                {/* Academic Paper Writer Options */}
                {tool === "paper_writer" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Section Selector */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Target Academic Section
                        </label>
                        <select
                          value={targetSection}
                          onChange={(e) => setTargetSection(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500"
                        >
                          {SECTIONS.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Citation Style Selector */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                          Citation Style
                        </label>
                        <select
                          value={citationStyle}
                          onChange={(e) => setCitationStyle(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500"
                        >
                          {CITATION_STYLES.map((style) => (
                            <option key={style} value={style}>
                              {style} (In-text + References)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        Paper Title / Specific Topic
                      </label>
                      <input
                        value={paperTopic}
                        onChange={(e) => setPaperTopic(e.target.value)}
                        placeholder="e.g. Graph Neural Networks for Molecular Property Prediction"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                )}

                {/* Component Extractor Options */}
                {tool === "extract" && (
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      Component to Extract Across Studies
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMPONENT_TYPES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setComponentType(c.id)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                            componentType === c.id
                              ? "bg-violet-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Inputs for Ask / Cross tools */}
                {(tool === "ask" || tool === "cross") && (
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700">
                      {tool === "ask" ? "Question about the paper" : "Question across selected studies"}
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={3}
                      placeholder={
                        tool === "ask"
                          ? "e.g. What were the primary baseline models evaluated against?"
                          : "e.g. What common methodological weaknesses exist across these studies?"
                      }
                      className="w-full resize-none rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                {/* Focus input for review tool */}
                {tool === "review" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        Literature Review Focus (Optional)
                      </label>
                      <input
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        placeholder="e.g. Benchmarks and scaling constraints in vision transformers"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        Citation Format
                      </label>
                      <select
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-500"
                      >
                        {CITATION_STYLES.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Trigger Button */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  {!selectedIds.length
                    ? "Select paper(s) above to run AI analysis."
                    : selectedIds.length < (activeTool?.min || 1)
                    ? `Select at least ${activeTool.min} paper(s).`
                    : `Ready to analyze ${selectedIds.length} paper(s).`}
                </p>

                <button
                  onClick={run}
                  disabled={!canRun || working}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-105 disabled:opacity-40"
                >
                  {working ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  <span>
                    {working
                      ? "Generating..."
                      : tool === "paper_writer"
                      ? `Draft ${targetSection}`
                      : tool === "extract"
                      ? `Extract ${componentType}`
                      : tool === "summary"
                      ? "Generate Summary"
                      : tool === "review"
                      ? "Generate Review"
                      : "Run Analysis"}
                  </span>
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-100">
                  {error}
                </div>
              )}
            </section>

            {/* ---------------------------------------------------- */}
            {/* OUTPUT RESULT SECTION */}
            {/* ---------------------------------------------------- */}

            {/* ACADEMIC PAPER WRITER OUTPUT */}
            {result?.type === "academic_writing" && (
              <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-7 shadow-sm md:p-9">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
                        {result.value.section}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                        {result.value.citationStyle} Citations
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900">
                      {result.value.title}
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${result.value.content}\n\nReferences:\n${(result.value.references || [])
                            .map((r, i) => `[${i + 1}] ${r.text}`)
                            .join("\n")}`
                        );
                        toast.success("Copied paper text with citations!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Clipboard size={14} /> Copy
                    </button>

                    {result.value.bibtex && (
                      <button
                        onClick={() => {
                          const blob = new Blob([result.value.bibtex], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "citations.bib";
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Exported BibTeX!");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        <Quote size={14} /> BibTeX
                      </button>
                    )}
                  </div>
                </div>

                {/* Generated Academic Content */}
                <div className="mt-6 space-y-4 font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-line">
                  {result.value.content}
                </div>

                {/* References List */}
                {result.value.references?.length > 0 && (
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <h3 className="text-base font-bold text-slate-900 font-sans mb-3">
                      References ({result.value.citationStyle})
                    </h3>
                    <div className="space-y-2 text-xs text-slate-600 font-sans">
                      {result.value.references.map((ref, idx) => (
                        <p key={idx} className="pl-4 -indent-4">
                          <span className="font-bold text-violet-700 mr-2">
                            [{ref.index || idx + 1}]
                          </span>
                          {ref.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* COMPONENT EXTRACTION OUTPUT */}
            {result?.type === "component_extraction" && (
              <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Database size={20} className="text-violet-600" />
                  <h3 className="text-lg font-bold text-slate-900 capitalize">
                    Extracted {result.value.component}
                  </h3>
                </div>

                {result.value.synthesis && (
                  <div className="mb-6 rounded-2xl bg-violet-50 p-4 text-xs leading-relaxed text-violet-900">
                    <span className="font-bold block mb-1">Cross-Study Synthesis:</span>
                    {result.value.synthesis}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {(result.value.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs"
                    >
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.name || item.milestone || item.finding || item.limitation}
                      </h4>
                      {item.paperTitle && (
                        <p className="text-[11px] text-violet-600 font-semibold mt-0.5">
                          Source: {item.paperTitle}
                        </p>
                      )}
                      <p className="mt-2 text-slate-600 leading-relaxed">
                        {item.description || item.evidence || item.implication || item.novelty}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SUMMARY OUTPUT */}
            {summaryResult && (
              <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900">
                    AI Summary: {summaryResult.paper.title}
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(summaryResult.summary, null, 2));
                      toast.success("Copied summary!");
                    }}
                    className="text-xs font-semibold text-violet-600 hover:underline"
                  >
                    Copy JSON
                  </button>
                </div>

                <p className="rounded-2xl bg-violet-50 p-4 text-xs font-medium text-slate-800 leading-relaxed mb-4">
                  <strong>TL;DR: </strong> {summaryResult.summary.tldr}
                </p>

                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-800">Methodology</p>
                    <p className="mt-1 text-slate-600">{summaryResult.summary.methodology}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-800">Dataset / Evaluation</p>
                    <p className="mt-1 text-slate-600">{summaryResult.summary.dataset}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-800">Conclusion</p>
                    <p className="mt-1 text-slate-600">{summaryResult.summary.conclusion}</p>
                  </div>
                </div>
              </section>
            )}

            {/* RAG / Q&A OUTPUT */}
            {result?.type === "rag" && (
              <section className="mt-8 rounded-3xl border border-violet-100 bg-white p-7 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Grounded AI Answer</h3>
                <div className="rounded-2xl bg-violet-50 p-5 text-sm text-slate-800 leading-relaxed">
                  {result.value.answer}
                </div>

                {result.value.sources?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Supporting Evidence</p>
                    {result.value.sources.map((s, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                        <p className="font-semibold text-violet-700">{s.title || `Passage ${s.passage}`}</p>
                        <p className="mt-1">{s.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* LITERATURE REVIEW OUTPUT */}
            {result?.type === "review" && (
              <section className="mt-8 rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Synthesized Literature Review</h3>
                <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl mb-4">
                  {result.value.introduction}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <h4 className="font-bold text-slate-800 mb-2">Methodological Trends</h4>
                    <ul className="space-y-1 text-slate-600">
                      {(result.value.methodologicalTrends || []).map((m, i) => (
                        <li key={i}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <h4 className="font-bold text-slate-800 mb-2">Identified Research Gaps</h4>
                    <ul className="space-y-1 text-slate-600">
                      {(result.value.researchGaps || []).map((g, i) => (
                        <li key={i}>• {g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* PAPER COMPARISON OUTPUT */}
            {result?.type === "compare" && (
              <section className="mt-8 rounded-3xl border border-purple-100 bg-white p-7 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Comparative Synthesis</h3>
                <p className="text-xs text-slate-700 bg-purple-50 p-4 rounded-2xl mb-4">
                  {result.value.summary}
                </p>

                <div className="space-y-3">
                  {(result.value.dimensions || []).map((dim, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-100 p-4 text-xs">
                      <p className="font-bold text-violet-700 mb-2">{dim.name}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(dim.values || []).map((v, vIdx) => (
                          <div key={vIdx} className="bg-slate-50 p-2.5 rounded-xl">
                            <span className="font-semibold text-slate-700">{v.paper}: </span>
                            <span className="text-slate-600">{v.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ---------------------------------------------------- */}
          {/* SIDEBAR: RECENT SUMMARIES & INFO */}
          {/* ---------------------------------------------------- */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900">Citation Engine</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                ResearchNest automatically generates in-text citations ([1][2] for IEEE or (Author, Year) for APA) and
                produces reference lists grounded solely in the selected papers.
              </p>

              <div className="mt-4 rounded-2xl bg-violet-50 p-3 text-xs font-mono text-violet-800">
                Deep learning has significantly improved medical imaging [1][2].
              </div>
            </div>

            {/* Recent History */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Recent Summaries
              </h4>
              {!history.length ? (
                <p className="text-xs text-slate-400">Your generated summaries will appear here.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSummaryResult(entry);
                        setTool("summary");
                        setSelectedIds([entry.paper.id]);
                      }}
                      className="w-full text-left rounded-xl border border-slate-100 p-2.5 text-xs text-slate-700 hover:bg-violet-50 hover:border-violet-200 transition"
                    >
                      <p className="font-semibold truncate">{entry.paper.title}</p>
                      <span className="text-[10px] text-slate-400">Open summary</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}