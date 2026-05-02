const prisma = require('../lib/prisma');
const GradingService = require('../services/GradingService');

// Start a new test attempt
exports.startAttempt = async (req, res) => {
  const { userId, examId } = req.body;
  try {
    const attempt = await prisma.ecTestAttempt.create({
      data: { 
        user_id: parseInt(userId), 
        assessment_id: parseInt(examId),
        status: 'in_progress'
      },
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
    const question = await prisma.ecQuestion.findUnique({ where: { id: parseInt(questionId) } });
    if (!question) return res.status(404).json({ error: 'Question not found' });

    let isCorrect = false;
    let scoreAutomated = 0;
    let aiFeedback = null;

    if (question.question_type === 'CODING') {
      const result = await GradingService.evaluateCodingAnswer(
        givenAnswer, question.correct_answer, question.question_text, question.points || 20
      );
      scoreAutomated = result.score;
      isCorrect = scoreAutomated >= (question.points || 20) * 0.6;
      aiFeedback = result.feedback;
    } else {
      isCorrect = await GradingService.evaluateAnswer(givenAnswer, question.correct_answer, question.question_text);
      scoreAutomated = isCorrect ? (question.points || 10) : 0;
    }

    const submission = await prisma.ecSubmission.upsert({
      where: { attempt_id_question_id: { attempt_id: parseInt(attemptId), question_id: parseInt(questionId) } },
      update: { given_answer: givenAnswer, is_correct: isCorrect, points_earned: scoreAutomated },
      create: { 
        attempt_id: parseInt(attemptId), 
        question_id: parseInt(questionId), 
        given_answer: givenAnswer, 
        is_correct: isCorrect, 
        points_earned: scoreAutomated 
      }
    });

    res.status(201).json({ ...submission, aiFeedback });
  } catch (error) {
    console.error('Submit Answer Error:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
};


// Complete an attempt and calculate final score
exports.completeAttempt = async (req, res) => {
  const { id } = req.params;
  try {
    const attemptId = parseInt(id);
    const submissions = await prisma.ecSubmission.findMany({
      where: { attempt_id: attemptId },
    });

    const totalScore = submissions.reduce((sum, sub) => sum + (sub.points_earned || 0), 0);
    const attempt = await prisma.ecTestAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: true },
    });

    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    const status = GradingService.calculatePassStatus(totalScore, attempt.assessment.passing_score);

    const updatedAttempt = await prisma.ecTestAttempt.update({
      where: { id: attemptId },
      data: { score: totalScore, status, completed_at: new Date() },
    });

    if (status === 'passed') {
      try {
        await prisma.ecCertificate.create({
          data: {
            user_id: attempt.user_id,
            assessment_id: attempt.assessment_id,
            attempt_id: attempt.id,
            certificate_number: `CERT-${attempt.id}-${Date.now()}`,
            certificate_url: `https://api.skillcertify.com/certs/${attempt.id}`,
          },
        });

        await prisma.ecBadge.create({
          data: {
            user_id: attempt.user_id,
            name: `${attempt.assessment.assessment_name} Certified`,
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
