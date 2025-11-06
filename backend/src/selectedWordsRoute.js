import express from "express";
const router = express.Router();

const selectedWords = [
  { id: 101, swedish: "hund", english: "dog" },
  { id: 102, swedish: "katt", english: "cat" },
  { id: 103, swedish: "äpple", english: "apple" },
  { id: 104, swedish: "bok", english: "book" },
  { id: 105, swedish: "hus", english: "house" },
  { id: 106, swedish: "sol", english: "sun" },
  { id: 107, swedish: "måne", english: "moon" },
  { id: 108, swedish: "vatten", english: "water" },
  { id: 109, swedish: "mat", english: "food" },
  { id: 110, swedish: "vän", english: "friend" },
];

router.get("/", (req, res) => {
  res.json(selectedWords);
});

export default router;
