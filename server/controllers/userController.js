const prisma = require('../lib/prisma');

// Get user profile including stats
exports.getUserProfile = async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        testAttempts: {
          include: { exam: { include: { skill: true } } },
          orderBy: { attemptDate: 'desc' }
        },
        certifications: {
          include: { user: { select: { name: true } } }
        },
        badges: true
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Calculate some quick stats
    const totalAttempts = user.testAttempts.length;
    const passedAttempts = user.testAttempts.filter(a => a.status === 'PASSED').length;
    
    res.status(200).json({
      ...user,
      stats: {
        totalAttempts,
        passedAttempts,
        certificationCount: user.certifications.length,
        badgeCount: user.badges.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
