import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";

const app = express();
const PORT = 9001;

// Tillåt frontend (t.ex. Vite/Vue på port 5173)
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Test-endpoint
app.get("/hello", (req, res) => {
  res.send("hello world");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/words", wordRoutes);

// Starta servern
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
