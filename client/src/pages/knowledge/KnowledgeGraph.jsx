import React, { useEffect, useState } from "react";
import {
  BrainCircuit,
  FileText,
  Network,
  Search,
  Sparkles,
  Users,
  Tag,
} from "lucide-react";
import axios from "axios";

export default function KnowledgeGraph() {
  const [papers, setPapers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [workspaceId, setWorkspaceId] = useState("");
  const [search, setSearch] = useState("");

  const [selectedPaper, setSelectedPaper] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResearchData();
  }, []);

  const loadResearchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [papersResponse, workspaceResponse] =
        await Promise.all([
          axios.get("/api/papers"),
          axios.get("/api/workspaces"),
        ]);

      setPapers(
        papersResponse.data.papers || []
      );

      setWorkspaces(
        workspaceResponse.data.workspaces || []
      );
    } catch (error) {
      console.error(
        "Failed to load research data:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load research data."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter((paper) => {
    const matchesWorkspace =
      !workspaceId ||
      String(
        paper.workspace?._id ||
          paper.workspace ||
          ""
      ) === String(workspaceId);

    const query = search
      .trim()
      .toLowerCase();

    const searchableText = [
      paper.title,
      paper.filename,
      paper.topic,
      ...(paper.authors || []),
      ...(paper.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !query ||
      searchableText.includes(query);

    return (
      matchesWorkspace &&
      matchesSearch
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF7FF]">

      {/* HEADER */}

      <header className="border-b border-violet-100 bg-white px-6 py-5">

        <div className="mx-auto max-w-7xl">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

              <BrainCircuit size={23} />

            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                Research Knowledge Explorer
              </h1>

              <p className="text-sm text-slate-500">
                Discover connections across your research
              </p>

            </div>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* TOP SECTION */}

        <section className="rounded-[28px] bg-slate-950 p-7 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-violet-200">

                <Sparkles size={14} />

                RESEARCH INTELLIGENCE

              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">

                Understand how your
                <span className="block text-violet-300">
                  research connects.
                </span>

              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">

                Explore relationships between papers,
                authors, topics, methods, and research
                concepts in your workspace.

              </p>

            </div>

            {/* STATS */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

              <Stat
                value={papers.length}
                label="Papers"
              />

              <Stat
                value={workspaces.length}
                label="Workspaces"
              />

              <Stat
                value="AI"
                label="Analysis"
              />

            </div>

          </div>

        </section>

        {/* CONTROLS */}

        <section className="mt-6 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Explore
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Your research network
              </h2>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* WORKSPACE */}

              <select
                value={workspaceId}
                onChange={(event) =>
                  setWorkspaceId(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >

                <option value="">
                  All Workspaces
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

              {/* SEARCH */}

              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search papers, topics..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 sm:w-72"
                />

              </div>

            </div>

          </div>

        </section>

        {/* MAIN CONTENT */}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_350px]">

          {/* GRAPH */}

          <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-bold text-slate-900">
                    Research Network
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Select a paper to explore it.
                  </p>

                </div>

                <span className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                  {filteredPapers.length} papers
                </span>

              </div>

            </div>

            <div className="relative min-h-[600px] overflow-hidden bg-slate-50">

              {/* DOT GRID */}

              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "radial-gradient(#c4b5fd 1px, transparent 1px)",
                  backgroundSize:
                    "24px 24px",
                }}
              />

              {loading && (

                <div className="relative flex min-h-[600px] items-center justify-center">

                  <div className="text-center">

                    <BrainCircuit
                      size={35}
                      className="mx-auto animate-pulse text-violet-500"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      Loading research...
                    </p>

                  </div>

                </div>

              )}

              {!loading && error && (

                <div className="relative flex min-h-[600px] items-center justify-center">

                  <div className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">
                    {error}
                  </div>

                </div>

              )}

              {!loading &&
                !error &&
                filteredPapers.length === 0 && (

                  <div className="relative flex min-h-[600px] items-center justify-center">

                    <div className="max-w-sm text-center">

                      <Network
                        size={40}
                        className="mx-auto text-violet-400"
                      />

                      <h3 className="mt-4 font-bold text-slate-800">
                        No papers found
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Upload papers or select another
                        workspace.
                      </p>

                    </div>

                  </div>

                )}

              {!loading &&
                !error &&
                filteredPapers.length > 0 && (

                  <div className="relative min-h-[600px] p-8">

                    {/* CENTER */}

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">

                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-violet-100 bg-violet-600 text-center text-white shadow-xl">

                        <div>

                          <BrainCircuit
                            size={28}
                            className="mx-auto"
                          />

                          <p className="mt-1 text-xs font-bold">
                            Research
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* PAPER NODES */}

                    {filteredPapers
                      .slice(0, 8)
                      .map(
                        (
                          paper,
                          index
                        ) => {

                          const positions = [
                            "left-[6%] top-[15%]",
                            "left-[38%] top-[8%]",
                            "right-[7%] top-[16%]",
                            "right-[4%] top-[47%]",
                            "right-[12%] bottom-[10%]",
                            "left-[39%] bottom-[8%]",
                            "left-[7%] bottom-[13%]",
                            "left-[3%] top-[47%]",
                          ];

                          const selected =
                            selectedPaper?._id ===
                            paper._id;

                          return (
                            <button
                              key={
                                paper._id
                              }
                              onClick={() =>
                                setSelectedPaper(
                                  paper
                                )
                              }
                              className={`absolute ${positions[index]} w-40 -translate-y-1/2 rounded-2xl border bg-white p-3 text-left shadow-lg transition-all hover:scale-105 ${
                                selected
                                  ? "border-violet-500 ring-4 ring-violet-100"
                                  : "border-white"
                              }`}
                            >

                              <div className="flex items-center gap-2">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">

                                  <FileText
                                    size={15}
                                  />

                                </div>

                                <span className="text-[10px] font-bold uppercase text-violet-500">
                                  Paper
                                </span>

                              </div>

                              <p className="mt-2 line-clamp-3 text-xs font-bold text-slate-700">
                                {paper.title ||
                                  paper.filename}
                              </p>

                              {paper.topic && (
                                <p className="mt-2 truncate text-[10px] text-slate-400">
                                  {paper.topic}
                                </p>
                              )}

                            </button>
                          );
                        }
                      )}

                  </div>

                )}

            </div>

          </div>

          {/* DETAILS */}

          <aside className="h-fit rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">

            {!selectedPaper ? (

              <div className="py-12 text-center">

                <Network
                  size={36}
                  className="mx-auto text-violet-400"
                />

                <h3 className="mt-4 font-bold text-slate-800">
                  Select a paper
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Select a paper from the network to
                  inspect its research relationships.
                </p>

              </div>

            ) : (

              <SelectedPaper
                paper={selectedPaper}
              />

            )}

          </aside>

        </section>

      </main>

    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center">

      <p className="text-xl font-black">
        {value}
      </p>

      <p className="text-[11px] text-slate-300">
        {label}
      </p>

    </div>
  );
}

function SelectedPaper({ paper }) {
  return (
    <div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">

        <FileText size={22} />

      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-violet-600">
        Selected paper
      </p>

      <h2 className="mt-2 text-xl font-black leading-tight text-slate-900">
        {paper.title ||
          paper.filename}
      </h2>

      {/* TOPIC */}

      <div className="mt-5 rounded-2xl bg-violet-50 p-4">

        <div className="flex items-center gap-2">

          <BrainCircuit
            size={16}
            className="text-violet-600"
          />

          <span className="text-xs font-bold text-violet-600">
            Research Topic
          </span>

        </div>

        <p className="mt-2 font-bold text-violet-800">
          {paper.topic ||
            "Research"}
        </p>

      </div>

      {/* AUTHORS */}

      <div className="mt-5">

        <div className="flex items-center gap-2">

          <Users
            size={16}
            className="text-violet-600"
          />

          <p className="text-sm font-bold text-slate-800">
            Authors
          </p>

        </div>

        <div className="mt-3 flex flex-wrap gap-2">

          {paper.authors?.length ? (
            paper.authors.map(
              (author) => (
                <span
                  key={author}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600"
                >
                  {author}
                </span>
              )
            )
          ) : (
            <span className="text-xs text-slate-400">
              Not available
            </span>
          )}

        </div>

      </div>

      {/* TAGS */}

      <div className="mt-5">

        <div className="flex items-center gap-2">

          <Tag
            size={16}
            className="text-violet-600"
          />

          <p className="text-sm font-bold text-slate-800">
            Research concepts
          </p>

        </div>

        <div className="mt-3 flex flex-wrap gap-2">

          {paper.tags?.length ? (
            paper.tags.map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs text-violet-700"
                >
                  {tag}
                </span>
              )
            )
          ) : (
            <span className="text-xs text-slate-400">
              No concepts available
            </span>
          )}

        </div>

      </div>

      {/* AI */}

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4">

        <div className="flex items-center gap-2">

          <Sparkles
            size={17}
            className="text-violet-600"
          />

          <p className="text-sm font-bold text-slate-800">
            AI Relationship Analysis
          </p>

        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">

          ResearchNest will analyze this paper against
          your research collection to discover meaningful
          relationships.

        </p>

      </div>

    </div>
  );
}