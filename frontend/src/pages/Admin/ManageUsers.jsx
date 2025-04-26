import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Fixed import path for Input
import { Card, CardContent } from '@/components/ui/card';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manage Users</h1>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Search Users</h2>
          <Input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Users</h2>
          {filteredUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul>
              {filteredUsers.map((user) => (
                <li key={user._id} className="flex justify-between items-center mb-2">
                  <span>{user.username}</span>
                  <Button onClick={() => handleDeleteUser(user._id)} variant="destructive">
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;