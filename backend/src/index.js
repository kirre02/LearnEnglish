import express from "express";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";


const app = express();
const port = 9001;

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));


app.use(express.json());

app.get("/hello", (req, res) => {
	res.send("hello world");
});

app.use("/users", userRoutes);

app.listen(port, () => {
	console.log(`Server has started on port ${port}`);
});
