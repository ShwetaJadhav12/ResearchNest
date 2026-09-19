import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },

    institution: {
      type: String,
      default: "",
    },

    researchInterests: {
      type: [String],
      default: [],
    },

    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      realTimeAlerts: {
        type: Boolean,
        default: true,
      },
      defaultCitationStyle: {
        type: String,
        enum: ["IEEE", "APA", "BibTeX", "MLA", "Harvard"],
        default: "IEEE",
      },
      readerFontSize: {
        type: String,
        enum: ["text-sm", "text-base", "text-lg"],
        default: "text-base",
      },
      readerTheme: {
        type: String,
        enum: ["light", "sepia", "night"],
        default: "light",
      },
      aiModelDetail: {
        type: String,
        enum: ["concise", "detailed", "academic"],
        default: "detailed",
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;