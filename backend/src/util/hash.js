import bcrypt from "bcrypt";

export async function hashPassword(pw) {
	try {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(pw, salt);
		return hash;
	} catch (err) {
		console.error("Error hashing password:", err);
		throw err;
	}
}
