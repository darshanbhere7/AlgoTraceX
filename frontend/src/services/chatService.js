import { API_BASE_URL } from '@/config/api';

// Get auth token from localStorage
const getAuthToken = () => {
  // Make sure the key matches what you use to store the token
  return localStorage.getItem('token'); 
};

// Chat conversation service
export const chatService = {
  // Get all conversations for the current user
  async getConversations() {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ai/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      return data.success ? data.conversations : [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  async getConversationMessages(conversationId) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation messages');
      }

      const data = await response.json();
      return data.success ? { messages: data.messages, conversation: data.conversation } : null;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw error;
    }
  },

  // Send a message and get AI response, now including language
  async sendMessage(message, conversationHistory = [], userProfile = {}, conversationId = null, language = 'English') {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ai/ask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          conversationHistory,
          userProfile,
          conversationId,
          language 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      return data.success ? {
        answer: data.answer,
        conversationId: data.conversationId,
        messageId: data.messageId
      } : null;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // **UPDATED** to call the backend proxy
  async textToSpeech(text, lang) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ai/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, lang }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audio stream from server');
      }
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error) {
      console.error('Error fetching text-to-speech audio:', error);
      throw error;
    }
  },

  // **NEW FUNCTION FOR RECOMMENDATIONS**
  async getRecommendations(userProfile) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLevel: userProfile.level,
          currentTopics: userProfile.topics.join(', '),
          strengths: userProfile.strengths.join(', '),
          weaknesses: userProfile.weaknesses.join(', ')
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }
      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // **NEW FUNCTION FOR EXPLANATIONS**
  async explainAlgorithm(algorithm, level) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, level }),
      });
      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }
      const data = await response.json();
      return data.explanation;
    } catch (error) {
      console.error('Error getting explanation:', error);
      throw error;
    }
  },

  // Delete a conversation
  async deleteConversation(conversationId) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Update conversation title
  async updateConversationTitle(conversationId, title) {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}/title`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversation title');
      }

      const data = await response.json();
      return data.success ? data.conversation : null;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }
};

export default chatService;