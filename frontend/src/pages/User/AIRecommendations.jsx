import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, MessageSquare, BookOpen, Plus, Send, User, Bot, Trash2, Copy, RefreshCw, Mic, Volume2, VolumeX } from 'lucide-react';
import chatService from '@/services/chatService';

// SpeechRecognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
}

const AIRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  
  const [audioPlayer, setAudioPlayer] = useState({
    player: null,
    messageId: null,
    isLoading: false,
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

  const commonTopics = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Hash Tables', 'Greedy', 'Backtracking'];
  const commonSkills = ['Problem Analysis', 'Time Complexity', 'Space Complexity', 'Implementation', 'Debugging', 'Pattern Recognition'];
  const indianLanguages = ['English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam'];

  const languageCodes = {
    'English': 'en-US', 'Hindi': 'hi-IN', 'Bengali': 'bn-IN', 'Telugu': 'te-IN', 
    'Marathi': 'mr-IN', 'Tamil': 'ta-IN', 'Gujarati': 'gu-IN', 'Kannada': 'kn-IN', 'Malayalam': 'ml-IN'
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);
  
  useEffect(() => {
    return () => {
      if (audioPlayer.player) {
        audioPlayer.player.pause();
        URL.revokeObjectURL(audioPlayer.player.src);
      }
    };
  }, [audioPlayer.player]);

  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setCurrentMessage(prev => prev + finalTranscript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
    } else {
      if (!recognition) return;
      recognition.lang = languageCodes[language] || 'en-US';
      recognition.start();
    }
    setIsListening(!isListening);
  };
  
  const toggleSpeak = async (message) => {
    if (audioPlayer.player && audioPlayer.messageId === message.id) {
      audioPlayer.player.pause();
      setAudioPlayer({ player: null, messageId: null, isLoading: false });
      return;
    }

    if (audioPlayer.player) {
      audioPlayer.player.pause();
    }

    try {
      setAudioPlayer({ player: null, messageId: message.id, isLoading: true });

      const audioUrl = await chatService.textToSpeech(message.content);
      const newPlayer = new Audio(audioUrl);

      const cleanup = () => {
        setAudioPlayer({ player: null, messageId: null, isLoading: false });
        URL.revokeObjectURL(audioUrl);
      };
      
      newPlayer.onended = cleanup;
      newPlayer.onerror = () => {
        console.error("Error playing audio.");
        cleanup();
      };

      newPlayer.play();
      setAudioPlayer({ player: newPlayer, messageId: message.id, isLoading: false });

    } catch (error) {
      setError('Failed to generate or play audio.');
      setAudioPlayer({ player: null, messageId: null, isLoading: false });
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const dbConversations = await chatService.getConversations();
        const transformedConversations = dbConversations.map(conv => ({
          id: conv._id, title: conv.title, messages: [],
          lastMessageAt: conv.lastMessageAt, createdAt: conv.createdAt
        }));
        setConversations(transformedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      }
    };
    loadConversations();
  }, []);

  const createNewConversation = () => {
    const newConv = { id: `temp_${Date.now()}`, title: 'New Chat', messages: [] };
    setConversations([newConv, ...conversations]);
    setCurrentConvId(newConv.id);
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const result = await chatService.getConversationMessages(conversationId);
      if (result) {
        const transformedMessages = result.messages.map(msg => ({
          id: msg._id, type: msg.type, content: msg.content, timestamp: new Date(msg.timestamp)
        }));
        updateConversationState(conversationId, { messages: transformedMessages });
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const selectConversation = (conversationId) => {
    setCurrentConvId(conversationId);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv && conv.messages.length === 0 && !conv.id.startsWith('temp_')) {
      loadConversationMessages(conversationId);
    }
  };

  const getCurrentConv = () => conversations.find(c => c.id === currentConvId);

  const updateConversationState = (convId, updates) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, ...updates } : c))
    );
  };
  
  const formatText = (text) => {
    if (!text) return text;
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '');
        return ( <pre key={index} className="bg-black/10 dark:bg-white/10 p-3 rounded my-2 overflow-x-auto"><code className="text-xs font-mono">{code}</code></pre> );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return ( <code key={index} className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code> );
      }
      const lines = part.split('\n');
      return (
        <React.Fragment key={index}>
          {lines.map((line, lineIndex) => {
            if (line.trim().match(/^[-*•]\s/)) {
              const content = line.replace(/^[-*•]\s/, '');
              return ( <div key={lineIndex} className="flex gap-2 my-1"><span>•</span><span>{processInlineFormatting(content)}</span></div> );
            }
            if (line.trim().match(/^\d+\.\s/)) {
              return ( <div key={lineIndex} className="my-1">{processInlineFormatting(line)}</div> );
            }
            if (line.trim().startsWith('#')) {
              const level = line.match(/^#+/)[0].length;
              const content = line.replace(/^#+\s*/, '');
              const fontSize = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm';
              return ( <div key={lineIndex} className={`font-bold ${fontSize} mt-3 mb-1`}>{processInlineFormatting(content)}</div> );
            }
            return lineIndex < lines.length - 1 ? ( <React.Fragment key={lineIndex}>{processInlineFormatting(line)}<br /></React.Fragment> ) : ( processInlineFormatting(line) );
          })}
        </React.Fragment>
      );
    });
  };

  const processInlineFormatting = (text) => {
    if (!text) return text;
    const parts = [];
    let currentIndex = 0;
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > currentIndex) { parts.push(text.slice(currentIndex, match.index)); }
      const matched = match[0];
      if (matched.startsWith('**') && matched.endsWith('**')) {
        parts.push( <strong key={match.index} className="font-semibold">{matched.slice(2, -2)}</strong> );
      } else if (matched.startsWith('*') && matched.endsWith('*')) {
        parts.push( <em key={match.index} className="italic">{matched.slice(1, -1)}</em> );
      }
      currentIndex = regex.lastIndex;
    }
    if (currentIndex < text.length) { parts.push(text.slice(currentIndex)); }
    return parts.length > 0 ? parts : text;
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    const messageToSend = currentMessage;
    setCurrentMessage('');
    let activeConvId = currentConvId;
    if (!activeConvId) {
        const tempId = `temp_${Date.now()}`;
        const newConv = { id: tempId, title: 'New Chat', messages: [] };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConvId(tempId);
        activeConvId = tempId;
    }
    const userMsg = { id: Date.now().toString(), type: 'user', content: messageToSend, timestamp: new Date() };
    setConversations(prev => prev.map(c => c.id === activeConvId ? {
        ...c,
        messages: [...c.messages, userMsg],
        title: c.messages.length === 0 ? (messageToSend.substring(0, 40) + (messageToSend.length > 40 ? '...' : '')) : c.title
    } : c));
    setLoading(true);
    setIsTyping(true);
    setError('');

    try {
      const currentConv = conversations.find(c => c.id === activeConvId);
      const conversationHistory = currentConv?.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })) || [];
      const result = await chatService.sendMessage(
        messageToSend, conversationHistory, userProfile,
        activeConvId.startsWith('temp_') ? null : activeConvId,
        language
      );

      if (result) {
        const aiMsg = { 
          id: result.messageId || (Date.now() + 1).toString(), 
          type: 'assistant', 
          content: result.answer, 
          timestamp: new Date() 
        };
        const finalConvId = result.conversationId || activeConvId;
        if (finalConvId !== activeConvId) {
            setCurrentConvId(finalConvId);
        }
        setConversations(prev => prev.map(c => c.id === activeConvId || c.id === finalConvId ? {
            ...c, id: finalConvId, messages: [...c.messages, aiMsg]
        } : c));
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
  
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const clearConv = () => { if (currentConvId) { updateConversationState(currentConvId, { messages: [] }); } };
  const deleteConv = async (id) => {
    try {
      if (!id.startsWith('temp_')) { await chatService.deleteConversation(id); }
      setConversations(conversations.filter(c => c.id !== id));
      if (currentConvId === id) setCurrentConvId(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };
  const copyMessage = (content) => { navigator.clipboard.writeText(content); };
  const regenerateResponse = async () => { /* This function's logic was not provided */ };
  
  const handleGetRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
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
      setUserProfile(prev => ({ ...prev, [field]: [...prev[field], value] }));
    }
  };
  
  const removeFromProfile = (field, index) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const renderConversation = () => {
    const conv = getCurrentConv();
    const lastMessage = conv?.messages[conv.messages.length - 1];
    const canRegenerate = lastMessage?.type === 'assistant' && !loading;

    return (
      <div className="flex h-[600px] border rounded-lg">
        <div className="w-1/4 border-r p-3 overflow-y-auto bg-muted/30">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">Conversations</h3>
            <Button size="icon" variant="ghost" onClick={createNewConversation} className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {conversations.map((c) => (
              <div key={c.id} className={`p-2 rounded cursor-pointer text-sm transition-colors relative group ${ c.id === currentConvId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted' }`} onClick={() => selectConversation(c.id)}>
                <p className="truncate pr-8">{c.title}</p>
                <Button size="icon" variant="ghost" className="h-6 w-6 p-0 absolute top-1/2 right-1 -translate-y-1/2 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteConv(c.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-background">
          <div className="border-b p-3 flex justify-between items-center">
            <h3 className="font-semibold text-sm">{conv?.title || 'Select a conversation'}</h3>
             <div className="flex items-center gap-4">
               <Select value={language} onValueChange={setLanguage}>
                 <SelectTrigger className="w-[120px] h-7 text-xs"><SelectValue /></SelectTrigger>
                 <SelectContent>
                   {indianLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                 </SelectContent>
               </Select>
              {conv && conv.messages.length > 0 && ( <Button variant="outline" size="sm" onClick={clearConv} className="h-7 text-xs"><Trash2 className="h-3 w-3 mr-1" />Clear</Button> )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!conv && (
              <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm mb-3">Select a chat or start a new one</p>
                <Button size="sm" onClick={createNewConversation}>New Chat</Button>
              </div>
            )}
            {conv?.messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'assistant' && <Bot className="h-5 w-5 mt-2 flex-shrink-0" />}
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${ msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted' }`}>
                  <div className="break-words">{formatText(msg.content)}</div>
                   <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                     <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                     <button className="p-1 hover:opacity-100 opacity-70" onClick={() => copyMessage(msg.content)}><Copy className="h-3 w-3" /></button>
                     {msg.type === 'assistant' && (
                       <button className="p-1 hover:opacity-100 opacity-70" onClick={() => toggleSpeak(msg)} disabled={audioPlayer.isLoading && audioPlayer.messageId === msg.id}>
                         { audioPlayer.messageId === msg.id ? 
                            (audioPlayer.isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <VolumeX className="h-3.5 w-3.5 text-blue-500" />) :
                            <Volume2 className="h-3.5 w-3.5" />
                         }
                       </button>
                     )}
                   </div>
                </div>
                {msg.type === 'user' && <User className="h-5 w-5 mt-2 flex-shrink-0" />}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3 justify-start">
                  <Bot className="h-5 w-5 mt-2 flex-shrink-0" />
                  <div className="bg-muted rounded-lg p-3 flex items-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {canRegenerate && (
            <div className='px-4 pb-2 flex justify-center'>
                <Button variant="outline" size="sm" onClick={regenerateResponse} disabled={loading}><RefreshCw className="h-3 w-3 mr-2" /> Regenerate</Button>
            </div>
          )}
          <div className="border-t p-3">
            <div className="relative flex items-center gap-2">
              <Textarea
                placeholder="Ask about DSA... (Enter to send, Shift+Enter for new line)"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                className="resize-none pr-24 py-3 text-sm"
                disabled={loading || !currentConvId}
              />
              <div className="absolute right-2 bottom-1.5 flex items-center">
                {recognition && (
                  <Button onClick={toggleListening} variant="ghost" size="icon" className={`h-8 w-8 ${isListening ? 'text-red-500' : ''}`} disabled={loading || !currentConvId}>
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={sendMessage} disabled={loading || !currentMessage.trim()} size="icon" className="h-8 w-8">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">AI DSA Assistant</h1>
          <p className="text-muted-foreground">Your context-aware DSA learning companion</p>
        </div>
        
        {error && ( <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert> )}
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-2" />Chat</TabsTrigger>
            <TabsTrigger value="recommendations"><Brain className="h-4 w-4 mr-2" />Recommendations</TabsTrigger>
            <TabsTrigger value="explanations"><BookOpen className="h-4 w-4 mr-2" />Explain</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <Card><CardContent className="p-0">{renderConversation()}</CardContent></Card>
          </TabsContent>
          <TabsContent value="recommendations">
             <Card>
               <CardHeader><CardTitle>Personalized Recommendations</CardTitle><CardDescription>Get tailored learning suggestions based on your profile.</CardDescription></CardHeader>
               <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                 <div className="space-y-2"><Label>Your Level</Label><Select value={userProfile.level} onValueChange={(v) => setUserProfile({...userProfile, level: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                 <div className="space-y-2"><Label>Learning Topics</Label><Select onValueChange={(v) => addToProfile('topics', v)}><SelectTrigger><SelectValue placeholder="Add topics you are studying" /></SelectTrigger><SelectContent>{commonTopics.filter(t => !userProfile.topics.includes(t)).map(t => ( <SelectItem key={t} value={t}>{t}</SelectItem> ))}</SelectContent></Select><div className="flex flex-wrap gap-2 pt-2">{userProfile.topics.map((t, i) => ( <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFromProfile('topics', i)}>{t} &times;</Badge> ))}</div></div>
                 <div className="space-y-2"><Label>Strengths</Label><Select onValueChange={(v) => addToProfile('strengths', v)}><SelectTrigger><SelectValue placeholder="Add your strengths" /></SelectTrigger><SelectContent>{commonSkills.filter(s => !userProfile.strengths.includes(s) && !userProfile.weaknesses.includes(s)).map(s => ( <SelectItem key={s} value={s}>{s}</SelectItem> ))}</SelectContent></Select><div className="flex flex-wrap gap-2 pt-2">{userProfile.strengths.map((s, i) => ( <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeFromProfile('strengths', i)}>{s} &times;</Badge> ))}</div></div>
                 <div className="space-y-2"><Label>Areas to Improve</Label><Select onValueChange={(v) => addToProfile('weaknesses', v)}><SelectTrigger><SelectValue placeholder="Add areas for improvement" /></SelectTrigger><SelectContent>{commonSkills.filter(s => !userProfile.weaknesses.includes(s) && !userProfile.strengths.includes(s)).map(s => ( <SelectItem key={s} value={s}>{s}</SelectItem> ))}</SelectContent></Select><div className="flex flex-wrap gap-2 pt-2">{userProfile.weaknesses.map((w, i) => ( <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => removeFromProfile('weaknesses', i)}>{w} &times;</Badge> ))}</div></div>
                 <Button onClick={handleGetRecommendations} disabled={loading} className="w-full">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Get Recommendations</Button>
                 {recommendations && ( <Card className="bg-muted/50"><CardHeader><CardTitle>Your Learning Plan</CardTitle></CardHeader><CardContent className="text-sm">{formatText(recommendations)}</CardContent></Card> )}
               </CardContent>
             </Card>
           </TabsContent>
           <TabsContent value="explanations">
             <Card>
               <CardHeader><CardTitle>Quick Algorithm Explanation</CardTitle><CardDescription>Get an instant explanation tailored to your skill level.</CardDescription></CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2"><Label htmlFor="algorithm-input">Algorithm</Label><Input id="algorithm-input" placeholder="e.g., Quick Sort" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} /></div>
                   <div className="space-y-2"><Label>Level</Label><Select value={level} onValueChange={setLevel}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                 </div>
                 <Button onClick={handleExplainAlgorithm} disabled={loading || !algorithm.trim()} className="w-full">{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Explain Algorithm</Button>
                 {explanation && ( <Card className="bg-muted/50"><CardHeader><CardTitle>{algorithm}</CardTitle></CardHeader><CardContent className="text-sm">{formatText(explanation)}</CardContent></Card> )}
               </CardContent>
             </Card>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIRecommendations;