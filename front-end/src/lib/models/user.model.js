import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: [true, "Email already exists."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      trim: true,
    },
    name: {
      type: String,
      lowercase: true,
      required: [true, "Name is required."],
      trim: true,
    },
    image: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/5/50/User_icon-cp.svg",
    },
    hasChannel: {
      type: Boolean,
      default: false,
      required: [true, "Channel is required."],
    },
    dob: {
      type: String,
    },
    method: {
      type: String,
      lowercase: true,
      enum: ["google", "github"],
      trim: true,
      required: [true, "Method is required"],
    },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models["user"] || mongoose.model("user", authSchema);
