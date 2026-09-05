import Workspace from "../models/Workspace.js";
import Paper from "../models/Paper.js";
import Activity from "../models/Activity.js";

// GET /api/workspaces
export const getMyWorkspaces = async (req, res) => {
  try {
    // Find workspaces user created OR is a member of
    const workspaces = await Workspace.find({
      $or: [
        { createdBy: req.user.id },
        { "members.user": req.user.id },
      ],
    })
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    // Fetch paper counts for each workspace
    const workspaceIds = workspaces.map((w) => w._id);
    const paperCounts = await Paper.aggregate([
      { $match: { workspace: { $in: workspaceIds } } },
      { $group: { _id: "$workspace", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    paperCounts.forEach((c) => {
      countMap[String(c._id)] = c.count;
    });

    const enriched = workspaces.map((w) => {
      const isOwner = String(w.createdBy._id || w.createdBy) === String(req.user.id);
      const membership = (w.members || []).find(
        (m) => String(m.user?._id || m.user) === String(req.user.id)
      );
      const userRole = isOwner ? "admin" : membership?.role || "editor";

      return {
        _id: w._id,
        name: w.name,
        description: w.description,
        topic: w.topic,
        createdBy: w.createdBy,
        membersCount: (w.members?.length || 0) + 1,
        papersCount: countMap[String(w._id)] || 0,
        userRole,
        isOwner,
        progress: w.progress,
        createdAt: w.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      workspaces: enriched,
    });
  } catch (error) {
    console.error("❌ Get workspaces error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspaces",
    });
  }
};

// POST /api/workspaces
export const createWorkspace = async (req, res) => {
  try {
    const { name, description = "", topic = "Research" } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workspace name is required",
      });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description.trim(),
      topic: topic.trim(),
      createdBy: req.user.id,
      members: [],
      progress: {
        status: "discovery",
        readingTarget: 10,
        notesTarget: 20,
        milestones: [
          { title: "Identify research questions", completed: false },
          { title: "Collect initial 5 papers", completed: false },
          { title: "Synthesize literature review", completed: false },
        ],
      },
    });

    await Activity.create({
      workspace: workspace._id,
      user: req.user.id,
      type: "progress_updated",
      description: `Created research workspace "${workspace.name}"`,
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create workspace",
    });
  }
};

// GET /api/workspaces/:workspaceId/papers
export const getWorkspacePapers = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("createdBy", "fullName email");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Verify user is owner or member
    const isOwner = String(workspace.createdBy._id || workspace.createdBy) === String(req.user.id);
    const isMember = (workspace.members || []).some(
      (m) => String(m.user) === String(req.user.id)
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this workspace",
      });
    }

    // Fetch all papers in this workspace
    const papers = await Paper.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .select(
        "_id filename title authors tags abstract topic workspace source doi journal year citationCount createdAt"
      );

    return res.status(200).json({
      success: true,
      workspace,
      papers,
    });
  } catch (error) {
    console.error("❌ Get workspace papers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace papers",
    });
  }
};

// PUT /api/workspaces/:workspaceId
export const updateWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, topic } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    // Only owner or admin member can edit workspace info
    const isOwner = String(workspace.createdBy) === String(req.user.id);
    const isAdmin = (workspace.members || []).some(
      (m) => String(m.user) === String(req.user.id) && m.role === "admin"
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    if (name) workspace.name = name.trim();
    if (description !== undefined) workspace.description = description.trim();
    if (topic) workspace.topic = topic.trim();

    await workspace.save();

    return res.status(200).json({
      success: true,
      workspace,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/workspaces/:workspaceId
export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    if (String(workspace.createdBy) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Only the workspace owner can delete it.",
      });
    }

    // Unlink papers from this workspace instead of deleting user's papers completely
    await Paper.updateMany({ workspace: workspaceId }, { $set: { workspace: null } });
    await Workspace.findByIdAndDelete(workspaceId);

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};