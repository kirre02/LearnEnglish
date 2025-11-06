import express from "express";
import { saveQuizResult, getUserQuizStats } from "../controllers/quizResultsController.js";

const router = express.Router();

router.post("/quiz-results", saveQuizResult);
router.get("/quiz-results/:userId", getUserQuizStats);

export default router;
