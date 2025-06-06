// server/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth.verifyToken, notificationController.getNotifications);
router.put('/:id', auth.verifyToken, notificationController.updateNotification);
router.delete('/:id', auth.verifyToken, notificationController.removeNotification);

module.exports = router;
