import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  ArrowUpDown, 
  Search, 
  GitBranch, 
  Link, 
  Layers, 
  Hash, 
  Zap,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Code,
  Activity
} from "lucide-react";

export default function VisualizerHome() {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);

  // Your original navigation function - keeping this intact
  const handleNavigate = (path) => {
    // This would use your react-router-dom navigate in the real app
    window.location.href = path; // or use your routing logic
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

  const dsaCategories = [
    {
      id: "sorting",
      title: "Sorting Algorithms",
      icon: ArrowUpDown,
      description: "Visualize how different sorting algorithms organize data",
      items: [
        { name: "Bubble Sort", path: "/user/bubble-sort", complexity: "O(n²)", description: "Simple comparison-based sorting with adjacent swaps" },
        { name: "Merge Sort", path: "/user/merge-sort", complexity: "O(n log n)", description: "Divide and conquer approach with guaranteed performance" },
        { name: "Quick Sort", path: "/user/quick-sort", complexity: "O(n log n)", description: "Efficient pivot-based sorting with in-place partitioning" },
        { name: "Heap Sort", path: "/user/heap-sort", complexity: "O(n log n)", description: "Binary heap-based sorting with consistent performance" },
        { name: "Insertion Sort", path: "/user/insertion-sort", complexity: "O(n²)", description: "Build sorted array incrementally, efficient for small arrays" },
        { name: "Selection Sort", path: "/user/selection-sort", complexity: "O(n²)", description: "Find minimum element and swap with current position" }
      ]
    },
    {
      id: "searching",
      title: "Search Algorithms",
      icon: Search,
      description: "Learn how to efficiently find elements in data structures",
      items: [
        { name: "Linear Search", path: "/user/linear-search", complexity: "O(n)", description: "Sequential element searching through each item" },
        { name: "Binary Search", path: "/user/binary-search", complexity: "O(log n)", description: "Divide and conquer search on sorted arrays" },
        { name: "Jump Search", path: "/user/jump-search", complexity: "O(√n)", description: "Block-based searching with optimal jump size" },
        { name: "Interpolation Search", path: "/user/interpolation-search", complexity: "O(log log n)", description: "Estimate position based on value distribution" }
      ]
    },
    {
      id: "trees",
      title: "Tree Structures",
      icon: GitBranch,
      description: "Explore hierarchical data structures and tree algorithms",
      items: [
        { name: "Binary Tree", path: "/user/binary-tree", complexity: "Various", description: "Basic hierarchical tree structure with two children per node" },
        { name: "Binary Search Tree", path: "/user/bst", complexity: "O(log n)", description: "Ordered binary tree for efficient searching" },
        { name: "AVL Tree", path: "/user/avl-tree", complexity: "O(log n)", description: "Self-balancing BST with height difference ≤ 1" },
        { name: "Red-Black Tree", path: "/user/rb-tree", complexity: "O(log n)", description: "Balanced binary search tree with color properties" },
        { name: "Heap", path: "/user/heap", complexity: "O(log n)", description: "Complete binary tree with heap property" },
        { name: "Trie", path: "/user/trie", complexity: "O(m)", description: "Prefix tree for efficient string operations" }
      ]
    },
    {
      id: "linear",
      title: "Linear Data Structures",
      icon: Link,
      description: "Fundamental sequential data structures",
      items: [
        { name: "Array", path: "/user/array", complexity: "O(1)", description: "Fixed-size sequential collection with index access" },
        { name: "Linked List", path: "/user/linked-list", complexity: "O(n)", description: "Dynamic sequential structure with pointer-based connections" },
        { name: "Doubly Linked List", path: "/user/doubly-linked-list", complexity: "O(n)", description: "Bidirectional linked structure for efficient traversal" },
        { name: "Stack", path: "/user/stack", complexity: "O(1)", description: "LIFO (Last In, First Out) data structure" },
        { name: "Queue", path: "/user/queue", complexity: "O(1)", description: "FIFO (First In, First Out) data structure" },
        { name: "Deque", path: "/user/deque", complexity: "O(1)", description: "Double-ended queue with insertion/deletion at both ends" }
      ]
    },
    {
      id: "graphs",
      title: "Graph Algorithms",
      icon: Layers,
      description: "Network and graph traversal algorithms",
      items: [
        { name: "Depth-First Search", path: "/user/dfs", complexity: "O(V+E)", description: "Explore as far as possible along each branch" },
        { name: "Breadth-First Search", path: "/user/bfs", complexity: "O(V+E)", description: "Explore all neighbors before moving to next level" },
        { name: "Dijkstra's Algorithm", path: "/user/dijkstra", complexity: "O(V²)", description: "Find shortest path from source to all vertices" },
        { name: "A* Search", path: "/user/a-star", complexity: "O(b^d)", description: "Heuristic pathfinding with estimated cost function" },
        { name: "Kruskal's MST", path: "/user/kruskal", complexity: "O(E log E)", description: "Find minimum spanning tree using edge sorting" },
        { name: "Prim's MST", path: "/user/prim", complexity: "O(V²)", description: "Build minimum spanning tree from arbitrary start vertex" }
      ]
    },
    {
      id: "hashing",
      title: "Hash Tables",
      icon: Hash,
      description: "Hash-based data structures and collision resolution",
      items: [
        { name: "Hash Table", path: "/user/hash-table", complexity: "O(1)", description: "Key-value mapping with hash function for fast access" },
        { name: "Chaining", path: "/user/hash-chaining", complexity: "O(1)", description: "Handle collisions using linked lists at each bucket" },
        { name: "Open Addressing", path: "/user/open-addressing", complexity: "O(1)", description: "Resolve collisions by probing for next available slot" },
        { name: "Bloom Filter", path: "/user/bloom-filter", complexity: "O(1)", description: "Probabilistic data structure for membership testing" }
      ]
    },
    {
      id: "advanced",
      title: "Advanced Algorithms",
      icon: Zap,
      description: "Complex algorithmic techniques and patterns",
      items: [
        { name: "Dynamic Programming", complexity: "Various", description: "Solve complex problems by breaking into subproblems" },
        { name: "Backtracking", complexity: "Exponential", description: "Systematic trial-and-error approach with constraint satisfaction" },
        { name: "Greedy Algorithms", complexity: "Various", description: "Make locally optimal choices for global optimization" },
        { name: "Divide & Conquer", complexity: "Various", description: "Break problems into smaller subproblems recursively" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gray-900 rounded-xl shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              DSA Visualizer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Master Data Structures and Algorithms through interactive visualizations. 
              Watch algorithms come to life with step-by-step animations and real-time complexity analysis.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4" />
                <span>Interactive Learning</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <Code className="w-4 h-4" />
                <span>Code Examples</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <Activity className="w-4 h-4" />
                <span>Real-time Visualization</span>
              </div>
            </div>
          </div>
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
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Category Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-gray-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {category.title}
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">
                          {category.items.length} items
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="p-4 space-y-2">
                        {category.items.map((item) => (
                          <div
                            key={item.name}
                            className={`p-4 bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${
                              selectedItem?.name === item.name ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                            }`}
                            onClick={() => handleItemSelect(item)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-900">
                                {item.name}
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                                {item.complexity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {selectedItem ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedItem.name}
                      </h3>
                      <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-mono">
                        {selectedItem.complexity}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-6">
                      {selectedItem.description}
                    </p>
                    
                    {/* Visualization Area */}
                    <div className="bg-gray-50 rounded-lg p-8 mb-6 text-center">
                      <div className="text-gray-400 mb-4">
                        <Activity className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Interactive visualization will appear here
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                        onClick={() => selectedItem.path && handleNavigate(selectedItem.path)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Go to {selectedItem.name}
                      </Button>
                      <Button variant="outline" className="w-full">
                        View Code
                      </Button>
                      <Button variant="outline" className="w-full">
                        Step Through
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <BookOpen className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select an Algorithm
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Choose any algorithm from the categories to start visualizing and learning
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold">40+</div>
              <div className="text-gray-400">Algorithms</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">7</div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">∞</div>
              <div className="text-gray-400">Learning</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">✨</div>
              <div className="text-gray-400">Interactive</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}