const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const syncTopicsFromFile = require('./utils/topicSeeder');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testRoutes = require('./routes/testRoutes');
const aiRoutes = require('./routes/aiRoutes'); // Added AI routes
const topicRoutes = require('./routes/topicRoutes');
const practiceQuestionRoutes = require('./routes/practiceQuestionRoutes');
const questionRoutes = require('./routes/questionRoutes');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes); // Added AI routes
app.use('/api/topics', topicRoutes);
app.use('/api/practice-questions', practiceQuestionRoutes);
app.use('/api/questions', questionRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// Start server after DB connection and seeding
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await syncTopicsFromFile();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();