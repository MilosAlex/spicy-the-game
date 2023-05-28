import bcrypt from "bcrypt";

// Hashes passwords with a bcrypt function.
async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

export default hashPassword;