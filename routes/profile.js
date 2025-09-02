import express from "express";
import Profile from "../models/Profile.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

export default function(verifyToken){
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const profile = await Profile.findOne().sort({ updatedAt: -1 });
      res.json(profile || {});
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  router.post("/", verifyToken, upload.single("avatarFile"), async (req, res) => {
    try {
      const payload = req.body;
      if (req.file) payload.avatar = `/uploads/${req.file.filename}`;

      const existing = await Profile.findOne();
      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        return res.json(existing);
      }

      const p = new Profile(payload);
      await p.save();
      res.status(201).json(p);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  router.put("/:id", verifyToken, upload.single("avatarFile"), async (req, res) => {
    try {
      const payload = req.body;
      if (req.file) payload.avatar = `/uploads/${req.file.filename}`;
      const updated = await Profile.findByIdAndUpdate(req.params.id, payload, { new: true });
      res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  router.delete("/:id", verifyToken, async (req,res) => {
    try { 
      await Profile.findByIdAndDelete(req.params.id); 
      res.json({ message: "Deleted" }); 
    } catch (err) { res.status(500).json({ message: err.message }); }
  });

  return router;
}
