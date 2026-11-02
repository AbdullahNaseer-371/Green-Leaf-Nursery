const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "https://frontend-eta-lovat-44.vercel.app",
];

const corsConfig = cors({
    origin: (origin, callback) => {
        // Allow requests without an Origin header (e.g. server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});

module.exports = { corsConfig };




