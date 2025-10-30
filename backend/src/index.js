import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

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
app.use("/api/words", wordRoutes); // Slumpmässiga glosor
app.use("/api/results", resultRoutes); // Resultat
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
