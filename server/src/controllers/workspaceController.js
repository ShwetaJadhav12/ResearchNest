import Workspace from "../models/Workspace.js";
import Paper from "../models/Paper.js";


// ==========================================
// GET USER WORKSPACES
// ==========================================

export const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      createdBy: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      workspaces,
    });
  } catch (error) {
    console.error(
      "❌ Get workspaces error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspaces",
    });
  }
};


// ==========================================
// GET PAPERS FROM A WORKSPACE
// ==========================================

export const getWorkspacePapers = async (
  req,
  res
) => {
  try {
    const { workspaceId } = req.params;

    // First verify workspace belongs to user
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      createdBy: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Then get only papers belonging
    // to that workspace AND user
    const papers = await Paper.find({
      workspace: workspaceId,
      uploadedBy: req.user.id,
    })
      .sort({
        createdAt: -1,
      })
      .select(
        "_id filename title authors tags abstract topic workspace createdAt"
      );

    return res.status(200).json({
      success: true,
      workspace,
      papers,
    });
  } catch (error) {
    console.error(
      "❌ Get workspace papers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace papers",
    });
  }
};