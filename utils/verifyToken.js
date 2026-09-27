const jwt = require("jsonwebtoken");
const { ENV } = require("../config/env");

const verifyToken = (token) => {
    return jwt.verify(token, ENV.JWT_SECRET_KEY)
}
const verifyRefreshToken = (token) => {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
};
module.exports = { verifyToken,verifyRefreshToken };