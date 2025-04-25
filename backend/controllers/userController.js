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

// @desc    Update user progress (used for tracking DSA learning progress)
// @route   PUT /api/user/progress
// @access  Private (Protected by JWT)
const updateUserProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { progress },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Progress updated successfully',
      progress: user.progress,
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
