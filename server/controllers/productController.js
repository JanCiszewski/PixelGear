const Product = require("../models/Product");
const Variant = require("../models/Variants");
const mongoose = require("mongoose");

const getProducts = async (req, res) => {

    try {
        let message;
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 12);
        const filter = req.query.category ? {category: req.query.category} : {};

        if(!Number.isInteger(page) || page <= 0 ) {
            return res.status(400).json({
                message: "Nieprawidłowy numer strony"
            })
        }

        if(!Number.isInteger(limit) || limit <= 0 || limit > 50) {
            return res.status(400).json({
                message: "Nieprawidłowy limit produktów"
            })
        }
        
        const skip = limit * (page - 1);
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts/limit);

        if(page > totalPages && totalPages !== 0) {
            return res.status(400).json({
                message: "Podana strona nie istnieje"
            })
        }

        const products = await Product.find(filter).skip(skip).limit(limit);

        if(req.query.category) {
            message = "Znaleziono produkty z wybranej kategorii";
            } else {
                message = "Znaleziono wszystkie produkty";
            }

        if(products.length === 0) {
            message = "Nie znaleziono produktów"
        }

        return res.status(200).json({
            products,
            totalProducts,
            totalPages,
            currentPage: page,
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

        if(existingProduct) {
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
            productVariants,
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
        return res.status(500).json({
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    }
}

const searchProducts = async (req, res) => {
    try {
        if(typeof req.query.q !== "string" || req.query.q.trim().length === 0) {
            return res.status(400).json({
                message: "Nie podano prawidłowej frazy wyszukiwania"
            })
        }

        const searchQuery = req.query.q.trim();
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchParameters = new RegExp(escapedQuery, "i");
        const products = await Product.find({ $or: [{name: searchParameters}, {brand: searchParameters}]})

        return res.status(200).json({
            products,
            message: products.length === 0 ? "Nie znaleziono produktów" : "Znaleziono produkty"
        })

    }catch(error) {
        return res.status(500).json({
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    }
   
}

const updateProduct = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        const productId = req.params.id;
        const {product, updateVariants, newVariants} = req.body;

        let updatedProduct = null;
        let updatedVariants = [];
        let createdVariants = [];

        if (Array.isArray(product) || (product !== undefined && typeof product !== "object")) {
            return res.status(400).json({
                message: "Podano błędne dane do edycji"
            })
        }

        if((!Array.isArray(updateVariants) && updateVariants !== undefined) || (!Array.isArray(newVariants) && newVariants !== undefined)) {
            return res.status(400).json({
                message: "Podano błędne dane do edycji"
            })
        }

        if((!product || Object.keys(product).length === 0) && (!updateVariants || updateVariants.length === 0) && (!newVariants || newVariants.length === 0)) {
            return res.status(400).json({
                message: "Nie podano danych do edycji"
            })
        }
        
        const existingProduct = await Product.findOne({_id: productId})
        if(!existingProduct) {
            return res.status(404).json({
                        message: "Nie znaleziono produktu"
                    })
        }

        await session.withTransaction( async (session) => {
            if(product && Object.keys(product).length > 0) {
                updatedProduct = await Product.findByIdAndUpdate(productId, {$set: product}, {session, runValidators: true, returnDocument: "after"});
                if (!updatedProduct) {
                    const error = new Error("Nie znaleziono produktu");
                    error.code = "PRODUCTS_NOT_FOUND"
                    throw error;
                }    
            }
            if (Array.isArray(updateVariants) && updateVariants.length > 0) {
                for (const variant of updateVariants) {
                    const {id, ...variantData} = variant;
                    const updatedVariant = await Variant.findOneAndUpdate({_id: id, product: productId}, {$set: variantData}, {session, runValidators: true, returnDocument: "after"})
                    if(!updatedVariant) {
                        const error = new Error("Nie znaleziono wariantów");
                        error.code = "VARIANTS_NOT_FOUND"
                        throw error;
                     }
                    updatedVariants.push(updatedVariant); 
                }
            }

            if(Array.isArray(newVariants) && newVariants.length > 0) {
                createdVariants = newVariants.map( (variant) => new Variant({
                    ...variant,
                    product: existingProduct._id
                }))
                await Variant.insertMany(createdVariants, {session});
            }
        })

        return res.status(200).json({
                updatedProduct,
                updatedVariants,
                createdVariants,
                message: "Pomyślnie zaktualizano produkt oraz jego warianty"
            })

    } catch(error) {
        if(error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
            message: "Błąd walidacji"
        })
        }
        if(error.code === "VARIANTS_NOT_FOUND" || error.code === "PRODUCTS_NOT_FOUND"){
            return res.status(404).json({
                    message: error.message
                })
        }
        return res.status(500).json({
            message: "Wystąpił błąd, spróbuj jeszcze raz później"
        })
    } finally {
        if(session) {
            await session.endSession();
        }
    }
}

module.exports = {
    getProducts,
    createProduct,
    findProductBySlug,
    searchProducts,
    updateProduct
}