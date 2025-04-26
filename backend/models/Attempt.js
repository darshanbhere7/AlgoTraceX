const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    attemptDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['correct', 'incorrect'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = Attempt;
