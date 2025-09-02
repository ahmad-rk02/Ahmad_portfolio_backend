import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Project from "../models/Project.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

export default function(verifyToken) {
  const router = express.Router();

  // GET all projects
  router.get("/", async (req, res) => {
    try {
      const items = await Project.find().sort({ order: 1, createdAt: -1 });
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // CREATE project
  router.post("/", verifyToken, upload.array("files", 10), async (req, res) => {
    try {
      const { title, description, link, tech } = req.body;
      const techArr = typeof tech === "string"
        ? tech.split(",").map(s => s.trim()).filter(Boolean)
        : (tech || []);

      const files = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
      const item = new Project({
        title,
        description,
        link,
        tech: techArr,
        image: files[0] || "",
        files
      });

      await item.save();
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // UPDATE project
  router.put("/:id", verifyToken, upload.array("files", 10), async (req, res) => {
    try {
      const payload = { ...req.body };

      if (payload.tech && typeof payload.tech === "string") {
        payload.tech = payload.tech.split(",").map(s => s.trim()).filter(Boolean);
      }

      if (req.files && req.files.length > 0) {
        const oldProject = await Project.findById(req.params.id);
        if (oldProject?.files?.length > 0) {
          oldProject.files.forEach(f => {
            const oldPath = path.join(process.cwd(), f);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          });
        }

        const files = req.files.map(f => `/uploads/${f.filename}`);
        payload.files = files;
        payload.image = files[0];
      }

      const updated = await Project.findByIdAndUpdate(req.params.id, payload, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // DELETE project
  router.delete("/:id", verifyToken, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (project?.files?.length > 0) {
        project.files.forEach(f => {
          const filePath = path.join(process.cwd(), f);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }

      await Project.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
}
