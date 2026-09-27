const jwt = require("jsonwebtoken");

const { ENV } = require("../config/env");

const generateAccessToken = (payload) => {

    return jwt.sign(payload, ENV.JWT_SECRET_KEY, {

        expiresIn: ENV.JWT_EXPIRES_IN

    });

};


module.exports = {
    generateAccessToken
};