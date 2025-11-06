import db from '../database/db.js';

// Spara resultat
export const saveResult = async (req, res) => {
  try {
    const { userId, score, total, quiz_type, duration_seconds } = req.body;

    const duration = duration_seconds ?? 0;

    const query = `
      INSERT INTO results (user_id, score, total, quiz_type, duration_seconds)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      userId,
      score,
      total,
      quiz_type,
      duration_seconds
    ]);
res.status(201).json({
  message: 'Result saved successfully',
  resultId: result.insertId,
  score,
  total,
  quiz_type,
  duration_seconds
});

  } catch (error) {
    console.error('Error saving result:', error);
    res.status(500).json({ error: error.message });
  }
};

// Hämta användarens resultat
export const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT id, score, total, quiz_type, duration_seconds, date
      FROM results
      WHERE user_id = ?
      ORDER BY \`date\` DESC
    `;
    const [results] = await db.execute(query, [userId]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: error.message });
  }
};
