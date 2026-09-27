const bcrypt = require("bcrypt");
const { ENV } = require("../config/env.js")
const hashPassword = async (password) => {

    return await bcrypt.hash(password, Number(ENV.BCRYPT_SALT_ROUND));

};
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

module.exports = {
    hashPassword,
    comparePassword
};