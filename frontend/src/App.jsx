import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import Progress from './pages/User/Progress';
import WeeklyTest from './pages/User/WeeklyTest';
import AIRecommendations from './pages/User/AIRecommendations';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageTopics from './pages/Admin/ManageTopics';
import ManageTests from './pages/Admin/ManageTests';
import ManageUsers from './pages/Admin/ManageUsers';
import UserAnalytics from './pages/Admin/UserAnalytics';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Toaster } from 'sonner';
import Topics from './pages/User/Topics';
import PracticeQuestions from './pages/User/PracticeQuestions';
import ManagePracticeQuestions from './pages/Admin/ManagePracticeQuestions';

import VisualizerHome from './pages/User/VisualizerHome';
import BubbleSort from "@/components/sorting/BubbleSort";
import MergeSort from "./components/sorting/MergeSort";
import QuickSort from "./components/sorting/QuickSort";

import LinearSearch from "./components/searching/LinearSearch";
import BinarySearch from "./components/searching/BinarySearch";

// Create a simple NotFound component
const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded shadow-md">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you are looking for doesn't exist or has been moved.</p>
        <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go Home
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user" element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <Navbar />
                  <div className="p-4">
                    <Outlet />
                  </div>
                </div>
              </div>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="topics" element={<Topics />} />
              <Route path="progress" element={<Progress />} />
              <Route path="weekly-test" element={<WeeklyTest />} />
              <Route path="visualizer-home" element={<VisualizerHome />} />

              <Route path="bubble-sort" element={<BubbleSort />} />
              <Route path="merge-sort" element={<MergeSort />} />
              <Route path="quick-sort" element={<QuickSort />} />

              <Route path="linear-search" element={<LinearSearch />} />
              <Route path="binary-search" element={<BinarySearch />} />

              <Route path="ai-recommendations" element={<AIRecommendations />} />

              <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
            </Route>
          </Route>

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute admin={true} />}>
            <Route path="/admin" element={
              <div className="flex">
                <Sidebar admin={true} />
                <div className="flex-1">
                  <Navbar />
                  <div className="p-4">
                    <Outlet />
                  </div>
                </div>
              </div>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-topics" element={<ManageTopics />} />
              <Route path="practice-questions" element={<PracticeQuestions />} />
              <Route path="admintests" element={<ManagePracticeQuestions />} />
              <Route path="manage-tests" element={<ManageTests />} />
              <Route path="user-analytics" element={<UserAnalytics />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
