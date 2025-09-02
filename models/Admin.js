 import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ }, // Email validation
  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Admin", AdminSchema);