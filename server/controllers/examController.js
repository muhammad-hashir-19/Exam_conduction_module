const prisma = require('../lib/prisma');

// Create a new exam
exports.createExam = async (req, res) => {
  const { title, description, skillId, duration, passingScore } = req.body;
  try {
    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        skillId,
        duration: parseInt(duration),
        passingScore: parseInt(passingScore),
      },
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

// Get all exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: { skill: true },
    });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

// Get exam by ID with questions
exports.getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: { question: true },
        },
      },
    });
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};
