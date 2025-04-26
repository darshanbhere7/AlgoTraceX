import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';

const UserAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('/api/admin/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <p>Loading user analytics...</p>;
  }

  if (!analytics) {
    return <p>No analytics data available.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">User Analytics</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Overall Usage Stats</h2>
          <div className="flex justify-between">
            <div>
              <p className="font-medium">Total Users:</p>
              <p>{analytics.totalUsers}</p>
            </div>
            <div>
              <p className="font-medium">Active Users:</p>
              <p>{analytics.activeUsers}</p>
            </div>
            <div>
              <p className="font-medium">Tests Taken:</p>
              <p>{analytics.totalTestsTaken}</p>
            </div>
            <div>
              <p className="font-medium">Average Score:</p>
              <p>{analytics.averageScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;
