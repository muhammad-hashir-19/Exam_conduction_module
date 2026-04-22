const prisma = require('../lib/prisma');
const GradingService = require('../services/GradingService');

// Start a new test attempt
exports.startAttempt = async (req, res) => {
  const { userId, examId } = req.body;
  try {
    const attempt = await prisma.eC_TestAttempt.create({
      data: { userId, examId },
    });
    res.status(201).json(attempt);
  } catch (error) {
    console.error('Start Attempt Error:', error);
    res.status(500).json({ error: 'Failed to start test attempt' });
  }
};

// Submit an answer (Now using AI-Powered Grading Agent)
exports.submitAnswer = async (req, res) => {
  const { attemptId, questionId, givenAnswer } = req.body;
  try {
    const question = await prisma.eC_Question.findUnique({ where: { id: questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // USE AI AGENT FOR SCORING
    const isCorrect = await GradingService.evaluateAnswer(givenAnswer, question.correctAnswer, question.text);
    const scoreAutomated = isCorrect ? (question.points || 10) : 0;

    const submission = await prisma.eC_Submission.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: { givenAnswer, isCorrect, scoreAutomated },
      create: { attemptId, questionId, givenAnswer, isCorrect, scoreAutomated }
    });

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit Answer Error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

// Complete an attempt and calculate final score
exports.completeAttempt = async (req, res) => {
  const { id } = req.params;
  try {
    const submissions = await prisma.eC_Submission.findMany({
      where: { attemptId: id },
    });

    const totalScore = submissions.reduce((sum, sub) => sum + (sub.scoreAutomated || 0), 0);
    const attempt = await prisma.eC_TestAttempt.findUnique({
      where: { id },
      include: { exam: true },
    });

    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const status = GradingService.calculatePassStatus(totalScore, attempt.exam.passingScore);

    const updatedAttempt = await prisma.eC_TestAttempt.update({
      where: { id },
      data: { score: totalScore, status, completedAt: new Date() },
    });

    if (status === 'PASSED') {
      try {
        await prisma.eC_Certification.create({
          data: {
            userId: attempt.userId,
            examId: attempt.examId,
            certificateUrl: `https://api.skillcertify.com/certs/${attempt.id}`,
          },
        });

        await prisma.eC_Badge.create({
          data: {
            userId: attempt.userId,
            name: `${attempt.exam.title} Certified`,
            criteria: `Passed with score ${totalScore}`,
          },
        });
      } catch (certError) {
        console.error('Certification Issue Error (Non-Fatal):', certError);
      }
    }

    res.status(200).json(updatedAttempt);
  } catch (error) {
    console.error('Complete Attempt Error:', error);
    res.status(500).json({ error: 'Failed to complete attempt' });
  }
};
