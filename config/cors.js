
const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "https://frontend-eta-lovat-44.vercel.app",
    "https://frontend-greenleaf3.vercel.app",
];

const corsConfig = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
});

module.exports = { corsConfig };
