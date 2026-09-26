const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Predefined academic subjects library
router.get('/predefined', subjectController.getPredefinedSubjects);

router.get('/', subjectController.getSubjects);
router.post('/', subjectController.createSubject);
router.get('/:id', subjectController.getSubjectById);
router.put('/:id', subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

// Nested topic routes
router.get('/:subjectId/topics', topicController.getTopicsBySubject);
router.post('/:subjectId/topics', topicController.createTopic);

module.exports = router;
