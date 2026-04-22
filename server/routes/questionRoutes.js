const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// Only ADMIN can create/manage questions
router.post('/', authenticateToken, authorizeRole('ADMIN'), questionController.createQuestion);
router.post('/link-exam', authenticateToken, authorizeRole('ADMIN'), questionController.addQuestionToExam);
router.get('/', authenticateToken, questionController.getQuestions);

module.exports = router;
