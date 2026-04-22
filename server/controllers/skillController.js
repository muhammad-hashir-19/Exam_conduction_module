const prisma = require('../lib/prisma');

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

// Create a new skill
exports.createSkill = async (req, res) => {
  const { name } = req.body;
  try {
    const newSkill = await prisma.skill.create({
      data: { name },
    });
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
};

// Get skill by ID
exports.getSkillById = async (req, res) => {
  const { id } = req.params;
  try {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: { questions: true, exams: true },
    });
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.status(200).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
};
