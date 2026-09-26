const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlanController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/generate', studyPlanController.generatePlan);
router.get('/', studyPlanController.getPlans);
router.get('/:id', studyPlanController.getPlanById);
router.delete('/:id', studyPlanController.deletePlan);

module.exports = router;
