import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

// Button component with light sweep animation
const ButtonWithSweep = ({ children, to, variant = "primary", className = "" }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isPrimary = variant === "primary";

  return (
    <Link
      to={to}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl font-medium overflow-hidden transition-all duration-300 ${
        isPrimary
          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg hover:shadow-xl"
          : "bg-transparent text-gray-900 dark:text-white border-2 border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-600"
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Light sweep effect that follows mouse */}
      {isHovered && (
        <motion.div
          className={`absolute ${
            isPrimary
              ? "bg-white/20"
              : "bg-gray-900/10 dark:bg-white/10"
          }`}
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            filter: "blur(30px)",
            pointerEvents: "none",
            x: mousePosition.x - 100,
            y: mousePosition.y - 100,
          }}
          animate={{
            x: mousePosition.x - 100,
            y: mousePosition.y - 100,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {isPrimary && (
          <motion.svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </motion.svg>
        )}
      </span>
    </Link>
  );
};

export default function SplineSceneBasic() {
  return (
    <div className="relative w-full h-screen max-h-screen flex items-center justify-center pt-20 pb-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-900 overflow-hidden">
      <Card className="w-full max-w-7xl h-full max-h-[calc(100vh-5rem)] bg-white dark:bg-neutral-900 relative overflow-hidden border-0 shadow-none">
        {/* Spotlight effect using CSS - different for light/dark */}
        <div
          className="absolute -top-40 left-0 md:left-60 md:-top-20 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 30%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
        <div
          className="absolute -top-40 left-0 md:left-60 md:-top-20 w-[600px] h-[600px] rounded-full opacity-0 dark:opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full py-4 lg:py-6">
          {/* Left content */}
          <div className="flex-1 relative z-10 flex flex-col justify-center space-y-4 lg:space-y-5">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-neutral-700/50 rounded-full w-fit"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wide uppercase">
                Interactive Learning
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Master DSA
                <br />
                <motion.span
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="block bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent"
                >
                  Through Visualization
                </motion.span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-xl"
            >
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Transform complex algorithms into interactive visual experiences. Watch every step and master data structures with confidence.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <ButtonWithSweep to="/register" variant="primary" className="text-sm px-6 py-2.5">
                Start Learning
              </ButtonWithSweep>
              <ButtonWithSweep to="/login" variant="secondary" className="text-sm px-6 py-2.5">
                Sign In
              </ButtonWithSweep>
            </motion.div>
          </div>

          {/* Right content - Spline Scene with fade effect */}
          <div className="flex-1 relative h-full min-h-[300px] md:min-h-[400px] lg:min-h-full overflow-hidden">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
            {/* Bottom fade gradient overlay - Light theme */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10 dark:hidden"
              style={{
                background: "linear-gradient(to top, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.85) 25%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 100%)",
              }}
            />
            {/* Bottom fade gradient overlay - Dark theme */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10 hidden dark:block"
              style={{
                background: "linear-gradient(to top, rgb(23, 23, 23) 0%, rgba(23, 23, 23, 0.85) 25%, rgba(23, 23, 23, 0.5) 50%, rgba(23, 23, 23, 0.2) 75%, transparent 100%)",
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}