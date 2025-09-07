import express from "express";
import Profile from "../models/Profile.js";
import { uploadAvatar } from "../middleware/upload.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// PUBLIC GET
router.get("/", async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ updatedAt: -1 });
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROTECTED POST
router.post("/", verifyToken, uploadAvatar.single("avatarFile"), async (req, res) => {
  try {
    const payload = req.body;
    if (req.file) payload.avatar = req.file.path;

    const existing = await Profile.findOne();
    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      return res.json(existing);
    }

    const p = new Profile(payload);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROTECTED PUT
router.put("/:id", verifyToken, uploadAvatar.single("avatarFile"), async (req, res) => {
  try {
    const payload = req.body;
    if (req.file) payload.avatar = req.file.path;
    const updated = await Profile.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROTECTED DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Profile.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
