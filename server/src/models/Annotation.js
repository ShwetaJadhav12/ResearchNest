import mongoose from "mongoose";

const annotationSchema = new mongoose.Schema(
  {
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      index: true,
    },

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

    type: {
      type: String,
      enum: ["highlight", "note", "question", "idea"],
      default: "highlight",
    },

    selectedText: {
      type: String,
      default: "",
    },

    content: {
      type: String,
      default: "",
    },

    aiResponse: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      enum: ["purple", "yellow", "green", "blue", "pink"],
      default: "purple",
    },

    pageNumber: {
      type: Number,
      default: 1,
    },

    tags: {
      type: [String],
      default: [],
    },

    isShared: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Annotation = mongoose.model("Annotation", annotationSchema);

export default Annotation;
