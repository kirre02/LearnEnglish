import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import resultRoutes from "./routes/resultRoutes.js"; // Från gren 4
import db from "./database/db.js"; // ✅ LADES TILL

const app = express();
const PORT = 9001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.get("/hello", (req, res) => {
  res.send("hello world");
});

app.use("/api/users", userRoutes);
app.use("/api/words", wordRoutes); // Från gren 5
app.use("/api", resultRoutes); // Från gren 4

// ✅ LADES TILL - User Progress Route
app.get("/api/user-progress", async (req, res) => {
  try {
    // 1. Hämta totalt antal ord i databasen
    const [totalWordsResult] = await db.execute(
      'SELECT COUNT(*) as totalWords FROM words'
    );

    // 2. Temporär lösning - använd default värden
    // (Vi uppdaterar senare när vi har användarinloggning)
    let learnedWords = 0;
    let completedQuizzes = 0;

    // 3. Försök hämta från quiz_results om tabellen finns
    try {
      const [quizResults] = await db.execute(
        'SELECT COUNT(DISTINCT word_id) as learnedCount FROM quiz_results WHERE is_correct = 1'
      );
      learnedWords = quizResults[0].learnedCount || 0;

      const [quizCount] = await db.execute(
        'SELECT COUNT(DISTINCT DATE(created_at)) as quizCount FROM quiz_results'
      );
      completedQuizzes = quizCount[0].quizCount || 0;
    } catch (error) {
      console.log('Quiz results table not found, using default values');
    }

    res.json({
      learnedWords: learnedWords,
      totalWords: totalWordsResult[0].totalWords || 125,
      completedQuizzes: completedQuizzes
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Kunde inte hämta framsteg' });
  }
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});