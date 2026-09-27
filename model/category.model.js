const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    sku: { type: String, unique: true },
    description: { type: String, }
}, { timestamps: true })


categorySchema.pre('validate', function () {
    if (this.name && !this.sku) {
        const sanitizedSlug = slugify(this.name, { lower: false, strict: true, replacement: '-' }).toUpperCase();
        const uniqueSalt = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.sku = `${sanitizedSlug}-${uniqueSalt}`;
    }
});
const Category = mongoose.model("Category", categorySchema);
module.exports = Category

