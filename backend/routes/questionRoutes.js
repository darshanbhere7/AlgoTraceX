const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// @route   GET /api/questions
// @desc    Get all DSA questions
// @access  Public
router.get('/', (req, res) => {
  try {
    // Using absolute path to ensure file is found
    const questionsPath = path.join(process.cwd(), '_data', 'questions.json');
    console.log('Attempting to read questions from:', questionsPath); // Debug log
    
    if (!fs.existsSync(questionsPath)) {
      console.error('Questions file not found at:', questionsPath);
      return res.status(404).json({ message: 'Questions file not found' });
    }

    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    res.json(questions);
  } catch (error) {
    console.error('Error reading questions:', error);
    res.status(500).json({ message: 'Error loading questions', error: error.message });
  }
});

module.exports = router; 