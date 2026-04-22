import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    // 📧 Gmail (use this as login/email)
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // 🔒 Password (should be hashed in backend)
    password: {
      type: String,
      required: true,
    },

    // 🎮 Match Type (admin / MatchType1 etc.)
    matchType: {
      type: String,
      required: true,
    },
    isLogin: {
      type: Boolean,
      required: true,
      default: false,
    },

    // ⏰ Start Time (in minutes)
    startTime: {
      type: Number, // e.g. 7:30 → 450
      required: true,
      min: 0,
      max: 1440,
    },

    // ⏰ End Time (in minutes)
    endTime: {
      type: Number,
      required: true,
      min: 0,
      max: 1440,
    },
  },
  { timestamps: true },
);

// Prevent OverwriteModelError in Next.js
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
