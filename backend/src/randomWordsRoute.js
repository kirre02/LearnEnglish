import express from "express";

const router = express.Router();

const words = [
  { id: 1, swedish: "äpple", english: "apple" },
  { id: 2, swedish: "hund", english: "dog" },
  { id: 3, swedish: "katt", english: "cat" },
  { id: 4, swedish: "bok", english: "book" },
  { id: 5, swedish: "bil", english: "car" },
  { id: 6, swedish: "hus", english: "house" },
  { id: 7, swedish: "bord", english: "table" },
  { id: 8, swedish: "stol", english: "chair" },
  { id: 9, swedish: "vatten", english: "water" },
  { id: 10, swedish: "sol", english: "sun" },
  { id: 11, swedish: "måne", english: "moon" },
  { id: 12, swedish: "blomma", english: "flower" },
];

// GET /api/random-words → returnera 10 slumpmässiga glosor
router.get("/", (req, res) => {
  const shuffled = words.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 10);
  res.json(selected);
});

export default router;
