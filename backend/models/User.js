const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    progress: {
      overallProgress: {
        type: Number,
        default: 0
      },
      topics: {
        arrays: { type: Number, default: 0 },
        linkedLists: { type: Number, default: 0 },
        trees: { type: Number, default: 0 },
        graphs: { type: Number, default: 0 }
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      completedLessons: [{
        type: String
      }],
      testScores: [{
        testId: String,
        score: Number,
        date: Date
      }]
    }
  },
  {
    timestamps: true,
  }
);

// 🔒 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
