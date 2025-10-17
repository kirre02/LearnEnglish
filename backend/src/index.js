import express from "express";
import userRoutes from "./routes/userRoutes.js";
import wordRoutes from "./routes/wordRoutes.js";

const app = express();
const port = 9001;

app.use(express.json());

app.get("/hello", (req, res) => {
  res.send("hello world");
});

app.use("/users", userRoutes);

app.use("/words", wordRoutes);

app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});
