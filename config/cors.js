const cors = require("cors");
const { ENV } = require("./env");

const allowedOrigins = [
    "http://localhost:5173",
    ENV.CLIENT_URL,
].filter(Boolean);

const corsConfig = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],
});

module.exports = { corsConfig };