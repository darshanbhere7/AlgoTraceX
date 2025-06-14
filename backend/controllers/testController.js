const Test = require('../models/Test');
const User = require('../models/User');

// Admin - Create a new Test
const createTest = async (req, res) => {
  try {
    const { title, topic, weekNumber, timeLimit, questions } = req.body;

    const newTest = new Test({
      title,
      topic,
      weekNumber,
      timeLimit,
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
    // Check if req.user exists and if it's an admin
    if (req.user && req.user.role === 'admin') {
      // Admin gets all test data
      tests = await Test.find().sort({ weekNumber: -1 });
    } else {
      // Users (authenticated non-admin or unauthenticated) get test data without correct answers
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
    const { testId, answers, timeSpent } = req.body;
    console.log('Backend: Received answers in req.body:', answers, 'Type:', typeof answers); // Debug log 1
    const userId = req.user.id;

    // Validate required fields
    if (!testId || !answers) {
      return res.status(400).json({ message: 'Test ID and answers are required' });
    }

    // Find the test to validate answers
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Convert answers object to array if needed
    let answersArray;
    if (typeof answers === 'object' && !Array.isArray(answers)) {
      answersArray = Object.keys(answers).map(key => parseInt(answers[key]));
    } else if (Array.isArray(answers)) {
      answersArray = answers;
    } else {
      return res.status(400).json({ message: 'Invalid answers format' });
    }
    console.log('Backend: answersArray after parsing:', answersArray); // Debug log 2

    // Validate answers array length
    if (answersArray.length !== test.questions.length) {
      return res.status(400).json({ 
        message: `Expected ${test.questions.length} answers, but got ${answersArray.length}`
      });
    }

    // Calculate score
    let correctAnswers = 0;
    test.questions.forEach((question, index) => {
      if (question.correctAnswer === answersArray[index]) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / test.questions.length) * 100);

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already taken this test
    const existingSubmission = user.testHistory.find(
      history => history.test && history.test.toString() === testId
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this test' });
    }

    // Add test result to user's history
    user.testHistory.push({
      test: testId,
      answers: answersArray,
      score,
      timeSpent,
      date: new Date()
    });

    // Initialize progress if it doesn't exist
    if (!user.progress) {
      user.progress = {
        overallProgress: 0,
        topics: {
          arrays: 0,
          linkedLists: 0,
          trees: 0,
          graphs: 0
        },
        lastUpdated: new Date(),
        completedLessons: [],
        testScores: []
      };
    }

    // Update test scores
    user.progress.testScores.push({
      test: testId,
      score,
      timeSpent,
      date: new Date()
    });

    // Calculate new overall progress
    const totalTests = user.progress.testScores.length;
    let overallProgress = 0;
    
    if (totalTests > 0) {
      const totalScore = user.progress.testScores.reduce((sum, test) => sum + (test.score || 0), 0);
      overallProgress = Math.round(totalScore / totalTests);
    }

    // Ensure overallProgress is a valid number
    user.progress.overallProgress = isNaN(overallProgress) ? 0 : overallProgress;
    user.progress.lastUpdated = new Date();

    // Save the updated user document
    await user.save();

    res.status(200).json({
      message: 'Test submitted successfully',
      score,
      overallProgress: user.progress.overallProgress,
      correctAnswers,
      totalQuestions: test.questions.length,
      timeSpent
    });
  } catch (error) {
    console.error('Error in submitTest:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
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
