// server/routes/achievementRoutes.js
const express     = require('express');
const auth        = require('../middleware/auth.middleware');
const controller  = require('../controllers/achievementController');

const router = express.Router();

router.post('/',        auth.verifyToken, controller.createAchievement);
router.get('/',         auth.verifyToken, controller.listAchievements);
router.get('/:id',      auth.verifyToken, controller.getAchievement);
router.put('/:id',      auth.verifyToken, controller.updateAchievement);
router.delete('/:id',   auth.verifyToken, controller.deleteAchievement);

module.exports = router;      