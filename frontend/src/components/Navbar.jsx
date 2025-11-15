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

      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        className="w-5 h-5 text-neutral-700 dark:text-neutral-200 relative z-10"
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        ) : (
          <g>
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </g>
        )}
      </motion.svg>
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent transition-colors duration-300 px-8 py-4">
      <div className="w-full max-w-5xl mx-auto backdrop-blur-md bg-white/30 dark:bg-neutral-900/30 rounded-full shadow-sm dark:shadow-black/40 px-5 py-2.5 transition-all duration-300 border border-white/20 dark:border-neutral-800/40">
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
            <button className="md:hidden p-2 rounded-full hover:bg-white/20 dark:hover:bg-neutral-800/60 transition-colors">
              <svg
                className="w-5 h-5 text-neutral-800 dark:text-neutral-200"
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