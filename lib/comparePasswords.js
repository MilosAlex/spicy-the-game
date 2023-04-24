import bcrypt from "bcrypt";

async function comparePasswords(password, hash) {
    const match = await bcrypt.compare(password, hash);
    return match;
}

export default comparePasswords;