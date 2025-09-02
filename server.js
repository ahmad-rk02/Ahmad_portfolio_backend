import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import experienceRoutes from "./routes/experience.js";      
import educationRoutes from "./routes/education.js";
import skillsRoutes from "./routes/skills.js";
import projectsRoutes from "./routes/projects.js";
import achievementsRoutes from "./routes/achievements.js";
import verifyToken from "./middleware/auth.js";

dotenv.config();
const app = express();
// app.use(cors({
//   origin: [
//     "http://localhost:5173"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));
app.use(cors());


app.use(express.json());

// connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes(verifyToken));
app.use("/api/experience",experienceRoutes(verifyToken));
app.use("/api/education", educationRoutes(verifyToken));
app.use("/api/skills", skillsRoutes(verifyToken));
app.use("/api/projects", projectsRoutes(verifyToken));
app.use("/api/achievements", achievementsRoutes(verifyToken));

app.get("/", (req, res) => res.send("3D Portfolio API running"));

export default app; 

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}