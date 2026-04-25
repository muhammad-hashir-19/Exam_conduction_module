const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Universal Database Seeding...');

  const dataPath = path.join(__dirname, 'seed-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ seed-data.json not found! Run export-db.js first.');
    return;
  }

  const { skills, questions, exams } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Clear existing data
  await prisma.eC_ExamQuestion.deleteMany();
  await prisma.eC_Submission.deleteMany();
  await prisma.eC_TestAttempt.deleteMany();
  await prisma.eC_Question.deleteMany();
  await prisma.eC_Exam.deleteMany();
  await prisma.eC_Skill.deleteMany();
  await prisma.eC_User.deleteMany(); // Clear users too for a fresh sync

  console.log('🧹 Database cleaned.');

  // 2. Create Default Accounts
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await prisma.eC_User.create({
    data: {
      email: 'admin@skillcertify.com',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN'
    }
  });

  await prisma.eC_User.create({
    data: {
      email: 'user@skillcertify.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER'
    }
  });

  console.log('👤 Seeded Default Admin and User accounts.');

  // 3. Seed Skills
  for (const s of skills) {
    await prisma.eC_Skill.create({ data: { id: s.id, name: s.name, description: s.description } });
  }
  console.log(`✅ Seeded ${skills.length} skills.`);

  // 4. Seed Questions
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

  // 5. Seed Exams and Links
  for (const e of exams) {
    await prisma.eC_Exam.create({
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
        data: { examId: e.id, questionId: qId }
      });
    }
  }
  console.log(`✅ Seeded ${exams.length} exams with all question links.`);
  console.log('🏆 All Set! Your team is now perfectly synchronized.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
