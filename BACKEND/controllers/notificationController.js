const Notification = require("../models/Notification");
const { sendSuccess, sendError } = require("../utils/response");
const { getPagination, paginateResponse } = require("../utils/pagination");

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { unread } = req.query;

    const filter = { user: req.user.id };
    if (unread === "true") filter.isRead = false;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate("relatedTask", "title status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      200,
      "Notifications fetched successfully.",
      paginateResponse(notifications, total, page, limit)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, "Notification not found.");
    }

    return sendSuccess(res, 200, "Notification marked as read.", { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    return sendSuccess(res, 200, "All notifications marked as read.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
