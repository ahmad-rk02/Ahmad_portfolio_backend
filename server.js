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

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect DB before handling requests
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return; // already connected
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
  }
};

await connectDB(); // force connect at cold start


connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes(verifyToken));
app.use("/api/experience", experienceRoutes(verifyToken));
app.use("/api/education", educationRoutes(verifyToken));
app.use("/api/skills", skillsRoutes(verifyToken));
app.use("/api/projects", projectsRoutes(verifyToken));
app.use("/api/achievements", achievementsRoutes(verifyToken));

// Health check
app.get("/", (req, res) => res.send("3D Portfolio API running 🚀"));

// Extra DB check endpoint (for testing on Vercel)
app.get("/api/dbcheck", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return res.json({ status: "✅ MongoDB connected" });
    } else {
      return res.status(500).json({ status: "❌ MongoDB not connected" });
    }
  } catch (err) {
    res.status(500).json({ status: "❌ Error", error: err.message });
  }
});


// Export for Vercel
export default app;

// Local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}












// app.use(cors({
//   origin: [
//     "http://localhost:5173"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));