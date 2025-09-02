import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  name: String,
  title: String,
  summary: String,
  email: String,
  phone: String,
  website: String,
  avatar: String, // single image
  socials: {
    linkedin: String,
    github: String,
    other: { type: Map, of: String }
  }
}, { timestamps: true });

export default mongoose.model("Profile", ProfileSchema);
