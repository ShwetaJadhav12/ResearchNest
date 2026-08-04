import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    title: { type: String },
    authors: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    abstract: { type: String, default: "" },
    contentType: { type: String },
    size: { type: Number },
    data: { type: Buffer },
    folder: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Paper = mongoose.model("Paper", paperSchema);
export default Paper;
