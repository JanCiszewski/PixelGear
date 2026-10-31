const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.get("/", productController.searchProducts);
router.post("/", productController.createProduct);

router.get("/:slug", productController.findProductBySlug);

module.exports = router;