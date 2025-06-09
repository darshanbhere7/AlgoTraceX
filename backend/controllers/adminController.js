const Topic = require('../models/Topic');
const User = require('../models/User');
const Test = require('../models/Test');
const Feedback = require('../models/Feedback');

// Admin Dashboard - Summary Stats
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTopics = await Topic.countDocuments();
    const feedbacks = await Feedback.find().limit(5).sort({ createdAt: -1 });

    res.status(200).json({
      totalUsers,
      totalTopics,
      recentFeedbacks: feedbacks,
    });
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get User Analytics
const getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalTestsTaken = await User.aggregate([
      { $unwind: '$testHistory' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    // Get weekly signups
    const weeklySignups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get average test scores
    const testScores = await User.aggregate([
      { $unwind: '$testHistory' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$testHistory.date' } },
          score: { $avg: '$testHistory.score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get topic-wise progress
    const topicProgress = await User.aggregate([
      { $unwind: '$progress' },
      {
        $group: {
          _id: '$progress.topic',
          averageProgress: { $avg: '$progress.completed' }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await User.aggregate([
      { $unwind: '$testHistory' },
      { $sort: { 'testHistory.date': -1 } },
      { $limit: 10 },
      {
        $project: {
          user: '$name',
          action: 'Completed Test',
          timestamp: '$testHistory.date'
        }
      }
    ]);

    res.status(200).json({
      totalUsers,
      totalTests,
      totalTestsTaken: totalTestsTaken[0]?.count || 0,
      weeklySignups: weeklySignups.map(item => ({ date: item._id, count: item.count })),
      testScores: testScores.map(item => ({ date: item._id, score: Math.round(item.score) })),
      topicProgress: Object.fromEntries(
        topicProgress.map(item => [item._id, Math.round(item.averageProgress)])
      ),
      recentActivity
    });
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Manage Topics - Add a new Topic
const addTopic = async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;
    const newTopic = new Topic({ title, description, difficulty });
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error in addTopic:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Manage Topics - Get All Topics
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (error) {
    console.error('Error in getAllTopics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Manage Users - Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // don't send password
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTopic:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAdminDashboard,
  getUserAnalytics,
  addTopic,
  deleteTopic,
  getAllTopics,
  getAllUsers,
  updateUserRole,
  deleteUser
};
