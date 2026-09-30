const jwt = require("jsonwebtoken");


// Generate JWT token
function generateToken(payload) {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );
}


// Verify JWT token
function verifyToken(token) {
    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );
}


module.exports = {
    generateToken,
    verifyToken
};