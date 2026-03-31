import express from "express";
import {
  createManifest,
  getAllManifests,
  markManifestReviewed,
} from "../controller/manifest.controller.js";

const router = express.Router();

router.post("/", createManifest);
router.get("/admin", getAllManifests);
router.put("/admin/:id/review", markManifestReviewed);

export default router;
