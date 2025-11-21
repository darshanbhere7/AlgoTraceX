const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    keyConcepts: {
      type: [String],
      default: []
    },
    keyInsight: {
      type: String,
      default: ''
    },
    roadmap: {
      type: [String],
      default: ['Basics', 'Patterns', 'Practice', 'Apply']
    },
    actions: {
      type: [String],
      default: ['bookmark', 'pin', 'quiz', 'problems']
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', topicSchema);
