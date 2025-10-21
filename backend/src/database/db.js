import mysql from "mysql2/promise";

const db = await mysql.createConnection({
	host: "localhost",
	user: "user",
	password: "password123",
	database: "LearnEnglishDB",
});

export default db;
