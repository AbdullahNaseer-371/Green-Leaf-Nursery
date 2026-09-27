const dotenv = require("dotenv");
dotenv.config()

const ENV = Object.freeze({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_URL: process.env.CLIENT_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_TOKEN_HEADER: process.env.JWT_TOKEN_HEADER,
    BCRYPT_SALT_ROUND: Number(process.env.BCRYPT_SALT_ROUND),
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    // CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    // CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    // CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    // SMTP_MAIL: process.env.SMTP_MAIL,
    // SMTP_PASS: process.env.SMTP_PASS,
    // SMTP_HOST: process.env.SMTP_HOST,
    // SMTP_PORT: process.env.SMTP_PORT,
})

module.exports = { ENV };