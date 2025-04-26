import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:5000/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Navigate to login page after successful registration
      navigate('/login');
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Update user progress
  const updateProgress = async (progressData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/user/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progress: progressData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update progress');
      }

      // Update user state with new progress
      setUser(prev => ({
        ...prev,
        progress: progressData
      }));

      return true;
    } catch (error) {
      console.error('Update progress error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProgress,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;