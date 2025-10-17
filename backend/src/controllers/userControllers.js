import db from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Validera input
    if (!email || !password) {
      return res.status(400).json({ message: "E-post och lösenord krävs" });
    }

    // Hitta användaren i databasen
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Fel e-post eller lösenord" });
    }

    const user = users[0];

    // Jämför lösenord - använd bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Fel e-post eller lösenord" });
    }

    // Skapa JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    // Skicka tillbaka token och användarinfo (utan lösenord)
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
}
