import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext.jsx";
import logoDark from "../../assets/logo_dark.png";
import logo from "../../assets/logo.png";

const LandingNavbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-b border-white/20 dark:border-neutral-800/30 shadow-sm"
          : "bg-transparent backdrop-blur-none border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/home" className="flex items-center gap-2.5 group">
            <img
              src={isDark ? logoDark : logo}
              alt="Algo Trace X"
              className="w-7 h-7 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className={`font-medium text-base tracking-tight transition-colors duration-300 ${
                isScrolled
                  ? "text-gray-900 dark:text-white"
                  : isDark
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              AlgoTraceX
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { id: "features", label: "Features" },
              { id: "how-it-works", label: "How It Works" },
              { id: "pricing", label: "Pricing" },
              { id: "team", label: "Team" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-normal tracking-tight transition-colors duration-300 relative group ${
                  isScrolled
                    ? "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    : isDark
                    ? "text-white/90 hover:text-white"
                    : "text-gray-900/90 hover:text-gray-900"
                }`}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isScrolled
                  ? "bg-white/80 dark:bg-neutral-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-800 backdrop-blur-sm"
                  : isDark
                  ? "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  : "bg-gray-900/10 text-gray-900 hover:bg-gray-900/20 backdrop-blur-sm"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 1020.354 15.354z"
                  />
                </svg>
              )}
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isScrolled
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    : isDark
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;

