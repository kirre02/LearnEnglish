import db from "../database/db.js";

export async function getAllWords(req, res) {
  try {
    const [rows] = await db.execute("SELECT * FROM words");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fel vid hämtning av ord" });
  }
}

export async function getWordsByCategory(req, res) {
  try {
    const category = req.params.category;
    const [rows] = await db.execute(
      "SELECT * FROM words WHERE category = ?",
      [category]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Inga ord i denna kategori" });
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fel vid hämtning av ord" });
  }
}
