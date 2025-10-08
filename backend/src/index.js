import express from "express";

const app = express();
const port = 9001;

app.get("/hello", (req, res) => {
	res.send("hello world");
});

app.listen(port, () => {
	console.log(`Server has started on port ${port}`);
});
