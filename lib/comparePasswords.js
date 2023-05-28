import bcrypt from "bcrypt";

// Compares passwords with a bcrypt function.
// Returns true if the passwords match, false if they don't.
async function comparePasswords(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match;
}

export default comparePasswords;