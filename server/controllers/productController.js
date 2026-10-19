const Product = require("../models/Product");
const Variant = require("../models/Variants");

const searchProducts = async (req, res) => {

    try {
        let products;
        let message;

         if(req.query.category) {
            products = await Product.find({category: req.query.category});
            message = "Znaleziono produkty z wybranej kategorii";
            } else {
                products = await Product.find({});
                message = "Znaleziono wszystkie produkty";
            }

            if(products.length === 0) {
                message = "Nie znaleziono produktów"
            }

            return res.status(200).json({
                products,
                message
            })

    } catch(error) {
        return res.status(500).json({
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    }
}

module.exports = {
    searchProducts
}