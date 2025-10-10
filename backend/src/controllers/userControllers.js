import db from "../database/db.js";

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
