import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "../components/ui/aurora-background";
import DisplayCards from "../components/ui/display-cards";
import shivam from "../assets/team/shivam_color.png";
import darshan from "../assets/team/darshan.jpg";
import bhagyashree from "../assets/team/bhagyashree.jpg";

import {
  Mic,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Search,
  Play,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import Anthropic from "../components/kokonutui/anthropic";
import AnthropicDark from "../components/kokonutui/anthropic-dark";
import Google from "../components/kokonutui/gemini";
import OpenAI from "../components/kokonutui/open-ai";
import OpenAIDark from "../components/kokonutui/open-ai-dark";
import MistralAI from "../components/kokonutui/mistral";
import DeepSeek from "../components/kokonutui/deepseek";
import { cn } from "../lib/utils";
import LandingNavbar from "../components/home/LandingNavbar.jsx";
import LandingFooter from "../components/home/LandingFooter.jsx";

const SplineSceneBasic = lazy(() => import("./SplineSceneBasic"));

const HeroSkeleton = () => (
  <div className="h-[520px] w-full bg-gradient-to-br from-gray-100 via-gray-50 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-black flex items-center justify-center text-gray-400 dark:text-neutral-500 animate-pulse">
    Loading immersive scene...
  </div>
);

const HeroSection = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <HeroSkeleton />;
  }

  return (
    <Suspense fallback={<HeroSkeleton />}>
      <SplineSceneBasic />
    </Suspense>
  );
};

// Bento Grid Components for Features Section
const SpotlightFeature = ({ items }) => {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, index) => (
        <motion.li
          key={`spotlight-${item.toLowerCase().replace(/\s+/g, "-")}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            {item}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};

const TypingCodeFeature = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);

        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, Math.random() * 30 + 10);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, []);

  return (
    <div className="mt-3 relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          algorithm.js
        </div>
      </div>
      <div
        ref={terminalRef}
        className="bg-neutral-900 dark:bg-black text-neutral-100 p-3 rounded-md text-xs font-mono h-[150px] overflow-y-auto"
      >
        <pre className="whitespace-pre-wrap">
          {displayedText}
          <span className="animate-pulse">|</span>
        </pre>
      </div>
    </div>
  );
};

const IconsFeature = () => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <motion.div
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <OpenAI className="w-7 h-7 dark:hidden transition-transform" />
          <OpenAIDark className="w-7 h-7 hidden dark:block transition-transform" />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
          OpenAI
        </span>
      </motion.div>
      <motion.div
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Anthropic className="w-7 h-7 dark:hidden transition-transform" />
          <AnthropicDark className="w-7 h-7 hidden dark:block transition-transform" />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
          Anthropic
        </span>
      </motion.div>
      <motion.div
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Google className="w-7 h-7 transition-transform" />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
          Google
        </span>
      </motion.div>
      <motion.div
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <MistralAI className="w-7 h-7 transition-transform" />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
          Mistral
        </span>
      </motion.div>
      <motion.div
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <DeepSeek className="w-7 h-7 transition-transform" />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
          DeepSeek
        </span>
      </motion.div>
      <motion.div
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Plus className="w-6 h-6 text-neutral-600 dark:text-neutral-400 transition-transform" />
        </div>
        <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
          More
        </span>
      </motion.div>
    </div>
  );
};

function AIInput_Voice() {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId;

    if (submitted) {
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, 3000);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo]);

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  return (
    <div className="w-full py-4">
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            submitted
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {submitted ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            submitted
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(48)].map((_, i) => (
            <div
              key={`voice-bar-${i}`}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
}

const BentoCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className={cn(
          "group relative flex flex-col gap-4 h-full rounded-xl p-5",
          "bg-gradient-to-b from-neutral-50/60 via-neutral-50/40 to-neutral-50/30",
          "dark:from-neutral-900/60 dark:via-neutral-900/40 dark:to-neutral-900/30",
          "border border-neutral-200/60 dark:border-neutral-800/60",
          "before:absolute before:inset-0 before:rounded-xl",
          "before:bg-gradient-to-b before:from-white/10 before:via-white/20 before:to-transparent",
          "dark:before:from-black/10 dark:before:via-black/20 dark:before:to-transparent",
          "before:opacity-100 before:transition-opacity before:duration-500",
          "after:absolute after:inset-0 after:rounded-xl after:bg-neutral-50/70 dark:after:bg-neutral-900/70 after:z-[-1]",
          "backdrop-blur-[4px]",
          "shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)]",
          "hover:border-neutral-300/50 dark:hover:border-neutral-700/50",
          "hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
          "hover:backdrop-blur-[6px]",
          "hover:bg-gradient-to-b hover:from-neutral-50/60 hover:via-neutral-50/30 hover:to-neutral-50/20",
          "dark:hover:from-neutral-800/60 dark:hover:via-neutral-800/30 dark:hover:to-neutral-800/20",
          "transition-all duration-500 ease-out",
          item.className
        )}
        tabIndex={0}
        aria-label={`${item.title} - ${item.description}`}
      >
        <div
          className="relative z-10 flex flex-col gap-3 h-full"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors duration-300">
                {item.title}
              </h3>
              <div className="text-neutral-400 dark:text-neutral-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 tracking-tight">
              {item.description}
            </p>

            {item.feature === "spotlight" && item.spotlightItems && (
              <SpotlightFeature items={item.spotlightItems} />
            )}

            {item.feature === "icons" && <IconsFeature />}

            {item.feature === "typing" && item.typingText && (
              <TypingCodeFeature text={item.typingText} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Features Section with Bento Grid
const FeaturesSection = () => {
  const bentoItems = [
    {
      id: "main",
      title: "Building tomorrow's technology",
      description:
        "We architect and develop interactive algorithm visualizations that help you master data structures and algorithms with step-by-step execution and real-time insights.",
      href: "#",
      feature: "spotlight",
      spotlightItems: [
        "Step-by-step execution",
        "Real-time visualization",
        "Interactive complexity analysis",
        "Performance benchmarking",
        "Progress tracking",
      ],
      size: "lg",
      className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
    },
    {
      id: "stat1",
      title: "AI Agents & Automation",
      description:
        "Intelligent agents that learn, adapt, and automate complex workflows",
      href: "#",
      feature: "typing",
      typingText:
        "const visualizeAlgorithm = (algorithm) => {\n  const visualizer = new AlgorithmVisualizer({\n    type: 'bubble-sort',\n    data: generateRandomArray(10),\n    speed: 'medium'\n  });\n\n  // Step through execution\n  visualizer.stepForward();\n  visualizer.highlightComparison();\n  visualizer.showSwap();\n\n  return visualizer;\n};",
      size: "md",
      className: "col-span-2 row-span-1 col-start-1 col-end-3",
    },
    {
      id: "partners",
      title: "Trusted partners",
      description:
        "Working with the leading AI and cloud providers to deliver cutting-edge solutions",
      icons: true,
      href: "#",
      feature: "icons",
      size: "md",
      className: "col-span-1 row-span-1",
    },
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 bg-gray-50 dark:bg-neutral-950 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to master data structures and algorithms
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-6"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div variants={fadeInUp} className="md:col-span-1">
              <BentoCard item={bentoItems[0]} />
            </motion.div>
            <motion.div variants={fadeInUp} className="md:col-span-2">
              <BentoCard item={bentoItems[1]} />
            </motion.div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="md:col-span-1">
              <BentoCard item={bentoItems[2]}/>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="md:col-span-1 rounded-xl overflow-hidden bg-gradient-to-b from-neutral-50/80 to-neutral-50 dark:from-neutral-900/80 dark:to-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 hover:border-neutral-400/30 dark:hover:border-neutral-600/30 hover:shadow-lg hover:shadow-neutral-200/20 dark:hover:shadow-neutral-900/20 transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Voice Assistant
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 tracking-tight mb-4">
                  Interact with our AI using natural voice commands. Experience
                  seamless voice-driven interactions with advanced speech
                  recognition.
                </p>
                <AIInput_Voice />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// How It Works Section with Display Cards
const HowItWorksSection = () => {
  const steps = [
    {
      num: "01",
      title: "Choose an Algorithm",
      desc: "Select from sorting, searching, graphs, and more",
      icon: <Search className="size-4 text-blue-300" />,
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
    },
    {
      num: "02",
      title: "Visualize the Process",
      desc: "Watch the algorithm execute with color-coded steps",
      icon: <Play className="size-4 text-green-300" />,
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
    },
    {
      num: "03",
      title: "Understand Complexity",
      desc: "Learn time/space complexity and optimization techniques",
      icon: <BarChart3 className="size-4 text-purple-300" />,
      iconClassName: "text-purple-500",
      titleClassName: "text-purple-500",
    },
    {
      num: "04",
      title: "Practice & Master",
      desc: "Solve problems and track your improvement",
      icon: <TrendingUp className="size-4 text-orange-300" />,
      iconClassName: "text-orange-500",
      titleClassName: "text-orange-500",
    },
  ];

  const displayCards = [
    {
      icon: steps[0].icon,
      title: steps[0].title,
      description: steps[0].desc,
      date: "Step 1",
      iconClassName: steps[0].iconClassName,
      titleClassName: steps[0].titleClassName,
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: steps[1].icon,
      title: steps[1].title,
      description: steps[1].desc,
      date: "Step 2",
      iconClassName: steps[1].iconClassName,
      titleClassName: steps[1].titleClassName,
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: steps[2].icon,
      title: steps[2].title,
      description: steps[2].desc,
      date: "Step 3",
      iconClassName: steps[2].iconClassName,
      titleClassName: steps[2].titleClassName,
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Simple, intuitive, and incredibly effective
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center w-full"
        >
          <DisplayCards cards={displayCards} />
        </motion.div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const navigate = useNavigate();
  const plans = [
    { 
      name: "Starter", 
      price: "$0", 
      features: ["Basic algorithms", "Limited visualizations", "Community support"], 
      cta: "Get Started",
      action: () => navigate("/register")
    },
    { 
      name: "Pro", 
      price: "$29", 
      features: ["All algorithms", "Advanced visualizations", "Priority support", "Progress tracking"], 
      cta: "Get Started",
      popular: true,
      action: () => navigate("/register")
    },
    { 
      name: "Enterprise", 
      price: "Custom", 
      features: ["Everything in Pro", "Custom algorithms", "API access", "Dedicated support"], 
      cta: "Contact Us",
      action: () => navigate("/register")
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="pricing" className="py-20 px-4 bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pricing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that works for you
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className={`p-8 rounded-lg border transition-all ${
                plan.popular
                  ? "bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-md"
                  : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {plan.price}
                {plan.price !== "Custom" && <span className="text-lg text-gray-600 dark:text-gray-400 font-normal">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-3 text-gray-900 dark:text-white">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={plan.action}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  plan.popular
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    : "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700"
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

const TeamSection = () => {
  const team = [
    {
      name: "Darshan Bhere",
      image: darshan,
      focus: "Full Stack Developer & AI Systems",
      gender: "female",
      linkedin: "https://www.linkedin.com/in/darshan-bhere-b69a14260/",
    },
    {
      name: "Bhagyashree Dhongde",
      image: bhagyashree,
      focus: "Backend & Data Engineer",
      gender: "female",
      linkedin: "https://www.linkedin.com/in/bhagyashree-dhongde-915582258/",
    },
    {
      name: "Shivam Darekar",
      image: shivam,
      focus: "Frontend & Cloud Engineer ",
      gender: "female",
      linkedin: "https://www.linkedin.com/in/shivamdarekar2206/",
    },
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      id="team"
      className="relative py-24 bg-white dark:bg-neutral-900 overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-10 mx-auto h-64 w-[28rem] rounded-full bg-gradient-to-b from-slate-200/30 to-transparent dark:from-slate-900/30 blur-[160px] opacity-70" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-4xl md:text-[46px] font-bold leading-tight text-gray-900 dark:text-white">
            Meet the Team
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400">
            Your behind-the-scenes crew for smoother learning.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-8 md:grid-cols-3"
        >
          {team.map((person, idx) => (
            <motion.article
              key={person.name}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="relative group rounded-2xl border border-gray-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl shadow-[0_20px_45px_rgba(15,23,42,0.07)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.4)] transition-all duration-500"
            >
              <div className="overflow-hidden rounded-t-2xl">
                <motion.img
                  src={person.image}
                  alt={person.name}
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                />
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Co-founder
                  </p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {person.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {person.focus}
                  </p>
                </div>
                <motion.a
                  href={person.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/60 px-5 py-2 text-sm font-medium text-gray-900 dark:text-white transition-all duration-300 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900"
                >
                  Connect
                </motion.a>
              </div>
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gray-300/70 dark:group-hover:border-neutral-700/70 transition-all duration-300 pointer-events-none" />
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Main App
export default function App() {
  return (
    <div className="home-page min-h-screen bg-white dark:bg-neutral-900">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TeamSection />
      <LandingFooter />
    </div>
  );
}
