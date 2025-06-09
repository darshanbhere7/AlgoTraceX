const Test = require('../models/Test');
const User = require('../models/User');

// Admin - Create a new Test
const createTest = async (req, res) => {
  try {
    const { title, topic, weekNumber, questions } = req.body;

    const newTest = new Test({
      title,
      topic,
      weekNumber,
      questions
    });

    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    console.error('Error in createTest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all tests (filtered for users, full for admin)
const getAllTests = async (req, res) => {
  try {
    let tests;
    if (req.user.role === 'admin') {
      // Admin gets all test data
      tests = await Test.find().sort({ weekNumber: -1 });
    } else {
      // Users get test data without correct answers
      tests = await Test.find()
        .select('-questions.correctAnswer')
        .sort({ weekNumber: -1 });
    }
    res.status(200).json(tests);
  } catch (error) {
    console.error('Error in getAllTests:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get test by week number
const getTestByWeek = async (req, res) => {
  try {
    const { week } = req.params;
    const test = await Test.findOne({ weekNumber: week })
      .select('-questions.correctAnswer'); // Don't send correct answers to users

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(test);
  } catch (error) {
    console.error('Error in getTestByWeek:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Submit test answers
const submitTest = async (req, res) => {
  try {
    const { testId, answers, score } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add test result to user's history
    user.testHistory.push({
      test: testId,
      answers,
      score,
      date: new Date()
    });

    // Update user's progress
    if (!user.progress) {
      user.progress = {
        overallProgress: 0,
        topics: {},
        completedLessons: [],
        testScores: []
      };
    }

    // Update test scores
    user.progress.testScores.push({
      test: testId,
      score,
      date: new Date()
    });

    // Calculate new overall progress
    const totalTests = user.progress.testScores.length;
    const totalScore = user.progress.testScores.reduce((sum, test) => sum + test.score, 0);
    user.progress.overallProgress = Math.round(totalScore / totalTests);

    await user.save();

    res.status(200).json({
      message: 'Test submitted successfully',
      score,
      overallProgress: user.progress.overallProgress
    });
  } catch (error) {
    console.error('Error in submitTest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a test
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTest:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createTest,
  getAllTests,
  getTestByWeek,
  submitTest,
  deleteTest
};
