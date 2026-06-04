const Task = require("../models/Task");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, paginateResponse } = require("../utils/pagination");
const { createNotification } = require("../utils/notification");
const path = require("path");

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Manager
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, team, priority, deadline, notes } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedBy: req.user.id,
      assignedTo,
      team,
      priority,
      deadline,
      notes,
    });

    await task.populate([
      { path: "assignedBy", select: "name email avatarColor" },
      { path: "assignedTo", select: "name email avatarColor" },
      { path: "team", select: "name" },
    ]);

    await createNotification({
      user: assignedTo,
      message: `You have been assigned a new task: "${title}" by ${req.user.name}.`,
      type: "task_assigned",
      relatedTask: task._id,
    });

    return sendSuccess(res, 201, "Task created successfully.", { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering, searching, sorting, pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, priority, team, search, sortBy, order } = req.query;

    const filter = {};

    if (req.user.role === "employee") {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === "manager") {
      filter.assignedBy = req.user.id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (team) filter.team = team;
    if (search) filter.$text = { $search: search };

    const sortOptions = {};
    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    sortOptions[sortField] = sortOrder;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("assignedBy", "name email avatarColor")
        .populate("assignedTo", "name email avatarColor")
        .populate("team", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Tasks fetched successfully.", paginateResponse(tasks, total, page, limit));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedBy", "name email avatarColor role")
      .populate("assignedTo", "name email avatarColor role")
      .populate("team", "name manager")
      .populate("attachments.uploadedBy", "name")
      .populate("submissions.uploadedBy", "name");

    if (!task) return sendError(res, 404, "Task not found.");

    const isAssignedEmployee =
      req.user.role === "employee" &&
      task.assignedTo._id.toString() === req.user.id;
    const isOwningManager =
      req.user.role === "manager" &&
      task.assignedBy._id.toString() === req.user.id;

    if (!isAssignedEmployee && !isOwningManager) {
      return sendError(res, 403, "You are not authorized to view this task.");
    }

    return sendSuccess(res, 200, "Task fetched successfully.", { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private/Manager
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    if (req.user.role !== "manager") {
      return sendError(res, 403, "Only managers can update tasks.");
    }

    if (task.assignedBy.toString() !== req.user.id) {
      return sendError(res, 403, "You can only update tasks that you created.");
    }

    const { title, description, assignedTo, team, priority, deadline, notes, status } = req.body;
    const updates = { title, description, assignedTo, team, priority, deadline, notes, status };
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    Object.assign(task, updates);
    await task.save();

    await task.populate([
      { path: "assignedBy", select: "name email avatarColor" },
      { path: "assignedTo", select: "name email avatarColor" },
      { path: "team", select: "name" },
    ]);

    await createNotification({
      user: task.assignedTo._id,
      message: `Your task "${task.title}" has been updated.`,
      type: "task_updated",
      relatedTask: task._id,
    });

    return sendSuccess(res, 200, "Task updated successfully.", { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Manager
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    if (req.user.role !== "manager") {
      return sendError(res, 403, "Only managers can delete tasks.");
    }

    if (task.assignedBy.toString() !== req.user.id) {
      return sendError(res, 403, "You can only delete tasks that you created.");
    }

    await task.deleteOne();
    return sendSuccess(res, 200, "Task deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    if (req.user.role === "employee" && task.assignedTo.toString() !== req.user.id) {
      return sendError(res, 403, "You can only update the status of your own tasks.");
    }

    if (req.user.role === "manager" && task.assignedBy.toString() !== req.user.id) {
      return sendError(res, 403, "You can only update tasks that you created.");
    }

    task.status = status;
    await task.save();

    await createNotification({
      user: task.assignedBy,
      message: `Task "${task.title}" status has been updated to "${status}".`,
      type: "task_updated",
      relatedTask: task._id,
    });

    return sendSuccess(res, 200, "Task status updated.", { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task progress
// @route   PATCH /api/tasks/:id/progress
// @access  Private
const updateTaskProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    if (
      req.user.role === "employee" &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return sendError(res, 403, "You can only update progress for your own tasks.");
    }

    if (req.user.role === "manager" && task.assignedBy.toString() !== req.user.id) {
      return sendError(res, 403, "You can only update tasks that you created.");
    }

    task.progress = progress;
    await task.save();

    return sendSuccess(res, 200, "Task progress updated.", { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload file to a task
// @route   POST /api/tasks/:id/upload
// @access  Private
const uploadTaskFile = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, "No files uploaded.");
    }

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    const fileMeta = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user.id,
    }));

    if (req.user.role === "manager") {
      if (task.assignedBy.toString() !== req.user.id) {
        return sendError(res, 403, "You can only upload to tasks that you created.");
      }
      task.attachments.push(...fileMeta);
    } else {
      if (task.assignedTo.toString() !== req.user.id) {
        return sendError(res, 403, "You can only upload to your own tasks.");
      }
      task.submissions.push(...fileMeta);
    }

    await task.save();

    const notifyUser =
      req.user.role === "manager" ? task.assignedTo : task.assignedBy;

    await createNotification({
      user: notifyUser,
      message: `${req.user.name} uploaded ${req.files.length} file(s) to task "${task.title}".`,
      type: "file_uploaded",
      relatedTask: task._id,
    });

    return sendSuccess(res, 200, "Files uploaded successfully.", { uploaded: fileMeta });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a task attachment or submission
// @route   GET /api/tasks/:id/files/:fileId/download
// @access  Private
const downloadTaskFile = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    const isAssignedEmployee =
      req.user.role === "employee" &&
      task.assignedTo.toString() === req.user.id;
    const isOwningManager =
      req.user.role === "manager" &&
      task.assignedBy.toString() === req.user.id;

    if (!isAssignedEmployee && !isOwningManager) {
      return sendError(res, 403, "You are not authorized to download files from this task.");
    }

    const files = [...task.attachments, ...task.submissions];
    const file = files.find((item) => item._id.toString() === req.params.fileId);
    if (!file) return sendError(res, 404, "File not found.");

    const uploadDir = path.resolve(__dirname, "../uploads");
    const filePath = path.resolve(uploadDir, file.filename);

    if (!filePath.startsWith(uploadDir)) {
      return sendError(res, 400, "Invalid file path.");
    }

    return res.download(filePath, file.originalName);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskProgress,
  uploadTaskFile,
  downloadTaskFile,
};
