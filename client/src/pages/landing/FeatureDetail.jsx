
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Upload,
  Plus,
  Sparkles,
  FileText,
  FolderOpen,
  Search,
  X,
  ChevronRight,
  Brain,
  Loader2,
} from "lucide-react";

import Navbar from "../../components/layout/Navbar";

const featureContent = {
  "upload-organize": {
    title: "Smart Research Workspace",
    eyebrow: "AI-powered organization",
    summary:
      "Upload your research papers and ResearchNest automatically understands their topics and organizes them into focused workspaces.",
  },

  "ai-research-assistant": {
    title: "AI Research Assistant",
    eyebrow: "Smart research",
    summary:
      "Ask questions, summarize papers and discover insights across your research workspace.",
  },

  "knowledge-graph": {
    title: "Knowledge Graph",
    eyebrow: "Connect ideas",
    summary:
      "Discover relationships between papers, topics, authors and research concepts.",
  },

  "smart-notes": {
    title: "Smart Notes",
    eyebrow: "Research thinking",
    summary:
      "Capture and organize your thoughts alongside the papers that inspired them.",
  },

  "research-insights": {
    title: "Research Insights",
    eyebrow: "Research intelligence",
    summary:
      "Understand your research collection and discover patterns across your papers.",
  },

  "team-collaboration": {
    title: "Team Collaboration",
    eyebrow: "Work together",
    summary:
      "Share research workspaces and collaborate with your team.",
  },
};

const workspaceIcons = [
  "✨",
  "🧠",
  "🧬",
  "🤖",
  "🔐",
  "📊",
  "🌍",
  "⚛️",
];

export default function FeatureDetail() {
  const { slug } = useParams();

  const feature =
    featureContent[slug] ||
    featureContent["upload-organize"];

  const [papers, setPapers] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState(null);

  const [search, setSearch] = useState("");

  const [uploading, setUploading] =
    useState(false);

  const [showCreateWorkspace, setShowCreateWorkspace] =
    useState(false);

  const [newWorkspace, setNewWorkspace] =
    useState("");

  const [customWorkspaces, setCustomWorkspaces] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "researchnest_workspaces"
          ) || "[]"
        );
      } catch {
        return [];
      }
    });

  /*
   * FETCH PAPERS
   */

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await api.get("/api/papers")

      if (res.data?.success) {
        setPapers(res.data.papers || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch papers:",
        error
      );

      toast.error(
        "Unable to load your research papers"
      );
    }
  };

  /*
   * AI WORKSPACES
   *
   * Every unique AI topic becomes a workspace.
   */

  const workspaces = useMemo(() => {
    const workspaceMap = {};

    papers.forEach((paper) => {
      const topic =
        paper.topic ||
        paper.folder ||
        "Research";

      if (!workspaceMap[topic]) {
        workspaceMap[topic] = {
          id: topic,
          name: topic,
          papers: [],
          icon:
            workspaceIcons[
              Object.keys(workspaceMap).length %
                workspaceIcons.length
            ],
          type: "ai",
        };
      }

      workspaceMap[topic].papers.push(paper);
    });

    /*
     * Add manually created workspaces
     */

    customWorkspaces.forEach((workspace) => {
      if (!workspaceMap[workspace.name]) {
        workspaceMap[workspace.name] = {
          id: workspace.id,
          name: workspace.name,
          papers: [],
          icon:
            workspace.icon || "📁",
          type: "custom",
        };
      }
    });

    return Object.values(workspaceMap);
  }, [papers, customWorkspaces]);

  /*
   * SELECTED WORKSPACE
   */

  const activeWorkspace = useMemo(() => {
    if (!selectedWorkspace) {
      return null;
    }

    return workspaces.find(
      (workspace) =>
        workspace.id === selectedWorkspace
    );
  }, [selectedWorkspace, workspaces]);

  /*
   * FILTER PAPERS
   */

  const filteredPapers =
    activeWorkspace?.papers.filter((paper) => {
      const value =
        `${paper.title || ""} ${
          paper.filename || ""
        } ${
          paper.authors?.join(" ") || ""
        }`.toLowerCase();

      return value.includes(
        search.toLowerCase()
      );
    }) || [];

  /*
   * UPLOAD PAPERS
   */

  const handleUpload = async (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setUploading(true);

    let successCount = 0;

    try {
      for (const file of files) {
        if (
          file.type !== "application/pdf" &&
          !file.name
            .toLowerCase()
            .endsWith(".pdf")
        ) {
          toast.error(
            `${file.name} is not a PDF`
          );

          continue;
        }

        const formData = new FormData();

        formData.append(
          "file",
          file
        );

        /*
         * Don't send a topic.
         *
         * Gemini will determine it.
         */

        const response =
          await api.post(
  "/api/papers/upload",
  
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
              withCredentials: true,
            }
          );

        if (
          response.data?.success
        ) {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} paper${
            successCount > 1
              ? "s"
              : ""
          } uploaded. AI is organizing your research.`
        );

        await fetchPapers();
      }
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Paper upload failed"
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  /*
   * CREATE WORKSPACE
   *
   * Manual workspaces are stored locally for now.
   * AI-created workspaces come automatically
   * from paper.topic.
   */

  const createWorkspace = () => {
    const name =
      newWorkspace.trim();

    if (!name) {
      toast.error(
        "Enter a workspace name"
      );

      return;
    }

    const exists =
      workspaces.some(
        (workspace) =>
          workspace.name.toLowerCase() ===
          name.toLowerCase()
      );

    if (exists) {
      toast.error(
        "Workspace already exists"
      );

      return;
    }

    const workspace = {
      id: `workspace-${Date.now()}`,
      name,
      icon: "📁",
    };

    const updated = [
      ...customWorkspaces,
      workspace,
    ];

    setCustomWorkspaces(updated);

    localStorage.setItem(
      "researchnest_workspaces",
      JSON.stringify(updated)
    );

    setNewWorkspace("");

    setShowCreateWorkspace(false);

    toast.success(
      "Workspace created"
    );
  };

  /*
   * WORKSPACE VIEW
   */

  if (activeWorkspace) {
    return (
      <div className="min-h-screen bg-[#FAF7FF]">
        <Navbar />

        <main className="mx-auto max-w-7xl px-6 py-10">

          {/* BACK */}

          <button
            onClick={() =>
              setSelectedWorkspace(null)
            }
            className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={17} />

            All Workspaces
          </button>

          {/* HEADER */}

          <div className="rounded-[28px] border border-violet-100 bg-white p-7 shadow-sm">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-5">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl">

                  {activeWorkspace.icon}

                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h1 className="text-3xl font-bold text-slate-900">

                      {activeWorkspace.name}

                    </h1>

                    {activeWorkspace.type ===
                      "ai" && (
                      <span className="flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">

                        <Sparkles size={12} />

                        AI Workspace

                      </span>
                    )}

                  </div>

                  <p className="mt-1 text-sm text-slate-500">

                    {activeWorkspace.papers.length}{" "}
                    research paper
                    {activeWorkspace.papers.length !==
                    1
                      ? "s"
                      : ""}

                  </p>

                </div>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">

                <Upload size={17} />

                Add Papers

                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleUpload}
                />

              </label>

            </div>

          </div>

          {/* SEARCH */}

          <div className="mt-7 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

            <Search
              size={19}
              className="text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search papers in this workspace..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

          </div>

          {/* PAPERS */}

          <div className="mt-8">

            {filteredPapers.length ===
            0 ? (
              <div className="rounded-[28px] border border-dashed border-violet-200 bg-white px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">

                  <FileText size={28} />

                </div>

                <h2 className="mt-5 text-xl font-semibold text-slate-900">

                  No papers yet

                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                  Upload research papers and
                  ResearchNest will automatically
                  organize them here.

                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {filteredPapers.map(
                  (paper) => (
                    <div
                      key={paper._id}
                      className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                    >

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                          <FileText
                            size={21}
                          />

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="truncate font-semibold text-slate-900">

                            {paper.title ||
                              paper.filename}

                          </h3>

                          <p className="mt-1 text-sm text-slate-500">

                            {paper.authors?.length
                              ? paper.authors.join(
                                  ", "
                                )
                              : "Author information unavailable"}

                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">

                            <span className="flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">

                              <Brain
                                size={12}
                              />

                              {paper.topic ||
                                activeWorkspace.name}

                            </span>

                            {paper.tags
                              ?.slice(0, 3)
                              .map(
                                (tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500"
                                  >
                                    {tag}
                                  </span>
                                )
                              )}

                          </div>

                        </div>

                        <ChevronRight
                          size={19}
                          className="mt-2 text-slate-300 transition group-hover:text-violet-500"
                        />

                      </div>

                      {paper.abstract && (
                        <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-500">

                          {paper.abstract.length >
                          260
                            ? `${paper.abstract.slice(
                                0,
                                260
                              )}...`
                            : paper.abstract}

                        </p>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </main>
      </div>
    );
  }

  /*
   * MAIN WORKSPACE PAGE
   */

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* TOP */}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-600"
            >
              <ArrowLeft size={16} />

              Back to home
            </Link>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200">

                <Sparkles
                  size={22}
                />

              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">

                  AI Research Workspace

                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">

                  {feature.title}

                </h1>

              </div>

            </div>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">

              {feature.summary}

            </p>

          </div>

          <button
            onClick={() =>
              setShowCreateWorkspace(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50"
          >

            <Plus size={17} />

            Create Workspace

          </button>

        </div>

        {/* UPLOAD AREA */}

        <section className="mt-10 rounded-[30px] border border-violet-100 bg-white p-8 shadow-[0_18px_60px_rgba(139,92,246,0.08)]">

          <div className="flex flex-col items-center text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">

              {uploading ? (
                <Loader2
                  size={28}
                  className="animate-spin"
                />
              ) : (
                <Upload size={28} />
              )}

            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">

              Upload your research papers

            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">

              Upload one or multiple PDFs. Gemini
              analyzes the content and automatically
              places each paper into the right
              research workspace.

            </p>

            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">

              <Upload size={17} />

              {uploading
                ? "Analyzing papers..."
                : "Upload Research Papers"}

              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />

            </label>

            <p className="mt-3 text-xs text-slate-400">

              PDF files • AI topic detection • Automatic workspace organization

            </p>

          </div>

        </section>

        {/* WORKSPACES */}

        <section className="mt-12">

          <div className="flex items-end justify-between">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">

                Your Workspaces

              </h2>

              <p className="mt-1 text-sm text-slate-500">

                ResearchNest automatically groups related papers together.

              </p>

            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">

              {workspaces.length} workspace
              {workspaces.length !== 1
                ? "s"
                : ""}

            </span>

          </div>

          {workspaces.length ===
          0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-violet-200 bg-white px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">

                <FolderOpen
                  size={28}
                />

              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">

                Your research workspace is empty

              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">

                Upload your first research paper.
                ResearchNest will analyze it and
                automatically create a workspace
                around its topic.

              </p>

            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {workspaces.map(
                (workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() =>
                      setSelectedWorkspace(
                        workspace.id
                      )
                    }
                    className="group rounded-[26px] border border-slate-200 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_15px_40px_rgba(139,92,246,0.12)]"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">

                        {workspace.icon}

                      </div>

                      <ChevronRight
                        size={19}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-violet-500"
                      />

                    </div>

                    <div className="mt-5">

                      <div className="flex items-center gap-2">

                        <h3 className="font-semibold text-slate-900">

                          {workspace.name}

                        </h3>

                        {workspace.type ===
                          "ai" && (
                          <Sparkles
                            size={14}
                            className="text-violet-500"
                          />
                        )}

                      </div>

                      <p className="mt-1 text-sm text-slate-500">

                        {workspace.papers.length}{" "}
                        paper
                        {workspace.papers.length !==
                        1
                          ? "s"
                          : ""}

                      </p>

                    </div>

                    <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-400">

                      <FileText
                        size={13}
                      />

                      {workspace.papers
                        .slice(0, 2)
                        .map(
                          (paper) =>
                            paper.title ||
                            paper.filename
                        )
                        .join(" • ") ||
                        "No papers yet"}

                    </div>

                  </button>
                )
              )}

              {/* CREATE CARD */}

              <button
                onClick={() =>
                  setShowCreateWorkspace(true)
                }
                className="flex min-h-[210px] flex-col items-center justify-center rounded-[26px] border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center transition hover:border-violet-400 hover:bg-violet-50"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">

                  <Plus size={22} />

                </div>

                <p className="mt-4 font-semibold text-slate-800">

                  Create workspace

                </p>

                <p className="mt-1 text-xs text-slate-500">

                  Start a focused research collection

                </p>

              </button>

            </div>
          )}

        </section>

      </main>

      {/* CREATE WORKSPACE MODAL */}

      {showCreateWorkspace && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowCreateWorkspace(false);
            }
          }}
        >

          <div className="w-full max-w-md rounded-[28px] border border-violet-100 bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

                  <FolderOpen
                    size={20}
                  />

                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">

                  Create workspace

                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">

                  Create a focused space for a
                  research topic or project.

                </p>

              </div>

              <button
                onClick={() =>
                  setShowCreateWorkspace(
                    false
                  )
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >

                <X size={19} />

              </button>

            </div>

            <label className="mt-7 block">

              <span className="text-sm font-medium text-slate-700">

                Workspace name

              </span>

              <input
                autoFocus
                value={newWorkspace}
                onChange={(event) =>
                  setNewWorkspace(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    createWorkspace();
                  }
                }}
                placeholder="e.g. Generative AI"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />

            </label>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowCreateWorkspace(
                    false
                  )
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >

                Cancel

              </button>

              <button
                onClick={createWorkspace}
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
              >

                Create Workspace

              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

