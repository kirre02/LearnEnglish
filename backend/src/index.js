import express from "express";
<<<<<<< HEAD
import userRoutes from "./routes/userRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";  // <-- LÄGG TILL DENNA RAD!
=======
>>>>>>> 5-audio-support
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";

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
<<<<<<< HEAD
app.use("/api", resultRoutes);  // <-- LÄGG TILL DENNA RAD!

=======
app.use("/api/words", wordRoutes);
>>>>>>> 5-audio-support
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);});