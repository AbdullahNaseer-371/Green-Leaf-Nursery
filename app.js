
const express = require("express");

const { connectDB } = require("./config/db.js");
const { corsConfig } = require("./config/cors.js");
const { rateLimiter } = require("./config/rateLimiter.js");

const route = require("./routes/user.route.js");
const categoryRoute = require("./routes/category.route.js");
const plantRoute = require("./routes/plant.route.js");
const saleRoute = require("./routes/sale.route.js");

const app = express();

// CORS
app.use(corsConfig);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GreenLeaf Nursery API is running",
    });
});

// Rate limiter
app.use(rateLimiter);

// MongoDB connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);

        return res.status(503).json({
            success: false,
            message: "Database connection failed",
        });
    }
});

// API routes
app.use("/api/auth", route);
app.use("/api/categories", categoryRoute);
app.use("/api/plants", plantRoute);
app.use("/api/sales", saleRoute);

// Export for Vercel
module.exports = app;

connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});