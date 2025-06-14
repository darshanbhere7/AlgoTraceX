const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: [true, 'Difficulty is required'],
    },
    source: {
      type: String,
      enum: ['leetcode', 'codingninjas', 'codechef', 'geeksforgeeks', 'hackerrank', 'hackerearth', 'spoj', 'codeforces', 'other'],
      required: [true, 'Source is required'],
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source URL is required'],
    },
    topics: [{
      type: String,
      required: [true, 'At least one topic is required'],
    }],
    solution: {
      type: String,
    },
    testCases: [{
      input: String,
      output: String,
      explanation: String
    }],
    hints: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    sheet: {
      type: String,
      enum: ['Love Babbar', 'Striver'],
      required: true,
    },
    sheetTopic: {
      type: String,
      required: true,
    },
    sheetOrder: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const PracticeQuestion = mongoose.model('PracticeQuestion', practiceQuestionSchema);

module.exports = PracticeQuestion; 