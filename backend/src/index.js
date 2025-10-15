import express from "express";
import randomWordsRoute from "./randomWordsRoute.js";
import selectedWordsRoute from "./selectedWordsRoute.js";

const app = express();
const port = 9001;

app.get("/hello", (req, res) => {
  res.send("hello world");
});

app.use("/api/random-words", randomWordsRoute);
app.use("/api/selected-words", selectedWordsRoute);

app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});
