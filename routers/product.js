const express = require("express");
const router = express.Router();
const { check, body, param, query } = require("express-validator");
const Product = require("../models/product");
const product = require("../controllers/product");
const isAuth = require("../middleware/isAuth");

router.get(
  "/product",
  isAuth,
  [
    query("currentPage", "Select at least one page")
      .isNumeric()
      .isLength({ min: 1 }),
    query("perPage", "Select the limit of users per page")
      .isNumeric()
      .isLength({ min: 1 }),
  ],
  product.getAllProducts
);

router.get(
  "/product/:productId",
  isAuth,
  [
    param("productId", "At least select a register")
      .trim()
      .isLength({ min: 1 }),
  ],
  product.getProductById
);

router.post("/product", isAuth, product.insertProduct);

router.put(
  "/product/:productId",
  isAuth,
  [
    check("productId").custom(async (value, { req }) => {
      try {
        const productItem = await Product.findById(value);
        if (!productItem) {
          const error = new Error("This product is no longer exist");
          error.statusCode = 422;
          throw error;
        }
        return true;
      } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        throw err;
      }
    }),
  ],
  product.updateProduct
);

router.delete(
  "/product/:productId",
  isAuth,
  [
    check("productId").custom(async (value, { req }) => {
      try {
        const productItem = await Product.findById(value);
        if (!productItem) {
          const error = new Error("This product is no longer exist");
          error.statusCode = 422;
          throw error;
        }
        return true;
      } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        throw err;
      }
    }),
  ],
  product.deleteProducto
);

module.exports = router;
