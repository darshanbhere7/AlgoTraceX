const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    questions: [questionSchema],
    createdAt: { type: Date, default: Date.now },
    availableTill: { type: Date, required: true }, // When test expires
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
