const prisma = require('../lib/prisma');

// Start a new test attempt
exports.startAttempt = async (req, res) => {
  const { userId, examId } = req.body;
  try {
    const attempt = await prisma.testAttempt.create({
      data: { userId, examId },
    });
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start test attempt' });
  }
};

// Submit an answer
exports.submitAnswer = async (req, res) => {
  const { attemptId, questionId, givenAnswer } = req.body;
  try {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    const isCorrect = question.correctAnswer === givenAnswer;
    const scoreAutomated = isCorrect ? question.points : 0;

    const submission = await prisma.submission.create({
      data: {
        attemptId,
        questionId,
        givenAnswer,
        isCorrect,
        scoreAutomated,
      },
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};

// Complete an attempt and calculate final score
exports.completeAttempt = async (req, res) => {
  const { id } = req.params;
  try {
    const submissions = await prisma.submission.findMany({
      where: { attemptId: id },
    });

    const totalScore = submissions.reduce((sum, sub) => sum + sub.scoreAutomated, 0);
    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: { exam: true },
    });

    const status = totalScore >= attempt.exam.passingScore ? 'PASSED' : 'FAILED';

    const updatedAttempt = await prisma.testAttempt.update({
      where: { id },
      data: { score: totalScore, status },
    });

    // Award Certification if passed
    if (status === 'PASSED') {
      await prisma.certification.create({
        data: {
          userId: attempt.userId,
          examId: attempt.examId,
          certificateUrl: `https://certification-service.com/cert/${attempt.id}`, // Mock URL
        },
      });

      // Award a Badge
      await prisma.badge.create({
        data: {
          userId: attempt.userId,
          name: `${attempt.exam.title} Certified`,
          criteria: `Passed ${attempt.exam.title} with a score of ${totalScore}`,
        },
      });
    }

    res.status(200).json(updatedAttempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete attempt' });
  }
};
