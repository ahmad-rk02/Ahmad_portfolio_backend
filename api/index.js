import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "../routes/auth.js";
import profileRoutes from "../routes/profile.js";
import experienceRoutes from "../routes/experience.js";
import educationRoutes from "../routes/education.js";
import skillsRoutes from "../routes/skills.js";
import projectsRoutes from "../routes/projects.js";
import achievementsRoutes from "../routes/achievements.js";
import verifyToken from "../middleware/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", verifyToken, profileRoutes);
app.use("/api/experience", verifyToken, experienceRoutes);
app.use("/api/education", verifyToken, educationRoutes);
app.use("/api/skills", verifyToken, skillsRoutes);
app.use("/api/projects", verifyToken, projectsRoutes);
app.use("/api/achievements", verifyToken, achievementsRoutes);

app.get("/", (req, res) => res.send("3D Portfolio API running"));

export default app; 