import { getAllUsers, loginUser, addUser } from "../controllers/userControllers.js";
import express from "express"

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", addUser);
router.post("/login", loginUser)

export default router
