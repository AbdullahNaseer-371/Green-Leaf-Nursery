const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: [`Admin`, `Manager`, `Employee`], default: `Employee` },
    refreshTokens: [String]
}, { timestamps: true })
const User = mongoose.model("User", userSchema);
module.exports = User

