const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.get("/", productController.getProducts);
router.post("/", productController.createProduct);
router.get("/search", productController.searchProducts);

router.get("/:slug", productController.findProductBySlug);

module.exports = router;