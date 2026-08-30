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
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";

const historyKey = "researchnest_ai_history";

const tools = [
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
    id: "ask",
    label: "Ask Paper",
    description: "Ask questions about one paper",
    icon: MessageSquare,
    color: "blue",
    min: 1,
    max: 1,
  },
  {
    id: "compare",
    label: "Compare",
    description: "Compare research evidence",
    icon: Scale,
    color: "fuchsia",
    min: 2,
    max: 4,
  },
  {
    id: "review",
    label: "Literature Review",
    description: "Synthesize multiple studies",
    icon: BookOpenCheck,
    color: "emerald",
    min: 2,
    max: 6,
  },
  {
    id: "cross",
    label: "Cross-Paper Q&A",
    description: "Ask across multiple papers",
    icon: Search,
    color: "amber",
    min: 2,
    max: 6,
  },
];

function toMarkdown(paper, summary) {
  return `# ${paper.title || paper.filename}

${summary.tldr || ""}

## Research problem
${summary.researchProblem || "Not provided"}

## Methodology
${summary.methodology || "Not provided"}

## Dataset / evaluation
${summary.dataset || "Not provided"}

## Key findings
${(summary.keyFindings || []).map((item) => `- ${item}`).join("\n")}

## Limitations
${(summary.limitations || []).map((item) => `- ${item}`).join("\n")}

## Conclusion
${summary.conclusion || "Not provided"}
`;
}

export default function ResearchAssistant() {
  const [papers, setPapers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [workspaceId, setWorkspaceId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [tool, setTool] = useState("summary");

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
      setHistory(
        JSON.parse(
          localStorage.getItem(historyKey) || "[]"
        )
      );
    } catch {
      setHistory([]);
    }

    Promise.all([
      api.get("/api/papers"),
      api.get("/api/workspaces"),
    ])
      .then(([papersResponse, workspaceResponse]) => {
        setPapers(papersResponse.data.papers || []);
        setWorkspaces(workspaceResponse.data.workspaces || []);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to load your research library."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // --------------------------------------------------
  // FILTER PAPERS BY WORKSPACE
  // --------------------------------------------------

  const visiblePapers = useMemo(() => {
    if (!workspaceId) return papers;

    return papers.filter(
      (paper) =>
        String(
          paper.workspace?._id ||
            paper.workspace ||
            ""
        ) === String(workspaceId)
    );
  }, [papers, workspaceId]);

  // --------------------------------------------------
  // SELECTED PAPERS
  // --------------------------------------------------

  const selectedPapers = useMemo(
    () =>
      visiblePapers.filter((paper) =>
        selectedIds.includes(paper._id)
      ),
    [visiblePapers, selectedIds]
  );

  // --------------------------------------------------
  // TOOL
  // --------------------------------------------------

  const activeTool = tools.find(
    (item) => item.id === tool
  );

  // --------------------------------------------------
  // WORKSPACE CHANGE
  // --------------------------------------------------

  const changeWorkspace = (value) => {
    setWorkspaceId(value);
    setSelectedIds([]);
    setSummaryResult(null);
    setResult(null);
    setQuestion("");
    setError("");
  };

  // --------------------------------------------------
  // TOOL CHANGE
  // --------------------------------------------------

  const changeTool = (id) => {
    setTool(id);
    setSelectedIds([]);
    setSummaryResult(null);
    setResult(null);
    setQuestion("");
    setFocus("");
    setError("");
  };

  // --------------------------------------------------
  // SELECT PAPER
  // --------------------------------------------------

  const togglePaper = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (paperId) => paperId !== id
        );
      }

      if (
        activeTool?.max &&
        current.length >= activeTool.max
      ) {
        return current;
      }

      return [...current, id];
    });

    setSummaryResult(null);
    setResult(null);
    setError("");
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const canRun =
    selectedIds.length >= (activeTool?.min || 1) &&
    selectedIds.length <=
      (activeTool?.max || 999);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const generateSummary = async () => {
    const paperId = selectedIds[0];

    if (!paperId) return;

    setWorking(true);
    setError("");
    setSummaryResult(null);

    try {
      const { data } = await api.post(
        `/api/ai/summarize/${paperId}`
      );

      const entry = {
        paper: data.paper,
        summary: data.summary,
        createdAt: new Date().toISOString(),
      };

      setSummaryResult(entry);

      const next = [
        entry,
        ...history.filter(
          (item) =>
            item.paper.id !== entry.paper.id
        ),
      ].slice(0, 5);

      setHistory(next);

      localStorage.setItem(
        historyKey,
        JSON.stringify(next)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate the AI summary."
      );
    } finally {
      setWorking(false);
    }
  };

  // --------------------------------------------------
  // ASK / COMPARE / REVIEW / CROSS PAPER
  // --------------------------------------------------

  const runResearchTool = async () => {
    setWorking(true);
    setError("");
    setResult(null);

    try {
      let data;

      if (tool === "ask") {
        if (!question.trim()) {
          throw new Error(
            "Enter a question about the selected paper."
          );
        }

        ({ data } = await api.post(
          `/api/ai/ask/${selectedIds[0]}`,
          {
            question: question.trim(),
          }
        ));

        setResult({
          type: "rag",
          value: data.result,
        });
      }

      if (tool === "compare") {
        ({ data } = await api.post(
          "/api/ai/compare",
          {
            paperIds: selectedIds,
          }
        ));

        setResult({
          type: "compare",
          value: data.comparison,
        });
      }

      if (tool === "review") {
        ({ data } = await api.post(
          "/api/ai/literature-review",
          {
            paperIds: selectedIds,
            focus: focus.trim(),
          }
        ));

        setResult({
          type: "review",
          value: data.review,
        });
      }

      if (tool === "cross") {
        if (!question.trim()) {
          throw new Error(
            "Enter a question about the selected papers."
          );
        }

        ({ data } = await api.post(
          "/api/ai/ask-across",
          {
            paperIds: selectedIds,
            question: question.trim(),
          }
        ));

        setResult({
          type: "rag",
          value: data.result,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to complete the analysis."
      );
    } finally {
      setWorking(false);
    }
  };

  const run = async () => {
    if (!canRun || working) return;

    if (tool === "summary") {
      await generateSummary();
    } else {
      await runResearchTool();
    }
  };

  // --------------------------------------------------
  // COPY SUMMARY
  // --------------------------------------------------

  const copySummary = async () => {
    if (!summaryResult) return;

    await navigator.clipboard.writeText(
      toMarkdown(
        summaryResult.paper,
        summaryResult.summary
      )
    );

    setCopied(true);

    window.setTimeout(
      () => setCopied(false),
      1800
    );
  };

  // --------------------------------------------------
  // DOWNLOAD SUMMARY
  // --------------------------------------------------

  const downloadSummary = () => {
    if (!summaryResult) return;

    const markdown = toMarkdown(
      summaryResult.paper,
      summaryResult.summary
    );

    const blob = new Blob([markdown], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `${(
      summaryResult.paper.title ||
      "research-summary"
    )
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase()}.md`;

    link.click();

    URL.revokeObjectURL(url);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

        {/* HERO */}

        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl md:p-10">

          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
              <BrainCircuit size={14} />

              ResearchNest AI
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Your AI research
              <span className="block bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                copilot.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Select your workspace and research papers.
              ResearchNest can summarize studies, answer
              evidence-grounded questions, compare papers,
              and help build literature reviews.
            </p>

          </div>

          <div className="relative z-10 mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">

            <HeroStat
              icon={<FileText size={18} />}
              title="Your papers"
              value={papers.length}
            />

            <HeroStat
              icon={<BookOpen size={18} />}
              title="Workspaces"
              value={workspaces.length}
            />

            <HeroStat
              icon={<Sparkles size={18} />}
              title="AI tools"
              value="5"
            />

          </div>
        </section>

        {/* MAIN WORKSPACE */}

        <section className="mt-8 grid gap-7 lg:grid-cols-[1fr_20rem]">

          <div className="min-w-0">

            {/* CONTROL PANEL */}

            <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:p-7">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    Step 1
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Choose your research space
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Work with papers already organized in
                    your ResearchNest workspace.
                  </p>

                </div>

                <div className="rounded-2xl bg-violet-50 px-4 py-3 text-right">
                  <p className="text-xs text-violet-500">
                    Selected
                  </p>

                  <p className="text-xl font-black text-violet-700">
                    {selectedIds.length}
                  </p>
                </div>

              </div>

              {/* WORKSPACE SELECT */}

              <div className="mt-6">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Workspace
                </label>

                <select
                  value={workspaceId}
                  onChange={(e) =>
                    changeWorkspace(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">
                    All workspaces
                  </option>

                  {workspaces.map(
                    (workspace) => (
                      <option
                        key={workspace._id}
                        value={workspace._id}
                      >
                        {workspace.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* PAPERS */}

              <div className="mt-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Your research papers
                    </p>

                    <p className="text-xs text-slate-400">
                      {visiblePapers.length} papers available
                    </p>
                  </div>

                  {selectedIds.length > 0 && (
                    <button
                      onClick={() =>
                        setSelectedIds([])
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-violet-600"
                    >
                      <X size={13} />

                      Clear selection
                    </button>
                  )}

                </div>

                {loading ? (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Loading your papers...
                  </div>
                ) : !visiblePapers.length ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-8 text-center">

                    <FileText
                      size={30}
                      className="mx-auto text-violet-300"
                    />

                    <p className="mt-3 font-semibold text-slate-700">
                      No papers in this workspace
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Upload research papers first to use
                      the AI Research Assistant.
                    </p>

                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">

                    {visiblePapers.map(
                      (paper) => {

                        const selected =
                          selectedIds.includes(
                            paper._id
                          );

                        const disabled =
                          !selected &&
                          selectedIds.length >=
                            (activeTool?.max ||
                              999);

                        return (
                          <button
                            key={paper._id}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              togglePaper(
                                paper._id
                              )
                            }
                            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-violet-400 bg-violet-50 shadow-sm"
                                : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                            } ${
                              disabled
                                ? "cursor-not-allowed opacity-40"
                                : ""
                            }`}
                          >

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                selected
                                  ? "bg-violet-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {selected ? (
                                <Check
                                  size={19}
                                />
                              ) : (
                                <FileText
                                  size={19}
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-bold text-slate-800">
                                {paper.title ||
                                  paper.filename}
                              </p>

                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">

                                <span>
                                  {paper.topic ||
                                    "Research"}
                                </span>

                                {paper.authors
                                  ?.length ? (
                                  <>
                                    <span>
                                      •
                                    </span>

                                    <span className="truncate">
                                      {paper.authors.join(
                                        ", "
                                      )}
                                    </span>
                                  </>
                                ) : null}

                              </div>

                            </div>

                            <ChevronRight
                              size={17}
                              className={
                                selected
                                  ? "text-violet-500"
                                  : "text-slate-300"
                              }
                            />

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

            </section>

            {/* AI TOOLS */}

            <section className="mt-7 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:p-7">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  Step 2
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Choose an AI tool
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Different research tasks require different
                  kinds of analysis.
                </p>

              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {tools.map((item) => {

                  const Icon = item.icon;
                  const active =
                    item.id === tool;

                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        changeTool(
                          item.id
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-violet-400 bg-violet-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                      }`}
                    >

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          active
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon size={19} />
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-800">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>

                      <p className="mt-2 text-[11px] font-semibold text-violet-500">
                        {item.min === 1 &&
                        item.max === 1
                          ? "1 paper"
                          : `${item.min}–${item.max} papers`}
                      </p>

                    </button>
                  );
                })}

              </div>

              {/* QUESTIONS */}

              {(tool === "ask" ||
                tool === "cross") && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {tool === "ask"
                      ? "Ask about this paper"
                      : "Ask across these papers"}
                  </label>

                  <textarea
                    value={question}
                    onChange={(e) =>
                      setQuestion(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder={
                      tool === "ask"
                        ? "e.g. What methodology did the authors use?"
                        : "e.g. What are the common limitations across these studies?"
                    }
                    className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                </div>
              )}

              {/* REVIEW FOCUS */}

              {tool === "review" && (
                <div className="mt-6">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Literature review focus
                    <span className="ml-2 font-normal text-slate-400">
                      Optional
                    </span>
                  </label>

                  <input
                    value={focus}
                    onChange={(e) =>
                      setFocus(
                        e.target.value
                      )
                    }
                    placeholder="e.g. AI methods for medical image diagnosis"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                </div>
              )}

              {/* ACTION */}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="text-sm text-slate-500">

                  {!selectedIds.length ? (
                    <span>
                      Select a paper to begin.
                    </span>
                  ) : selectedIds.length <
                    (activeTool?.min || 1) ? (
                    <span>
                      Select at least{" "}
                      {activeTool.min}{" "}
                      papers.
                    </span>
                  ) : (
                    <span className="font-medium text-emerald-600">
                      Ready to analyze{" "}
                      {selectedIds.length}{" "}
                      {selectedIds.length ===
                      1
                        ? "paper"
                        : "papers"}
                      .
                    </span>
                  )}

                </div>

                <button
                  onClick={run}
                  disabled={
                    !canRun ||
                    working ||
                    (tool !== "summary" &&
                      (tool === "ask" ||
                        tool === "cross") &&
                      !question.trim())
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {working ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Sparkles size={18} />
                  )}

                  {working
                    ? "ResearchNest AI is thinking..."
                    : tool === "summary"
                    ? "Generate AI Summary"
                    : tool === "ask"
                    ? "Ask AI"
                    : tool === "compare"
                    ? "Compare Papers"
                    : tool === "review"
                    ? "Generate Literature Review"
                    : "Ask Across Papers"}

                </button>

              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}

            </section>

            {/* SUMMARY */}

            {summaryResult && (
              <ResearchBrief
                result={summaryResult}
                copied={copied}
                onCopy={copySummary}
                onDownload={downloadSummary}
              />
            )}

            {/* OTHER RESULTS */}

            {result && (
              <ResearchOutput output={result} />
            )}

          </div>

          {/* SIDEBAR */}

          <aside className="h-fit rounded-3xl border border-violet-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
                <BrainCircuit size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  AI Assistant
                </h2>

                <p className="text-xs text-slate-500">
                  Research tools
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-2">

              {tools.map((item) => {

                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      changeTool(
                        item.id
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      tool === item.id
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >

                    <Icon size={17} />

                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                  </button>
                );
              })}

            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current selection
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {selectedIds.length}
              </p>

              <p className="text-xs text-slate-500">
                research paper
                {selectedIds.length === 1
                  ? ""
                  : "s"} selected
              </p>

            </div>

            {/* RECENT */}

            <div className="mt-6 border-t border-slate-100 pt-5">

              <p className="text-sm font-bold text-slate-800">
                Recent summaries
              </p>

              {history.length ? (
                <div className="mt-3 space-y-2">

                  {history.map(
                    (entry) => (
                      <button
                        key={`${entry.paper.id}-${entry.createdAt}`}
                        onClick={() => {
                          setSummaryResult(
                            entry
                          );
                          setTool(
                            "summary"
                          );
                          setSelectedIds([
                            entry.paper.id,
                          ]);
                        }}
                        className="w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50"
                      >

                        <p className="line-clamp-2 text-xs font-semibold text-slate-700">
                          {entry.paper.title}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Open summary{" "}
                          <ChevronRight
                            size={12}
                            className="inline"
                          />
                        </p>

                      </button>
                    )
                  )}

                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  Your generated summaries will
                  appear here.
                </p>
              )}

            </div>

          </aside>

        </section>

      </main>
    </div>
  );
}

/* =====================================================
   HERO STAT
===================================================== */

function HeroStat({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

      <div className="rounded-xl bg-white/10 p-2.5">
        {icon}
      </div>

      <div>
        <p className="text-lg font-bold">
          {value}
        </p>

        <p className="text-xs text-slate-300">
          {title}
        </p>
      </div>

    </div>
  );
}

/* =====================================================
   RESEARCH BRIEF
===================================================== */

function ResearchBrief({
  result,
  copied,
  onCopy,
  onDownload,
}) {
  const {
    paper,
    summary,
  } = result;

  return (
    <section className="mt-7 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:p-7">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div className="min-w-0">

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            AI research brief
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-900">
            {paper.title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {paper.authors?.join(", ") ||
              "Author metadata unavailable"}
          </p>

        </div>

        <div className="flex shrink-0 gap-2">

          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? (
              <Check
                size={16}
                className="text-emerald-600"
              />
            ) : (
              <Clipboard size={16} />
            )}

            {copied
              ? "Copied"
              : "Copy"}
          </button>

          <button
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <Download size={16} />

            Export
          </button>

        </div>

      </div>

      {/* TLDR */}

      <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">

        <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
          TL;DR
        </p>

        <p className="mt-2 text-sm leading-7 text-slate-700">
          {summary.tldr ||
            "No overview was generated."}
        </p>

      </div>

      {/* MAIN INSIGHTS */}

      <div className="mt-5 grid gap-4 md:grid-cols-3">

        <InsightCard
          icon={<Target size={18} />}
          title="Research problem"
          value={
            summary.researchProblem
          }
        />

        <InsightCard
          icon={
            <BookOpenCheck
              size={18}
            />
          }
          title="Methodology"
          value={
            summary.methodology
          }
        />

        <InsightCard
          icon={<FileText size={18} />}
          title="Dataset / evaluation"
          value={summary.dataset}
        />

      </div>

      {/* FINDINGS */}

      <div className="mt-4 grid gap-4 md:grid-cols-2">

        <InsightList
          title="Key findings"
          items={
            summary.keyFindings
          }
        />

        <InsightList
          title="Limitations"
          items={
            summary.limitations
          }
        />

      </div>

      {/* CONCLUSION */}

      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">

        <div className="flex items-center gap-2">

          <Lightbulb
            size={18}
            className="text-violet-600"
          />

          <h3 className="font-bold text-slate-800">
            Conclusion
          </h3>

        </div>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {summary.conclusion ||
            "Not identified in the source paper."}
        </p>

      </div>

    </section>
  );
}

/* =====================================================
   INSIGHT CARD
===================================================== */

function InsightCard({
  icon,
  title,
  value,
}) {
  return (
    <article className="rounded-2xl bg-slate-50 p-5">

      <div className="text-violet-600">
        {icon}
      </div>

      <h3 className="mt-3 font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {value ||
          "Not identified in the source paper."}
      </p>

    </article>
  );
}

/* =====================================================
   INSIGHT LIST
===================================================== */

function InsightList({
  title,
  items,
}) {
  return (
    <article className="rounded-2xl border border-slate-100 p-5">

      <h3 className="font-bold text-slate-800">
        {title}
      </h3>

      {items?.length ? (
        <ul className="mt-3 space-y-3">

          {items.map(
            (item, index) => (
              <li
                key={`${title}-${index}`}
                className="flex gap-3 text-sm leading-6 text-slate-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />

                {item}
              </li>
            )
          )}

        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Not identified in the source paper.
        </p>
      )}

    </article>
  );
}

/* =====================================================
   RESEARCH OUTPUT
===================================================== */

function ResearchOutput({
  output,
}) {
  const value = output.value;

  if (output.type === "rag") {
    return (
      <section className="mt-7 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:p-7">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
            <MessageSquare
              size={19}
            />
          </div>

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Grounded answer
            </p>

            <p className="text-sm text-slate-500">
              {value.confidence ||
                "medium"}{" "}
              confidence
            </p>

          </div>

        </div>

        <div className="mt-5 rounded-2xl bg-violet-50 p-5">

          <p className="text-sm leading-7 text-slate-700">
            {value.answer}
          </p>

        </div>

        {value.sources?.length ? (
          <div className="mt-5">

            <p className="text-sm font-bold text-slate-800">
              Evidence used
            </p>

            <div className="mt-3 space-y-3">

              {value.sources.map(
                (
                  source,
                  index
                ) => (
                  <div
                    key={`${source.title || "paper"}-${source.passage}-${index}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >

                    <p className="text-xs font-bold text-violet-600">
                      {source.title
                        ? `${source.title} · `
                        : ""}
                      Passage{" "}
                      {source.passage}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {source.excerpt}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>
        ) : null}

      </section>
    );
  }

  if (output.type === "review") {
    const sections = [
      [
        "Existing approaches",
        value.existingApproaches,
      ],
      [
        "Methodological trends",
        value.methodologicalTrends,
      ],
      [
        "Key findings",
        value.keyFindings,
      ],
      [
        "Research gaps",
        value.researchGaps,
      ],
      [
        "Future directions",
        value.futureDirections,
      ],
      [
        "Commonly studied",
        value.commonlyStudied,
      ],
      [
        "Underexplored areas",
        value.underexplored,
      ],
    ];

    return (
      <section className="mt-7 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:p-7">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <BookOpenCheck
              size={20}
            />
          </div>

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              AI synthesis
            </p>

            <h2 className="text-xl font-black text-slate-900">
              Literature Review
            </h2>

          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5">

          <p className="text-sm leading-7 text-slate-700">
            {value.introduction}
          </p>

        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {sections.map(
            ([title, items]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 p-5"
              >

                <h3 className="font-bold text-slate-800">
                  {title}
                </h3>

                {items?.length ? (
                  <ul className="mt-3 space-y-2">

                    {items.map(
                      (
                        item,
                        index
                      ) => (
                        <li
                          key={index}
                          className="text-sm leading-6 text-slate-600"
                        >
                          • {item}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    No evidence provided.
                  </p>
                )}

              </div>
            )
          )}

        </div>

      </section>
    );
  }

  return (
    <section className="mt-7 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:p-7">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-fuchsia-100 p-2.5 text-fuchsia-700">
          <Scale size={20} />
        </div>

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-600">
            Evidence matrix
          </p>

          <h2 className="text-xl font-black text-slate-900">
            Paper Comparison
          </h2>

        </div>

      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">

        <p className="text-sm leading-7 text-slate-700">
          {value.summary}
        </p>

      </div>

      <div className="mt-5 space-y-3">

        {value.dimensions?.map(
          (dimension, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 p-5"
            >

              <p className="font-bold text-violet-700">
                {dimension.name}
              </p>

              <div className="mt-3 grid gap-3">

                {dimension.values?.map(
                  (
                    item,
                    valueIndex
                  ) => (
                    <div
                      key={valueIndex}
                      className="rounded-xl bg-slate-50 p-3"
                    >

                      <p className="text-xs font-bold text-slate-500">
                        {item.paper}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.value}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )
        )}

      </div>

      <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-5">

        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
          AI takeaway
        </p>

        <p className="mt-2 text-sm leading-7 text-slate-700">
          {value.takeaway}
        </p>

      </div>

    </section>
  );
}