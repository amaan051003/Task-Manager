const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { sendSuccess, sendError } = require("../utils/response");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 409, "Email is already registered.");
    const user = await User.create({ name, email, password, role: role || "employee" });
    const token = generateToken(user._id);
    return sendSuccess(res, 201, "User registered successfully.", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor },
    });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return sendError(res, 401, "Invalid email or password.");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, "Invalid email or password.");
    const token = generateToken(user._id);
    return sendSuccess(res, 200, "Login successful.", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarColor: user.avatarColor, employeeId: user.employeeId },
    });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return sendSuccess(res, 200, "User fetched successfully.", { user });
  } catch (error) { next(error); }
};

const createAccount = async (req, res, next) => {
  try {
    const { name, email, password, employeeId, role = "employee" } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return sendError(res, 409, "Email is already registered.");
    const account = await User.create({
      name,
      email,
      password,
      role,
      employeeId: role === "employee" ? employeeId : undefined,
    });
    return sendSuccess(res, 201, `${role === "manager" ? "Manager" : "Employee"} created successfully.`, {
      user: { id: account._id, name: account.name, email: account.email, role: account.role, employeeId: account.employeeId, avatarColor: account.avatarColor },
    });
  } catch (error) { next(error); }
};

const getEmployees = async (req, res, next) => {
  try {
    const users = await User.find({ role: "employee" }).select("name email avatarColor employeeId role");
    return sendSuccess(res, 200, "Employees fetched successfully.", { users });
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe, createAccount, getEmployees };
