import bcrypt from "bcryptjs";


// Creates a secure hash from the user's password.

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};


// Compares a plain password with the stored password hash.

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(
        password,
        hashedPassword
    );
};


export {
    hashPassword,
    comparePassword
};