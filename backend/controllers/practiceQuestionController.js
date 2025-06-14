const PracticeQuestion = require('../models/PracticeQuestion');
const CompletedQuestion = require('../models/CompletedQuestion');
const axios = require('axios');
const cheerio = require('cheerio');

// Get all practice questions (filtered for users, full for admin)
const getAllQuestions = async (req, res) => {
  try {
    const { difficulty, source, topic, sheet, sheetTopic } = req.query;
    let query = { isActive: true };

    // Add filters if provided
    if (difficulty) query.difficulty = difficulty;
    if (source) query.source = source;
    if (topic) query.topics = topic;
    if (sheet) query.sheet = sheet;
    if (sheetTopic) query.sheetTopic = sheetTopic;

    const questions = await PracticeQuestion.find(query)
      .select(req.user.role === 'admin' ? '' : '-solution')
      .sort({ createdAt: -1 });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error in getAllQuestions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single practice question
const getQuestion = async (req, res) => {
  try {
    const question = await PracticeQuestion.findById(req.params.id)
      .select(req.user.role === 'admin' ? '' : '-solution');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Error in getQuestion:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mark a question as complete
const markQuestionComplete = async (req, res) => {
  try {
    const { questionId, title, source, difficulty, completed } = req.body;

    // Check if the question is already marked complete by the user
    const existingCompletion = await CompletedQuestion.findOne({ user: req.user.id, questionId });
    if (existingCompletion) {
      return res.status(400).json({ message: 'Question already marked complete' });
    }

    const completedQuestion = new CompletedQuestion({
      user: req.user.id,
      questionId,
      title,
      source,
      difficulty,
      completed
    });

    await completedQuestion.save();
    res.status(201).json(completedQuestion);
  } catch (error) {
    console.error('Error marking question complete:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all completed questions for the authenticated user
const getCompletedQuestions = async (req, res) => {
  try {
    const completedQuestions = await CompletedQuestion.find({ user: req.user.id });
    res.status(200).json(completedQuestions);
  } catch (error) {
    console.error('Error fetching completed questions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Unmark a question as complete
const unmarkQuestionComplete = async (req, res) => {
  try {
    const { id } = req.params; // This `id` is the `_id` of the CompletedQuestion document

    const result = await CompletedQuestion.findOneAndDelete({ user: req.user.id, questionId: id });

    if (!result) {
      return res.status(404).json({ message: 'Completed question record not found' });
    }

    res.status(200).json({ message: 'Question unmarked as complete successfully' });
  } catch (error) {
    console.error('Error unmarking question complete:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new practice question (admin only)
const createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      source,
      sourceUrl,
      topics,
      solution,
      testCases,
      hints,
      sheet,
      sheetTopic,
      sheetOrder // sheetOrder might be passed, but we'll override if creating new
    } = req.body;

    let newSheetOrder = sheetOrder;

    // If this is a new question being added (not an edit), determine the next sheetOrder
    if (!req.body._id) { // Assuming _id is not present for new creations
      const latestQuestionInTopic = await PracticeQuestion.findOne({ sheet: sheet, sheetTopic: sheetTopic })
        .sort({ sheetOrder: -1 })
        .limit(1);

      newSheetOrder = latestQuestionInTopic ? latestQuestionInTopic.sheetOrder + 1 : 1;
    }

    const newQuestion = new PracticeQuestion({
      title,
      description,
      difficulty,
      source,
      sourceUrl,
      topics: [sheetTopic],
      solution,
      testCases,
      hints,
      sheet,
      sheetTopic,
      sheetOrder: newSheetOrder,
      isActive: true // Default to active for new questions
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a practice question (admin only)
const updateQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      source,
      sourceUrl,
      topics,
      solution,
      testCases,
      hints,
      isActive,
      sheet,
      sheetTopic,
      sheetOrder
    } = req.body;

    const question = await PracticeQuestion.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        difficulty,
        source,
        sourceUrl,
        topics,
        solution,
        testCases,
        hints,
        isActive,
        sheet,
        sheetTopic,
        sheetOrder
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a practice question (admin only)
const deleteQuestion = async (req, res) => {
  try {
    const question = await PracticeQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Fetch question details from external source
const fetchQuestionDetails = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    };

    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response;
    try {
      response = await axios.get(url, { 
        headers,
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      const $ = cheerio.load(response.data);
      let title = '';
      let description = '';
      let difficulty = 'Medium'; // Default difficulty
      let topic = ''; // Default topic

      // Example for LeetCode - adjust selectors as needed for other platforms
      if (url.includes('leetcode.com')) {
        title = $('meta[property="og:title"]').attr('content') || $('title').text().split(' -')[0].trim();
        const descriptionMeta = $('meta[name="description"]').attr('content');
        if (descriptionMeta) {
          description = descriptionMeta.substring(0, 500) + '...'; // Truncate description
        }

        const difficultyText = $('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard').text();
        if (difficultyText) {
          difficulty = difficultyText.trim();
        }

        // Attempt to extract topic from URL or breadcrumbs/tags if available
        const pathSegments = new URL(url).pathname.split('/').filter(segment => segment !== '');
        if (pathSegments.length >= 2 && pathSegments[0] === 'problems') {
          // For LeetCode, topic might be inferred from tags or categories on the page
          // This is a placeholder; more robust parsing might be needed
          topic = 'Algorithm'; // Default or try to extract from page content
        }

      } else if (url.includes('geeksforgeeks.org')) {
        title = $('.content span.ctitle, h1.content-title').text().trim() || $('title').text().split(' - ')[0].trim();
        description = $('meta[name="description"]').attr('content') || $('.entry-content p').first().text().trim();
        if (description.length > 500) description = description.substring(0, 500) + '...';

        // Attempt to get difficulty from GFG if available
        const difficultyElement = $('.difficulty').text();
        if (difficultyElement) {
          if (difficultyElement.includes('Easy')) difficulty = 'Easy';
          else if (difficultyElement.includes('Medium')) difficulty = 'Medium';
          else if (difficultyElement.includes('Hard')) difficulty = 'Hard';
        }

        // Attempt to get topic from GFG if available (e.g., from breadcrumbs or tags)
        const topicElement = $('.breadcrumb a').last().text().trim();
        if (topicElement && topicElement !== title) {
          topic = topicElement;
        } else {
          topic = 'Data Structures'; // Default
        }
      }

      res.status(200).json({
        title,
        description,
        difficulty,
        topic
      });

    } catch (err) {
      console.error('Error fetching question details:', err);
      let errorMessage = 'Failed to fetch question details';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          errorMessage = 'Access Denied: The website blocked our request. Try manually entering details.';
        } else if (err.response.status === 404) {
          errorMessage = 'Page not found: The URL might be incorrect or the page no longer exists.';
        } else {
          errorMessage = `Error ${err.response.status}: ${err.response.statusText || 'Unknown Error'}`;
        }
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. The website took too long to respond.';
      }
      res.status(err.response?.status || 500).json({ message: errorMessage, error: err.message });
    }
  } catch (error) {
    console.error('Unhandled error in fetchQuestionDetails:', error);
    res.status(500).json({ message: 'Server Error in fetchQuestionDetails' });
  }
};

module.exports = {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  fetchQuestionDetails,
  markQuestionComplete,
  getCompletedQuestions,
  unmarkQuestionComplete
}; 