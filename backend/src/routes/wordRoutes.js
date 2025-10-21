import express from "express";
import { getAllWords, getWordsByCategory } from "../controllers/wordControllers.js";

const router = express.Router();

router.get("/", getAllWords);

router.get("/:category", getWordsByCategory);

export default router;
