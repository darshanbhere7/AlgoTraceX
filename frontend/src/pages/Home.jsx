import React, { useState } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import TextType from "../components/TextType";
import ShinyText from "../components/ShinyText.jsx";

// Navbar Component
const Navbar = () => {
  const [isDark, setIsDark] = useState(false);

  const handleToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent transition-colors duration-300 px-8 py-4">
      <div className="w-full max-w-7xl mx-auto backdrop-blur-md bg-white/40 dark:bg-neutral-900/40 rounded-full shadow-lg dark:shadow-black/30 px-6 py-3 transition-all duration-300 border border-white/30 dark:border-neutral-700/40">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AT</span>
            </div>
            <span className="font-semibold text-neutral-800 dark:text-white hidden sm:inline">Algo Trace X</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium">
              How It Works
            </a>
            <a href="#pricing" className="text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium">
              Pricing
            </a>
          </div>

          {/* CTA and Theme Toggle */}
          <div className="flex items-center gap-3">
            <motion.button 
              onClick={handleToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-neutral-800/60 transition-all shadow-sm"
            >
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-neutral-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-neutral-800" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 4.22a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm11.314 0a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM4 10a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm12 0a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-8 6a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-1.78a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm11.314 0a1 1 0 011.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM10 5a5 5 0 100 10 5 5 0 000-10z" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow hidden sm:block"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <AuroraBackground>
      <div className="pt-32 pb-20 px-4 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="mb-6 text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white leading-tight">
            <div className="mb-2">
              <TextType 
                text={["Visualize Data Structures", "Master Algorithms Faster", "Learn DSA Visually"]}
                typingSpeed={75}
                pauseDuration={1500}
                showCursor={true}
                cursorCharacter="|"
              />
            </div>
            <div className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
              Like Never Before
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <ShinyText
              text="Master algorithms with interactive visualizations. Step through code, understand complexity, and solve problems faster."
              disabled={false}
              speed={3}
              className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto block"
            />
          </motion.div>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Learning
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-neutral-800 dark:border-neutral-200 text-neutral-900 dark:text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 dark:hover:bg-neutral-800/50 transition-all shadow-sm"
            >
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    { icon: "▶️", title: "Step-by-Step Execution", desc: "Execute code line by line and see variable states in real time" },
    { icon: "📊", title: "Visual Complexity Analysis", desc: "Understand time and space complexity with interactive graphs" },
    { icon: "💡", title: "Curated Algorithms", desc: "Learn from a comprehensive library of sorted and annotated algorithms" },
    { icon: "🚀", title: "Performance Tracking", desc: "Benchmark your solutions and track your progress" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="features" className="py-20 px-4 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            className="text-neutral-600 dark:text-neutral-400 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Everything you need to master data structures and algorithms
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <motion.div 
                className="text-4xl mb-3"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    { num: "01", title: "Choose an Algorithm", desc: "Select from sorting, searching, graphs, and more" },
    { num: "02", title: "Visualize the Process", desc: "Watch the algorithm execute with color-coded steps" },
    { num: "03", title: "Understand Complexity", desc: "Learn time/space complexity and optimization techniques" },
    { num: "04", title: "Practice & Master", desc: "Solve problems and track your improvement" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="how-it-works" className="py-20 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-neutral-600 dark:text-neutral-400 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Simple, intuitive, and incredibly effective
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <div className="p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm h-full hover:shadow-md transition-shadow">
                <motion.div 
                  className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                >
                  {step.num}
                </motion.div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {step.desc}
                </p>
              </div>
              {i < 3 && (
                <motion.div 
                  className="hidden md:block absolute -right-3 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.5, duration: 0.4 }}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-md" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const plans = [
    { name: "Starter", price: "$0", features: ["Basic algorithms", "Limited visualizations", "Community support"], cta: "Start Free" },
    { name: "Pro", price: "$29", features: ["All algorithms", "Advanced visualizations", "Priority support", "Progress tracking"], cta: "Get Pro", popular: true },
    { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "Custom algorithms", "API access", "Dedicated support"], cta: "Contact Sales" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Simple Pricing
          </motion.h2>
          <motion.p 
            className="text-neutral-600 dark:text-neutral-400 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Choose the plan that works for you
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`p-8 rounded-2xl border transition-all ${
                plan.popular
                  ? "bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-400 dark:border-purple-500 shadow-lg"
                  : "bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <motion.div 
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.4, duration: 0.4 }}
                >
                  Most Popular
                </motion.div>
              )}
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <motion.div 
                className="text-4xl font-bold text-neutral-900 dark:text-white mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
              >
                {plan.price}
                {plan.price !== "Custom" && <span className="text-lg text-neutral-600 dark:text-neutral-400">/month</span>}
              </motion.div>
              <motion.ul 
                className="space-y-3 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
              >
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center text-neutral-700 dark:text-neutral-300">
                    <motion.span 
                      className="mr-3 text-purple-600 dark:text-purple-400"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.4 + j * 0.05, duration: 0.3 }}
                    >
                      ✓
                    </motion.span>
                    {feature}
                  </li>
                ))}
              </motion.ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Footer Section
const FooterSection = () => {
  return (
    <footer className="bg-neutral-900 dark:bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="font-semibold mb-4">Algo Trace X</h3>
            <p className="text-neutral-400 text-sm">Master DSA with interactive visualizations.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Visualize</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Learn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Practice</a></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </motion.div>
        </motion.div>
        <motion.div 
          className="border-t border-neutral-800 pt-8 text-center text-neutral-400 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p>&copy; 2025 Algo Trace X. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

// Main App
export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <FooterSection />
    </div>
  );
}