const mongoose = require("mongoose");
const {Schema} = mongoose;

const VariantSchema = new Schema({
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    price: {type: Number, min: 0.01, required: true},
    color: {type: String, enum: ["black", "white"], required: true},
    image: {type: String, required: true},
    stock: {type: Number, min: 0, required: true, validator: (stock) => {return stock % 1 === 0}}
});

const Variant = mongoose.model("Variant", VariantSchema);

module.exports = Variant;