const express = require('express');
const router = express.Router();
const studySessionController = require('../controllers/studySessionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', studySessionController.getSessions);
router.get('/today', studySessionController.getTodaySessions);
router.post('/', studySessionController.createSession);
router.put('/:id', studySessionController.updateSession);
router.delete('/:id', studySessionController.deleteSession);

module.exports = router;
