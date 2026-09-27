const mongoose = require('mongoose');
const { ENV } = require('./env');

async function connectDB() {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.log("Database Connected Successfully")
    } catch (error) {
        console.log("Errro while connecting")
        process.exit(1);
        console.log(`${process.exit(1)}`)
    }
}

module.exports = { connectDB };