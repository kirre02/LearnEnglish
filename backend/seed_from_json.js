import fs from "fs";
import db from "./src/database/db.js";

async function seedWords() {
  try {
    const jsonData = fs.readFileSync("./data/words.json", "utf8");
    const data = JSON.parse(jsonData);

    for (const [category, words] of Object.entries(data)) {
      for (const { english, correct, wrong } of words) {
        await db.execute(
          `INSERT INTO words (category, english_word, correct_swedish, wrong1, wrong2, wrong3)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [category, english, correct, wrong[0], wrong[1], wrong[2]]
        );
      }
    }

    console.log("Alla glosor har lagts till i databasen!");
  } catch (err) {
    console.error("Fel vid import:", err);
  } finally {
    await db.end();
  }
}

seedWords();
