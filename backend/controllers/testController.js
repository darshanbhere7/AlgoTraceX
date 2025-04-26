const Test = require('../models/Test');
const User = require('../models/User');

// Admin - Create a new Weekly Test
const createTest = async (req, res) => {
  try {
    const { title, questions, topic, weekNumber } = req.body;

    const newTest = new Test({
      title,
      questions,
      topic,
      weekNumber,
    });

    await newTest.save();
    res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (error) {
    console.error('Error in createTest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Admin - Get all tests
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ weekNumber: -1 });
    res.status(200).json(tests);
  } catch (error) {
    console.error('Error in getAllTests:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// User - Get Weekly Test by Week Number
const getTestByWeek = async (req, res) => {
  try {
    const { week } = req.params;
    const test = await Test.findOne({ weekNumber: week });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(test);
  } catch (error) {
    console.error('Error in getTestByWeek:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// User - Submit Test Answers
const submitTest = async (req, res) => {
  try {
    const { userId, weekNumber, score, answers } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update user's test history
    user.weeklyTests.push({ weekNumber, score, answers });
    await user.save();

    res.status(200).json({ message: 'Test submitted successfully' });
  } catch (error) {
    console.error('Error in submitTest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestByWeek,
  submitTest,
};
