import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import AlgoTraceXLanding from './pages/Home.jsx';
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
import CodeView from './pages/User/CodeView';
import ManagePracticeQuestions from './pages/Admin/ManagePracticeQuestions';

import VisualizerHome from './pages/User/VisualizerHome';
import Profile from './pages/User/Profile';
import BubbleSort from "@/components/sorting/BubbleSort";
import MergeSort from "./components/sorting/MergeSort";
import QuickSort from "./components/sorting/QuickSort";
import HeapSort from './components/sorting/HeapSort';
import InsertionSort from './components/sorting/InsertionSort';
import SelectionSort from './components/sorting/SelectionSort';

import LinearSearch from "./components/searching/LinearSearch";
import BinarySearch from "./components/searching/BinarySearch";
import JumpSearch from './components/searching/JumpSearch';
import InterpolationSearch from './components/searching/InterpolationSearch';

import BinaryTree from './components/trees/BinaryTree';
import BinarySearchTree from './components/trees/BinarySearchTree';
import AVLTree from './components/trees/AVLTree';
import RedBlackTree from './components/trees/RedBlackTree';
import HeapTree from './components/trees/HeapTree';

import ArrayVisualizer from "./components/linear/Array";
import LinkedList from './components/linear/LinkedList';
import Stack from './components/linear/Stack';
import DoublyLinkedList from './components/linear/DoublyLinkedList';
import Queue from './components/linear/Queue';
import VisualizerRoute from './components/VisualizerRoute';

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
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="home" element={<AlgoTraceXLanding />} />

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
              <Route path="profile" element={<Profile />} />
              <Route path="topics" element={<Topics />} />
              <Route path="progress" element={<Progress />} />
              <Route path="weekly-test" element={<WeeklyTest />} />
              <Route path="visualizer-home" element={<VisualizerHome />} />
              <Route path="practice-questions" element={<PracticeQuestions />} />
              <Route path="code-view" element={<CodeView />} />

              <Route path="bubble-sort" element={
                <VisualizerRoute>
                  <BubbleSort />
                </VisualizerRoute>
              } />
              <Route path="merge-sort" element={
                <VisualizerRoute>
                  <MergeSort />
                </VisualizerRoute>
              } />
              <Route path="quick-sort" element={
                <VisualizerRoute>
                  <QuickSort />
                </VisualizerRoute>
              } />
              <Route path="heap-sort" element={
                <VisualizerRoute>
                  <HeapSort />
                </VisualizerRoute>
              } />
              <Route path="insertion-sort" element={
                <VisualizerRoute>
                  <InsertionSort />
                </VisualizerRoute>
              } />
              <Route path="selection-sort" element={
                <VisualizerRoute>
                  <SelectionSort />
                </VisualizerRoute>
              } />

              <Route path="linear-search" element={
                <VisualizerRoute>
                  <LinearSearch />
                </VisualizerRoute>
              } />
              <Route path="binary-search" element={
                <VisualizerRoute>
                  <BinarySearch />
                </VisualizerRoute>
              } />
              <Route path="jump-search" element={
                <VisualizerRoute>
                  <JumpSearch />
                </VisualizerRoute>
              } />
              <Route path="interpolation-search" element={
                <VisualizerRoute>
                  <InterpolationSearch />
                </VisualizerRoute>
              } />

              <Route path="binary-tree" element={
                <VisualizerRoute>
                  <BinaryTree />
                </VisualizerRoute>
              } />
              <Route path="bst" element={
                <VisualizerRoute>
                  <BinarySearchTree />
                </VisualizerRoute>
              } />
              <Route path="avl-tree" element={
                <VisualizerRoute>
                  <AVLTree />
                </VisualizerRoute>
              } />
              <Route path="rb-tree" element={
                <VisualizerRoute>
                  <RedBlackTree />
                </VisualizerRoute>
              } />
              <Route path="heap-tree" element={
                <VisualizerRoute>
                  <HeapTree />
                </VisualizerRoute>
              } />

              <Route path="array" element={
                <VisualizerRoute>
                  <ArrayVisualizer />
                </VisualizerRoute>
              } />
              <Route path="linked-list" element={
                <VisualizerRoute>
                  <LinkedList />
                </VisualizerRoute>
              } />
              <Route path="stack" element={
                <VisualizerRoute>
                  <Stack />
                </VisualizerRoute>
              } />
              <Route path="doubly-linked-list" element={
                <VisualizerRoute>
                  <DoublyLinkedList />
                </VisualizerRoute>
              } />
              <Route path="queue" element={
                <VisualizerRoute>
                  <Queue />
                </VisualizerRoute>
              } />

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
