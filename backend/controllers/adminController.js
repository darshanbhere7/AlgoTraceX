const Topic = require('../models/Topic');
const User = require('../models/User');
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

// Manage Topics - Add a new Topic
const addTopic = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newTopic = new Topic({ name, description });
    await newTopic.save();

    res.status(201).json({ message: 'Topic created successfully', topic: newTopic });
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

module.exports = {
  getAdminDashboard,
  addTopic,
  getAllTopics,
  getAllUsers,
};
