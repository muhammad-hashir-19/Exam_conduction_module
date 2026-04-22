const prisma = require('../lib/prisma');

exports.getAllExams = async (req, res) => {
  try {
    const exams = await prisma.eC_Exam.findMany({
      include: { 
        skill: true,
        questions: true
      }
    });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

exports.getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const exam = await prisma.eC_Exam.findUnique({
      where: { id },
      include: {
        skill: true,
        questions: {
          include: { question: true }
        }
      }
    });
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam details' });
  }
};

exports.createExam = async (req, res) => {
  const { title, description, skillId, duration, passingScore } = req.body;
  try {
    const exam = await prisma.eC_Exam.create({
      data: { title, description, skillId, duration, passingScore }
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
};
