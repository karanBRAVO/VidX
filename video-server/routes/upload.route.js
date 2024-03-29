import express from "express";
import { uploadNewVideo } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/upload-new-video/:userId", uploadNewVideo);

export default router;
