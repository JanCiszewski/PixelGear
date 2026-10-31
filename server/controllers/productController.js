const Product = require("../models/Product");
const Variant = require("../models/Variants");
const mongoose = require("mongoose");

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

const createProduct = async (req, res) => {
    let session; 
    try {
        session = await mongoose.startSession();
        const {name, description, category, brand, variants} = req.body;
        const existingProduct = await Product.findOne({name});

        if(!Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
            message: "Nie podano wariantu"
        })
        }

        if(existingProduct.length !== 0) {
            return res.status(400).json({
            message: "Produkt już istnieje"
        })
        }

        const nameArray = name.toLowerCase().split(" ");
            const slug = nameArray.join("-");

            const product = new Product({
                name,
                description,
                slug,
                category,
                brand
            })

        const productVariants = variants.map( (variant) => new Variant({
            product: product._id,
            price: variant.price,
            color: variant.color,
            image: variant.image,
            stock: variant.stock
        })) 

        await session.withTransaction( async (session) => {
            await product.save({ session });
            await Variant.insertMany(productVariants, {session});
        })

        return res.status(201).json({
            product,
            message: "Produkt został dodany pomyślnie"
        })


    } catch (error) {
        return res.status(500).json({
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    } finally {
        if (session){
            await session.endSession();
        }
    }
}


const findProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const product = await Product.findOne({slug});

        if(!product) {
            return res.status(404).json({
                message: "Produkt nie istnieje"
            })
        }

        const variants = await Variant.find({product: product._id})

        return res.status(200).json({
            product,
            variants,
            message: "Znaleziono produkt"
        })
    } catch(error) {
        console.error(error);
        return res.status(500).json({
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    }
}

module.exports = {
    searchProducts,
    createProduct,
    findProductBySlug
}