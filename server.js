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

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:5173",                          // local dev
  "https://your-frontend.vercel.app"                // deployed frontend (replace this!)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Connect DB before handling requests
const connectDB = async () => {
  try {
    console.log("🔍 Trying to connect to MongoDB...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Not Found ❌");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", verifyToken, profileRoutes);
app.use("/api/experience", verifyToken, experienceRoutes);
app.use("/api/education", verifyToken, educationRoutes);
app.use("/api/skills", verifyToken, skillsRoutes);
app.use("/api/projects", verifyToken, projectsRoutes);
app.use("/api/achievements", verifyToken, achievementsRoutes);

// Health check
app.get("/", (req, res) => res.send("3D Portfolio API running 🚀"));

// Extra DB check endpoint (for testing on Vercel)
app.get("/api/dbcheck", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: "✅ MongoDB connected" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "❌ MongoDB not connected", error: err.message });
  }
});

// Export for Vercel
export default app;

// Local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
