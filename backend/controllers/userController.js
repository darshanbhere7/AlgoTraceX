const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private (Protected by JWT)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      progress: user.progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user progress
// @route   PUT /api/user/progress
// @access  Private (Protected by JWT)
const updateUserProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize progress object if it doesn't exist
    if (!user.progress) {
      user.progress = {
        overallProgress: 0,
        topics: {},
        completedLessons: [],
        testScores: [],
        lastUpdated: new Date()
      };
    }

    // Update progress fields while preserving existing data
    if (progress.overallProgress !== undefined) {
      user.progress.overallProgress = progress.overallProgress;
    }
    
    if (progress.topics) {
      user.progress.topics = {
        ...user.progress.topics,
        ...progress.topics
      };
    }

    if (progress.completedLessons) {
      user.progress.completedLessons = [
        ...new Set([...user.progress.completedLessons, ...progress.completedLessons])
      ];
    }

    if (progress.testScores) {
      user.progress.testScores = [
        ...user.progress.testScores,
        progress.testScores
      ];
    }

    user.progress.lastUpdated = new Date();
    await user.save();

    // Fetch the updated user to ensure we have the latest data
    const updatedUser = await User.findById(req.user.id);

    res.status(200).json({
      message: 'Progress updated successfully',
      progress: updatedUser.progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProgress,
};
