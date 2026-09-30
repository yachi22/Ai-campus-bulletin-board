const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;


// Hash a password
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}


// Compare password with hashed password
async function comparePassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}


module.exports = {
    hashPassword,
    comparePassword
};