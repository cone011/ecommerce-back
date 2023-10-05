const { validationResult } = require("express-validator");
const { ValidationParams } = require("../utils/validationParams");
const Product = require("../models/product");
const fileHelper = require("../utils/file");

exports.getAllProducts = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const perPage = req.query.perPage;
    const currentPage = req.query.currentPage;
    const totalProduct = await Product.find().countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res
      .status(200)
      .json({ message: "OK", totalProduct: totalProduct, products: products });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const productId = req.params.productId;
    const productItem = await Product.findById(productId);
    res.status(200).json({ message: "OK", product: productItem });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.insertProduct = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;

    const productCode = req.body.productCode;
    const title = req.body.title;
    const price = req.body.price;
    const image = req.file.path;
    const userId = req.userId;

    const productItem = new Product({
      productCode: productCode,
      title: title,
      price: price,
      image: image,
      userId: userId,
    });

    const result = await productItem.save();

    res
      .status(201)
      .json({ message: "OK", isSaved: true, productId: result._id.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;

    const productCode = req.body.productCode;
    const title = req.body.title;
    const price = req.body.price;
    const userId = req.userId;
    const productId = req.params.productId;

    const productItem = new Product({
      productCode: productCode,
      title: title,
      price: price,
      userId: userId,
      productId: productId,
    });

    const result = await productItem.save();

    res
      .status(201)
      .json({ message: "OK", isSaved: true, productId: result._id.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.deleteProducto = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const productId = req.params.productId;

    const productItem = await Product.findById(productId);

    await Product.findByIdAndRemove(productId);

    fileHelper.deleteFile(productItem.image);

    res.status(201).json({ message: "OK", isDeleted: true });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
