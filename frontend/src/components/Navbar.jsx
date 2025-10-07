import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from '../context/AuthContext';
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
      className="relative rounded-full bg-white dark:bg-neutral-800 p-2 transition-all duration-300 overflow-hidden"
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

const ScrollRevealLink = ({ href, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      className="relative overflow-hidden block h-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isHovered ? -24 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="text-neutral-700 dark:text-neutral-300 font-medium"
      >
        {children}
      </motion.div>
      <motion.div
        initial={{ y: 24 }}
        animate={{ y: isHovered ? 0 : 24 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute inset-0 text-neutral-700 dark:text-neutral-300 font-medium"
      >
        {children}
      </motion.div>
    </a>
  );
};

const UserProfile = ({ user, onViewProfile }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden bg-white dark:bg-neutral-800 rounded-full px-3 py-1.5 cursor-pointer border border-neutral-200 dark:border-neutral-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewProfile}
    >
      <div className="flex items-center space-x-2 h-8">
        <div className="w-8 h-8 bg-neutral-800 dark:bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white dark:text-neutral-800 text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>

        <div className="relative overflow-hidden h-6 w-24">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: isHovered ? -24 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap text-sm"
          >
            {user?.name || "User"}
          </motion.div>
          <motion.div
            initial={{ y: 24 }}
            animate={{ y: isHovered ? 0 : 24 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap flex items-center text-sm"
          >
            View Profile
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const Navbar = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const handleViewProfile = () => {
    console.log("View profile clicked", user);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="w-full bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300 px-8 py-4">
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-neutral-900 rounded-full shadow-md dark:shadow-xl dark:shadow-black/30 px-5 py-2.5 transition-all duration-300">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src={isDark ? logoDark : logo}
                alt="Logo"
                className="w-9 h-9 rounded-full shadow-sm object-cover"
              />
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <ScrollRevealLink href="#">Dashboard</ScrollRevealLink>
            <ScrollRevealLink href="#">Algorithms</ScrollRevealLink>
            <ScrollRevealLink href="#">Visualizations</ScrollRevealLink>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} />

            {/* User Info */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <UserProfile user={user} onViewProfile={handleViewProfile} />
              ) : (
                <span className="text-neutral-400 italic text-sm">Not logged in</span>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <svg
                className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;