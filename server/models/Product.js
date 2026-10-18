const mongoose = require("mongoose");
const {Schema} = mongoose;

const ProductSchema = new Schema({
    name: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    slug: {type: String, trim: true, unique: true},
    category: {type: String, enum: ["mouse", "headphones", "keyboard", "monitor"], required: true},
    brand: {type: String, required: true, trim: true},
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;