import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  FileText,
  Highlighter,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  X,
  Check,
  Send,
  LoaderCircle,
  Copy,
  Plus,
  Trash2,
  Filter,
  Maximize2,
  Minimize2,
  Eye,
  Settings2,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { SEED_PAPERS } from "../../data/seedPapers";

const seedById = Object.fromEntries(SEED_PAPERS.map((p) => [p._id, p]));

const HIGHLIGHT_COLORS = [
  { name: "purple", bg: "bg-purple-200/70", border: "border-purple-400", hex: "#c084fc", ring: "ring-purple-400" },
  { name: "yellow", bg: "bg-amber-200/70", border: "border-amber-400", hex: "#fcd34d", ring: "ring-amber-400" },
  { name: "green", bg: "bg-emerald-200/70", border: "border-emerald-400", hex: "#6ee7b7", ring: "ring-emerald-400" },
  { name: "blue", bg: "bg-sky-200/70", border: "border-sky-400", hex: "#7dd3fc", ring: "ring-sky-400" },
  { name: "pink", bg: "bg-pink-200/70", border: "border-pink-400", hex: "#f472b6", ring: "ring-pink-400" },
];

export default function PaperReader() {
  const { paperId } = useParams();
  const [activePaperId, setActivePaperId] = useState(paperId || "");
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [allPapers, setAllPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mode: "text" (interactive AI reading) or "pdf" (native PDF view)
  const [viewMode, setViewMode] = useState("text");
  const [pdfTheme, setPdfTheme] = useState("light"); // "light", "sepia", "night"
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);

  const copyBibTexCitation = () => {
    const title = paper?.title || "Research Paper";
    const author = paper?.authors?.join(" and ") || "Unknown Author";
    const year = paper?.year || new Date().getFullYear();
    const journal = paper?.journal || "ResearchNest Repository";
    const citeKey = (paper?.authors?.[0]?.split(" ")?.pop() || "paper") + year;
    const bibtex = `@article{${citeKey},\n  title={${title}},\n  author={${author}},\n  journal={${journal}},\n  year={${year}}\n}`;

    navigator.clipboard.writeText(bibtex);
    toast.success("BibTeX citation copied to clipboard!");
  };

  // Selection & AI Quick Action state
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState(null);
  const [activeAIAction, setActiveAIAction] = useState(null);
  const [aiActionLoading, setAiActionLoading] = useState(false);
  const [aiActionResult, setAiActionResult] = useState(null);
  const [customQuestion, setCustomQuestion] = useState("");

  // Reader typography
  const [fontSize, setFontSize] = useState("text-base"); // text-sm, text-base, text-lg
  const [fontFamily, setFontFamily] = useState("font-serif"); // font-serif, font-sans

  // Right Side Panel Tabs: "copilot", "notes", "ideas"
  const [activeTab, setActiveTab] = useState("copilot");
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  // Annotations (highlights, notes, questions, ideas)
  const [annotations, setAnnotations] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterColor, setFilterColor] = useState("all");

  // Note creation modal
  const [noteInput, setNoteInput] = useState("");
  const [selectedColor, setSelectedColor] = useState("purple");
  const [savingAnnotation, setSavingAnnotation] = useState(false);

  // Copilot chat state
  const [chatMessages, setChatMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! I am your AI Reading Assistant. Select any text in the paper to explain, simplify, or critique it, or ask me any question about the methodology, results, and findings.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const textContainerRef = useRef(null);
  const pdfObjectUrlRef = useRef("");
  const [pdfSrc, setPdfSrc] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // ----------------------------------------------------
  // INITIALIZE / RESOLVE ACTIVE PAPER
  // ----------------------------------------------------
  useEffect(() => {
    if (paperId) {
      setActivePaperId(paperId);
      return;
    }

    // No paperId provided: fetch papers and pick the first one
    api
      .get("/api/papers")
      .then(({ data }) => {
        const list = data.papers || [];
        setAllPapers(list);
        if (list.length > 0) {
          setActivePaperId(list[0]._id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load library.");
        setLoading(false);
      });
  }, [paperId]);

  // ----------------------------------------------------
  // FETCH PAPER & ANNOTATIONS
  // ----------------------------------------------------
  useEffect(() => {
    if (!activePaperId) return;

    const seedPaper = seedById[activePaperId];
    if (seedPaper) {
      setPaper(seedPaper);
      setViewMode(seedPaper.pdfUrl ? "pdf" : "text");
      setLoading(false);
      setError("");
      setAnnotations([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    api
      .get(`/api/reader/${activePaperId}`)
      .then(({ data }) => {
        if (!active) return;
        setPaper(data.paper);
        const hasPdf = data.paper.hasPdfBinary || Boolean(data.paper.pdfUrl);
        if ((!data.paper.content || data.paper.content.length < 200) && hasPdf) {
          setViewMode("pdf");
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to load paper reader.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    api
      .get(`/api/reader/${activePaperId}/annotations`)
      .then(({ data }) => {
        if (active) setAnnotations(data.annotations || []);
      })
      .catch((err) => console.warn("Annotations fetch error:", err));

    return () => {
      active = false;
    };
  }, [activePaperId]);

  useEffect(() => {
    if (viewMode !== "pdf" || !paper) return;

    let cancelled = false;

    const clearObjectUrl = () => {
      if (pdfObjectUrlRef.current) {
        URL.revokeObjectURL(pdfObjectUrlRef.current);
        pdfObjectUrlRef.current = "";
      }
    };

    const loadPdf = async () => {
      setPdfError("");
      setPdfLoading(true);
      clearObjectUrl();
      setPdfSrc("");

      const isSeed = Boolean(seedById[paper._id]);

      if (paper.pdfUrl && (!paper.hasPdfBinary || isSeed)) {
        if (!cancelled) {
          setPdfSrc(paper.pdfUrl);
          setPdfLoading(false);
        }
        return;
      }

      if (paper.hasPdfBinary) {
        try {
          const { data } = await api.get(`/api/reader/${paper._id}/pdf`, {
            responseType: "blob",
          });
          if (cancelled) return;
          const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
          if (blob.type && blob.type.includes("application/json")) {
            throw new Error("PDF not available");
          }
          const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
          const url = URL.createObjectURL(pdfBlob);
          pdfObjectUrlRef.current = url;
          setPdfSrc(url);
        } catch (err) {
          if (cancelled) return;
          if (paper.pdfUrl) {
            setPdfSrc(paper.pdfUrl);
          } else {
            setPdfError(err.response?.data?.message || "Could not load the PDF.");
          }
        } finally {
          if (!cancelled) setPdfLoading(false);
        }
        return;
      }

      if (paper.pdfUrl) {
        setPdfSrc(paper.pdfUrl);
        setPdfLoading(false);
        return;
      }

      setPdfError("No PDF is available for this paper.");
      setPdfLoading(false);
    };

    loadPdf();

    return () => {
      cancelled = true;
      clearObjectUrl();
    };
  }, [viewMode, paper]);

  // ----------------------------------------------------
  // TEXT SELECTION LISTENER
  // ----------------------------------------------------
  const handleMouseUp = () => {
    if (viewMode !== "text") return;

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    if (text && text.length > 3) {
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectionPosition({
        top: rect.top + window.scrollY - 55,
        left: Math.max(10, rect.left + rect.width / 2 - 160),
      });
    } else {
      // Don't clear immediately if user is interacting with the action popup
      if (!activeAIAction && !noteInput) {
        setSelectedText("");
        setSelectionPosition(null);
      }
    }
  };

  // ----------------------------------------------------
  // EXECUTE QUICK AI ACTION
  // ----------------------------------------------------
  const triggerAIAction = async (action, questionParam = "") => {
    if (!selectedText && !questionParam) return;

    setActiveAIAction(action);
    setAiActionLoading(true);
    setAiActionResult(null);

    try {
      const { data } = await api.post(`/api/reader/${activePaperId}/ai-action`, {
        selectedText: selectedText || "",
        action,
        customQuestion: questionParam || customQuestion,
      });

      setAiActionResult(data.data);
      // Auto open side panel with copilot tab
      setActiveTab("copilot");
      setSidePanelOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI action failed");
    } finally {
      setAiActionLoading(false);
    }
  };

  // ----------------------------------------------------
  // SAVE ANNOTATION (Highlight, Note, Idea, Question)
  // ----------------------------------------------------
  const handleSaveAnnotation = async (type = "highlight", aiRes = "") => {
    if (!selectedText && !noteInput) {
      toast.error("Please select text or write a note.");
      return;
    }

    setSavingAnnotation(true);
    try {
      if (seedById[activePaperId]) {
        const annotation = {
          _id: `local-${Date.now()}`,
          type,
          selectedText,
          content: noteInput || (type === "highlight" ? "Highlighted excerpt" : ""),
          aiResponse: aiRes || aiActionResult?.result || "",
          color: selectedColor,
          createdAt: new Date().toISOString(),
        };
        setAnnotations([annotation, ...annotations]);
        toast.success(type === "highlight" ? "Highlight saved" : "Saved");
        setSelectedText("");
        setSelectionPosition(null);
        setNoteInput("");
        setActiveAIAction(null);
        setAiActionResult(null);
        return;
      }

      const { data } = await api.post(`/api/reader/${activePaperId}/annotations`, {
        type,
        selectedText,
        content: noteInput || (type === "highlight" ? "Highlighted excerpt" : ""),
        aiResponse: aiRes || (aiActionResult?.result || ""),
        color: selectedColor,
      });

      setAnnotations([data.annotation, ...annotations]);
      toast.success(
        type === "highlight"
          ? "Highlight saved"
          : type === "idea"
          ? "Research idea saved"
          : type === "question"
          ? "Question saved"
          : "Note saved"
      );

      // Reset
      setSelectedText("");
      setSelectionPosition(null);
      setNoteInput("");
      setActiveAIAction(null);
      setAiActionResult(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save annotation");
    } finally {
      setSavingAnnotation(false);
    }
  };

  // ----------------------------------------------------
  // DELETE ANNOTATION
  // ----------------------------------------------------
  const handleDeleteAnnotation = async (id) => {
    try {
      if (String(id).startsWith("local-") || seedById[activePaperId]) {
        setAnnotations(annotations.filter((a) => a._id !== id));
        toast.success("Removed annotation");
        return;
      }

      await api.delete(`/api/reader/annotations/${id}`);
      setAnnotations(annotations.filter((a) => a._id !== id));
      toast.success("Removed annotation");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  // ----------------------------------------------------
  // CHAT WITH PAPER
  // ----------------------------------------------------
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: "user", content: chatInput.trim() };
    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const { data } = await api.post(`/api/reader/${activePaperId}/chat`, {
        question: userMsg.content,
        history: updatedHistory.slice(-6),
      });

      setChatMessages([...updatedHistory, { role: "ai", content: data.reply }]);
    } catch (err) {
      setChatMessages([
        ...updatedHistory,
        {
          role: "ai",
          content: "Sorry, I ran into an issue retrieving an answer from this paper.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ----------------------------------------------------
  // STRUCTURE TEXT INTO SECTIONS
  // ----------------------------------------------------
  const structuredSections = useMemo(() => {
    if (!paper?.content) return [];

    const lines = paper.content.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const sections = [];
    let currentSection = {
      title: "Introduction / Overview",
      content: [],
    };

    const sectionRegex =
      /^(abstract|introduction|background|related work|methodology|methods|system design|experimental setup|experiments|evaluation|results|discussion|limitations|conclusion|future work|references)\b/i;

    lines.forEach((line) => {
      if (line.length < 80 && sectionRegex.test(line)) {
        if (currentSection.content.length > 0) {
          sections.push({
            ...currentSection,
            text: currentSection.content.join("\n\n"),
          });
        }
        currentSection = {
          title: line.charAt(0).toUpperCase() + line.slice(1),
          content: [],
        };
      } else {
        currentSection.content.push(line);
      }
    });

    if (currentSection.content.length > 0) {
      sections.push({
        ...currentSection,
        text: currentSection.content.join("\n\n"),
      });
    }

    return sections.length > 0
      ? sections
      : [{ title: "Full Document", text: paper.content }];
  }, [paper?.content]);

  // Filtered Annotations
  const filteredAnnotations = useMemo(() => {
    return annotations.filter((ann) => {
      const matchType = filterType === "all" || ann.type === filterType;
      const matchColor = filterColor === "all" || ann.color === filterColor;
      return matchType && matchColor;
    });
  }, [annotations, filterType, filterColor]);

  // Export Notes to Markdown
  const exportAnnotationsMarkdown = () => {
    if (!annotations.length) {
      toast("No annotations to export");
      return;
    }

    const md = `# Research Notes & Highlights: ${paper?.title || paper?.filename}
Exported from ResearchNest on ${new Date().toLocaleDateString()}

${annotations
  .map(
    (a, i) => `### [${a.type.toUpperCase()}] #${i + 1}
${a.selectedText ? `> "${a.selectedText}"\n` : ""}
${a.content ? `**Note:** ${a.content}\n` : ""}
${a.aiResponse ? `**AI Insight:**\n${a.aiResponse}\n` : ""}
*Color: ${a.color} | Date: ${new Date(a.createdAt).toLocaleDateString()}*
---`
  )
  .join("\n\n")}`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(paper?.title || "paper-notes").slice(0, 30).replace(/[^a-z0-9]/gi, "-")}-notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exported notes to Markdown!");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF7FF]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm border border-violet-100">
            <LoaderCircle className="animate-spin text-violet-600" size={24} />
            <span className="font-semibold text-slate-700">Loading AI Research Reader...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-[#FAF7FF]">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="rounded-3xl border border-rose-100 bg-white p-10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Unable to Open Reader</h2>
            <p className="mt-2 text-sm text-slate-500">{error || "Paper not found."}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAF7FF]">
      {/* ---------------------------------------------------- */}
      {/* READER HEADER BAR */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-violet-100/80 bg-white/95 px-6 backdrop-blur">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => (paper.workspace ? navigate(`/projects/${paper.workspace}`) : navigate("/dashboard"))}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-900 md:text-base max-w-xl">
              {paper.title || paper.filename}
            </h1>
            <p className="truncate text-xs text-slate-400">
              {paper.authors?.length ? paper.authors.join(", ") : "Unknown authors"}
              {paper.journal ? ` • ${paper.journal}` : ""}
              {paper.year ? ` (${paper.year})` : ""}
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode("text")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                viewMode === "text"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "hover:text-slate-900"
              }`}
            >
              <BookOpen size={14} /> Interactive Text
            </button>
            <button
              onClick={() => setViewMode("pdf")}
              disabled={!paper.hasPdfBinary && !paper.pdfUrl}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                viewMode === "pdf"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <FileText size={14} /> PDF Viewer
            </button>
          </div>

          {/* Typography Controls (Text Mode Only) */}
          {viewMode === "text" && (
            <div className="hidden items-center gap-1 border-l border-slate-200 pl-3 md:flex">
              <button
                onClick={() => setFontSize(fontSize === "text-sm" ? "text-base" : fontSize === "text-base" ? "text-lg" : "text-sm")}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                title="Toggle font size"
              >
                aA
              </button>
              <button
                onClick={() => setFontFamily(fontFamily === "font-serif" ? "font-sans" : "font-serif")}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                title="Toggle font family"
              >
                {fontFamily === "font-serif" ? "Serif" : "Sans"}
              </button>
            </div>
          )}

          {/* Side Panel Toggle */}
          <button
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              sidePanelOpen
                ? "border-violet-300 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Sparkles size={15} />
            <span className="hidden sm:inline">AI Companion</span>
            {annotations.length > 0 && (
              <span className="ml-1 rounded-full bg-violet-600 px-1.5 py-0.2 text-[10px] text-white">
                {annotations.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT / MAIN READER */}
        <main
          className={`flex-1 ${
            viewMode === "pdf"
              ? "flex min-h-0 flex-col overflow-hidden p-0"
              : "overflow-y-auto px-4 py-8 md:px-12 lg:px-16"
          }`}
          onMouseUp={handleMouseUp}
          ref={textContainerRef}
        >
          {viewMode === "pdf" ? (
            /* ------------------ ENHANCED PDF VIEWER MODE ------------------ */
            <div
              className={`flex h-full min-h-0 w-full flex-col overflow-hidden transition-colors ${
                isPdfFullscreen ? "fixed inset-0 z-50 bg-slate-900" : ""
              } ${
                pdfTheme === "sepia"
                  ? "bg-[#f4ecd8]"
                  : pdfTheme === "night"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100"
              }`}
            >
              {/* PDF Control & AI Shortcuts Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-white px-4 py-2.5 text-xs text-slate-700 shadow-sm gap-2">
                {/* PDF AI Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider hidden sm:inline mr-1">
                    AI PDF Actions:
                  </span>
                  <button
                    onClick={() => triggerAIAction("summarize", paper.abstract || paper.content || paper.title)}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100 transition"
                  >
                    <Sparkles size={13} /> Summarize PDF
                  </button>
                  <button
                    onClick={() => triggerAIAction("explain", paper.abstract || paper.content || paper.title)}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    <FileText size={13} /> Key Methodology
                  </button>
                  <button
                    onClick={copyBibTexCitation}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    <Copy size={13} /> Copy BibTeX
                  </button>
                </div>

                {/* PDF Reader Theme & Fullscreen Controls */}
                <div className="flex items-center gap-2">
                  {/* Theme buttons */}
                  <div className="flex items-center rounded-xl bg-slate-100 p-0.5">
                    <button
                      onClick={() => setPdfTheme("light")}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                        pdfTheme === "light" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                      title="Light Theme"
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setPdfTheme("sepia")}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                        pdfTheme === "sepia" ? "bg-[#fbf0d9] text-amber-900 shadow-xs" : "text-slate-500"
                      }`}
                      title="Sepia Comfort Theme"
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => setPdfTheme("night")}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                        pdfTheme === "night" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500"
                      }`}
                      title="Night Theme"
                    >
                      Night
                    </button>
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsPdfFullscreen(!isPdfFullscreen)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    title={isPdfFullscreen ? "Exit Fullscreen" : "Fullscreen Reading Mode"}
                  >
                    {isPdfFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>

                  {/* Download */}
                  {pdfSrc && (
                    <a
                      href={pdfSrc}
                      download={`${paper.title || paper.filename || "paper"}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download size={13} /> Download
                    </a>
                  )}
                  {paper.officialUrl && (
                    <a
                      href={paper.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                    >
                      <ExternalLink size={13} /> Publisher
                    </a>
                  )}
                </div>
              </div>

              {/* PDF Container */}
              <div
                className={`relative min-h-0 flex-1 p-2 ${
                  pdfTheme === "sepia"
                    ? "bg-[#f4ecd8]"
                    : pdfTheme === "night"
                    ? "bg-slate-900"
                    : "bg-slate-200"
                }`}
              >
                {pdfLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                    <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm">
                      <LoaderCircle className="animate-spin" size={18} />
                      Loading PDF...
                    </div>
                  </div>
                )}
                {pdfError && !pdfSrc && (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="max-w-md rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm">
                      <FileText className="mx-auto mb-3 text-rose-400" size={28} />
                      <p className="font-bold text-slate-900">PDF could not be displayed</p>
                      <p className="mt-2 text-sm text-slate-500">{pdfError}</p>
                      <button
                        onClick={() => setViewMode("text")}
                        className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
                      >
                        Switch to interactive text
                      </button>
                    </div>
                  </div>
                )}
                {pdfSrc && (
                  <iframe
                    src={pdfSrc}
                    title={paper.title || "PDF viewer"}
                    className="h-full w-full border-none rounded-xl bg-white shadow-sm"
                  />
                )}
              </div>
            </div>
          ) : (
            /* ------------------ INTERACTIVE TEXT READER MODE ------------------ */
            <div className="mx-auto max-w-3xl pb-24">
              {/* Paper Metadata Banner */}
              <div className="mb-10 rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-purple-50/20 p-8 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                    {paper.topic || "Research Paper"}
                  </span>
                  {paper.journal && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {paper.journal}
                    </span>
                  )}
                  {paper.doi && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 font-mono">
                      DOI: {paper.doi}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  {paper.title || paper.filename}
                </h1>

                <p className="mt-3 text-sm text-slate-600">
                  {paper.authors?.join(", ") || "Unknown authors"}
                </p>

                {paper.abstract && (
                  <div className="mt-6 rounded-2xl bg-white/80 p-5 text-sm leading-relaxed text-slate-700 border border-violet-100 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">
                      Abstract
                    </p>
                    {paper.abstract}
                  </div>
                )}
              </div>

              {/* Section Jump Nav */}
              {structuredSections.length > 1 && (
                <div className="sticky top-2 z-20 mb-8 flex flex-wrap gap-1.5 rounded-2xl border border-violet-100/80 bg-white/90 p-2 shadow-sm backdrop-blur">
                  <span className="self-center px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Sections:
                  </span>
                  {structuredSections.map((sec, i) => (
                    <a
                      key={i}
                      href={`#section-${i}`}
                      className="rounded-xl bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-violet-100 hover:text-violet-700"
                    >
                      {sec.title.slice(0, 24)}
                    </a>
                  ))}
                </div>
              )}

              {/* Sections Content */}
              <div className={`space-y-12 ${fontSize} ${fontFamily} leading-relaxed text-slate-800`}>
                {structuredSections.map((section, secIdx) => (
                  <section
                    key={secIdx}
                    id={`section-${secIdx}`}
                    className="scroll-mt-24 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-100"
                  >
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                        {section.title}
                      </h2>
                      <button
                        onClick={() => triggerAIAction("summarize", section.text.slice(0, 3000))}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 font-sans"
                      >
                        <Sparkles size={13} /> Summarize section
                      </button>
                    </div>

                    <div className="whitespace-pre-line space-y-4">
                      {section.text.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx} className="selection:bg-violet-200 selection:text-violet-900">
                          {para}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* FLOATING TEXT SELECTION POPUP */}
          {/* ---------------------------------------------------- */}
          {selectionPosition && selectedText && (
            <div
              style={{
                top: `${selectionPosition.top}px`,
                left: `${selectionPosition.left}px`,
              }}
              className="absolute z-50 flex items-center gap-1 rounded-2xl border border-violet-200 bg-slate-900 px-2 py-1.5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Highlight Color Swatches */}
              <div className="flex items-center gap-1 pr-2 border-r border-slate-700">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(c.name);
                      handleSaveAnnotation("highlight");
                    }}
                    style={{ backgroundColor: c.hex }}
                    className="h-4 w-4 rounded-full transition hover:scale-125 focus:ring-2 focus:ring-white"
                    title={`Highlight in ${c.name}`}
                  />
                ))}
              </div>

              {/* Quick AI Action Buttons */}
              <button
                onClick={() => triggerAIAction("explain")}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition hover:bg-white/20"
                title="Explain passage"
              >
                <Lightbulb size={13} className="text-amber-300" /> Explain
              </button>

              <button
                onClick={() => triggerAIAction("simplify")}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition hover:bg-white/20"
                title="Simplify technical concepts"
              >
                <Sparkles size={13} className="text-violet-300" /> Simplify
              </button>

              <button
                onClick={() => triggerAIAction("methodology")}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition hover:bg-white/20"
                title="Analyze methodology"
              >
                <BookOpen size={13} className="text-sky-300" /> Method
              </button>

              <button
                onClick={() => triggerAIAction("results")}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition hover:bg-white/20"
                title="Explain results"
              >
                <FileText size={13} className="text-emerald-300" /> Results
              </button>

              <button
                onClick={() => triggerAIAction("limitations")}
                className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition hover:bg-white/20"
                title="Explain limitations"
              >
                <HelpCircle size={13} className="text-rose-300" /> Limits
              </button>

              {/* Add Note Button */}
              <button
                onClick={() => {
                  setActiveTab("notes");
                  setSidePanelOpen(true);
                  setNoteInput(`Note on: "${selectedText.slice(0, 60)}..."`);
                }}
                className="flex items-center gap-1 rounded-xl bg-violet-600 px-2.5 py-1 text-xs font-semibold transition hover:bg-violet-700"
              >
                <Highlighter size={13} /> Note
              </button>

              <button
                onClick={() => {
                  setSelectedText("");
                  setSelectionPosition(null);
                }}
                className="ml-1 p-1 text-slate-400 hover:text-white"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </main>

        {/* ---------------------------------------------------- */}
        {/* RIGHT SIDE PANEL (AI Companion, Notes, Ideas) */}
        {/* ---------------------------------------------------- */}
        {sidePanelOpen && (
          <aside className="flex w-96 flex-col border-l border-violet-100 bg-white shadow-lg transition-all z-20">
            {/* Tab Header */}
            <div className="flex border-b border-slate-100 bg-slate-50/80 px-4 pt-3">
              <button
                onClick={() => setActiveTab("copilot")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition ${
                  activeTab === "copilot"
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles size={14} /> AI Copilot
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition ${
                  activeTab === "notes"
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Highlighter size={14} /> Highlights ({annotations.length})
              </button>

              <button
                onClick={() => setActiveTab("ideas")}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-xs font-bold transition ${
                  activeTab === "ideas"
                    ? "border-violet-600 text-violet-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lightbulb size={14} /> Ideas
              </button>
            </div>

            {/* TAB CONTENT: AI COPILOT */}
            {activeTab === "copilot" && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Active AI Quick Action Result Card */}
                {aiActionLoading ? (
                  <div className="m-4 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-xs font-semibold text-violet-700">
                    <LoaderCircle size={16} className="animate-spin" />
                    Analyzing selected passage...
                  </div>
                ) : aiActionResult ? (
                  <div className="m-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/50 p-4 text-xs shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-violet-700">
                        AI {aiActionResult.action}
                      </span>
                      <button
                        onClick={() => setAiActionResult(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {aiActionResult.selectedText && (
                      <blockquote className="my-2 border-l-2 border-violet-300 pl-2 italic text-slate-600 line-clamp-2">
                        "{aiActionResult.selectedText}"
                      </blockquote>
                    )}

                    <div className="mt-2 text-slate-800 leading-relaxed max-h-52 overflow-y-auto pr-1">
                      {aiActionResult.result}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-violet-100 pt-2">
                      <button
                        onClick={() => handleSaveAnnotation("note", aiActionResult.result)}
                        className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-violet-700"
                      >
                        <Check size={12} /> Save to Notes
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiActionResult.result);
                          toast.success("Copied insight!");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-violet-600"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-violet-600 text-white"
                            : "border border-slate-100 bg-slate-50 text-slate-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <LoaderCircle size={14} className="animate-spin text-violet-600" />
                      ResearchNest AI is thinking...
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 bg-white">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask questions about this paper..."
                      className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="rounded-lg bg-violet-600 p-1.5 text-white disabled:opacity-40 hover:bg-violet-700 transition"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB CONTENT: HIGHLIGHTS & NOTES */}
            {activeTab === "notes" && (
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                {/* Note Creation Card */}
                <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50/50 p-3">
                  <p className="text-xs font-bold text-violet-700 mb-2">New Annotation</p>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Write a personal research note, hypothesis, or remark..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-violet-500"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          style={{ backgroundColor: c.hex }}
                          className={`h-4 w-4 rounded-full transition ${
                            selectedColor === c.name ? "ring-2 ring-violet-700 scale-110" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={savingAnnotation || !noteInput.trim()}
                      onClick={() => handleSaveAnnotation("note")}
                      className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-40"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                {/* Filter & Export Bar */}
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
                  <span className="font-semibold text-slate-700">Saved ({filteredAnnotations.length})</span>
                  <button
                    onClick={exportAnnotationsMarkdown}
                    className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:text-violet-800"
                  >
                    <Download size={13} /> Export .md
                  </button>
                </div>

                {/* List of Annotations */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {!filteredAnnotations.length ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      <Highlighter size={24} className="mx-auto mb-2 opacity-40 text-violet-500" />
                      No highlights or notes yet. Select text in the paper to highlight or add notes!
                    </div>
                  ) : (
                    filteredAnnotations.map((ann) => (
                      <div
                        key={ann._id}
                        className="rounded-2xl border border-slate-200 bg-white p-3.5 text-xs shadow-sm hover:border-violet-200 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full`}
                            style={{
                              backgroundColor:
                                HIGHLIGHT_COLORS.find((c) => c.name === ann.color)?.hex || "#c084fc",
                            }}
                          />
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {ann.type} • {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteAnnotation(ann._id)}
                            className="text-slate-300 hover:text-rose-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {ann.selectedText && (
                          <blockquote className="my-2 border-l-2 border-violet-200 pl-2 text-slate-600 italic line-clamp-3">
                            "{ann.selectedText}"
                          </blockquote>
                        )}

                        {ann.content && (
                          <p className="mt-1 font-medium text-slate-800">{ann.content}</p>
                        )}

                        {ann.aiResponse && (
                          <div className="mt-2 rounded-xl bg-violet-50/70 p-2 text-slate-700">
                            <span className="font-bold text-violet-700">AI Insight: </span>
                            {ann.aiResponse}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESEARCH IDEAS & QUESTIONS */}
            {activeTab === "ideas" && (
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 mb-4">
                  <p className="text-xs font-bold text-amber-800 mb-1">Capture Research Inspiration</p>
                  <p className="text-[11px] text-amber-700 mb-2">
                    Jot down novel hypotheses, future directions, or follow-up research questions inspired by this study.
                  </p>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="e.g. Could we apply this transformer architecture to protein sequence folding?"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-amber-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={!noteInput.trim()}
                      onClick={() => handleSaveAnnotation("question")}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      + Question
                    </button>
                    <button
                      type="button"
                      disabled={!noteInput.trim()}
                      onClick={() => handleSaveAnnotation("idea")}
                      className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-white hover:bg-amber-600"
                    >
                      + Save Idea
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {annotations.filter((a) => a.type === "idea" || a.type === "question").length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      <Lightbulb size={24} className="mx-auto mb-2 text-amber-400 opacity-60" />
                      No research ideas recorded yet. Turn reading into new research insights!
                    </div>
                  ) : (
                    annotations
                      .filter((a) => a.type === "idea" || a.type === "question")
                      .map((item) => (
                        <div
                          key={item._id}
                          className="rounded-2xl border border-amber-100 bg-white p-3.5 text-xs shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.type === "idea"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                            <button
                              onClick={() => handleDeleteAnnotation(item._id)}
                              className="text-slate-300 hover:text-rose-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="font-semibold text-slate-800 mt-1">{item.content}</p>
                          {item.selectedText && (
                            <p className="mt-2 text-[11px] text-slate-500 italic border-l border-slate-200 pl-2">
                              Ref: "{item.selectedText.slice(0, 80)}..."
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
