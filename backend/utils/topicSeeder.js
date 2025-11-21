const fs = require('fs');
const path = require('path');
const Topic = require('../models/Topic');

const TOPIC_DATA_PATH = path.join(__dirname, '..', '_data', 'topics.json');
const DEFAULT_ROADMAP = ['Basics', 'Patterns', 'Practice', 'Apply'];
const DEFAULT_ACTIONS = ['bookmark', 'pin', 'quiz', 'problems'];

const sanitizeTopic = (topic) => ({
  title: topic.title,
  category: topic.category || 'General',
  description: topic.description || '',
  difficulty: topic.difficulty || 'beginner',
  keyConcepts: Array.isArray(topic.keyConcepts) ? topic.keyConcepts : [],
  keyInsight: topic.keyInsight || '',
  roadmap:
    Array.isArray(topic.roadmap) && topic.roadmap.length > 0
      ? topic.roadmap
      : DEFAULT_ROADMAP,
  actions:
    Array.isArray(topic.actions) && topic.actions.length > 0
      ? topic.actions
      : DEFAULT_ACTIONS,
  isActive: topic.isActive !== undefined ? topic.isActive : true
});

const syncTopicsFromFile = async () => {
  try {
    const raw = fs.readFileSync(TOPIC_DATA_PATH, 'utf-8');
    const fileTopics = JSON.parse(raw);

    if (!Array.isArray(fileTopics) || fileTopics.length === 0) {
      console.warn('topics.json is empty or invalid. Skipping sync.');
      return;
    }

    const sanitizedTopics = fileTopics
      .filter((topic) => topic && topic.title)
      .map(sanitizeTopic);

    const bulkOps = sanitizedTopics.map((topic) => ({
      updateOne: {
        filter: { title: topic.title, difficulty: topic.difficulty },
        update: { $set: topic },
        upsert: true
      }
    }));

    if (bulkOps.length === 0) {
      console.warn('No valid topics found to sync.');
      return;
    }

    const result = await Topic.bulkWrite(bulkOps);
    console.log(
      `Topics synced. Inserted: ${result.upsertedCount || 0}, Modified: ${
        result.modifiedCount || 0
      }`
    );
  } catch (error) {
    console.error('Failed to sync topics from file:', error.message);
  }
};

module.exports = syncTopicsFromFile;

