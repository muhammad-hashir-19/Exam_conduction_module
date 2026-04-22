const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Skills
  const jsSkill = await prisma.eC_Skill.upsert({
    where: { name: 'JavaScript' },
    update: {},
    create: { name: 'JavaScript' },
  });

  const reactSkill = await prisma.eC_Skill.upsert({
    where: { name: 'React' },
    update: {},
    create: { name: 'React' },
  });

  const nodeSkill = await prisma.eC_Skill.upsert({
    where: { name: 'Node.js' },
    update: {},
    create: { name: 'Node.js' },
  });

  const sqlSkill = await prisma.eC_Skill.upsert({
    where: { name: 'SQL' },
    update: {},
    create: { name: 'SQL' },
  });

  // Create a Test User (password is 'password123')
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.eC_User.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test freelancer',
      role: 'FREELANCER',
    },
  });

  const adminUser = await prisma.eC_User.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Helper to create questions and link to exam
  const createExamWithQuestions = async (examData, questionsData) => {
    const exam = await prisma.eC_Exam.upsert({
      where: { id: examData.id },
      update: {},
      create: examData,
    });

    for (const q of questionsData) {
      const question = await prisma.eC_Question.upsert({
        where: { id: q.id },
        update: {},
        create: q,
      });

      await prisma.eC_ExamQuestion.upsert({
        where: { examId_questionId: { examId: exam.id, questionId: question.id } },
        update: {},
        create: { examId: exam.id, questionId: question.id },
      });
    }
  };

  // 1. JavaScript Exam
  await createExamWithQuestions(
    { id: 'js-exam-1', title: 'JavaScript Fundamentals', description: 'Master the core concepts of JS.', skillId: jsSkill.id, duration: 30, passingScore: 20 },
    [
      { id: 'js-q1', text: 'What is the output of typeof null?', type: 'MCQ', skillId: jsSkill.id, options: ['object', 'null', 'undefined', 'number'], correctAnswer: 'object', points: 10 },
      { id: 'js-q2', text: 'Which keyword is used to define a constant in ES6?', type: 'MCQ', skillId: jsSkill.id, options: ['const', 'let', 'var', 'constant'], correctAnswer: 'const', points: 10 },
      { id: 'js-q3', text: 'What does NaN stand for?', type: 'MCQ', skillId: jsSkill.id, options: ['Not a Number', 'New and Nice', 'Next and Now', 'No absolute Number'], correctAnswer: 'Not a Number', points: 10 }
    ]
  );

  // 2. React Exam
  await createExamWithQuestions(
    { id: 'react-exam-1', title: 'React Performance Tuning', description: 'Optimize your React apps like a pro.', skillId: reactSkill.id, duration: 45, passingScore: 20 },
    [
      { id: 'react-q1', text: 'What does React.memo do?', type: 'MCQ', skillId: reactSkill.id, options: ['Caches a value', 'Prevents unnecessary re-renders', 'Manages state', 'Handles side effects'], correctAnswer: 'Prevents unnecessary re-renders', points: 10 },
      { id: 'react-q2', text: 'Which hook should be used to memoize a function?', type: 'MCQ', skillId: reactSkill.id, options: ['useMemo', 'useRef', 'useCallback', 'useEffect'], correctAnswer: 'useCallback', points: 10 },
      { id: 'react-q3', text: 'Where should you place calculations in a functional component?', type: 'MCQ', skillId: reactSkill.id, options: ['useMemo', 'useEffect', 'useState', 'Inside render'], correctAnswer: 'useMemo', points: 10 }
    ]
  );

  // 3. Node.js Exam
  await createExamWithQuestions(
    { id: 'node-exam-1', title: 'Node.js Backend Mastery', description: 'Build scalable servers with Node.', skillId: nodeSkill.id, duration: 40, passingScore: 20 },
    [
      { id: 'node-q1', text: 'Which core module is used for handling file paths?', type: 'MCQ', skillId: nodeSkill.id, options: ['fs', 'path', 'url', 'os'], correctAnswer: 'path', points: 10 },
      { id: 'node-q2', text: 'What is the default port for an Express server?', type: 'MCQ', skillId: nodeSkill.id, options: ['3000', '5000', '8080', 'None'], correctAnswer: 'None', points: 10 },
      { id: 'node-q3', text: 'Which module provides basic cryptographic functionality?', type: 'MCQ', skillId: nodeSkill.id, options: ['crypto', 'security', 'hash', 'encrypt'], correctAnswer: 'crypto', points: 10 }
    ]
  );

  // 4. SQL Exam
  await createExamWithQuestions(
    { id: 'sql-exam-1', title: 'SQL Query Optimization', description: 'Write fast and efficient queries.', skillId: sqlSkill.id, duration: 35, passingScore: 20 },
    [
      { id: 'sql-q1', text: 'Which keyword is used to sort results in SQL?', type: 'MCQ', skillId: sqlSkill.id, options: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ARRANGE'], correctAnswer: 'ORDER BY', points: 10 },
      { id: 'sql-q2', text: 'Which JOIN returns all records from the left table?', type: 'MCQ', skillId: sqlSkill.id, options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'FULL JOIN'], correctAnswer: 'LEFT JOIN', points: 10 },
      { id: 'sql-q3', text: 'What is the primary key typically used for?', type: 'MCQ', skillId: sqlSkill.id, options: ['Sorting', 'Indexing', 'Uniquely identifying a row', 'Nothing'], correctAnswer: 'Uniquely identifying a row', points: 10 }
    ]
  );

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
