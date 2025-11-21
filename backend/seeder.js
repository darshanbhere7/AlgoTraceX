const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const colors = require('colors'); // Temporarily commenting out colors for debugging

// Load env vars
dotenv.config({ path: './config/config.env' }); // Adjust path to your config file

// Load models
const PracticeQuestion = require('../models/PracticeQuestion');
const User = require('../models/User');
const Test = require('../models/Test');
const Topic = require('../models/Topic');
const CompletedQuestion = require('../models/CompletedQuestion');
const CompletedTest = require('../models/CompletedTest');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected for Seeder...')) // Added connection log
.catch(err => {
  console.error('MongoDB Connection Error for Seeder:', err);
  process.exit(1);
});

// Read JSON files
let questionsData;
let topicsData;
try {
  questionsData = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/questions.json`, 'utf-8') // Create a folder `_data` and put your questions.json there
  );
  console.log('questions.json loaded successfully. Number of topics:', questionsData.length); // Log success
} catch (err) {
  console.error('Error reading questions.json:', err);
  process.exit(1);
}

try {
  topicsData = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/topics.json`, 'utf-8')
  );
  console.log('topics.json loaded successfully. Number of topics:', topicsData.length);
} catch (err) {
  console.error('Error reading topics.json:', err);
  process.exit(1);
}

// Function to infer source and difficulty from URL
const getQuestionDetails = (url) => {
  let source = 'GeeksforGeeks';
  if (url.includes('leetcode.com')) {
    source = 'LeetCode';
  } else if (url.includes('spoj.com')) {
    source = 'SPOJ';
  } else if (url.includes('hackerrank.com')) {
    source = 'HackerRank';
  } else if (url.includes('hackerearth.com')) {
    source = 'HackerEarth';
  }
  // You can add more rules here

  // Default difficulty, can be changed manually later
  const difficulty = 'Medium'; 

  return { source, difficulty };
};

// Transform and Import data into DB
const importData = async () => {
  try {
    console.log('Starting data import...'); // Log import start
    const questionsToInsert = [];

    questionsData.forEach(topicItem => {
      if (!topicItem.questions || !Array.isArray(topicItem.questions)) {
        console.warn(`Topic item ${topicItem.topic} has no questions array or invalid format.`);
        return; // Skip this topic item if questions array is missing or invalid
      }
      topicItem.questions.forEach((question, index) => {
        const { source, difficulty } = getQuestionDetails(question.url);
        
        questionsToInsert.push({
          title: question.question,
          description: `Solve the problem: ${question.question}`, // Add a default description
          difficulty: difficulty,
          source: source,
          sourceUrl: question.url,
          sheet: "Love Babbar", // Assuming all are from Love Babbar sheet
          sheetTopic: topicItem.topic,
          sheetOrder: index + 1, // 1-based order
          hints: [], // Default empty hints
          solution: 'Solution not added yet.', // Default solution text
          topic: topicItem.topic // Generic topic field
        });
      });
    });
    console.log(`Prepared ${questionsToInsert.length} questions for insertion.`); // Log count

    await PracticeQuestion.create(questionsToInsert);
    await Topic.deleteMany();
    await Topic.create(topicsData);
    console.log('Data Imported successfully.'); // Changed success message
    process.exit();
  } catch (err) {
    console.error('Error during data import:', err); // Changed error message
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    console.log('Starting data deletion...'); // Log delete start
    await PracticeQuestion.deleteMany();
    await User.deleteMany();
    await Test.deleteMany();
    await Topic.deleteMany();
    await CompletedQuestion.deleteMany();
    await CompletedTest.deleteMany();
    console.log('Data Destroyed successfully.'); // Changed success message
    process.exit();
  } catch (err) {
    console.error('Error during data deletion:', err); // Changed error message
    process.exit(1);
  }
};

// Command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i for import or -d for delete.');
  process.exit(1);
}