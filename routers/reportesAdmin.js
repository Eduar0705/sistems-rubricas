const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get("/admin/reportes", reportesController.getAdminReports);

module.exports = router;