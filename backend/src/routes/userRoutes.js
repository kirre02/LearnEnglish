import {getAllUsers, loginUser, addUser, updateUser} from "../controllers/userControllers.js";
import express from "express"

const router = express.Router();

router.get("/", getAllUsers);
router.post("/register", addUser);
router.post("/login", loginUser)
router.put("/update/:id", updateUser);

export default router
