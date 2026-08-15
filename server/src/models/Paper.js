import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    authors: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    abstract: {
      type: String,
      default: "",
    },

    // 📄 Full text extracted from the PDF
    // Used by the AI Research Assistant
    content: {
      type: String,
      default: "",
    },

    contentType: {
      type: String,
    },

    size: {
      type: Number,
    },

    data: {
      type: Buffer,
    },

    folder: {
      type: String,
      default: "",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🤖 Gemini detected topic
    topic: {
      type: String,
      default: "",
      trim: true,
    },

    // 🗂️ Workspace
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Paper = mongoose.model(
  "Paper",
  paperSchema
);

export default Paper;