const prisma = require('../lib/prisma');

exports.getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.eC_User.findUnique({
      where: { id: userId },
      include: {
        testAttempts: {
          include: { exam: { include: { skill: true } } },
          orderBy: { attemptDate: 'desc' }
        },
        certifications: { include: { exam: true } },
        badges: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const stats = {
      totalAttempts: user.testAttempts.length,
      passedAttempts: user.testAttempts.filter(a => a.status === 'PASSED').length,
      certificationCount: user.certifications.length,
      badgeCount: user.badges.length
    };

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ ...userWithoutPassword, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
