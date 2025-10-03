import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

const speedOptions = {
    "0.25x": 1500,
    "0.5x": 1000,
    "1x": 600,
    "2x": 300,
    "4x": 150,
};

export default function BinarySearchTree() {
    const [root, setRoot] = useState(null);
    const [currentInput, setCurrentInput] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [deleteInput, setDeleteInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [visitedNodes, setVisitedNodes] = useState(new Set());
    const [pathNodes, setPathNodes] = useState(new Set());
    const [foundNode, setFoundNode] = useState(null);
    const [operation, setOperation] = useState("");

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const insertNodeBST = (node, value, path = []) => {
        if (node === null) {
            return new TreeNode(value);
        }

        if (value < node.value) {
            node.left = insertNodeBST(node.left, value, [...path, 'L']);
        } else if (value > node.value) {
            node.right = insertNodeBST(node.right, value, [...path, 'R']);
        }
        // If value equals node.value, don't insert (no duplicates)

        return node;
    };

    const handleAddValue = async () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
            if (root) {
                await insertWithAnimation(val);
            } else {
                setRoot(new TreeNode(val));
                setCurrentInput("");
            }
        }
    };

    const insertWithAnimation = async (value) => {
        setAnimating(true);
        setOperation("insert");
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
        
        setCurrentStep(`Inserting ${value} into the BST...`);
        await sleep(delay);

        let current = root;
        const path = [];

        while (current !== null) {
            path.push(current.value);
            setPathNodes(new Set(path));
            setHighlightedNodes(new Set([current.value]));

            if (value === current.value) {
                setCurrentStep(`Value ${value} already exists in the tree. No duplicates allowed.`);
                await sleep(delay * 2);
                setAnimating(false);
                setHighlightedNodes(new Set());
                setPathNodes(new Set());
                setCurrentInput("");
                return;
            }

            if (value < current.value) {
                setCurrentStep(`${value} < ${current.value}, go left`);
                await sleep(delay);
                setVisitedNodes(prev => new Set([...prev, current.value]));
                
                if (current.left === null) {
                    setCurrentStep(`Found empty left position. Inserting ${value} here.`);
                    await sleep(delay);
                    break;
                }
                current = current.left;
            } else {
                setCurrentStep(`${value} > ${current.value}, go right`);
                await sleep(delay);
                setVisitedNodes(prev => new Set([...prev, current.value]));
                
                if (current.right === null) {
                    setCurrentStep(`Found empty right position. Inserting ${value} here.`);
                    await sleep(delay);
                    break;
                }
                current = current.right;
            }
        }

        const newRoot = insertNodeBST(root, value);
        setRoot(newRoot);
        
        setHighlightedNodes(new Set([value]));
        setCurrentStep(`Successfully inserted ${value}! ✓`);
        await sleep(delay * 2);

        setAnimating(false);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
        setCurrentInput("");
    };

    const searchValue = async () => {
        const val = parseInt(searchInput.trim());
        if (isNaN(val) || !root) return;

        setAnimating(true);
        setOperation("search");
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
        setFoundNode(null);

        setCurrentStep(`Searching for ${val} in the BST...`);
        await sleep(delay);

        let current = root;
        const path = [];

        while (current !== null) {
            path.push(current.value);
            setPathNodes(new Set(path));
            setHighlightedNodes(new Set([current.value]));

            if (val === current.value) {
                setCurrentStep(`Found ${val}! 🎯`);
                setFoundNode(current.value);
                await sleep(delay * 2);
                setAnimating(false);
                return;
            }

            setVisitedNodes(prev => new Set([...prev, current.value]));

            if (val < current.value) {
                setCurrentStep(`${val} < ${current.value}, search left subtree`);
                await sleep(delay);
                current = current.left;
            } else {
                setCurrentStep(`${val} > ${current.value}, search right subtree`);
                await sleep(delay);
                current = current.right;
            }
        }

        setCurrentStep(`Value ${val} not found in the tree. ✗`);
        await sleep(delay * 2);
        
        setAnimating(false);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
    };

    const findMin = (node) => {
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    };

    const deleteNodeBST = (node, value) => {
        if (node === null) return null;

        if (value < node.value) {
            node.left = deleteNodeBST(node.left, value);
        } else if (value > node.value) {
            node.right = deleteNodeBST(node.right, value);
        } else {
            // Node to be deleted found
            
            // Case 1: Node with no children (leaf)
            if (node.left === null && node.right === null) {
                return null;
            }
            
            // Case 2: Node with one child
            if (node.left === null) {
                return node.right;
            }
            if (node.right === null) {
                return node.left;
            }
            
            // Case 3: Node with two children
            // Find inorder successor (smallest in right subtree)
            const successor = findMin(node.right);
            node.value = successor.value;
            node.right = deleteNodeBST(node.right, successor.value);
        }

        return node;
    };

    const deleteValue = async () => {
        const val = parseInt(deleteInput.trim());
        if (isNaN(val) || !root) return;

        setAnimating(true);
        setOperation("delete");
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());

        setCurrentStep(`Searching for ${val} to delete...`);
        await sleep(delay);

        let current = root;
        const path = [];
        let found = false;

        while (current !== null) {
            path.push(current.value);
            setPathNodes(new Set(path));
            setHighlightedNodes(new Set([current.value]));

            if (val === current.value) {
                found = true;
                setCurrentStep(`Found ${val}!`);
                await sleep(delay);

                // Determine deletion case
                const hasLeft = current.left !== null;
                const hasRight = current.right !== null;

                if (!hasLeft && !hasRight) {
                    setCurrentStep(`Node ${val} is a leaf. Deleting directly...`);
                } else if (!hasLeft || !hasRight) {
                    setCurrentStep(`Node ${val} has one child. Replacing with child...`);
                } else {
                    setCurrentStep(`Node ${val} has two children. Finding inorder successor...`);
                    await sleep(delay);
                    const successor = findMin(current.right);
                    setCurrentStep(`Inorder successor is ${successor.value}. Replacing and deleting successor...`);
                }
                
                await sleep(delay);
                break;
            }

            setVisitedNodes(prev => new Set([...prev, current.value]));

            if (val < current.value) {
                setCurrentStep(`${val} < ${current.value}, search left`);
                await sleep(delay);
                current = current.left;
            } else {
                setCurrentStep(`${val} > ${current.value}, search right`);
                await sleep(delay);
                current = current.right;
            }
        }

        if (!found) {
            setCurrentStep(`Value ${val} not found in the tree. ✗`);
            await sleep(delay * 2);
        } else {
            const newRoot = deleteNodeBST(root, val);
            setRoot(newRoot);
            setCurrentStep(`Successfully deleted ${val}! ✓`);
            await sleep(delay * 2);
        }

        setAnimating(false);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
        setDeleteInput("");
    };

    const findMinMax = async (type) => {
        if (!root) return;

        setAnimating(true);
        setOperation(type);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());

        setCurrentStep(`Finding ${type === "min" ? "minimum" : "maximum"} value...`);
        await sleep(delay);

        let current = root;
        const path = [];

        while (true) {
            path.push(current.value);
            setPathNodes(new Set(path));
            setHighlightedNodes(new Set([current.value]));
            setVisitedNodes(prev => new Set([...prev, current.value]));

            if (type === "min") {
                if (current.left === null) {
                    setCurrentStep(`Minimum value is ${current.value}! 🎯`);
                    setFoundNode(current.value);
                    await sleep(delay * 2);
                    break;
                }
                setCurrentStep(`Go left to find smaller value`);
                await sleep(delay);
                current = current.left;
            } else {
                if (current.right === null) {
                    setCurrentStep(`Maximum value is ${current.value}! 🎯`);
                    setFoundNode(current.value);
                    await sleep(delay * 2);
                    break;
                }
                setCurrentStep(`Go right to find larger value`);
                await sleep(delay);
                current = current.right;
            }
        }

        setAnimating(false);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
    };

    const generateRandomBST = () => {
        if (animating) return;
        let newRoot = null;
        const values = new Set();
        
        while (values.size < 10) {
            values.add(Math.floor(Math.random() * 90) + 10);
        }
        
        for (const val of values) {
            newRoot = insertNodeBST(newRoot, val);
        }
        
        setRoot(newRoot);
    };

    const reset = () => {
        setRoot(null);
        setCurrentInput("");
        setSearchInput("");
        setDeleteInput("");
        setAnimating(false);
        setCurrentStep("");
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setPathNodes(new Set());
        setFoundNode(null);
        setOperation("");
    };

    const renderTree = (node, x = 400, y = 60, level = 0, xOffset = 200) => {
        if (!node) return null;

        const nextOffset = xOffset / 2;
        const leftX = x - xOffset;
        const rightX = x + xOffset;
        const childY = y + 80;

        const isHighlighted = highlightedNodes.has(node.value);
        const isVisited = visitedNodes.has(node.value);
        const isInPath = pathNodes.has(node.value);
        const isFound = foundNode === node.value;

        return (
            <g key={`${node.value}-${x}-${y}`}>
                {node.left && (
                    <line
                        x1={x}
                        y1={y}
                        x2={leftX}
                        y2={childY}
                        stroke={isInPath ? "#3b82f6" : "#cbd5e1"}
                        strokeWidth={isInPath ? "3" : "2"}
                        className="transition-all duration-300"
                    />
                )}
                {node.right && (
                    <line
                        x1={x}
                        y1={y}
                        x2={rightX}
                        y2={childY}
                        stroke={isInPath ? "#3b82f6" : "#cbd5e1"}
                        strokeWidth={isInPath ? "3" : "2"}
                        className="transition-all duration-300"
                    />
                )}

                {node.left && renderTree(node.left, leftX, childY, level + 1, nextOffset)}
                {node.right && renderTree(node.right, rightX, childY, level + 1, nextOffset)}

                <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill={
                        isFound ? "#10b981" :
                        isHighlighted ? "#f59e0b" : 
                        isVisited ? "#94a3b8" : 
                        isInPath ? "#60a5fa" : 
                        "#e2e8f0"
                    }
                    stroke={
                        isFound ? "#059669" :
                        isHighlighted ? "#d97706" : 
                        isVisited ? "#64748b" : 
                        isInPath ? "#3b82f6" : 
                        "#94a3b8"
                    }
                    strokeWidth="3"
                    className="transition-all duration-300"
                    style={{
                        filter: isHighlighted || isFound ? "drop-shadow(0 0 10px currentColor)" : "none",
                        transform: isHighlighted ? "scale(1.2)" : "scale(1)",
                        transformOrigin: `${x}px ${y}px`
                    }}
                />
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy=".3em"
                    fill={isVisited && !isHighlighted && !isFound ? "#475569" : "white"}
                    fontSize="16"
                    fontWeight="bold"
                    className="pointer-events-none"
                >
                    {node.value}
                </text>
            </g>
        );
    };

    const getTreeHeight = (node) => {
        if (!node) return 0;
        return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
    };

    const treeHeight = getTreeHeight(root);
    const svgHeight = Math.max(300, treeHeight * 80 + 40);

    return (
        <Card className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-indigo-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Binary Search Tree Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Explore BST operations: Insert, Search, Delete, Find Min/Max</p>
                </div>

                {/* Insert Panel */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Insert value (0-999)"
                            value={currentInput}
                            disabled={animating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="w-44 border-indigo-300 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={animating} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                            Insert
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Search value"
                            value={searchInput}
                            disabled={animating}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchValue()}
                            className="w-36 border-blue-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={searchValue} disabled={animating || !root} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                            Search
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Delete value"
                            value={deleteInput}
                            disabled={animating}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && deleteValue()}
                            className="w-36 border-red-300 bg-white focus:border-red-500 focus:ring-red-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={deleteValue} disabled={animating || !root} size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Additional Operations */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        onClick={() => findMinMax("min")}
                        disabled={animating || !root}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                    >
                        Find Minimum
                    </Button>
                    <Button
                        onClick={() => findMinMax("max")}
                        disabled={animating || !root}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
                    >
                        Find Maximum
                    </Button>
                    <Button onClick={generateRandomBST} disabled={animating} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                        Generate Random BST
                    </Button>
                    <Button variant="outline" onClick={reset} disabled={animating} className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-md">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Animation Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={animating}
                            className={speedKey === key ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md" : "border-indigo-300 text-gray-700 hover:bg-indigo-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100 rounded-xl border-2 border-indigo-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Tree Visualizer */}
                <div className="min-h-80 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-200 shadow-inner overflow-auto">
                    {!root ? (
                        <div className="flex items-center justify-center h-80 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🔍</div>
                                <span>Insert numbers to build your Binary Search Tree</span>
                                <p className="text-xs mt-2 text-gray-400">Left subtree &lt; Node &lt; Right subtree</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <svg width="800" height={svgHeight} className="mx-auto">
                                {renderTree(root)}
                            </svg>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 border-2 border-slate-400 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Unvisited</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-400 border-2 border-blue-600 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Search Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 border-2 border-amber-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Current Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-400 border-2 border-slate-600 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Visited</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Found/Result</span>
                    </div>
                </div>

                {/* BST Property Info */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 text-sm border-2 border-indigo-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🔍</span>
                        Binary Search Tree Properties
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        A Binary Search Tree is a special binary tree with the <strong>BST property</strong>: for every node, 
                        all values in the left subtree are less than the node's value, and all values in the right subtree 
                        are greater. This ordering enables efficient searching, insertion, and deletion operations.
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Key Insight:</strong> The BST property means an inorder traversal visits nodes in 
                            sorted order. This makes BSTs ideal for maintaining sorted data with dynamic insertions and deletions.
                        </p>
                    </div>
                    <div className="pt-3 border-t border-indigo-300">
                        <strong className="text-indigo-700">Average Case:</strong> <span className="text-gray-700">O(log n) for search, insert, delete</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <strong className="text-blue-700">Worst Case:</strong> <span className="text-gray-700">O(n) for skewed trees</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <strong className="text-cyan-700">Space:</strong> <span className="text-gray-700">O(n)</span>
                    </div>
                </div>

                {/* Operations Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-sm border-2 border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <span>➕</span> Insert & Search
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Insert:</strong> Start at root. Compare value with current node. Go left if smaller, 
                            right if larger. Insert at the first empty position found.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Search:</strong> Similar to insert, but stop when value is found or reach a null node. 
                            The path taken reveals the logarithmic search efficiency.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 text-sm border-2 border-red-200">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                            <span>🗑️</span> Delete Operation
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-1">
                            <strong>3 Cases:</strong>
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            • <strong>Leaf node:</strong> Simply remove<br/>
                            • <strong>One child:</strong> Replace node with its child<br/>
                            • <strong>Two children:</strong> Replace with inorder successor (smallest in right subtree), 
                            then delete the successor
                        </p>
                    </div>
                </div>

                {/* Min/Max Operations */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-sm border-2 border-green-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                            <h4 className="font-bold text-green-900 mb-1">Finding Minimum & Maximum</h4>
                            <p className="text-green-800">
                                <strong>Minimum:</strong> Keep going left until you can't anymore (leftmost node). 
                                <strong className="ml-3">Maximum:</strong> Keep going right until you can't anymore (rightmost node). 
                                Both operations take O(h) time where h is the tree height.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advantages */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-sm border-2 border-purple-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h4 className="font-bold text-purple-900 mb-1">Why Use BST?</h4>
                            <p className="text-purple-800">
                                BSTs combine the efficiency of binary search with the flexibility of linked structures. 
                                Unlike sorted arrays, BSTs support fast insertions and deletions. Unlike hash tables, 
                                BSTs maintain order and support range queries. Self-balancing variants (AVL, Red-Black) 
                                guarantee O(log n) worst-case performance.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}