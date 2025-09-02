import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  title: String,
  issuer: String,
  date: String,
  description: String,
  link: String,
  image: String,
  order: { type: Number, default: 0 }
},{ timestamps: true });

export default mongoose.model("Achievement", AchievementSchema);
