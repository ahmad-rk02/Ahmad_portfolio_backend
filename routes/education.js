import express from "express";
import Education from "../models/Education.js";

export default function(verifyToken){
  const router = express.Router();

  router.get("/", async (req,res) => {
    try { const items = await Education.find().sort({ order: 1, startYear: -1 }); res.json(items); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  router.post("/", verifyToken, async (req,res) => {
    try { const item = new Education(req.body); await item.save(); res.status(201).json(item); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  router.put("/:id", verifyToken, async (req,res) => {
    try { const updated = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  router.delete("/:id", verifyToken, async (req,res) => {
    try { await Education.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
    catch (err){ res.status(500).json({ message: err.message }); }
  });

  return router;
}
