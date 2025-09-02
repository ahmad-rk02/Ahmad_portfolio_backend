import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  field: String,
  startYear: String,
  endYear: String,
  grade: String,
  description: String,
  order: { type: Number, default: 0 }
},{ timestamps: true });

export default mongoose.model("Education", EducationSchema);
