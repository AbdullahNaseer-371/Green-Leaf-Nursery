const jwt = require("jsonwebtoken");

const { ENV } = require("../config/env");


const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        ENV.JWT_REFRESH_SECRET,
        {
            expiresIn: ENV.JWT_REFRESH_EXPIRES_IN

        }
    );
}
module.exports = { generateRefreshToken }