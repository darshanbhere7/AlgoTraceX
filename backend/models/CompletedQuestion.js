const mongoose = require('mongoose');

const CompletedQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  completed: {
    type: Boolean,
    default: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only complete a specific question once
CompletedQuestionSchema.index({ user: 1, questionId: 1 }, { unique: true });

console.log('CompletedQuestion Model loaded. questionId type:', CompletedQuestionSchema.paths.questionId.instance);

module.exports = mongoose.model('CompletedQuestion', CompletedQuestionSchema); 