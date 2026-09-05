import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    topic: {
      type: String,
      default: "Research",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "editor",
        },
        email: {
          type: String,
          trim: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    invitedEmails: [
      {
        email: {
          type: String,
          trim: true,
          lowercase: true,
        },
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "editor",
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    progress: {
      status: {
        type: String,
        enum: ["discovery", "reading", "analyzing", "writing", "completed"],
        default: "reading",
      },
      readingTarget: {
        type: Number,
        default: 10,
      },
      notesTarget: {
        type: Number,
        default: 20,
      },
      milestones: [
        {
          title: String,
          completed: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model(
  "Workspace",
  workspaceSchema
);

export default Workspace;