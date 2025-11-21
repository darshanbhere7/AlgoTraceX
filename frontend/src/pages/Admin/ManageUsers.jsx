import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. Please try again.');
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Set up polling for real-time updates
    const interval = setInterval(fetchUsers, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      toast.success(`User role updated to ${newRole}!`);
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading users...</div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-neutral-950">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Add padding-top to account for fixed navbar */}
      <div className="p-6 pt-24 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 mb-1">Admin</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white"
            />
          <motion.button 
            onClick={fetchUsers}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 transition-colors shadow-sm"
          >
            Refresh Users
          </motion.button>
          </div>
        </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
      <Card className="bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div 
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-sm"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-300' : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => handleToggleRole(user._id, user.role)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 shadow-sm"
                  >
                    {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteUser(user._id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded transition-colors bg-white dark:bg-neutral-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-300 dark:border-neutral-700 shadow-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>
      </div>
    </div>
  );
};

export default ManageUsers;