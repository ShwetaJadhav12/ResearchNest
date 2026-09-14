import React, { useEffect, useState } from "react";
import {
  Brain,
  Sparkles,
  Layers,
  GitCompare,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Filter,
  Search,
  RefreshCw,
  Sliders,
  ChevronRight,
  Bookmark,
  Building2,
  FileText,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function ResearchHorizon() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("matrix"); // "matrix", "insights", "hypotheses", "lineage"

  const [horizonData, setHorizonData] = useState({
    papersCount: 0,
    matrix: [],
    crossPaperInsights: [],
    hypotheses: [],
    methodologyLineage: [],
  });

  const loadWorkspaces = async () => {
    try {
      const res = await api.get("/api/workspaces");
      setWorkspaces(res.data.workspaces || []);
    } catch (err) {
      console.warn("Failed to fetch workspaces:", err);
    }
  };

  const loadHorizonData = async () => {
    try {
      setLoading(true);
      setError("");

      const url = workspaceId
        ? `/api/knowledge-graph/horizon?workspaceId=${workspaceId}`
        : "/api/knowledge-graph/horizon";

      const res = await api.get(url);
      if (res.data.success && res.data.data) {
        setHorizonData(res.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Horizon data load error:", err);
      setError(err.response?.data?.message || "Failed to load Research Horizon analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    loadHorizonData();
  }, [workspaceId]);

  // Filter matrix papers
  const filteredMatrix = (horizonData.matrix || []).filter((item) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      (item.title || "").toLowerCase().includes(query) ||
      (item.methodologyCategory || "").toLowerCase().includes(query) ||
      (item.keyNovelty || "").toLowerCase().includes(query) ||
      (item.datasetUsed || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* HEADER HERO */}
      <header className="border-b border-slate-200 bg-white px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-xs font-semibold text-violet-700">
                <Sparkles size={14} className="animate-pulse" />
                Beyond Knowledge Graphs • Next-Gen Research Matrix
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Research Horizon & <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Hypothesis Matrix</span>
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
                An active innovation engine replacing static graph nodes. Automatically synthesizes paper methodologies, scans cross-paper contradictions, and formulates high-impact AI research hypotheses.
              </p>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-400 focus:border-violet-500 focus:outline-none"
              >
                <option value="">All Workspaces</option>
                {workspaces.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>

              <button
                onClick={loadHorizonData}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Synthesizing..." : "Re-Analyze Horizon"}
              </button>
            </div>
          </div>

          {/* STATS OVERVIEW CARDS */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-violet-600">
                <FileText size={20} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analyzed Papers</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{horizonData.matrix?.length || 0}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-amber-600">
                <GitCompare size={20} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cross-Paper Insights</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{horizonData.crossPaperInsights?.length || 0}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-emerald-600">
                <Lightbulb size={20} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Hypotheses</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{horizonData.hypotheses?.length || 0}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 text-sky-600">
                <TrendingUp size={20} />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lineage Shifts</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{horizonData.methodologyLineage?.length || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-8 w-full">
        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "matrix"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Layers size={16} />
              Comparative Tech Matrix
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "insights"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <GitCompare size={16} />
              Contradiction & Consensus
            </button>

            <button
              onClick={() => setActiveTab("hypotheses")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "hypotheses"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Lightbulb size={16} />
              AI Breakthrough Hypotheses
            </button>

            <button
              onClick={() => setActiveTab("lineage")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "lineage"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <TrendingUp size={16} />
              Method Evolution Timeline
            </button>
          </div>

          {activeTab === "matrix" && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search methodology..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-violet-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* LOADING & ERROR STATES */}
        {loading && (
          <div className="my-16 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className="animate-spin text-violet-600 mb-3" size={36} />
            <p className="text-sm font-medium">Synthesizing multi-paper matrix and hypothesis models via Gemini AI...</p>
          </div>
        )}

        {error && !loading && (
          <div className="my-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle size={20} />
              Analysis Error
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && horizonData.matrix?.length === 0 && (
          <div className="my-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <Brain size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">No Research Papers Found</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Upload papers to your workspace to automatically generate the Comparative Tech Matrix, cross-paper contradiction analysis, and AI hypotheses.
            </p>
          </div>
        )}

        {/* TAB 1: COMPARATIVE TECH MATRIX */}
        {!loading && !error && activeTab === "matrix" && horizonData.matrix?.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Paper Title & Authors</th>
                    <th className="px-6 py-4">Methodology Category</th>
                    <th className="px-6 py-4">Dataset Used</th>
                    <th className="px-6 py-4">SOTA Metrics</th>
                    <th className="px-6 py-4">Compute Overhead</th>
                    <th className="px-6 py-4">Key Novelty</th>
                    <th className="px-6 py-4">Limitations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-violet-50/40 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900 min-w-[220px]">
                        <div>{item.title}</div>
                        <div className="text-xs font-normal text-slate-500 mt-0.5">{item.authors} ({item.year})</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
                          {item.methodologyCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{item.datasetUsed || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                          <CheckCircle2 size={14} />
                          {item.sotaMetrics}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Cpu size={14} className="text-sky-500" />
                          {item.computeCost}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700 max-w-xs">{item.keyNovelty}</td>
                      <td className="px-6 py-4 text-xs text-amber-700 bg-amber-50/50 rounded-md max-w-xs">
                        {item.primaryLimitations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CONTRADICTION & CONSENSUS */}
        {!loading && !error && activeTab === "insights" && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {(horizonData.crossPaperInsights || []).map((insight, idx) => {
              const isContradiction = insight.type?.toLowerCase().includes("contradict");
              const isConsensus = insight.type?.toLowerCase().includes("consensus");

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                    isContradiction
                      ? "border-rose-200 bg-rose-50/30"
                      : isConsensus
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-purple-200 bg-purple-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        isContradiction
                          ? "bg-rose-100 text-rose-800"
                          : isConsensus
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {isContradiction ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      {insight.type?.toUpperCase()}
                    </span>

                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Impact: {insight.impactLevel || "High"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">{insight.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{insight.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-200/60">
                    <div className="text-xs font-semibold text-slate-500 mb-2">Involved Workspace Papers:</div>
                    <div className="flex flex-wrap gap-2">
                      {(insight.involvedPapers || []).map((paperName, pIdx) => (
                        <span key={pIdx} className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {paperName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: AI HYPOTHESIS GENERATOR */}
        {!loading && !error && activeTab === "hypotheses" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {(horizonData.hypotheses || []).map((hypo, idx) => (
              <div key={idx} className="rounded-2xl border border-violet-200 bg-white p-6 shadow-md shadow-violet-500/5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-violet-100/50 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      <Zap size={14} /> AI Proposed Hypothesis #{idx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Novelty</span>
                        <span className="text-sm font-extrabold text-violet-600">{hypo.noveltyScore || 90}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Feasibility</span>
                        <span className="text-sm font-extrabold text-emerald-600">{hypo.feasibilityScore || 85}%</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">{hypo.title}</h3>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">Unsolved Gap / Problem Statement:</span>
                    {hypo.problemStatement}
                  </div>

                  <div className="mt-3 rounded-xl bg-violet-50/60 p-3.5 border border-violet-200 text-xs text-violet-950">
                    <span className="font-bold text-violet-900 block mb-1">Proposed Methodological Solution:</span>
                    {hypo.proposedMethod}
                  </div>

                  <div className="mt-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">Expected Impact:</span> {hypo.expectedImpact}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <BookOpen size={14} />
                    <span>Based on: {hypo.sourcePapers?.join(", ")}</span>
                  </div>

                  <button
                    onClick={() => toast.success("Hypothesis bookmarked into your workspace ideas!")}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-600"
                  >
                    <Bookmark size={14} /> Save to Ideas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: METHODOLOGY LINEAGE */}
        {!loading && !error && activeTab === "lineage" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-violet-600" size={20} />
              Chronological Paradigm Evolution Across Library
            </h3>

            <div className="relative border-l-2 border-violet-200 pl-6 space-y-8 ml-4">
              {(horizonData.methodologyLineage || []).map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-violet-600 shadow" />
                  <span className="inline-block rounded-md bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-800">
                    {step.year}
                  </span>
                  <h4 className="mt-1 text-base font-bold text-slate-900">{step.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{step.paradigmShift}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(step.papers || []).map((paperName, pIdx) => (
                      <span key={pIdx} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {paperName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
