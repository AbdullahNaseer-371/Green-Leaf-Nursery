const jwt = require("jsonwebtoken");

const { ENV } = require("../config/env");


const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
        }
    );
}
module.exports={generateRefreshToken}