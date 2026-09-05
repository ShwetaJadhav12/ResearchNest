import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import Paper from "../models/Paper.js";
import Activity from "../models/Activity.js";
import Discussion from "../models/Discussion.js";
import Annotation from "../models/Annotation.js";
import SavedResearch from "../models/SavedResearch.js";

// Helper to check user membership and role
const getWorkspaceAndRole = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId)
    .populate("createdBy", "fullName email avatar")
    .populate("members.user", "fullName email avatar");

  if (!workspace) return { workspace: null, role: null };

  if (String(workspace.createdBy._id || workspace.createdBy) === String(userId)) {
    return { workspace, role: "admin", isOwner: true };
  }

  const member = (workspace.members || []).find(
    (m) => String(m.user?._id || m.user) === String(userId)
  );

  if (member) {
    return { workspace, role: member.role || "editor", isOwner: false };
  }

  return { workspace: null, role: null };
};

// GET /api/collaboration/:workspaceId/hub
export const getWorkspaceCollaborationHub = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { workspace, role, isOwner } = await getWorkspaceAndRole(
      workspaceId,
      req.user.id
    );

    if (!workspace) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this workspace.",
      });
    }

    const [papers, activities, discussions, savedResearch, notesCount] =
      await Promise.all([
        Paper.find({ workspace: workspaceId }).select(
          "_id title filename authors topic year citationCount doi source createdAt"
        ),
        Activity.find({ workspace: workspaceId })
          .populate("user", "fullName email avatar")
          .sort({ createdAt: -1 })
          .limit(30),
        Discussion.find({ workspace: workspaceId })
          .populate("user", "fullName email avatar")
          .populate("paper", "title filename")
          .sort({ createdAt: 1 })
          .limit(50),
        SavedResearch.find({ workspace: workspaceId })
          .populate("user", "fullName email")
          .sort({ createdAt: -1 }),
        Annotation.countDocuments({ workspace: workspaceId }),
      ]);

    return res.status(200).json({
      success: true,
      workspace: {
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        topic: workspace.topic,
        createdBy: workspace.createdBy,
        members: workspace.members,
        invitedEmails: workspace.invitedEmails,
        progress: workspace.progress || {
          status: "reading",
          readingTarget: 10,
          notesTarget: 20,
          milestones: [],
        },
        createdAt: workspace.createdAt,
      },
      currentUserRole: role,
      isOwner,
      papers,
      activities,
      discussions,
      savedResearch,
      stats: {
        totalPapers: papers.length,
        totalMembers: (workspace.members?.length || 0) + 1,
        totalDiscussions: discussions.length,
        totalNotes: notesCount,
        totalSavedResearch: savedResearch.length,
      },
    });
  } catch (error) {
    console.error("Get collaboration hub error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/collaboration/:workspaceId/invite
export const inviteMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role = "editor" } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { workspace, role: userRole } = await getWorkspaceAndRole(
      workspaceId,
      req.user.id
    );

    if (!workspace || userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only workspace admins can invite new members.",
      });
    }

    // Check if user is already a member
    const alreadyMember = workspace.members.some(
      (m) => m.email?.toLowerCase() === normalizedEmail ||
        String(m.user?.email || "").toLowerCase() === normalizedEmail
    );

    if (alreadyMember || workspace.createdBy?.email?.toLowerCase() === normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "This researcher is already a member of this workspace.",
      });
    }

    // Check if registered user exists in system
    const targetUser = await User.findOne({ email: normalizedEmail });

    if (targetUser) {
      workspace.members.push({
        user: targetUser._id,
        role,
        email: normalizedEmail,
        joinedAt: new Date(),
      });

      await workspace.save();

      // Log activity
      await Activity.create({
        workspace: workspace._id,
        user: req.user.id,
        type: "member_joined",
        description: `${targetUser.fullName || targetUser.email} joined as an ${role}`,
        metadata: { invitedUserId: targetUser._id, role },
      });

      const updatedWorkspace = await Workspace.findById(workspaceId)
        .populate("createdBy", "fullName email avatar")
        .populate("members.user", "fullName email avatar");

      return res.status(200).json({
        success: true,
        message: `${targetUser.fullName || targetUser.email} was added to the workspace as an ${role}.`,
        members: updatedWorkspace.members,
      });
    }

    // If not registered yet, record in invitedEmails
    const alreadyInvited = (workspace.invitedEmails || []).some(
      (inv) => inv.email === normalizedEmail
    );

    if (!alreadyInvited) {
      workspace.invitedEmails = workspace.invitedEmails || [];
      workspace.invitedEmails.push({
        email: normalizedEmail,
        role,
        invitedBy: req.user.id,
        invitedAt: new Date(),
      });
      await workspace.save();
    }

    return res.status(200).json({
      success: true,
      message: `Invitation recorded for ${normalizedEmail}. When they log in, they will have ${role} access.`,
      invitedEmails: workspace.invitedEmails,
    });
  } catch (error) {
    console.error("Invite member error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/collaboration/:workspaceId/members/:memberUserId
export const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberUserId } = req.params;
    const { role } = req.body;

    if (!["admin", "editor", "viewer"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const { workspace, role: userRole } = await getWorkspaceAndRole(
      workspaceId,
      req.user.id
    );

    if (!workspace || userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only workspace admins can modify member permissions.",
      });
    }

    const member = workspace.members.find(
      (m) => String(m.user?._id || m.user) === String(memberUserId)
    );

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    member.role = role;
    await workspace.save();

    await Activity.create({
      workspace: workspace._id,
      user: req.user.id,
      type: "member_role_changed",
      description: `Updated role for member to ${role}`,
      metadata: { targetUserId: memberUserId, newRole: role },
    });

    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate("members.user", "fullName email avatar");

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      members: updatedWorkspace.members,
    });
  } catch (error) {
    console.error("Update member role error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/collaboration/:workspaceId/members/:memberUserId
export const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberUserId } = req.params;
    const { workspace, role: userRole } = await getWorkspaceAndRole(
      workspaceId,
      req.user.id
    );

    const isSelfLeaving = String(req.user.id) === String(memberUserId);

    if (!workspace || (userRole !== "admin" && !isSelfLeaving)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied to remove member.",
      });
    }

    workspace.members = workspace.members.filter(
      (m) => String(m.user?._id || m.user) !== String(memberUserId)
    );

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: isSelfLeaving ? "You left the workspace." : "Member removed.",
      members: workspace.members,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/collaboration/:workspaceId/discussions
export const postDiscussionMessage = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { message, paperId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    const { workspace, role } = await getWorkspaceAndRole(workspaceId, req.user.id);
    if (!workspace || role === "viewer") {
      return res.status(403).json({
        success: false,
        message: "You must have editor permissions to post in team discussions.",
      });
    }

    const discussion = await Discussion.create({
      workspace: workspaceId,
      user: req.user.id,
      message: message.trim(),
      paper: paperId || null,
    });

    await discussion.populate("user", "fullName email avatar");
    if (discussion.paper) {
      await discussion.populate("paper", "title filename");
    }

    await Activity.create({
      workspace: workspaceId,
      user: req.user.id,
      type: "discussion_post",
      description: `${req.user.fullName || "A researcher"} posted in discussions: "${message.slice(0, 60)}"`,
      metadata: { discussionId: discussion._id },
    });

    return res.status(201).json({
      success: true,
      discussion,
    });
  } catch (error) {
    console.error("Post discussion error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/collaboration/:workspaceId/progress
export const updateWorkspaceProgress = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { status, readingTarget, notesTarget, milestones } = req.body;

    const { workspace, role } = await getWorkspaceAndRole(workspaceId, req.user.id);
    if (!workspace || role === "viewer") {
      return res.status(403).json({ success: false, message: "Permission denied." });
    }

    workspace.progress = workspace.progress || {};
    if (status) workspace.progress.status = status;
    if (readingTarget !== undefined) workspace.progress.readingTarget = readingTarget;
    if (notesTarget !== undefined) workspace.progress.notesTarget = notesTarget;
    if (milestones) workspace.progress.milestones = milestones;

    await workspace.save();

    await Activity.create({
      workspace: workspaceId,
      user: req.user.id,
      type: "progress_updated",
      description: `${req.user.fullName || "A researcher"} updated the project research status to ${status || "active"}`,
    });

    return res.status(200).json({
      success: true,
      progress: workspace.progress,
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/collaboration/:workspaceId/save-research
export const saveWorkspaceResearch = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { toolType, title, citationStyle, targetSection, papers, content } = req.body;

    const { workspace, role } = await getWorkspaceAndRole(workspaceId, req.user.id);
    if (!workspace || role === "viewer") {
      return res.status(403).json({ success: false, message: "Permission denied." });
    }

    const saved = await SavedResearch.create({
      workspace: workspaceId,
      user: req.user.id,
      toolType,
      title: title || "AI Research Output",
      citationStyle: citationStyle || "IEEE",
      targetSection: targetSection || "Full Paper",
      papers: papers || [],
      content,
    });

    await saved.populate("user", "fullName email");

    await Activity.create({
      workspace: workspaceId,
      user: req.user.id,
      type: "ai_generated",
      description: `${req.user.fullName || "A researcher"} generated and saved ${toolType.replace("_", " ")}: "${title}"`,
      metadata: { savedResearchId: saved._id },
    });

    return res.status(201).json({
      success: true,
      savedResearch: saved,
    });
  } catch (error) {
    console.error("Save research error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
