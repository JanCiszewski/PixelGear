const Product = require("../models/Product");
const Variant = require("../models/Variants");

const findAllProducts = async (req, res) => {

    try {
        const products = await Product.find({});

        if(products.length !== 0) {
            return res.status(200).json({
                products,
                message: "Znaleziono wszystkie produkty"
            })
        }

        return res.status(200).json({
            message: "Nie znaleziono produktów"
        })

    } catch(error) {
        return res.status(500).json({
            products,
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    }
    
}

module.exports = {
    findAllProducts
}