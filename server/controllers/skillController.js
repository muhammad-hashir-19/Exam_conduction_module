const prisma = require('../lib/prisma');

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await prisma.eC_Skill.findMany();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

exports.createSkill = async (req, res) => {
  const { name } = req.body;
  try {
    const skill = await prisma.eC_Skill.create({ data: { name } });
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
};

exports.getSkillById = async (req, res) => {
  const { id } = req.params;
  try {
    const skill = await prisma.eC_Skill.findUnique({ where: { id } });
    res.status(200).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skill' });
  }
};
