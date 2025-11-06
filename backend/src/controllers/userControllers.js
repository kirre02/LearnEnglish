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

  export async function updateUser(req, res) {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!id) {
      console.error("User ID is missing!");
      return res.status(400).json({ message: "User ID is required" });
    }

    // Samla fält som ska uppdateras
    const fields = [];
    const values = [];

    if (name !== undefined && name !== "") {
      fields.push("name = ?");
      values.push(name);
    }

    if (email !== undefined && email !== "") {
      fields.push("email = ?");
      values.push(email);
    }

    if (password !== undefined && password !== "") {
      const hashedPassword = await hashPassword(password);
      fields.push("password_hash = ?");
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Inga uppgifter att uppdatera" });
    }

    // SQL-fråga
    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    try {
      const [result] = await db.execute(sql, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Användare hittades inte" });
      }

      // Hämta uppdaterad användare
      const [updatedRows] = await db.query(
          "SELECT id, name, email, created_at FROM users WHERE id = ?",
          [id]
      );

      res.json({
        message: "Användaren har uppdaterats",
        user: updatedRows[0]
      });
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Ett fel uppstod vid uppdatering av användaren" });
    }
  }


  export async function addUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "missing fields" });
      }

      // Hasha lösenordet
      const hashed = await hashPassword(password);

      // Lägg till användaren i databasen
      const [result] = await db.query(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        [name, email, hashed]
      );

      const userId = result.insertId;

      // Skapa JWT-token
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "24h" }
      );

      // Returnera token + användarinfo
      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: userId,
          name,
          email
        }
      });

    } catch (err) {
      console.log("there was an error during registration:", err);
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
