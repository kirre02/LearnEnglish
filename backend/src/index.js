import express from "express";
import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import cors from "cors";

const app = express();
const PORT = 9001;

// Lägg till CORS middleware
app.use(cors({
  origin: "http://localhost:5173", // Vue dev server
  credentials: true
}));

app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api", quizRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
