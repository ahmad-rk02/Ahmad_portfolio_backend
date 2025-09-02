import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  name: String,
  level: String,
  percent: Number,
  category: String,
  order: { type: Number, default: 0 }
},{ timestamps: true });

export default mongoose.model("Skill", SkillSchema);
