import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
  role: String,
  company: String,
  startDate: String,
  endDate: String,
  duration: String,
  description: String,
  order: { type: Number, default: 0 }
},{ timestamps: true });

export default mongoose.model("Experience", ExperienceSchema);
