import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, MessageSquare, BookOpen, Send, User, Bot, Trash2, Copy, RefreshCw, Mic, MicOff, Languages, Volume2, VolumeX } from 'lucide-react';
import chatService from '@/services/chatService';

// SpeechRecognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

// **NEW: Helper function to remove markdown for TTS**
const stripMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold: **text** -> text
    .replace(/\*(.*?)\*/g, '$1')     // Italic: *text* -> text
    .replace(/```[\s\S]*?```/g, ' (code block) ') // Code blocks
    .replace(/`([^`]+)`/g, '$1')   // Inline code: `text` -> text
    .replace(/^\s*#+\s*(.*)/gm, '$1') // Headers: # text -> text
    .replace(/^\s*[-*•]\s*/gm, '')  // List bullets
    .replace(/^\s*\d+\.\s*/gm, '') // Numbered lists
    .replace(/[\[\]\(].*?[\]\)]/g, '') // Links [text](url)
    .replace(/[\*_`#]/g, '');     // Remove any remaining markdown chars
};


const AIRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef(null);

  // State for reliable audio playback
  const [audioPlayer, setAudioPlayer] = useState({
    player: null,
    messageId: null,
  });

  const [userProfile, setUserProfile] = useState({
    level: 'beginner',
    topics: [],
    strengths: [],
    weaknesses: []
  });
  const [recommendations, setRecommendations] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [level, setLevel] = useState('beginner');
  const [explanation, setExplanation] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  const commonTopics = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Hash Tables', 'Greedy', 'Backtracking'];
  const commonSkills = ['Problem Analysis', 'Time Complexity', 'Space Complexity', 'Implementation', 'Debugging', 'Pattern Recognition'];

  const languageOptions = [
    { label: 'English', value: 'English', speechCode: 'en-US' },
    { label: 'Hindi', value: 'Hindi', speechCode: 'hi-IN' },
    { label: 'Marathi', value: 'Marathi', speechCode: 'mr-IN' },
    { label: 'Telugu', value: 'Telugu', speechCode: 'te-IN' },
    { label: 'Bengali', value: 'Bengali', speechCode: 'bn-IN' },
    { label: 'Tamil', value: 'Tamil', speechCode: 'ta-IN' },
    { label: 'Gujarati', value: 'Gujarati', speechCode: 'gu-IN' },
    { label: 'Kannada', value: 'Kannada', speechCode: 'kn-IN' },
    { label: 'Malayalam', value: 'Malayalam', speechCode: 'ml-IN' }
  ];

  const getSpeechLangCode = (language) => {
    const option = languageOptions.find((opt) => opt.value === language);
    return option?.speechCode || 'en-US';
  };

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.lang = getSpeechLangCode(value);
    }
  };

  const handleMicClick = () => {
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      return;
    }

    if (typeof window === 'undefined') {
      setError('Speech recognition is not available in this environment.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLangCode(selectedLanguage);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error !== 'no-speech') {
        setError('Speech recognition error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      speechRecognitionRef.current = null;
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim();
      if (transcript) {
        setCurrentMessage((prev) => (prev ? `${prev.trim()} ${transcript}`.trim() : transcript));
      }
    };

    speechRecognitionRef.current = recognition;
    recognition.start();
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
  };

  const subtleScale = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Effect to clean up the audio player
  useEffect(() => {
    return () => {
      if (audioPlayer.player) {
        audioPlayer.player.pause();
      }
    };
  }, [audioPlayer.player]);

  // **UPDATED toggleSpeak function to use the backend proxy**
  const toggleSpeak = async (message) => {
    if (audioPlayer.player && audioPlayer.messageId === message.id) {
      audioPlayer.player.pause();
      setAudioPlayer({ player: null, messageId: null });
      return;
    }

    if (audioPlayer.player) {
      audioPlayer.player.pause();
    }

    try {
      const langCode = getSpeechLangCode(selectedLanguage)?.split('-')[0] || 'en';
      
      // **FIX: Clean markdown from text before sending to TTS**
      const cleanText = stripMarkdown(message.content);
      
      // Split text into chunks to avoid hitting any URL length limits
      const chunks = cleanText.match(/[\s\S]{1,200}/g) || [];
      let currentChunk = 0;
      let players = []; // Store all audio players to manage them

      const playNextChunk = () => {
        if (currentChunk >= chunks.length) {
          setAudioPlayer({ player: null, messageId: null });
          return;
        }

        const playCurrentChunk = async () => {
          const audioUrl = await chatService.textToSpeech(chunks[currentChunk], langCode);
          const newPlayer = new Audio(audioUrl);
          players[currentChunk] = newPlayer;

          newPlayer.onended = () => {
            URL.revokeObjectURL(audioUrl); // Clean up memory
            currentChunk++;
            playNextChunk();
          };

          newPlayer.onerror = () => {
            console.error("Error playing audio chunk.");
            setError("Could not play audio.");
            setAudioPlayer({ player: null, messageId: null });
          };
          
          newPlayer.play();
          setAudioPlayer({ player: newPlayer, messageId: message.id });
        };
        
        playCurrentChunk();
      };
      
      playNextChunk();

    } catch (error) {
      setError('Failed to generate or play audio.');
      setAudioPlayer({ player: null, messageId: null });
    }
  };

  // Load conversations from database on component mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const dbConversations = await chatService.getConversations();
        // Transform database conversations to match frontend format
        const transformedConversations = dbConversations.map(conv => ({
          id: conv._id,
          title: conv.title,
          messages: [], // Messages will be loaded separately when conversation is selected
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt
        }));
        setConversations(transformedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        // If there's an error, start with empty conversations
        setConversations([]);
      }
    };

    loadConversations();
  }, []);

  const createNewConversation = (initialTitle = 'New Chat') => {
    const newConv = { id: `temp_${Date.now()}`, title: initialTitle, messages: [] };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
    return newConv;
  };

  // Load messages for a conversation when it's selected
  const loadConversationMessages = async (conversationId) => {
    try {
      const result = await chatService.getConversationMessages(conversationId);
      if (result) {
        const transformedMessages = result.messages.map(msg => ({
          id: msg._id,
          type: msg.type,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        
        // Update the conversation with loaded messages
        updateConversationState(conversationId, { messages: transformedMessages });
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  // Handle conversation selection
  const selectConversation = (conversationId) => {
    setCurrentConvId(conversationId);
    const conv = conversations.find(c => c.id === conversationId);
    
    // If conversation has no messages loaded, load them
    if (conv && conv.messages.length === 0 && !conv.id.startsWith('temp_')) {
      loadConversationMessages(conversationId);
    }
  };

  const getCurrentConv = () => conversations.find(c => c.id === currentConvId);

  const ensureActiveConversation = () => {
    const existing = getCurrentConv();
    if (existing) return existing;
    return createNewConversation();
  };

  // Handle new chat button click
  const handleNewChat = () => {
    // Clear the current message input
    setCurrentMessage('');
    // Create a new conversation
    createNewConversation('New Chat');
  };

  // A single function to update conversations in state
  const updateConversationState = (convId, updates) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, ...updates } : c))
    );
  };

  // Format text with markdown-like syntax
  const formatText = (text) => {
    if (!text) return text;
    
    // Split by code blocks first to preserve them
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/);
    
    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith('```')) {
        const code = part.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '');
        return (
          <pre key={index} className="bg-black/10 dark:bg-white/10 p-3 rounded my-2 overflow-x-auto">
            <code className="text-xs font-mono">{code}</code>
          </pre>
        );
      }
      
      // Handle inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      
      // Handle regular text with bold, italic, and lists
      const lines = part.split('\n');
      return (
        <React.Fragment key={index}>
          {lines.map((line, lineIndex) => {
            // Handle bullet points
            if (line.trim().match(/^[-*•]\s/)) {
              const content = line.replace(/^[-*•]\s/, '');
              return (
                <div key={lineIndex} className="flex gap-2 my-1">
                  <span>•</span>
                  <span>{processInlineFormatting(content)}</span>
                </div>
              );
            }
            
            // Handle numbered lists
            if (line.trim().match(/^\d+\.\s/)) {
              return (
                <div key={lineIndex} className="my-1">
                  {processInlineFormatting(line)}
                </div>
              );
            }
            
            // Handle headers
            if (line.trim().startsWith('#')) {
              const level = line.match(/^#+/)[0].length;
              const content = line.replace(/^#+\s*/, '');
              const fontSize = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm';
              return (
                <div key={lineIndex} className={`font-bold ${fontSize} mt-3 mb-1`}>
                  {processInlineFormatting(content)}
                </div>
              );
            }
            
            // Regular line
            return lineIndex < lines.length - 1 ? (
              <React.Fragment key={lineIndex}>
                {processInlineFormatting(line)}
                <br />
              </React.Fragment>
            ) : (
              processInlineFormatting(line)
            );
          })}
        </React.Fragment>
      );
    });
  };

  const processInlineFormatting = (text) => {
    if (!text) return text;
    
    const parts = [];
    let currentIndex = 0;
    
    // Regex to match **bold**, *italic*, or plain text
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }
      
      const matched = match[0];
      if (matched.startsWith('**') && matched.endsWith('**')) {
        // Bold text
        parts.push(
          <strong key={match.index} className="font-semibold">
            {matched.slice(2, -2)}
          </strong>
        );
      } else if (matched.startsWith('*') && matched.endsWith('*')) {
        // Italic text
        parts.push(
          <em key={match.index} className="italic">
            {matched.slice(1, -1)}
          </em>
        );
      }
      
      currentIndex = regex.lastIndex;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // REFINED: sendMessage logic is now cleaner and more robust with database persistence
  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const messageToSend = currentMessage;
    setCurrentMessage(''); // Clear input immediately for better UX

    let activeConv = ensureActiveConversation();
    let activeConvId = activeConv.id;

    // Add user message to UI immediately
    const userMsg = { id: Date.now().toString(), type: 'user', content: messageToSend, timestamp: new Date() };
    const updatedMessages = [...activeConv.messages, userMsg];
    const newTitle = activeConv.messages.length === 0 ? (messageToSend.substring(0, 40) + (messageToSend.length > 40 ? '...' : '')) : activeConv.title;
    updateConversationState(activeConvId, { messages: updatedMessages, title: newTitle });

    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
      // Prepare context for the API: all messages *before* the new one
      const conversationHistory = activeConv.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Use chat service to send message
      const result = await chatService.sendMessage(
        messageToSend,
        conversationHistory,
        userProfile,
        activeConvId.startsWith('temp_') ? null : activeConvId, // Only send conversationId if it's from database
        selectedLanguage
      );

      if (result) {
        const aiMsg = { 
          id: result.messageId || (Date.now() + 1).toString(), 
          type: 'assistant', 
          content: result.answer, 
          timestamp: new Date() 
        };
        
        // Update conversation with new conversationId if it was created
        if (result.conversationId && activeConvId.startsWith('temp_')) {
          const updatedConv = { ...activeConv, id: result.conversationId };
          setConversations(prev => prev.map(c => c.id === activeConvId ? updatedConv : c));
          setCurrentConvId(result.conversationId);
        }
        
        updateConversationState(result.conversationId || activeConvId, { 
          messages: [...updatedMessages, aiMsg] 
        });
      } else {
        setError('Failed to get response');
      }
    } catch (err) {
      setError(`Failed to connect to server: ${err.message}`);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputFocus = () => {
    ensureActiveConversation();
  };

  const clearConv = () => {
    if (currentConvId) {
      updateConversationState(currentConvId, { messages: [] });
    }
  };

  const deleteConv = async (id) => {
    try {
      // If it's a database conversation, delete it from the database
      if (!id.startsWith('temp_')) {
        await chatService.deleteConversation(id);
      }
      
      // Remove from local state
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConvId === id) setCurrentConvId(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };
  
  // REFINED: regenerateResponse logic is simplified
  const regenerateResponse = async () => {
    const conv = getCurrentConv();
    if (!conv || conv.messages.length < 1) return;

    // Find the last user message to resubmit
    const lastUserMessageIndex = conv.messages.findLastIndex(m => m.type === 'user');
    if (lastUserMessageIndex === -1) return;

    const messagesToResubmit = conv.messages.slice(0, lastUserMessageIndex + 1);
    const lastUserMessage = messagesToResubmit[lastUserMessageIndex];
    
    // Update UI to show only the history being resubmitted
    updateConversationState(conv.id, { messages: messagesToResubmit });

    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
        const conversationHistory = messagesToResubmit.slice(0, -1).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        // **Calling chatService directly now**
        const result = await chatService.sendMessage(
            lastUserMessage.content,
            conversationHistory,
            userProfile,
            conv.id.startsWith('temp_') ? null : conv.id,
            selectedLanguage
        );

        if (result) {
            const aiMsg = { 
              id: result.messageId || Date.now().toString(), 
              type: 'assistant', 
              content: result.answer, 
              timestamp: new Date() 
            };
            updateConversationState(conv.id, { messages: [...messagesToResubmit, aiMsg] });
        } else {
            setError('Failed to regenerate response');
        }
    } catch (err) {
        setError(`Failed to regenerate: ${err.message}`);
    } finally {
        setLoading(false);
        setIsTyping(false);
    }
  };


  const handleGetRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      // **Using chatService now**
      const result = await chatService.getRecommendations(userProfile);
      setRecommendations(result);
    } catch (err) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainAlgorithm = async () => {
    if (!algorithm.trim()) {
      setError('Please enter an algorithm name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // **Using chatService now**
      const result = await chatService.explainAlgorithm(algorithm, level);
      setExplanation(result);
    } catch (err) {
      setError(err.message || 'Failed to get explanation');
    } finally {
      setLoading(false);
    }
  };

  const addToProfile = (field, value) => {
    if (value && !userProfile[field].includes(value)) {
      setUserProfile({ ...userProfile, [field]: [...userProfile[field], value] });
    }
  };

  const removeFromProfile = (field, index) => {
    setUserProfile({ ...userProfile, [field]: userProfile[field].filter((_, i) => i !== index) });
  };
  
  const GlowButton = ({ children, className = '', fullWidth = true, type = 'button', ...props }) => {
    const widthClasses = fullWidth ? 'w-full px-5 py-3' : 'px-3 py-2';
    return (
      <button
        type={type}
        {...props}
        className={`
          relative group overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500
          hover:from-indigo-400 hover:via-purple-400 hover:to-blue-400 text-white font-semibold shadow-lg
          transition-all duration-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          disabled:opacity-60 disabled:cursor-not-allowed
          ${!props.disabled ? 'hover:-translate-y-0.5' : ''}
          ${widthClasses}
          ${className}
        `}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </button>
    );
  };

  const renderConversation = () => {
    const conv = getCurrentConv();
    const lastMessage = conv?.messages[conv.messages.length - 1];
    const canRegenerate = lastMessage?.type === 'assistant' && !loading;

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={subtleScale}
        transition={{ duration: 0.4 }}
        className="flex h-[620px] border rounded-2xl overflow-hidden bg-background/70"
      >
        <div className="w-full md:w-1/4 border-r flex flex-col bg-muted/20">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs tracking-[0.2em] uppercase text-muted-foreground">Chats</h3>
              <span className="text-[11px] text-muted-foreground">auto</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-2">
            <div className="space-y-2">
              {conversations.map((c, index) => (
                <motion.div
                  key={c.id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`p-3 rounded-lg cursor-pointer text-sm transition-all border ${
                    c.id === currentConvId ? 'bg-background border-border shadow-sm' : 'hover:bg-muted/60 border-transparent'
                  }`}
                  onClick={() => selectConversation(c.id)}
                >
                  <div className="flex justify-between items-center gap-3">
                    <p className="truncate">{c.title}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => { e.stopPropagation(); deleteConv(c.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-muted-foreground">Start typing to spin up a new chat.</p>
              )}
            </div>
          </div>
          <div className="border-t p-4">
            <Button
              variant="outline"
              onClick={handleNewChat}
              className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted/60"
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-background">
          <div className="border-b px-4 py-3 flex justify-between items-center">
            <h3 className="font-semibold text-sm">{conv?.title || 'Your assistant is ready'}</h3>
            {conv && conv.messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearConv} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <Trash2 className="h-3 w-3 mr-2" />Clear
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-secondary/10">
            {!conv && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.35 }}
                className="text-center text-muted-foreground h-full flex flex-col justify-center items-center gap-3"
              >
                <div className="rounded-full border border-dashed w-16 h-16 flex items-center justify-center">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-semibold">Hello👋</p>
                  <p className="text-sm">Ask anything about DSA to start a fresh chat.</p>
                </div>
              </motion.div>
            )}
            {conv?.messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'assistant' && <Bot className="h-5 w-5 mt-2 flex-shrink-0 text-muted-foreground" />}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border ${
                  msg.type === 'user' ? 'bg-background border-border shadow-sm' : 'bg-muted border-transparent'
                }`}>
                  <div className="break-words leading-relaxed">{formatText(msg.content)}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button className="p-1 hover:text-foreground transition-colors" onClick={() => copyMessage(msg.content)}>
                      <Copy className="h-3 w-3" />
                    </button>
                    {/* **FIX: Re-added the TTS button with correct styling** */}
                    {msg.type === 'assistant' && (
                      <button className="p-1 hover:text-foreground transition-colors" onClick={() => toggleSpeak(msg)}>
                        { audioPlayer.messageId === msg.id ? <VolumeX className="h-3.5 w-3.5 text-blue-500" /> : <Volume2 className="h-3.5 w-3.5" /> }
                      </button>
                    )}
                  </div>
                </div>
                {msg.type === 'user' && <User className="h-5 w-5 mt-2 flex-shrink-0 text-muted-foreground" />}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 justify-start"
              >
                <Bot className="h-5 w-5 mt-2 flex-shrink-0 text-muted-foreground" />
                <div className="bg-muted rounded-2xl px-4 py-3 flex items-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {canRegenerate && (
            <div className="px-4 pb-3 flex justify-center">
              <Button variant="ghost" size="sm" onClick={regenerateResponse} disabled={loading} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3 w-3 mr-2" /> Regenerate
              </Button>
            </div>
          )}
          <div className="border-t p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <Languages className="h-3.5 w-3.5" />
                <span>Language</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40 text-sm h-9">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Textarea
                placeholder="Ask about DSA... (Enter to send, Shift+Enter for new line)"
                value={currentMessage}
                // **THIS IS THE FIX**
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleInputFocus}
                rows={1}
                className="resize-none pr-28 py-3 text-sm bg-background border-muted focus-visible:ring-0 focus-visible:border-foreground"
                disabled={loading}
              />
              <div className="absolute right-2 bottom-2 flex gap-2">
                <Button
                  variant={isListening ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleMicClick}
                  disabled={loading}
                  className="h-9 w-9 rounded-full border border-border"
                  aria-pressed={isListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  onClick={sendMessage}
                  disabled={loading || !currentMessage.trim()}
                  size="icon"
                  className="h-9 w-9 border border-border rounded-full text-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <motion.div className="pt-24 pb-12 px-4 md:px-8 lg:px-12" initial="hidden" animate="visible" variants={subtleScale} transition={{ duration: 0.4 }}>
      <motion.div className="max-w-6xl mx-auto space-y-6" initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.4 }}>
        <motion.div className="text-center space-y-2" initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.3 }}>
          <h1 className="text-3xl font-bold tracking-tight">AlgoBot AI Assitant</h1>
          <p className="text-muted-foreground">Your context-aware DSA learning companion</p>
        </motion.div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/40 p-1 rounded-xl">
            <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" />Chat</TabsTrigger>
            <TabsTrigger value="recommendations"><Brain className="h-4 w-4 mr-2" />Recommendations</TabsTrigger>
            <TabsTrigger value="explanations"><BookOpen className="h-4 w-4 mr-2" />Explain</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <Card className="border-muted">
              <CardContent className="p-0">{renderConversation()}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recommendations">
             <Card className="border-muted pt-5 pb-5">
               <CardHeader>
                 <CardTitle>Personalized Recommendations</CardTitle>
                 <CardDescription>Get tailored learning suggestions based on your profile.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                 <div className="space-y-2">
                   <Label>Your Level</Label>
                   <Select value={userProfile.level} onValueChange={(v) => setUserProfile({...userProfile, level: v})}>
                     <SelectTrigger><SelectValue /></SelectTrigger>
                     <SelectContent>
                       <SelectItem value="beginner">Beginner</SelectItem>
                       <SelectItem value="intermediate">Intermediate</SelectItem>
                       <SelectItem value="advanced">Advanced</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Learning Topics</Label>
                   <Select onValueChange={(v) => addToProfile('topics', v)}>
                     <SelectTrigger><SelectValue placeholder="Add topics you are studying" /></SelectTrigger>
                     <SelectContent>
                       {commonTopics.filter(t => !userProfile.topics.includes(t)).map(t => (
                         <SelectItem key={t} value={t}>{t}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {userProfile.topics.map((t, i) => (
                       <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFromProfile('topics', i)}>{t} &times;</Badge>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Strengths</Label>
                   <Select onValueChange={(v) => addToProfile('strengths', v)}>
                     <SelectTrigger><SelectValue placeholder="Add your strengths" /></SelectTrigger>
                     <SelectContent>
                       {commonSkills.filter(s => !userProfile.strengths.includes(s) && !userProfile.weaknesses.includes(s)).map(s => (
                         <SelectItem key={s} value={s}>{s}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {userProfile.strengths.map((s, i) => (
                       <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFromProfile('strengths', i)}>{s} &times;</Badge>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Areas to Improve</Label>
                   <Select onValueChange={(v) => addToProfile('weaknesses', v)}>
                     <SelectTrigger><SelectValue placeholder="Add areas for improvement" /></SelectTrigger>
                     <SelectContent>
                       {commonSkills.filter(s => !userProfile.weaknesses.includes(s) && !userProfile.strengths.includes(s)).map(s => (
                         <SelectItem key={s} value={s}>{s}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <div className="flex flex-wrap gap-2 pt-2">
                     {userProfile.weaknesses.map((w, i) => (
                       <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => removeFromProfile('weaknesses', i)}>{w} &times;</Badge>
                     ))}
                   </div>
                 </div>
                 <Button
                   onClick={handleGetRecommendations}
                   disabled={loading}
                   variant="ghost"
                   className="w-full border border-border text-foreground hover:bg-muted"
                 >
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Get Recommendations
                 </Button>
                 {recommendations && (
                   <Card className="bg-muted/30 border-none">
                     <CardHeader><CardTitle>Your Learning Plan</CardTitle></CardHeader>
                     <CardContent className="text-sm">{formatText(recommendations)}</CardContent>
                   </Card>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
           <TabsContent value="explanations">
             <Card className="border-muted pt-5 pb-5">
               <CardHeader><CardTitle>Quick Algorithm Explanation</CardTitle><CardDescription>Get an instant explanation tailored to your skill level.</CardDescription></CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2"><Label htmlFor="algorithm-input">Algorithm</Label><Input id="algorithm-input" placeholder="e.g., Quick Sort" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} /></div>
                   <div className="space-y-2"><Label>Level</Label><Select value={level} onValueChange={setLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                 </div>
                 <Button
                   onClick={handleExplainAlgorithm}
                   disabled={loading || !algorithm.trim()}
                   variant="ghost"
                   className="w-full border border-border text-foreground hover:bg-muted"
                 >
                   {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Explain Algorithm
                 </Button>
                 {explanation && (
                   <Card className="bg-muted/30 border-none">
                     <CardHeader><CardTitle>{algorithm}</CardTitle></CardHeader>
                     <CardContent className="text-sm">{formatText(explanation)}</CardContent>
                   </Card>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
          </Tabs>
      </motion.div>
      </motion.div>
    </div>
  );
};

export default AIRecommendations;