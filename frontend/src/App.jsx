import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/User/Dashboard';
import Progress from './pages/User/Progress';
// import Visualizer from './pages/User/Visualizer';
// import CodeView from './pages/User/CodeView';
// import WeeklyTest from './pages/User/WeeklyTest';
// import AIRecommendations from './pages/User/AIRecommendations';
// import AdminDashboard from './pages/Admin/AdminDashboard';
// import ManageTopics from './pages/Admin/ManageTopics';
// import ManageTests from './pages/Admin/ManageTests';
// import UserAnalytics from './pages/Admin/UserAnalytics';
// import ManageUsers from './pages/Admin/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Create a simple NotFound component since it's not imported
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
              <Route path="progress" element={<Progress />} />
              {/* Uncomment these routes when the components are ready */}
              {/* <Route path="visualizer" element={<Visualizer />} /> */}
              {/* <Route path="code-view" element={<CodeView />} /> */}
              {/* <Route path="weekly-test" element={<WeeklyTest />} /> */}
              {/* <Route path="ai-recommendations" element={<AIRecommendations />} /> */}
              
              {/* Redirect to dashboard for any unmatched user paths */}
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
              {/* Uncomment these routes when the components are ready */}
              {/* <Route path="dashboard" element={<AdminDashboard />} /> */}
              {/* <Route path="manage-topics" element={<ManageTopics />} /> */}
              {/* <Route path="manage-tests" element={<ManageTests />} /> */}
              {/* <Route path="user-analytics" element={<UserAnalytics />} /> */}
              {/* <Route path="manage-users" element={<ManageUsers />} /> */}
              
              {/* Temporary dashboard for admin - replace with actual component when ready */}
              <Route path="dashboard" element={
                <div className="p-6 bg-white rounded shadow">
                  <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                  <p>Admin functionality is under development.</p>
                </div>
              } />
              
              {/* Redirect to admin dashboard for any unmatched admin paths */}
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