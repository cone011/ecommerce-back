const { validationResult } = require("express-validator");
const { ValidationParams } = require("../utils/validationParams");
const User = require("../models/users");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getAllUsers = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const perPage = req.query.perPage;
    const currentPage = req.query.currentPage;
    const totalUsers = await User.find().countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res
      .status(200)
      .json({ message: "OK", totalUsers: totalUsers, users: users });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const userId = req.params.userId;
    const userItem = await User.findById(userId);
    res.status(200).json({ message: "OK", user: userItem });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.insertUser = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;

    const hashPassword = await bcrypt.hash(password, 12);

    const userItem = new User({
      email: email,
      password: hashPassword,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    });

    const result = await userItem.save();

    res
      .status(201)
      .json({ message: "OK", isSaved: true, userId: result._id.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const userId = req.params.userId;

    const userItem = await User.findById(userId);

    userItem.email = email;
    userItem.firstName = firstName;
    userItem.lastName = lastName;
    userItem.phone = phone;

    await userItem.save();

    res
      .status(201)
      .json({ message: "OK", isSaved: true, userId: userId.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const email = req.body.email;
    const password = req.body.password;

    const userItem = await User.findOne({ email: email });
    if (!userItem) {
      const error = new Error("This user is no longer exist");
      error.statusCode = 422;
      throw error;
    }

    const isEqual = bcrypt.compare(password, userItem.password);

    if (!isEqual) {
      const error = new Error("Invalid password!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      { userId: userItem._id.toString() },
      `${process.env.JWT_TOKEN}`,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token: token, userId: userItem._id.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.resetPasword = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const newPassword = req.body.newPassword;
    const userId = req.params.userId;
    const hashPassword = await bcrypt.hash(newPassword, 12);

    // await User.updateOne(
    //   { _id: new ObjectId(userId) },
    //   { $set: { password: hashPassword } }
    // );

    const userItem = await User.findById(userId);

    userItem.password = hashPassword;

    await userItem.save();

    res
      .status(201)
      .json({ message: "OK", isSaved: true, userId: userId.toString() });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const listErrors = validationResult(req);
    const hasError = ValidationParams(res, listErrors);
    if (hasError) return;
    const userId = req.params.userId;
    await User.findByIdAndRemove(userId);
    res.status(201).json({ message: "OK", isDeleted: true });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
