const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true, index: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    saleDate: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

saleSchema.index({ saleDate: -1, totalPrice: -1 });

const Sale=mongoose.model("Sale",saleSchema);
module.exports=Sale