const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacionesController');

router.get('/api/notifications', notificacionesController.getNotifications);
router.post('/api/notifications/:id/read', notificacionesController.markAsRead);
router.post('/api/notifications/read-all', notificacionesController.markAllAsRead);

module.exports = router;
