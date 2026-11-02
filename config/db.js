
const mongoose = require("mongoose");
const { ENV } = require("./env");

async function connectDB() {
    try {
        if (!ENV.MONGO_URI) {
            throw new Error("MONGO_URI is missing from environment variables");
        }

        await mongoose.connect(ENV.MONGO_URI);

        console.log("MongoDB Atlas Connected Successfully");

        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB Connection Failed:");
        console.error(error.message);

        throw error;
    }
}

module.exports = { connectDB };
