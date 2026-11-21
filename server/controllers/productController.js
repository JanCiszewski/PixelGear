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

        if(!product && (!updateVariants || updateVariants.length === 0) && (!newVariants || newVariants.length === 0)) {
            return res.status(400).json({
                message: "Nie podano danych do edycji"
            })
        }

        const existingProduct = await Product.findOne({_id: productId})
        if(!existingProduct) {
            return res.status(404).json({
                message: "Produkt nie istnieje"
            })
        }

        // const existingVariants = await Variant.find({product: existingProduct.id})

        await session.withTransaction( async (session) => {
            if(product && Object.keys(product).length > 0) {
                const updatedProduct = await Product.findByIdAndUpdate(productId, {$set: product}, {session, runValidators: true, new: true});
                if (!updatedProduct) {
                    return res.status(404).json({
                        message: "Nie znaleziono produktu"
                    })
                }    
            }


            await Promise.all(updateVariants.map( async (variant) => {
                const updatedVariant = await Variant.findOneAndUpdate({_id: variant.id, product: productId}, {$set: variant}, {session, runValidators: true, new: true})
                if(!updatedVariant) {
                    return res.status(404).json({
                        message: "Nie znaleziono wariantu"
                    })
                }
                return updatedVariant;
            }));


            // if(isArray(updateVariants) && updateVariants.length !== 0) {
            //     const updatedVariant = await Variant.findAndUpdate(productId, {$set: product}, {session, runValidators: true, new: true});
            //     if (!updatedProduct) {
            //         return res.status(404).json({
            //             message: "Nie znaleziono produktu"
            //         })
            //     }
            // }
        })

    } catch(error) {
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