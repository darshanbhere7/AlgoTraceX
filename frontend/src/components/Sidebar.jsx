import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Zap,
  Code,
  TrendingUp,
  Layers,
  HelpCircle,
  Lightbulb,
  BarChart3,
  Edit3,
  CheckSquare,
  Users,
} from "lucide-react";
import { Sidebar, SidebarBody } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import logo from "../assets/logo.png";
import logoDark from "../assets/logo_dark.png";


const SidebarUserProfile = ({ user, onViewProfile, open }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!open) {
    return (
      <motion.div
        className="relative overflow-hidden bg-neutral-700 dark:bg-neutral-800 rounded-full w-10 h-10 cursor-pointer border border-neutral-600 dark:border-neutral-700 flex items-center justify-center flex-shrink-0"
        onClick={onViewProfile}
      >
        <span className="text-neutral-100 dark:text-neutral-300 text-sm font-semibold">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden bg-neutral-700 dark:bg-neutral-800 rounded-full px-3 py-1.5 cursor-pointer border border-neutral-600 dark:border-neutral-700 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewProfile}
    >
      <div className="flex items-center space-x-2 h-8">
        <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-neutral-800 dark:text-neutral-800 text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>

        <div className="relative overflow-hidden h-6 flex-1">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: isHovered ? -24 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-neutral-100 dark:text-neutral-300 font-medium whitespace-nowrap text-sm"
          >
            {user?.name || "User"}
          </motion.div>
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: isHovered ? 0 : 24 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 text-neutral-100 dark:text-neutral-300 font-medium whitespace-nowrap flex items-center text-sm"
          >
            View Profile
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const SidebarEnhanced = ({ admin = false, children }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const userLinks = [
    {
      to: "/user/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/visualizer-home",
      label: "DSA Visualizer",
      icon: <Zap className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/code-view",
      label: "Code View",
      icon: <Code className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/weekly-test",
      label: "Weekly Tests",
      icon: <CheckSquare className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/progress",
      label: "Progress",
      icon: <TrendingUp className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/topics",
      label: "Topics",
      icon: <Layers className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/practice-questions",
      label: "Practice Questions",
      icon: <HelpCircle className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/user/ai-recommendations",
      label: "AlgoBot AI",
      icon: <Lightbulb className="h-5 w-5 shrink-0" />,
    },
  ];

  const adminLinks = [
    {
      to: "/admin/dashboard",
      label: "Admin Dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/admin/manage-topics",
      label: "Manage Topics",
      icon: <Layers className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/admin/manage-tests",
      label: "Manage Tests",
      icon: <Edit3 className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/admin/user-analytics",
      label: "User Analytics",
      icon: <BarChart3 className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/admin/admintests",
      label: "Practice Questions",
      icon: <HelpCircle className="h-5 w-5 shrink-0" />,
    },
    {
      to: "/admin/manage-users",
      label: "Manage Users",
      icon: <Users className="h-5 w-5 shrink-0" />,
    },
  ];

  const links = admin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
  };

  const handleViewProfile = () => {
    if (admin) {
      navigate("/admin/dashboard");
      return;
    }
    navigate("/user/profile");
  };


  // Calculate sidebar width - collapsed: 72px, expanded: 200px (reduced for better space usage)
  const collapsedWidth = 72;
  const expandedWidth = 200;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 h-screen z-40"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody 
            className="justify-between gap-6 bg-neutral-50 dark:bg-neutral-950 h-full shadow-lg dark:shadow-2xl dark:shadow-black/50"
          >
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <div className="z-20 flex items-center justify-between py-1 text-sm font-normal">
                <div className="flex-shrink-0 relative">
                  <motion.img
                    src={isDark ? logoDark : logo}
                    alt="Logo"
                    className="w-9 h-9 rounded-full shadow-sm object-cover"
                    key={isDark ? 'dark' : 'light'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center py-1.5 px-3 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap min-h-[36px]",
                        isActive &&
                          "bg-neutral-200 dark:bg-neutral-800 font-medium"
                      )
                    }
                  >
                    <span className="text-neutral-700 dark:text-neutral-300 flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {link.icon}
                    </span>
                    <motion.span 
                      className="ml-2"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ 
                        opacity: open ? 1 : 0, 
                        width: open ? "auto" : 0 
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {link.label}
                    </motion.span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <NavLink
                to={admin ? "/admin/settings" : "/user/settings"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-1.5 px-3 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap min-h-[36px]",
                    isActive && "bg-neutral-200 dark:bg-neutral-800 font-medium"
                  )
                }
              >
                <Settings size={18} className="flex-shrink-0 w-5 h-5 flex items-center justify-center" />
                <motion.span 
                  className="ml-2"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: open ? 1 : 0, 
                    width: open ? "auto" : 0 
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  Settings
                </motion.span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left py-1.5 px-3 rounded text-red-600 dark:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap min-h-[36px]"
              >
                <LogOut size={18} className="flex-shrink-0 w-5 h-5 flex items-center justify-center" />
                <motion.span 
                  className="ml-2"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: open ? 1 : 0, 
                    width: open ? "auto" : 0 
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  Logout
                </motion.span>
              </button>

              <SidebarUserProfile
                user={user}
                onViewProfile={handleViewProfile}
                open={open}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Main content area with animated margin */}
      <motion.div
        className="flex-1 h-screen overflow-auto"
        animate={{
          marginLeft: open ? expandedWidth : collapsedWidth
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default SidebarEnhanced;