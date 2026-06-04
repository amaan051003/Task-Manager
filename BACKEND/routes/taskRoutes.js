const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskProgress,
  uploadTaskFile,
  downloadTaskFile,
} = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const { body } = require("express-validator");

const createTaskValidation = [
  body("title").trim().notEmpty().withMessage("Task title is required."),
  body("assignedTo")
    .notEmpty().isMongoId().withMessage("Valid assignedTo user ID is required."),
  body("priority")
    .optional().isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority."),
  body("status")
    .optional().isIn(["pending", "in_progress", "review", "completed"]).withMessage("Invalid status."),
  body("deadline")
    .optional().isISO8601().withMessage("Deadline must be a valid date."),
  body("progress")
    .optional().isInt({ min: 0, max: 100 }).withMessage("Progress must be between 0 and 100."),
];

const statusValidation = [
  body("status")
    .isIn(["pending", "in_progress", "review", "completed"])
    .withMessage("Invalid status value."),
];

const progressValidation = [
  body("progress")
    .isInt({ min: 0, max: 100 })
    .withMessage("Progress must be between 0 and 100."),
];

router.use(protect);

router.post("/", authorize("manager"), createTaskValidation, validate, createTask);
router.get("/", getTasks);
router.get("/:id", getTask);
router.put("/:id", authorize("manager"), updateTask);
router.delete("/:id", authorize("manager"), deleteTask);
router.patch("/:id/status", statusValidation, validate, updateTaskStatus);
router.patch("/:id/progress", progressValidation, validate, updateTaskProgress);
router.post("/:id/upload", upload.array("files", 5), uploadTaskFile);
router.get("/:id/files/:fileId/download", downloadTaskFile);

module.exports = router;
