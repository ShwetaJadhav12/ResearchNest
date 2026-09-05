import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      default: "document.pdf",
    },

    title: {
      type: String,
      default: "",
    },

    doi: {
      type: String,
      default: "",
      trim: true,
    },

    journal: {
      type: String,
      default: "",
    },

    year: {
      type: Number,
    },

    citationCount: {
      type: Number,
      default: 0,
    },

    officialUrl: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      enum: ["upload", "discovery"],
      default: "upload",
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