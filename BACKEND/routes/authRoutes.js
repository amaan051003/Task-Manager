const express = require("express");
const router = express.Router();
const { register, login, getMe, createAccount, getEmployees } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { body } = require("express-validator");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Provide a valid email.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role").optional().isIn(["manager", "employee"]).withMessage("Role must be manager or employee."),
];

const loginValidation = [
  body("email").isEmail().withMessage("Provide a valid email.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

const createAccountValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Provide a valid email.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role").optional().isIn(["manager", "employee"]).withMessage("Role must be manager or employee."),
  body("employeeId").optional().trim(),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);
router.get("/employees", protect, authorize("manager"), getEmployees);
router.post("/create-employee", protect, authorize("manager"), createAccountValidation, validate, createAccount);
router.post("/create-account", protect, authorize("manager"), createAccountValidation, validate, createAccount);

module.exports = router;
