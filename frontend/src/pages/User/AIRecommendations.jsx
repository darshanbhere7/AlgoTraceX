import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, MessageSquare, BookOpen } from 'lucide-react';

const AIRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Recommendations state
  const [userProfile, setUserProfile] = useState({
    userLevel: 'beginner',
    currentTopic: '',
    strengths: '',
    weaknesses: ''
  });
  const [recommendations, setRecommendations] = useState('');

  // Question state
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [answer, setAnswer] = useState('');

  // Algorithm explanation state
  const [algorithm, setAlgorithm] = useState('');
  const [level, setLevel] = useState('beginner');
  const [explanation, setExplanation] = useState('');

  const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/recommendations`, userProfile);
      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/ask`, {
        question,
        context
      });
      if (response.data.success) {
        setAnswer(response.data.answer);
      } else {
        setError('Failed to get answer');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get answer');
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
      setError(err.response?.data?.error || 'Failed to get explanation');
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendations = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Get Personalized DSA Recommendations
        </CardTitle>
        <CardDescription>
          Tell us about your current level and learning goals to get customized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userLevel">Your Level</Label>
            <Select 
              value={userProfile.userLevel} 
              onValueChange={(value) => setUserProfile({...userProfile, userLevel: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentTopic">Current Topic</Label>
            <Input
              id="currentTopic"
              placeholder="e.g., Binary Trees, Dynamic Programming"
              value={userProfile.currentTopic}
              onChange={(e) => setUserProfile({...userProfile, currentTopic: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="strengths">Your Strengths</Label>
          <Textarea
            id="strengths"
            placeholder="What DSA concepts are you good at?"
            value={userProfile.strengths}
            onChange={(e) => setUserProfile({...userProfile, strengths: e.target.value})}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weaknesses">Your Weaknesses</Label>
          <Textarea
            id="weaknesses"
            placeholder="What DSA concepts do you struggle with?"
            value={userProfile.weaknesses}
            onChange={(e) => setUserProfile({...userProfile, weaknesses: e.target.value})}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleGetRecommendations} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
        </Button>

        {recommendations && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Personalized Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{recommendations}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  const renderQuestionAnswer = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Ask DSA Questions
        </CardTitle>
        <CardDescription>
          Get detailed answers to your data structures and algorithms questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question">Your Question</Label>
          <Textarea
            id="question"
            placeholder="Ask any question about data structures and algorithms..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Context (Optional)</Label>
          <Textarea
            id="context"
            placeholder="Provide any additional context..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
          />
        </div>

        <Button 
          onClick={handleAskQuestion} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Getting Answer...' : 'Ask Question'}
        </Button>

        {answer && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  const renderAlgorithmExplanation = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Get Algorithm Explanations
        </CardTitle>
        <CardDescription>
          Get detailed explanations of algorithms tailored to your level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm Name</Label>
            <Input
              id="algorithm"
              placeholder="e.g., Quick Sort, Binary Search, Dijkstra"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Explanation Level</Label>
            <Select 
              value={level} 
              onValueChange={(value) => setLevel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select explanation level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleExplainAlgorithm} 
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Getting Explanation...' : 'Explain Algorithm'}
        </Button>

        {explanation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{explanation}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Assistant for DSA Learning
          </h1>
          <p className="text-lg text-gray-600">
            Your personalized companion for mastering Data Structures & Algorithms
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Ask Questions
            </TabsTrigger>
            <TabsTrigger value="explanations" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Algorithm Explanations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            {renderRecommendations()}
          </TabsContent>
          
          <TabsContent value="questions">
            {renderQuestionAnswer()}
          </TabsContent>
          
          <TabsContent value="explanations">
            {renderAlgorithmExplanation()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIRecommendations;