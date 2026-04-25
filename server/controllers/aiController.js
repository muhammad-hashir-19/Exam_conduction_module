const Groq = require("groq-sdk");
const prisma = require("../lib/prisma");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateQuestions = async (req, res) => {
  const { skillId, count = 5 } = req.body;

  try {
    const skill = await prisma.eC_Skill.findUnique({ where: { id: skillId } });
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    const prompt = `
      Generate ${count} multiple-choice questions for ${skill.name}. 
      Also, recommend a total duration (in minutes) for an exam with these questions.
      Return as a JSON object: 
      {
        "recommendedDuration": number,
        "questions": [
          { "text": string, "type": "MCQ", "options": [string], "correctAnswer": string, "points": 10 }
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(chatCompletion.choices[0]?.message?.content);
    const rawQuestions = parsedData.questions;
    const recommendedDuration = parsedData.recommendedDuration || (count * 2);

    const createdQuestions = [];
    for (const q of rawQuestions) {
      const question = await prisma.eC_Question.create({
        data: {
          text: q.text,
          type: "MCQ",
          skillId: skillId,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: 10,
        },
      });
      createdQuestions.push(question);
    }

    const timestamp = new Date().toLocaleString();
    const exam = await prisma.eC_Exam.create({
      data: {
        title: `${skill.name} AI Challenge - ${timestamp}`,
        description: `An AI-generated skill assessment for ${skill.name} created on ${timestamp}.`,
        skillId: skillId,
        duration: recommendedDuration,
        passingScore: Math.ceil(count * 10 * 0.7),
      },
    });

    for (const q of createdQuestions) {
      await prisma.eC_ExamQuestion.create({
        data: { examId: exam.id, questionId: q.id },
      });
    }

    res.status(201).json({
      message: `Successfully generated ${createdQuestions.length} questions and a ${recommendedDuration}-minute exam.`,
      examId: exam.id
    });
  } catch (error) {
    console.error("Groq AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate questions using Groq AI" });
  }
};

exports.generateCodingQuestions = async (req, res) => {
  const { skillId, count = 3 } = req.body;

  try {
    const skill = await prisma.eC_Skill.findUnique({ where: { id: skillId } });
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    const prompt = `
      Generate ${count} coding exercise questions for ${skill.name}.
      Each question should be a practical coding problem a developer would solve.
      The "correctAnswer" should be a concise, correct code solution or key logic explanation (not a full essay).
      Return as a JSON object:
      {
        "recommendedDuration": number,
        "questions": [
          { "text": string, "correctAnswer": string, "points": 20 }
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(chatCompletion.choices[0]?.message?.content);
    const rawQuestions = parsedData.questions;
    const recommendedDuration = parsedData.recommendedDuration || (count * 10);

    const createdQuestions = [];
    for (const q of rawQuestions) {
      const question = await prisma.eC_Question.create({
        data: {
          text: q.text,
          type: "CODING",
          skillId: skillId,
          options: [],
          correctAnswer: q.correctAnswer,
          points: 20,
        },
      });
      createdQuestions.push(question);
    }

    const timestamp = new Date().toLocaleString();
    const exam = await prisma.eC_Exam.create({
      data: {
        title: `${skill.name} Coding Challenge - ${timestamp}`,
        description: `An AI-generated coding assessment for ${skill.name}.`,
        skillId: skillId,
        duration: recommendedDuration,
        passingScore: Math.ceil(count * 20 * 0.6),
      },
    });

    for (const q of createdQuestions) {
      await prisma.eC_ExamQuestion.create({
        data: { examId: exam.id, questionId: q.id },
      });
    }

    res.status(201).json({
      message: `Successfully generated ${createdQuestions.length} coding questions and a ${recommendedDuration}-minute exam.`,
      examId: exam.id
    });
  } catch (error) {
    console.error("Groq Coding Generation Error:", error);
    res.status(500).json({ error: "Failed to generate coding questions" });
  }
};

