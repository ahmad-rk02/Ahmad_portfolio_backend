// Updated Project model (models/Project.js)
import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  tech: [String],
  link: String,
  image: String, // Path to the primary image/file
  files: [String], // Paths to all uploaded files
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);