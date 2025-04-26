const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who created
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', topicSchema);
