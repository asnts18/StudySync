// server/routes/universityRoutes.js
const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');

// TODO
router.get('/', universityController.getAllUniversities);
router.get('/:id', universityController.getUniversityById);

module.exports = router;