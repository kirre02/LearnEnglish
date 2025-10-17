import db from '../database/db.js';

// Spara resultat
export const saveResult = async (req, res) => {
  try {
    const { userId, score, total } = req.body;
    
    const query = 'INSERT INTO results (user_id, score, total) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [userId, score, total]);
    
    res.status(201).json({ 
      message: 'Result saved successfully', 
      resultId: result.insertId 
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
      SELECT id, score, total, date 
      FROM results 
      WHERE user_id = ? 
      ORDER BY date DESC
    `;
    const [results] = await db.execute(query, [userId]);
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: error.message });
  }
};