import express from "express";
import Project from "../models/Project.js";
import { uploadProjects } from "../middleware/upload.js";

export default function (verifyToken) {
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
  router.post("/", verifyToken, uploadProjects.array("files", 10), async (req, res) => {
    try {
      const { title, description, link, tech } = req.body;
      const techArr = typeof tech === "string"
        ? tech.split(",").map(s => s.trim()).filter(Boolean)
        : (tech || []);

      const files = req.files ? req.files.map(f => f.path) : []; // Cloudinary URLs
      const item = new Project({
        title,
        description,
        link,
        tech: techArr,
        image: files[0] || "",
        files,
      });

      await item.save();
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // UPDATE project
  router.put("/:id", verifyToken, uploadProjects.array("files", 10), async (req, res) => {
    try {
      const payload = { ...req.body };

      if (payload.tech && typeof payload.tech === "string") {
        payload.tech = payload.tech.split(",").map(s => s.trim()).filter(Boolean);
      }

      if (req.files && req.files.length > 0) {
        const files = req.files.map(f => f.path); // Cloudinary URLs
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
      await Project.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
}
