import db from "../database/db.js";
import { hashPassword } from "../util/hash.js";
export async function getAllUsers(req, res) {
	try {
		const [result] = await db.query(
			"SELECT id, name, email, created_at FROM users",
		);
		res.json(result);
	} catch (err) {
		console.log("There was an error retrieving all users", err);
		res.status(500).json({ message: "Server error when retrieving all users" });
	}
}

export async function addUser(req, res) {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			res.status(400).json({ message: "missing fields" });
		}

		const hashed = await hashPassword(password);
		const [result] = await db.query(
			"INSERT INTO users (name, email, password_hash) VALUES (?,?,?)",
			[name, email, hashed],
		);

		res.status(200).json({
			message: "User created successfully",
			userId: result.insertId,
		});
	} catch (err) {
		console.log("there was an error during registration, message:", err);
		if (err.code === "ER_DUP_ENTRY") {
			res.status(400).json({ message: "Email already exists" });
		} else {
			res.status(500).json({ message: "Server error when creating user" });
		}
	}
}
