import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const WeeklyTest = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetchWeeklyTest = async () => {
      try {
        const response = await axios.get('/api/test/weekly');
        setTestData(response.data);
      } catch (error) {
        console.error('Failed to fetch weekly test', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyTest();
  }, []);

  const handleStartTest = () => {
    setStarted(true);
  };

  if (loading) {
    return <p>Loading Weekly Test...</p>;
  }

  if (!testData) {
    return <p>No weekly test available at the moment.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Weekly Test</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Test Details</h2>
          <p>{testData.description}</p>

          {!started ? (
            <Button onClick={handleStartTest} className="mt-4">
              Start Test
            </Button>
          ) : (
            <p className="mt-4 text-green-500">Test Started!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyTest;
