const Notification = require("../models/Notification");

const createNotification = async ({ user, message, type = "general", relatedTask = null }) => {
  try {
    await Notification.create({ user, message, type, relatedTask });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

module.exports = { createNotification };
