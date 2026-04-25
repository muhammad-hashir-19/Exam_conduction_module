const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  const dataPath = path.join(__dirname, 'seed-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ seed-data.json not found! Run export-db.js first.');
    return;
  }

  const { skills, questions, exams } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Clear existing data to avoid duplicates
  await prisma.eC_ExamQuestion.deleteMany();
  await prisma.eC_Submission.deleteMany();
  await prisma.eC_TestAttempt.deleteMany();
  await prisma.eC_Question.deleteMany();
  await prisma.eC_Exam.deleteMany();
  await prisma.eC_Skill.deleteMany();

  console.log('🧹 Database cleaned.');

  // 2. Seed Skills
  for (const s of skills) {
    await prisma.eC_Skill.create({ data: { id: s.id, name: s.name, description: s.description } });
  }
  console.log(`✅ Seeded ${skills.length} skills.`);

  // 3. Seed Questions
  for (const q of questions) {
    await prisma.eC_Question.create({
      data: {
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        skillId: q.skillId
      }
    });
  }
  console.log(`✅ Seeded ${questions.length} questions.`);

  // 4. Seed Exams and Links
  for (const e of exams) {
    const createdExam = await prisma.eC_Exam.create({
      data: {
        id: e.id,
        title: e.title,
        description: e.description,
        duration: e.duration,
        passingScore: e.passingScore,
        skillId: e.skillId
      }
    });

    for (const qId of e.questionIds) {
      await prisma.eC_ExamQuestion.create({
        data: { examId: createdExam.id, questionId: qId }
      });
    }
  }
  console.log(`✅ Seeded ${exams.length} exams with all question links.`);
  console.log('🏆 Seeding complete! Everything is ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
