import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ admin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  // If auth is still loading, show a loading state
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires admin but user is not admin, redirect to user dashboard
  if (admin && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  // If authenticated and passes role check, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;