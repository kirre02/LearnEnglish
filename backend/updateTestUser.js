import bcrypt from "bcryptjs";
import db from "./src/database/db.js";

async function updateTestUser() {
  try {
    const hashedPassword = await bcrypt.hash("123", 10);
    
    await db.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashedPassword, "coder1@example.com"]
    );
    
    console.log("Användare uppdaterad: coder1@example.com / 123");
  } catch (err) {
    console.log("Error updating user:", err);
  } finally {
    process.exit();
  }
}

updateTestUser();
