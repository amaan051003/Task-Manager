const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
} = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { body } = require("express-validator");

const teamValidation = [
  body("name").trim().notEmpty().withMessage("Team name is required."),
];

const memberValidation = [
  body("userId")
    .notEmpty().withMessage("userId is required.")
    .isMongoId().withMessage("Invalid userId."),
];

router.use(protect);

router.post("/", authorize("manager"), teamValidation, validate, createTeam);
router.get("/", getTeams);
router.get("/:id", getTeam);
router.put("/:id", authorize("manager"), updateTeam);
router.delete("/:id", authorize("manager"), deleteTeam);
router.post("/:id/add-member", authorize("manager"), memberValidation, validate, addMember);
router.post("/:id/remove-member", authorize("manager"), memberValidation, validate, removeMember);

module.exports = router;
