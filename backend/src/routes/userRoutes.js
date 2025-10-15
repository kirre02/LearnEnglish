import express from "express";
import { getAllUsers, addUser } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", addUser);
export default router;
