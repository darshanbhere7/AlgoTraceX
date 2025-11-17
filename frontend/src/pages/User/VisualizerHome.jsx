import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Search,
  GitBranch,
  Link,
  Layers,
  Zap,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Code,
  Activity
} from "lucide-react";

const stats = [
  { value: "40+", label: "Algorithms" },
  { value: "7", label: "Categories" },
  { value: "∞", label: "Learning" },
  { value: "✨", label: "Interactive" }
];

const ActionButton = ({ icon: Icon, children, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
  >
    {Icon && <Icon className="h-4 w-4" />}
    {children}
  </motion.button>
);

export default function VisualizerHome() {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (!path) return;
    navigate(path);
  };

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const dsaCategories = useMemo(() => [
    {
      id: "sorting",
      title: "Sorting Algorithms",
      icon: ArrowUpDown,
      description: "Visualize how each sorting technique organizes data.",
      items: [
        { name: "Bubble Sort", path: "/user/bubble-sort", complexity: "O(n²)", description: "Comparison-based sorting with adjacent swaps." },
        { name: "Merge Sort", path: "/user/merge-sort", complexity: "O(n log n)", description: "Divide & conquer with guaranteed performance." },
        { name: "Quick Sort", path: "/user/quick-sort", complexity: "O(n log n)", description: "Pivot-based, cache-friendly sorting." },
        { name: "Heap Sort", path: "/user/heap-sort", complexity: "O(n log n)", description: "Binary heap ensures consistent bounds." },
        { name: "Insertion Sort", path: "/user/insertion-sort", complexity: "O(n²)", description: "Best for nearly sorted or tiny arrays." },
        { name: "Selection Sort", path: "/user/selection-sort", complexity: "O(n²)", description: "Selects minimum elements for placement." }
      ]
    },
    {
      id: "searching",
      title: "Search Algorithms",
      icon: Search,
      description: "Learn how different searches traverse data.",
      items: [
        { name: "Linear Search", path: "/user/linear-search", complexity: "O(n)", description: "Checks every element until found." },
        { name: "Binary Search", path: "/user/binary-search", complexity: "O(log n)", description: "Halves the search space on sorted lists." },
        { name: "Jump Search", path: "/user/jump-search", complexity: "O(√n)", description: "Skips blocks to limit comparisons." },
        { name: "Interpolation Search", path: "/user/interpolation-search", complexity: "O(log log n)", description: "Predicts position via value distribution." }
      ]
    },
    {
      id: "trees",
      title: "Tree Structures",
      icon: GitBranch,
      description: "Explore hierarchical data structures and balancing.",
      items: [
        { name: "Binary Tree", path: "/user/binary-tree", complexity: "Various", description: "The foundational tree with two children." },
        { name: "Binary Search Tree", path: "/user/bst", complexity: "O(log n)", description: "Keeps values ordered for faster lookups." },
        { name: "AVL Tree", path: "/user/avl-tree", complexity: "O(log n)", description: "Strict height balancing for stable ops." },
        { name: "Red-Black Tree", path: "/user/rb-tree", complexity: "O(log n)", description: "Color-balanced BST used in std libs." },
        { name: "Heap Tree", path: "/user/heap-tree", complexity: "O(log n)", description: "Complete tree maintaining heap property." }
      ]
    },
    {
      id: "linear",
      title: "Linear Data Structures",
      icon: Link,
      description: "Fundamental sequential containers.",
      items: [
        { name: "Array", path: "/user/array", complexity: "O(1)", description: "Contiguous storage with index access." },
        { name: "Linked List", path: "/user/linked-list", complexity: "O(n)", description: "Nodes linked via pointers for flexibility." },
        { name: "Doubly Linked List", path: "/user/doubly-linked-list", complexity: "O(n)", description: "Traverse both directions efficiently." },
        { name: "Stack", path: "/user/stack", complexity: "O(1)", description: "LIFO access pattern for call stacks." },
        { name: "Queue", path: "/user/queue", complexity: "O(1)", description: "FIFO structure for scheduling tasks." }
      ]
    },
    {
      id: "advanced",
      title: "Advanced Techniques",
      icon: Layers,
      description: "High-level strategies for complex problems.",
      items: [
        { name: "Dynamic Programming", path: "/user/topics", complexity: "Various", description: "Cache overlapping subproblems for speed." },
        { name: "Backtracking", path: "/user/topics", complexity: "Exponential", description: "DFS-style exploration with constraint pruning." },
        { name: "Greedy Algorithms", path: "/user/topics", complexity: "Various", description: "Locally optimal steps for global goals." },
        { name: "Divide & Conquer", path: "/user/topics", complexity: "Various", description: "Split, solve, and merge subproblems." }
      ]
    }
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-3 bg-gray-900 dark:bg-neutral-800 rounded-xl shadow-sm"
              >
                <Activity className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              DSA Visualizer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              Master Data Structures and Algorithms through interactive visualizations. 
              Watch algorithms come to life with step-by-step animations and real-time complexity analysis.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-2 rounded-full shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Interactive Learning</span>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-2 rounded-full shadow-sm"
              >
                <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Code Examples</span>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-2 rounded-full shadow-sm"
              >
                <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Real-time Visualization</span>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm py-6 px-4 flex flex-col items-center"
              >
                <span className="text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Categories List */}
          <div className="lg:col-span-2 space-y-4">
            {dsaCategories.map((category, index) => {
              const IconComponent = category.icon;
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden"
                >
                  {/* Category Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors duration-200"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
                          <IconComponent className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {category.title}
                          </h2>
                          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {category.items.length} items
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
                    >
                      <div className="p-4 space-y-2">
                        {category.items.map((item) => (
                          <motion.div
                            key={item.name}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 bg-white dark:bg-neutral-900 rounded-lg border cursor-pointer transition-all duration-200 ${
                              selectedItem?.name === item.name 
                                ? 'border-gray-900 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800'
                                : 'border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'
                            }`}
                            onClick={() => handleItemSelect(item)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </h3>
                              <span className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-mono border border-gray-200 dark:border-neutral-700">
                                {item.complexity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6"
              >
                {selectedItem ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedItem.name}
                      </h3>
                      <span className="text-sm bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-mono border border-gray-200 dark:border-neutral-700">
                        {selectedItem.complexity}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {selectedItem.description}
                    </p>
                    
                    {/* Visualization Area */}
                    <div className="bg-gray-50 dark:bg-neutral-950 rounded-lg p-8 mb-6 text-center border border-gray-200 dark:border-neutral-800">
                      <div className="text-gray-500 dark:text-gray-400 mb-4">
                        <Activity className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Interactive visualization will appear here
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <ActionButton icon={Play} onClick={() => selectedItem.path && handleNavigate(selectedItem.path)}>
                        Go to {selectedItem.name}
                      </ActionButton>
                      <ActionButton icon={Code}>
                        View Code
                      </ActionButton>
                      <ActionButton icon={Activity}>
                        Step Through
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      <BookOpen className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Select an Algorithm
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Choose any algorithm from the categories to start visualizing and learning
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}