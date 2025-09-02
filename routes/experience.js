import express from "express";
import Experience from "../models/Experience.js";

export default function(verifyToken){
  const router = express.Router();

  router.get("/", async (req,res) => {
    try { const items = await Experience.find().sort({ order: 1, startDate: -1 }); res.json(items); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  router.post("/", verifyToken, async (req,res) => {
    try { const item = new Experience(req.body); await item.save(); res.status(201).json(item); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  router.put("/:id", verifyToken, async (req,res) => {
    try { const updated = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  router.delete("/:id", verifyToken, async (req,res) => {
    try { await Experience.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  return router;
}
