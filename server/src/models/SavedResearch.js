import mongoose from "mongoose";

const savedResearchSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    toolType: {
      type: String,
      enum: [
        "paper_writer",
        "survey_paper",
        "literature_review",
        "comparison",
        "summary",
        "component_extraction",
        "discovery_overview",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    citationStyle: {
      type: String,
      enum: ["IEEE", "APA 7", "MLA", "Chicago", "Harvard", "BibTeX", "None"],
      default: "IEEE",
    },

    targetSection: {
      type: String,
      default: "Full Paper",
    },

    papers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Paper",
      },
    ],

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SavedResearch = mongoose.model("SavedResearch", savedResearchSchema);

export default SavedResearch;
