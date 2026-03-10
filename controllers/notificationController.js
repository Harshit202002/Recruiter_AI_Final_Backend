import asyncHandler from '../utils/asyncHandler.js';

// Create a notification and emit via Socket.IO
export const createNotification = asyncHandler(async (req, res) => {
  const Notification = req.tenant.Notification;
  const { recipient, message, link } = req.body;
  const notification = await Notification.create({ recipient, message, link });
  // Emit to recipient via Socket.IO
  const io = req.app.get('io');
  io.to(recipient.toString()).emit('notification', notification);
  res.status(201).json(notification);
});

// Get notifications for a user
export const getNotifications = asyncHandler(async (req, res) => {
  const Notification = req.tenant.Notification;
  const userId = req.user._id;
  const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const Notification = req.tenant.Notification;
  const { id } = req.params;
  const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  res.json(notification);
});

// Mark all notifications for the logged-in user as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const Notification = req.tenant.Notification;
  const userId = req.user._id;
  const result = await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
  // Optionally notify other sockets for this user
  try {
    const io = req.app.get('io');
    if (io) io.to(userId.toString()).emit('notificationsMarkedRead');
  } catch (e) {
    // ignore socket emit errors
  }
  res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
});
