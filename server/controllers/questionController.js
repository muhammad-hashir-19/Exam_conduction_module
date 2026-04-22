const prisma = require('../lib/prisma');

// Create a new question
exports.createQuestion = async (req, res) => {
  const { text, type, skillId, options, correctAnswer, points } = req.body;
  try {
    const question = await prisma.question.create({
      data: {
        text,
        type,
        skillId,
        options,
        correctAnswer,
        points: parseInt(points),
      },
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Add question to exam
exports.addQuestionToExam = async (req, res) => {
  const { examId, questionId } = req.body;
  try {
    const examQuestion = await prisma.examQuestion.create({
      data: { examId, questionId },
    });
    res.status(201).json(examQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add question to exam' });
  }
};

// Get all questions (filtered by skill if needed)
exports.getQuestions = async (req, res) => {
  const { skillId } = req.query;
  try {
    const questions = await prisma.question.findMany({
      where: skillId ? { skillId } : {},
      include: { skill: true },
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};
