// controllers/quizResultsController.js
import db from "../database/db.js";

export async function saveQuizResult(req, res) {
  try {
    const { userId, correctAnswers, wrongAnswers } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID krävs" });

    await db.query(
      "INSERT INTO quiz_results (user_id, correct_answers, wrong_answers) VALUES (?, ?, ?)",
      [userId, correctAnswers, wrongAnswers]
    );

    res.status(201).json({ message: "Quizresultat sparat!" });
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ message: "Serverfel när resultatet sparades" });
  }
}

export async function getUserQuizStats(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "User ID krävs" });

    const [results] = await db.query(
      "SELECT correct_answers, wrong_answers, created_at FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json(results);
  } catch (err) {
    console.error("Error getting user stats:", err);
    res.status(500).json({ message: "Serverfel vid hämtning av statistik" });
  }
}
