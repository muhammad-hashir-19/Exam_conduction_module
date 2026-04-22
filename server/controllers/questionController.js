const prisma = require('../lib/prisma');

exports.createQuestion = async (req, res) => {
  const { text, type, skillId, options, correctAnswer, points } = req.body;
  try {
    const question = await prisma.eC_Question.create({
      data: { text, type, skillId, options, correctAnswer, points: parseInt(points) || 10 },
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
};

exports.addQuestionToExam = async (req, res) => {
  const { examId, questionId } = req.body;
  try {
    const examQuestion = await prisma.eC_ExamQuestion.upsert({
      where: { examId_questionId: { examId, questionId } },
      update: {},
      create: { examId, questionId }
    });
    res.status(201).json(examQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to link question to exam' });
  }
};

exports.getQuestions = async (req, res) => {
  const { skillId } = req.query;
  try {
    const questions = await prisma.eC_Question.findMany({
      where: skillId ? { skillId } : {},
      include: { skill: true },
    });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};
