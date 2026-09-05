import Paper from "../models/Paper.js";
import Workspace from "../models/Workspace.js";
import Activity from "../models/Activity.js";
import {
  searchAcademicResearch,
  fetchAndExtractOpenAccessPdf,
} from "../services/discoveryService.js";
import { generateDiscoveryOverview } from "../services/researchAIService.js";

// GET /api/discovery/search
export const searchResearch = async (req, res) => {
  try {
    const { q, source, year, openAccess } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const results = await searchAcademicResearch(q.trim(), {
      source: source || "all",
      year: year ? parseInt(year, 10) : undefined,
      openAccessOnly: openAccess === "true",
    });

    return res.status(200).json({
      success: true,
      query: q,
      papers: results.papers,
      categories: results.categories,
      total: results.total,
    });
  } catch (error) {
    console.error("Discovery search error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve academic research.",
    });
  }
};

// POST /api/discovery/ai-overview
export const getDiscoveryOverview = async (req, res) => {
  try {
    const { topic, papers = [] } = req.body;

    if (!topic || !papers.length) {
      return res.status(400).json({
        success: false,
        message: "Topic and retrieved papers are required to generate an AI research overview.",
      });
    }

    const overview = await generateDiscoveryOverview({
      papers: papers.slice(0, 15),
      topic,
    });

    return res.status(200).json({
      success: true,
      overview,
    });
  } catch (error) {
    console.error("Discovery AI overview error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI research overview.",
    });
  }
};

// POST /api/discovery/add-to-workspace
export const addDiscoveredPaperToWorkspace = async (req, res) => {
  try {
    const { workspaceId, paperData } = req.body;

    if (!workspaceId || !paperData) {
      return res.status(400).json({
        success: false,
        message: "Workspace ID and paper metadata are required.",
      });
    }

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    const isCreator = String(workspace.createdBy) === String(req.user.id);
    const member = (workspace.members || []).find(
      (m) => String(m.user) === String(req.user.id)
    );

    if (!isCreator && (!member || member.role === "viewer")) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to add papers to this workspace.",
      });
    }

    // Attempt to download and extract open-access PDF if URL is present
    let pdfBuffer = null;
    let extractedText = paperData.abstract || "";

    if (paperData.isOpenAccess && paperData.pdfUrl) {
      console.log(`📥 Fetching open-access PDF for: ${paperData.title}...`);
      const downloadResult = await fetchAndExtractOpenAccessPdf(paperData.pdfUrl);
      if (downloadResult.buffer) {
        pdfBuffer = downloadResult.buffer;
      }
      if (downloadResult.content && downloadResult.content.length > extractedText.length) {
        extractedText = downloadResult.content;
      }
    }

    const cleanFilename = `${(paperData.title || "paper")
      .slice(0, 50)
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}.pdf`;

    const paper = await Paper.create({
      filename: cleanFilename,
      title: paperData.title || "Untitled Paper",
      authors: Array.isArray(paperData.authors) ? paperData.authors : [],
      abstract: paperData.abstract || "",
      content: extractedText,
      data: pdfBuffer,
      contentType: "application/pdf",
      size: pdfBuffer ? pdfBuffer.length : undefined,
      doi: paperData.doi || "",
      journal: paperData.journal || "",
      year: paperData.year || new Date().getFullYear(),
      citationCount: paperData.citationCount || 0,
      officialUrl: paperData.officialUrl || "",
      pdfUrl: paperData.pdfUrl || "",
      source: "discovery",
      topic: paperData.topics?.[0] || workspace.topic || "Research",
      tags: paperData.topics || [],
      workspace: workspace._id,
      uploadedBy: req.user.id,
      folder: "Discovered Papers",
    });

    // Log Activity
    await Activity.create({
      workspace: workspace._id,
      user: req.user.id,
      type: "paper_added",
      description: `${req.user.fullName || "A researcher"} added discovered paper "${paper.title}" from ${paperData.source || "Academic Search"}`,
      metadata: {
        paperId: paper._id,
        source: paperData.source,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Paper "${paper.title}" added to ${workspace.name}`,
      paper: {
        _id: paper._id,
        title: paper.title,
        authors: paper.authors,
        topic: paper.topic,
        workspace: paper.workspace,
        source: paper.source,
        hasPdfBinary: Boolean(paper.data && paper.data.length > 0),
        pdfUrl: paper.pdfUrl,
      },
    });
  } catch (error) {
    console.error("Add discovered paper error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add paper to workspace.",
    });
  }
};
