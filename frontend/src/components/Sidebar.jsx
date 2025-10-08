"use client";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
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

const ThemeToggleButton = ({ isDark, onToggle }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    onToggle();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 600);
  };

  return (
    <motion.button
      type="button"
      className="relative rounded-full bg-neutral-200 dark:bg-neutral-700 p-2 transition-all duration-300 overflow-hidden"
      onClick={handleToggle}
      whileHover={{ rotate: isDark ? -15 : 180 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fill animation on press */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isPressed ? 3 : 0,
          opacity: isPressed ? [0, 0.3, 0] : 0
        }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-neutral-800 dark:bg-neutral-200 rounded-full"
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-5 h-5 text-neutral-700 dark:text-neutral-200 relative z-10"
      >
        <clipPath id="theme-toggle-clip">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-clip)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </motion.button>
  );
};

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

const SidebarEnhanced = ({ admin = false }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
      label: "AI Recommendations",
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
    console.log("View profile clicked", user);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div
      className="fixed left-0 top-0 h-screen z-40"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody 
          className="justify-between gap-10 bg-neutral-50 dark:bg-neutral-950 h-full shadow-lg dark:shadow-2xl dark:shadow-black/50"
        >
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <div className="z-20 flex items-center justify-between py-1 text-sm font-normal">
            <div className="flex-shrink-0">
              <img
                src={isDark ? logoDark : logo}
                alt="Logo"
                className="w-9 h-9 rounded-full shadow-sm object-cover"
              />
            </div>
            <div className="ml-2">
              <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-4 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap",
                    isActive &&
                      "bg-neutral-200 dark:bg-neutral-800 font-medium"
                  )
                }
              >
                <span className="text-neutral-700 dark:text-neutral-300 flex-shrink-0">
                  {link.icon}
                </span>
                {open && <span className="ml-2">{link.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <NavLink
            to={admin ? "/admin/settings" : "/user/settings"}
            className={({ isActive }) =>
              cn(
                "flex items-center py-2 px-4 rounded text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap",
                isActive && "bg-neutral-200 dark:bg-neutral-800 font-medium"
              )
            }
          >
            <Settings size={18} className="flex-shrink-0" />
            {open && <span className="ml-2">Settings</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left py-2 px-4 rounded text-red-600 dark:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {open && <span className="ml-2">Logout</span>}
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
  );
};

export default SidebarEnhanced;