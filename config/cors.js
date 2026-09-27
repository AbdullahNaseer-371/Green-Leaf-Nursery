const { ENV } = require("./env")

const cors = require("cors")

const corsConfig = cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
})

module.exports = { corsConfig };