import mongoose from "mongoose";

const manifestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    projectType: {
      type: String,
      required: true,
      trim: true,
    },
    projectDetails: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Manifest", manifestSchema);
