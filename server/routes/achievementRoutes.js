// routes/achievementRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const achievementController = require('../controllers/achievementController');
const ctrl    = require('../controllers/achievementController');

// ‑‑‑ public GETs (you can secure if you like) ‑‑‑
router.get('/',            achievementController.listAchievements);
router.get('/:id',         achievementController.getAchievement);

// ‑‑‑ protected write operations ‑‑‑
router.post('/',           auth.verifyToken, achievementController.createAchievement);
router.put('/:id',         auth.verifyToken, achievementController.updateAchievement);
router.delete('/:id',      auth.verifyToken, achievementController.deleteAchievement);

/* ───────────────── group‑scoped logic (owner only) ───────────────
   NOTE these come AFTER the platform routes so "/:id" above
   doesn’t swallow them – they start with /group/...             */
   router.post (
    '/group/:groupId',                   // create new achievement in group
    auth.verifyToken,
    ctrl.createGroupAchievement
  );
  
  router.post (
    '/group/:groupId/:achievementId/award/:memberId',   // give award
    auth.verifyToken,
    ctrl.awardAchievement
  );
  
  router.delete(
    '/group/:groupId/:achievementId/award/:memberId',   // revoke award
    auth.verifyToken,
    ctrl.revokeAchievement
  );
  
module.exports = router;
