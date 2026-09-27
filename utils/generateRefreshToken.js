const jwt = require("jsonwebtoken");

const { ENV } = require("../config/env");

const generateRefreshToken=(payload)=>{
    return jwt.sign(payload,ENV.JWT_REFRESH_SECRET,{
        expiresIn:ENV.JWT_REFRESH_EXPIRES_IN
    })
}
module.exports={generateRefreshToken}