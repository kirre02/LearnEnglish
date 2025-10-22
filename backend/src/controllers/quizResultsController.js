import db from "../database/db.js";
import jwt from "jsonwebtoken";

// 🟢 1. Quiz sonucunu kaydet
export async function saveQuizResult(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Ingen token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const { correctAnswers, wrongAnswers } = req.body;

    await db.query(
      "INSERT INTO quiz_results (user_id, correct_answers, wrong_answers) VALUES (?, ?, ?)",
      [decoded.userId, correctAnswers, wrongAnswers]
    );

    res.status(201).json({ message: "Quizresultat sparat!" });
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ message: "Serverfel när resultatet sparades" });
  }
}

// 🟡 2. Användarens statistik hämta
export async function getUserQuizStats(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Ingen token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    const [results] = await db.query(
      "SELECT correct_answers, wrong_answers, created_at FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC",
      [decoded.userId]
    );

    res.json(results);
  } catch (err) {
    console.error("Error getting user stats:", err);
    res.status(500).json({ message: "Serverfel vid hämtning av statistik" });
  }
}
