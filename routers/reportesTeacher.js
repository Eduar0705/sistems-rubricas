const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/teacher/report', reportesController.getTeacherReports);

module.exports = router;