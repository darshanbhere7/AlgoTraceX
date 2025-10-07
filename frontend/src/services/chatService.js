const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
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

  // Send a message and get AI response
  async sendMessage(message, conversationHistory = [], userProfile = {}, conversationId = null) {
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
          conversationId
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
