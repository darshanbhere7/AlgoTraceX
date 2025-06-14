import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, MessageSquare, BookOpen, Plus, Send, User, Bot, Trash2, Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Enhanced conversation state with localStorage
  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem('aiConversations');
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      // Convert string timestamps back to Date objects
      return parsedConversations.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
    return [];
  });
  const [currentConversationId, setCurrentConversationId] = useState(() => {
    const savedCurrentId = localStorage.getItem('currentConversationId');
    return savedCurrentId || null;
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // User profile for recommendations with localStorage
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('aiUserProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      userLevel: 'beginner',
      currentTopics: [],
      strengths: [],
      weaknesses: [],
      learningGoals: []
    };
  });
  const [recommendations, setRecommendations] = useState('');

  // Algorithm explanation state
  const [algorithm, setAlgorithm] = useState('');
  const [level, setLevel] = useState('beginner');
  const [explanation, setExplanation] = useState('');

  // Common options
  const commonTopics = [
    'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs',
    'Dynamic Programming', 'Sorting', 'Searching', 'Hash Tables',
    'Greedy Algorithms', 'Backtracking', 'Bit Manipulation', 'Recursion',
    'Divide and Conquer', 'Sliding Window', 'Two Pointers'
  ];

  const commonSkills = [
    'Problem Analysis', 'Time Complexity', 'Space Complexity',
    'Implementation', 'Debugging', 'Pattern Recognition',
    'Mathematical Thinking', 'Code Optimization', 'Edge Cases',
    'Testing', 'Code Readability', 'Algorithm Design'
  ];

  const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aiConversations', JSON.stringify(conversations));
  }, [conversations]);

  // Save current conversation ID to localStorage
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
    } else {
      localStorage.removeItem('currentConversationId');
    }
  }, [currentConversationId]);

  // Save user profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aiUserProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  // Create new conversation
  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      userContext: { ...userProfile }
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
  };

  // Get current conversation
  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId);
  };

  // Update conversation
  const updateConversation = (updates) => {
    setConversations(conversations.map(conv => 
      conv.id === currentConversationId ? { ...conv, ...updates } : conv
    ));
  };

  // Enhanced message sending with context awareness
  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const conversation = getCurrentConversation();
    if (!conversation) {
      createNewConversation();
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    // Add user message immediately
    const updatedMessages = [...conversation.messages, userMessage];
    updateConversation({ messages: updatedMessages });

    // Update conversation title if it's the first message
    if (conversation.messages.length === 0) {
      const title = currentMessage.length > 30 
        ? currentMessage.substring(0, 30) + '...' 
        : currentMessage;
      updateConversation({ title });
    }

    setCurrentMessage('');
    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
      // Enhanced context building
      const contextData = {
        question: currentMessage,
        conversationHistory: conversation.messages.slice(-10), // Last 10 messages for context
        userProfile: conversation.userContext,
        messageType: detectMessageType(currentMessage),
        previousContext: conversation.messages.length > 0 ? 
          conversation.messages[conversation.messages.length - 2]?.content : null
      };

      const response = await axios.post(`${API_BASE_URL}/ai/ask`, contextData);

      if (response.data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.data.answer,
          timestamp: new Date(),
          metadata: {
            responseType: response.data.responseType,
            confidence: response.data.confidence,
            suggestedFollowups: response.data.suggestedFollowups || []
          }
        };

        const finalMessages = [...updatedMessages, aiMessage];
        updateConversation({ messages: finalMessages });
      } else {
        setError('Failed to get response from AI');
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Detect message type for better context
  const detectMessageType = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      return 'explanation';
    } else if (lowerMessage.includes('how to') || lowerMessage.includes('implement')) {
      return 'howto';
    } else if (lowerMessage.includes('example') || lowerMessage.includes('show me')) {
      return 'example';
    } else if (lowerMessage.includes('more') || lowerMessage.includes('elaborate')) {
      return 'followup';
    } else if (lowerMessage.includes('short') || lowerMessage.includes('brief')) {
      return 'concise';
    } else if (lowerMessage.includes('detailed') || lowerMessage.includes('comprehensive')) {
      return 'detailed';
    } else if (lowerMessage.includes('code') || lowerMessage.includes('implementation')) {
      return 'code';
    }
    return 'general';
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Clear conversation
  const clearConversation = () => {
    if (currentConversationId) {
      updateConversation({ messages: [] });
    }
  };

  // Delete conversation
  const deleteConversation = (conversationId) => {
    setConversations(conversations.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  };

  // Copy message content
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Regenerate response
  const regenerateResponse = async (messageIndex) => {
    const conversation = getCurrentConversation();
    if (!conversation || messageIndex < 1) return;

    const userMessage = conversation.messages[messageIndex - 1];
    const messages = conversation.messages.slice(0, messageIndex);
    
    updateConversation({ messages });
    
    setLoading(true);
    setIsTyping(true);

    try {
      const contextData = {
        question: userMessage.content,
        conversationHistory: messages.slice(-10),
        userProfile: conversation.userContext,
        messageType: detectMessageType(userMessage.content),
        regenerate: true
      };

      const response = await axios.post(`${API_BASE_URL}/ai/ask`, contextData);

      if (response.data.success) {
        const aiMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: response.data.answer,
          timestamp: new Date(),
          metadata: {
            responseType: response.data.responseType,
            confidence: response.data.confidence,
            suggestedFollowups: response.data.suggestedFollowups || []
          }
        };

        updateConversation({ messages: [...messages, aiMessage] });
      }
    } catch (err) {
      setError('Failed to regenerate response');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Follow-up question handler
  const askFollowUp = (question) => {
    setCurrentMessage(question);
  };

  // Enhanced recommendations
  const handleGetRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/recommendations`, {
        ...userProfile,
        strengths: userProfile.strengths.join(', '),
        weaknesses: userProfile.weaknesses.join(', '),
        learningGoals: userProfile.learningGoals.join(', ')
      });

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Algorithm explanation
  const handleExplainAlgorithm = async () => {
    if (!algorithm.trim()) {
      setError('Please enter an algorithm name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/explain`, {
        algorithm,
        level
      });

      if (response.data.success) {
        setExplanation(response.data.explanation);
      } else {
        setError('Failed to get explanation');
      }
    } catch (err) {
      setError('Failed to get explanation');
    } finally {
      setLoading(false);
    }
  };

  // Profile management helpers
  const addToProfile = (field, value) => {
    if (value && !userProfile[field].includes(value)) {
      setUserProfile({
        ...userProfile,
        [field]: [...userProfile[field], value]
      });
    }
  };

  const removeFromProfile = (field, index) => {
    setUserProfile({
      ...userProfile,
      [field]: userProfile[field].filter((_, i) => i !== index)
    });
  };

  // Add state for custom inputs
  const [showCustomTopic, setShowCustomTopic] = useState(false);
  const [showCustomStrength, setShowCustomStrength] = useState(false);
  const [showCustomWeakness, setShowCustomWeakness] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customStrength, setCustomStrength] = useState('');
  const [customWeakness, setCustomWeakness] = useState('');

  // Handle custom inputs
  const handleAddCustomTopic = () => {
    if (customTopic.trim()) {
      addToProfile('currentTopics', customTopic);
      setCustomTopic('');
      setShowCustomTopic(false);
    }
  };

  const handleAddCustomStrength = () => {
    if (customStrength.trim()) {
      setUserProfile({
        ...userProfile,
        strengths: [...userProfile.strengths, customStrength]
      });
      setCustomStrength('');
      setShowCustomStrength(false);
    }
  };

  const handleAddCustomWeakness = () => {
    if (customWeakness.trim()) {
      setUserProfile({
        ...userProfile,
        weaknesses: [...userProfile.weaknesses, customWeakness]
      });
      setCustomWeakness('');
      setShowCustomWeakness(false);
    }
  };

  // Add clear all function
  const clearAll = (field) => {
    setUserProfile({
      ...userProfile,
      [field]: []
    });
  };

  // Add new styles for better content handling
  const messageContentStyles = {
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    maxWidth: '100%'
  };

  // Update the message rendering to handle markdown and prevent overflow
  const renderMessageContent = (content) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert" style={messageContentStyles}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            code: ({ children }) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>
            ),
            pre: ({ children }) => (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
            ),
            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Add clear all data function
  const clearAllData = () => {
    localStorage.removeItem('aiConversations');
    localStorage.removeItem('currentConversationId');
    localStorage.removeItem('aiUserProfile');
    setConversations([]);
    setCurrentConversationId(null);
    setUserProfile({
      userLevel: 'beginner',
      currentTopics: [],
      strengths: [],
      weaknesses: [],
      learningGoals: []
    });
  };

  // Update the conversation rendering
  const renderConversation = () => {
    const conversation = getCurrentConversation();

    return (
      <div className="flex h-[700px] overflow-hidden">
        {/* Conversation Sidebar */}
        <div className="w-1/4 border-r bg-muted/30 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Conversations</h3>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={createNewConversation}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {conversations.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearAllData}
                  className="h-8 text-xs"
                >
                  Clear All Data
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  conv.id === currentConversationId 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
                onClick={() => setCurrentConversationId(conv.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conv.title}</p>
                    <p className="text-xs opacity-70">
                      {conv.messages.length} messages
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b p-4 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div>
              <h3 className="font-semibold">
                {conversation?.title || 'Start a new conversation'}
              </h3>
              {conversation && (
                <p className="text-sm text-muted-foreground">
                  {conversation.messages.length} messages
                </p>
              )}
            </div>
            {conversation && conversation.messages.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearConversation}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!conversation && (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a new conversation to begin chatting with the AI assistant</p>
                <Button className="mt-4" onClick={createNewConversation}>
                  New Conversation
                </Button>
              </div>
            )}

            {conversation?.messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {renderMessageContent(message.content)}
                      
                      {/* Message actions */}
                      <div className="flex items-center gap-2 mt-3 text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {message.type === 'assistant' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => regenerateResponse(index + 1)}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Suggested follow-ups */}
                      {message.type === 'assistant' && message.metadata?.suggestedFollowups && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.metadata.suggestedFollowups.map((followup, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => askFollowUp(followup)}
                            >
                              {followup}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask anything about DSA... (Press Enter to send, Shift+Enter for new line)"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={2}
                className="resize-none"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !currentMessage.trim()}
                size="icon"
                className="h-auto"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => askFollowUp("Explain this in simple terms")}
              >
                Simplify
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => askFollowUp("Show me code examples")}
              >
                Show Code
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => askFollowUp("Give me practice problems")}
              >
                Practice
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => askFollowUp("Tell me more about this")}
              >
                More Details
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update the recommendations rendering
  const renderRecommendations = () => (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Personalized Recommendations
        </CardTitle>
        <CardDescription>
          Create your personalized DSA learning profile to get tailored recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto max-h-[700px]">
        {/* Level Selection */}
        <div className="space-y-2">
          <Label>Your Current Level</Label>
          <Select 
            value={userProfile.userLevel} 
            onValueChange={(value) => setUserProfile({...userProfile, userLevel: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner - Just starting with DSA</SelectItem>
              <SelectItem value="intermediate">Intermediate - Comfortable with basics</SelectItem>
              <SelectItem value="advanced">Advanced - Ready for complex problems</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Focus */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Current Learning Focus</Label>
            {userProfile.currentTopics.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAll('currentTopics')}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Select 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomTopic(true);
                } else {
                  addToProfile('currentTopics', value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select current focus areas" />
              </SelectTrigger>
              <SelectContent>
                {commonTopics.filter(topic => !userProfile.currentTopics.includes(topic))
                  .map((topic) => (
                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                ))}
                <SelectItem value="custom">Add Custom Topic</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCustomTopic(!showCustomTopic)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showCustomTopic && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter your custom topic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
              <Button onClick={handleAddCustomTopic}>Add</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCustomTopic(false);
                  setCustomTopic('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {userProfile.currentTopics.map((topic, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => removeFromProfile('currentTopics', index)}
              >
                {topic} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Your Strengths</Label>
            {userProfile.strengths.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAll('strengths')}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Select 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomStrength(true);
                } else {
                  addToProfile('strengths', value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add your strengths" />
              </SelectTrigger>
              <SelectContent>
                {commonSkills.filter(skill => !userProfile.strengths.includes(skill))
                  .map((skill) => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
                <SelectItem value="custom">Add Custom Strength</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCustomStrength(!showCustomStrength)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showCustomStrength && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter your custom strength"
                value={customStrength}
                onChange={(e) => setCustomStrength(e.target.value)}
              />
              <Button onClick={handleAddCustomStrength}>Add</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCustomStrength(false);
                  setCustomStrength('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {userProfile.strengths.map((strength, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => removeFromProfile('strengths', index)}
              >
                {strength} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Areas to Improve</Label>
            {userProfile.weaknesses.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAll('weaknesses')}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Select 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomWeakness(true);
                } else {
                  addToProfile('weaknesses', value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add areas to improve" />
              </SelectTrigger>
              <SelectContent>
                {commonSkills.filter(skill => !userProfile.weaknesses.includes(skill))
                  .map((skill) => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
                <SelectItem value="custom">Add Custom Area</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCustomWeakness(!showCustomWeakness)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showCustomWeakness && (
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Enter your custom area to improve"
                value={customWeakness}
                onChange={(e) => setCustomWeakness(e.target.value)}
              />
              <Button onClick={handleAddCustomWeakness}>Add</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCustomWeakness(false);
                  setCustomWeakness('');
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {userProfile.weaknesses.map((weakness, index) => (
              <Badge 
                key={index} 
                variant="destructive"
                className="cursor-pointer hover:bg-destructive/90"
                onClick={() => removeFromProfile('weaknesses', index)}
              >
                {weakness} ×
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleGetRecommendations} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get Personalized Recommendations
        </Button>

        {recommendations && (
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Learning Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {recommendations}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI DSA Learning Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your intelligent companion for mastering Data Structures & Algorithms
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Smart Chat
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Personalized Recommendations
            </TabsTrigger>
            <TabsTrigger value="explanations" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quick Explain
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Intelligent DSA Assistant</CardTitle>
                <CardDescription>
                  Have natural conversations about algorithms and data structures. 
                  The AI remembers context and adapts to your learning style.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {renderConversation()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations">
            {renderRecommendations()}
          </TabsContent>
          
          <TabsContent value="explanations">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick Algorithm Explanations
                </CardTitle>
                <CardDescription>
                  Get instant explanations for any algorithm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 overflow-y-auto max-h-[700px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Algorithm Name</Label>
                    <Input
                      placeholder="e.g., Quick Sort, Dijkstra's Algorithm"
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Explanation Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - High level overview</SelectItem>
                        <SelectItem value="intermediate">Intermediate - With examples</SelectItem>
                        <SelectItem value="advanced">Advanced - Detailed analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleExplainAlgorithm} 
                  disabled={loading || !algorithm.trim()}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Explain Algorithm
                </Button>

                {explanation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{algorithm} - {level} level</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
                            ),
                            a: ({ href, children }) => (
                              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {explanation}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIRecommendations;