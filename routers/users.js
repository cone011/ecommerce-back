const express = require("express");
const router = express.Router();
const { check, body, param, query } = require("express-validator");
const User = require("../models/users");
const user = require("../controllers/users");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

router.get(
  "/user",
  [
    query("currentPage", "Select at least one page")
      .isNumeric()
      .isLength({ min: 1 }),
    query("perPage", "Select the limit of users per page")
      .isNumeric()
      .isLength({ min: 1 }),
  ],
  user.getAllUsers
);

router.get(
  "/user/:userId",
  [param("userId", "At least select a register").trim().isLength({ min: 1 })],
  user.getUserById
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom(async (value, { req }) => {
        try {
          const userFound = await User.findOne({ email: value });
          if (userFound) {
            const error = new Error(
              "This email is already exists, please enter a diffrent one"
            );
            error.statusCode = 422;
            throw error;
          }
          return true;
        } catch (err) {
          if (!err.statusCode) err.statusCode = 500;
          throw err;
        }
      })
      .normalizeEmail(),
    body("password", "Please enter a password with at least 5 characters")
      .trim()
      .isLength({ min: 5 }),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
          const error = new Error("The password has to match");
          error.statusCode = 422;
          throw error;
        }
        return true;
      }),
    body("firstName", "Please enter a name to complete the registration")
      .trim()
      .isLength({ min: 3 }),
    body("lastName", "Please enter your lastname to complete the registration")
      .trim()
      .isLength({ min: 5 }),
  ],
  user.insertUser
);

router.put(
  "/user/:userId",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .custom(async (value, { req }) => {
        const userFound = await User.findOne({ email: value });
        if (userFound) {
          throw new Error(
            "This email is already exists, please enter a diffrent one"
          );
        }
      })
      .normalizeEmail(),
    body("firstName", "Please enter a name to complete the registration")
      .trim()
      .isLength({ min: 5 }),
    body("lastName", "Please enter your lastname to complete the registration")
      .trim()
      .isLength({ min: 5 }),
    check("userId", "At least select a register").custom(
      async (value, { req }) => {
        try {
          const userItem = await User.findById(value);
          if (!userItem) {
            const error = new Error("This user is no longer exist");
            error.statusCode = 422;
            throw error;
          }
          return true;
        } catch (err) {
          if (!err.statusCode) err.statusCode = 500;
          throw err;
        }
      }
    ),
  ],
  user.updateUser
);

router.patch(
  "/user/:userId",
  [
    body("newPassword", "Please enter a password with at least 5 characters")
      .trim()
      .isLength({ min: 5 }),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value != req.body.newPassword) {
          const error = new Error("The password has to match");
          error.statusCode = 422;
          throw error;
        }
        return true;
      }),
    check("userId", "At least select a register").custom(
      async (value, { req }) => {
        try {
          const userItem = await User.findOne(value);
          if (!userItem) {
            const error = new Error("This user is no longer exist");
            error.statusCode = 422;
            throw error;
          }
          return true;
        } catch (err) {
          if (!err.statusCode) err.statusCode = 500;
          throw err;
        }
      }
    ),
  ],
  user.resetPasword
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address")
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
  ],
  user.loginUser
);

router.delete(
  "/user/:userId",
  [
    check("userId").custom(async (value, { req }) => {
      try {
        const userItem = await User.findById(value);
        if (!userItem) {
          const error = new Error("This user is no longer exist");
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
  user.deleteUser
);

module.exports = router;
