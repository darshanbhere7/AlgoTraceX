import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings } from 'lucide-react';

const Sidebar = ({ admin = false }) => {
  const { user, logout } = useAuth();
  
  const userLinks = [
    { to: '/user/dashboard', label: 'Dashboard' },
    { to: '/user/visualizer', label: 'Algorithm Visualizer' },
    { to: '/user/code-view', label: 'Code View' },
    { to: '/user/weekly-test', label: 'Weekly Tests' },
    { to: '/user/progress', label: 'Progress' },
    { to: '/user/ai-recommendations', label: 'AI Recommendations' }
  ];
  
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard' },
    { to: '/admin/manage-topics', label: 'Manage Topics' },
    { to: '/admin/manage-tests', label: 'Manage Tests' },
    { to: '/admin/user-analytics', label: 'User Analytics' },
    { to: '/admin/manage-users', label: 'Manage Users' }
  ];
  
  const links = admin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    // Redirect will likely be handled by the AuthContext's logout function
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">
          {admin ? 'Admin Panel' : 'DSA Learning'}
        </h2>
        <div className="mb-6 p-3 bg-gray-700 rounded">
          <p className="text-sm">Logged in as:</p>
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <p className="mt-1 text-xs bg-blue-500 inline-block px-2 py-1 rounded">
            {user?.role}
          </p>
        </div>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to} 
                className={({ isActive }) => 
                  `block py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to={admin ? '/admin/settings' : '/user/settings'} 
              className={({ isActive }) => 
                `flex items-center py-2 px-4 rounded hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              <Settings size={16} className="mr-2" />
              Settings
            </NavLink>
          </li>
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full text-left py-2 px-4 rounded hover:bg-gray-700 text-red-400"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;