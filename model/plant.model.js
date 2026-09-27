const mongoose = require("mongoose");
const slugify=require("slugify");

const plantSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    sku: { type: String, unique: true },
    category:{type:mongoose.Schema.ObjectId,ref:"Category",required:true,index:true},
    stock: { type: Number,required:true,default:0},
    price:{type:Number,required:true},
    status:{type:String,enum:[`Available`,`Out of stock`,`Reserved`],default:`Avialble`,index:true},
}, { timestamps: true })

plantSchema.index({category:1,status:1,stock:-1})
plantSchema.pre('validate', function () {
    if (this.name && !this.sku) {
        const sanitizedSlug = slugify(this.name, { lower: false, strict: true, replacement: '-' }).toUpperCase();
        const uniqueSalt = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.sku = `${sanitizedSlug}-${uniqueSalt}`;
    }
});
const Plant = mongoose.model("Plant", plantSchema);
module.exports = Plant

