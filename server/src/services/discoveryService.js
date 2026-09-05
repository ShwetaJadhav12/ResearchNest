import pdfParse from "pdf-parse";

// Helper to reconstruct abstract from OpenAlex inverted index
const reconstructAbstract = (invertedIndex) => {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  try {
    const entries = Object.entries(invertedIndex);
    if (!entries.length) return "";

    let maxIndex = 0;
    entries.forEach(([_, positions]) => {
      positions.forEach((pos) => {
        if (pos > maxIndex) maxIndex = pos;
      });
    });

    const words = new Array(maxIndex + 1);
    entries.forEach(([word, positions]) => {
      positions.forEach((pos) => {
        words[pos] = word;
      });
    });

    return words.filter((w) => w !== undefined).join(" ").trim();
  } catch {
    return "";
  }
};

// Search OpenAlex
const searchOpenAlex = async (query, limit = 15) => {
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(
      query
    )}&per-page=${limit}&sort=relevance_score:desc`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "ResearchNest/1.0 (mailto:support@researchnest.app)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn("OpenAlex returned status:", res.status);
      return [];
    }

    const data = await res.json();
    const results = data.results || [];

    return results.map((item) => {
      const authors = (item.authorships || [])
        .map((a) => a.author?.display_name)
        .filter(Boolean);

      const abstract =
        reconstructAbstract(item.abstract_inverted_index) ||
        (item.title ? `Research work investigating ${item.title}` : "");

      const topics = (item.concepts || [])
        .map((c) => c.display_name)
        .filter(Boolean)
        .slice(0, 6);

      const journal =
        item.primary_location?.source?.display_name ||
        item.host_venue?.display_name ||
        item.locations?.[0]?.source?.display_name ||
        "Academic Journal / Conference";

      const doi = item.doi || (item.ids?.doi ? `https://doi.org/${item.ids.doi}` : "");
      const officialUrl =
        doi || item.primary_location?.landing_page_url || item.id || "";

      const pdfUrl =
        item.open_access?.oa_url ||
        item.primary_location?.pdf_url ||
        item.best_oa_location?.pdf_url ||
        "";

      return {
        id: item.id || `openalex-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || "Untitled Paper",
        authors,
        year: item.publication_year || new Date().getFullYear(),
        abstract,
        journal,
        doi,
        topics,
        citationCount: item.cited_by_count || 0,
        isOpenAccess: Boolean(item.open_access?.is_oa || pdfUrl),
        officialUrl,
        pdfUrl,
        source: "OpenAlex",
      };
    });
  } catch (error) {
    console.error("OpenAlex search error:", error.message);
    return [];
  }
};

// Search arXiv as supplementary/fallback
const searchArxiv = async (query, limit = 10) => {
  try {
    const cleanQuery = query.replace(/[^\w\s]/gi, " ").trim();
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
      cleanQuery
    )}&start=0&max_results=${limit}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];

    const xml = await res.text();

    // Fast XML entry parser without external dependency
    const entries = xml.split("<entry>").slice(1);
    return entries.map((entryXml) => {
      const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entryXml.match(/<published>([\s\S]*?)<\/published>/);
      const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/);
      const pdfMatch = entryXml.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/);

      const authors = [];
      const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
      let match;
      while ((match = authorRegex.exec(entryXml)) !== null) {
        authors.push(match[1].trim());
      }

      const rawId = idMatch ? idMatch[1].trim() : "";
      const arxivId = rawId.split("/abs/")[1] || rawId;
      const pdfUrl = pdfMatch ? pdfMatch[1] : arxivId ? `https://arxiv.org/pdf/${arxivId}.pdf` : "";
      const year = publishedMatch ? new Date(publishedMatch[1].trim()).getFullYear() : new Date().getFullYear();

      return {
        id: rawId || `arxiv-${Math.random().toString(36).substring(2, 9)}`,
        title: titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "Untitled arXiv Paper",
        authors,
        year,
        abstract: summaryMatch ? summaryMatch[1].replace(/\s+/g, " ").trim() : "",
        journal: "arXiv Preprint",
        doi: "",
        topics: ["Preprint", "Open Science"],
        citationCount: 0,
        isOpenAccess: true,
        officialUrl: rawId || pdfUrl,
        pdfUrl,
        source: "arXiv",
      };
    });
  } catch (error) {
    console.error("arXiv search error:", error.message);
    return [];
  }
};

// Aggregate discovery categories from paper list
const aggregateCategories = (papers) => {
  const authorMap = new Map();
  const areaMap = new Map();
  const journalMap = new Map();
  const datasetCandidates = new Set();

  papers.forEach((paper) => {
    // Authors
    (paper.authors || []).forEach((author) => {
      const current = authorMap.get(author) || { name: author, papersCount: 0, citations: 0 };
      current.papersCount += 1;
      current.citations += paper.citationCount || 0;
      authorMap.set(author, current);
    });

    // Research Areas
    (paper.topics || []).forEach((topic) => {
      const count = areaMap.get(topic) || 0;
      areaMap.set(topic, count + 1);
    });

    // Journals / Conferences
    if (paper.journal && paper.journal !== "Academic Journal / Conference") {
      const count = journalMap.get(paper.journal) || 0;
      journalMap.set(paper.journal, count + 1);
    }

    // Datasets detection from abstract/title
    const text = `${paper.title} ${paper.abstract}`.toLowerCase();
    const datasetMatches = text.match(/\b([a-z0-9-_]{3,20}\s(?:dataset|corpus|benchmark|database|registry))\b/gi) || [];
    datasetMatches.slice(0, 2).forEach((match) => {
      const cleaned = match.trim().replace(/^the\s+/i, "");
      if (cleaned.length > 5) datasetCandidates.add(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
    });
  });

  const keyAuthors = Array.from(authorMap.values())
    .sort((a, b) => b.papersCount * 2 + b.citations * 0.1 - (a.papersCount * 2 + a.citations * 0.1))
    .slice(0, 10);

  const researchAreas = Array.from(areaMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const journals = Array.from(journalMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const datasets = Array.from(datasetCandidates).slice(0, 8);

  return {
    keyAuthors,
    researchAreas,
    journals,
    datasets,
  };
};

// Main Unified Search Function
export const searchAcademicResearch = async (query, options = {}) => {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) {
    return { papers: [], categories: { keyAuthors: [], researchAreas: [], journals: [], datasets: [] } };
  }

  const { source = "all", year, openAccessOnly = false } = options;

  let papers = [];

  if (source === "openalex" || source === "all") {
    const openAlexPapers = await searchOpenAlex(cleanQuery, 15);
    papers.push(...openAlexPapers);
  }

  if ((source === "arxiv" || (source === "all" && papers.length < 8)) && papers.length < 25) {
    const arxivPapers = await searchArxiv(cleanQuery, 8);
    papers.push(...arxivPapers);
  }

  // Deduplicate by title similarity
  const seenTitles = new Set();
  let uniquePapers = papers.filter((p) => {
    const normalized = p.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
    if (!normalized || seenTitles.has(normalized)) return false;
    seenTitles.add(normalized);
    return true;
  });

  // Apply filters
  if (openAccessOnly) {
    uniquePapers = uniquePapers.filter((p) => p.isOpenAccess);
  }

  if (year) {
    const minYear = parseInt(year, 10);
    if (!isNaN(minYear)) {
      uniquePapers = uniquePapers.filter((p) => p.year >= minYear);
    }
  }

  const categories = aggregateCategories(uniquePapers);

  return {
    papers: uniquePapers,
    categories,
    total: uniquePapers.length,
  };
};

// Fetch and extract PDF text when adding discovered paper to workspace
export const fetchAndExtractOpenAccessPdf = async (pdfUrl) => {
  if (!pdfUrl) return { buffer: null, content: "" };

  try {
    const res = await fetch(pdfUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 ResearchNest/1.0",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn("Failed to download OA PDF:", res.status);
      return { buffer: null, content: "" };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let content = "";
    try {
      const parsed = await pdfParse(buffer);
      content = parsed.text ? parsed.text.replace(/\r/g, "").trim() : "";
    } catch (parseErr) {
      console.warn("pdf-parse extraction failed on downloaded PDF:", parseErr.message);
    }

    return { buffer, content };
  } catch (error) {
    console.warn("Error fetching OA PDF:", error.message);
    return { buffer: null, content: "" };
  }
};
