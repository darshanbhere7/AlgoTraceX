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

export default function BinaryTree() {
    const [root, setRoot] = useState(null);
    const [currentInput, setCurrentInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [visitedNodes, setVisitedNodes] = useState(new Set());
    const [traversalResult, setTraversalResult] = useState([]);
    const [currentTraversal, setCurrentTraversal] = useState("");

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const insertNode = (node, value, path = []) => {
        if (node === null) {
            return new TreeNode(value);
        }

        // For a general binary tree, we'll try to keep it balanced
        // Insert left if left is null or left subtree is smaller
        const leftSize = getTreeSize(node.left);
        const rightSize = getTreeSize(node.right);

        if (leftSize <= rightSize) {
            node.left = insertNode(node.left, value, [...path, 'L']);
        } else {
            node.right = insertNode(node.right, value, [...path, 'R']);
        }

        return node;
    };

    const getTreeSize = (node) => {
        if (node === null) return 0;
        return 1 + getTreeSize(node.left) + getTreeSize(node.right);
    };

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
            const newRoot = insertNode(root, val);
            setRoot(newRoot);
            setCurrentInput("");
        }
    };

    const generateRandomTree = () => {
        if (animating) return;
        let newRoot = null;
        const values = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
        
        for (const val of values) {
            newRoot = insertNode(newRoot, val);
        }
        
        setRoot(newRoot);
        setTraversalResult([]);
        setVisitedNodes(new Set());
    };

    const reset = () => {
        setRoot(null);
        setCurrentInput("");
        setAnimating(false);
        setCurrentStep("");
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setTraversalResult([]);
        setCurrentTraversal("");
    };

    // Preorder Traversal (Root -> Left -> Right)
    const preorderTraversal = async (node, result = []) => {
        if (node === null) return result;

        setHighlightedNodes(new Set([node.value]));
        setCurrentStep(`Visiting node: ${node.value} (Root)`);
        await sleep(delay);
        
        result.push(node.value);
        setTraversalResult([...result]);
        setVisitedNodes(prev => new Set([...prev, node.value]));
        await sleep(delay / 2);

        if (node.left) {
            setCurrentStep(`Moving to left child of ${node.value}`);
            await sleep(delay / 2);
            await preorderTraversal(node.left, result);
        }

        if (node.right) {
            setCurrentStep(`Moving to right child of ${node.value}`);
            await sleep(delay / 2);
            await preorderTraversal(node.right, result);
        }

        return result;
    };

    // Inorder Traversal (Left -> Root -> Right)
    const inorderTraversal = async (node, result = []) => {
        if (node === null) return result;

        if (node.left) {
            setCurrentStep(`Moving to left child of ${node.value}`);
            setHighlightedNodes(new Set([node.value]));
            await sleep(delay / 2);
            await inorderTraversal(node.left, result);
        }

        setHighlightedNodes(new Set([node.value]));
        setCurrentStep(`Visiting node: ${node.value} (Root)`);
        await sleep(delay);
        
        result.push(node.value);
        setTraversalResult([...result]);
        setVisitedNodes(prev => new Set([...prev, node.value]));
        await sleep(delay / 2);

        if (node.right) {
            setCurrentStep(`Moving to right child of ${node.value}`);
            await sleep(delay / 2);
            await inorderTraversal(node.right, result);
        }

        return result;
    };

    // Postorder Traversal (Left -> Right -> Root)
    const postorderTraversal = async (node, result = []) => {
        if (node === null) return result;

        if (node.left) {
            setHighlightedNodes(new Set([node.value]));
            setCurrentStep(`Moving to left child of ${node.value}`);
            await sleep(delay / 2);
            await postorderTraversal(node.left, result);
        }

        if (node.right) {
            setHighlightedNodes(new Set([node.value]));
            setCurrentStep(`Moving to right child of ${node.value}`);
            await sleep(delay / 2);
            await postorderTraversal(node.right, result);
        }

        setHighlightedNodes(new Set([node.value]));
        setCurrentStep(`Visiting node: ${node.value} (Root)`);
        await sleep(delay);
        
        result.push(node.value);
        setTraversalResult([...result]);
        setVisitedNodes(prev => new Set([...prev, node.value]));
        await sleep(delay / 2);

        return result;
    };

    // Level Order Traversal (Breadth-First)
    const levelOrderTraversal = async () => {
        if (!root) return;

        setAnimating(true);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setTraversalResult([]);
        setCurrentTraversal("Level Order");

        const queue = [root];
        const result = [];

        setCurrentStep("Starting Level Order Traversal (Breadth-First)...");
        await sleep(delay);

        while (queue.length > 0) {
            const node = queue.shift();
            
            setHighlightedNodes(new Set([node.value]));
            setCurrentStep(`Visiting node: ${node.value}`);
            await sleep(delay);
            
            result.push(node.value);
            setTraversalResult([...result]);
            setVisitedNodes(prev => new Set([...prev, node.value]));
            await sleep(delay / 2);

            if (node.left) {
                queue.push(node.left);
                setCurrentStep(`Adding left child ${node.left.value} to queue`);
                await sleep(delay / 2);
            }
            if (node.right) {
                queue.push(node.right);
                setCurrentStep(`Adding right child ${node.right.value} to queue`);
                await sleep(delay / 2);
            }
        }

        setCurrentStep("Level Order Traversal Complete! 🎉");
        await sleep(delay * 2);
        setHighlightedNodes(new Set());
        setAnimating(false);
    };

    const startTraversal = async (type) => {
        if (!root) return;

        setAnimating(true);
        setHighlightedNodes(new Set());
        setVisitedNodes(new Set());
        setTraversalResult([]);
        setCurrentTraversal(type);

        setCurrentStep(`Starting ${type} Traversal...`);
        await sleep(delay);

        if (type === "Preorder") {
            await preorderTraversal(root);
            setCurrentStep("Preorder Traversal Complete! 🎉");
        } else if (type === "Inorder") {
            await inorderTraversal(root);
            setCurrentStep("Inorder Traversal Complete! 🎉");
        } else if (type === "Postorder") {
            await postorderTraversal(root);
            setCurrentStep("Postorder Traversal Complete! 🎉");
        }

        await sleep(delay * 2);
        setHighlightedNodes(new Set());
        setAnimating(false);
    };

    // Render tree structure
    const renderTree = (node, x = 400, y = 60, level = 0, xOffset = 200) => {
        if (!node) return null;

        const nextOffset = xOffset / 2;
        const leftX = x - xOffset;
        const rightX = x + xOffset;
        const childY = y + 80;

        const isHighlighted = highlightedNodes.has(node.value);
        const isVisited = visitedNodes.has(node.value);

        return (
            <g key={`${node.value}-${x}-${y}`}>
                {/* Lines to children */}
                {node.left && (
                    <line
                        x1={x}
                        y1={y}
                        x2={leftX}
                        y2={childY}
                        stroke={isVisited ? "#10b981" : "#94a3b8"}
                        strokeWidth="2"
                        className="transition-all duration-300"
                    />
                )}
                {node.right && (
                    <line
                        x1={x}
                        y1={y}
                        x2={rightX}
                        y2={childY}
                        stroke={isVisited ? "#10b981" : "#94a3b8"}
                        strokeWidth="2"
                        className="transition-all duration-300"
                    />
                )}

                {/* Render children */}
                {node.left && renderTree(node.left, leftX, childY, level + 1, nextOffset)}
                {node.right && renderTree(node.right, rightX, childY, level + 1, nextOffset)}

                {/* Node circle */}
                <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill={isHighlighted ? "#f59e0b" : isVisited ? "#10b981" : "#60a5fa"}
                    stroke={isHighlighted ? "#d97706" : isVisited ? "#059669" : "#3b82f6"}
                    strokeWidth="3"
                    className="transition-all duration-300"
                    style={{
                        filter: isHighlighted ? "drop-shadow(0 0 10px #f59e0b)" : "none",
                        transform: isHighlighted ? "scale(1.2)" : "scale(1)",
                        transformOrigin: `${x}px ${y}px`
                    }}
                />
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
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
        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-blue-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Binary Tree Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Explore tree structure and traversal algorithms</p>
                </div>

                {/* Input Panel */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Enter number (0-999)"
                            value={currentInput}
                            disabled={animating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="w-48 border-blue-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={animating} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                            Insert
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomTree} disabled={animating} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                        Generate Random Tree
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={animating} className="border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md">
                        Reset
                    </Button>
                </div>

                {/* Traversal Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        onClick={() => startTraversal("Preorder")}
                        disabled={animating || !root}
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md"
                    >
                        Preorder (Root-L-R)
                    </Button>
                    <Button
                        onClick={() => startTraversal("Inorder")}
                        disabled={animating || !root}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md"
                    >
                        Inorder (L-Root-R)
                    </Button>
                    <Button
                        onClick={() => startTraversal("Postorder")}
                        disabled={animating || !root}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
                    >
                        Postorder (L-R-Root)
                    </Button>
                    <Button
                        onClick={levelOrderTraversal}
                        disabled={animating || !root}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                    >
                        Level Order (BFS)
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
                            className={speedKey === key ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "border-blue-300 text-gray-700 hover:bg-blue-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl border-2 border-blue-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Traversal Result */}
                {traversalResult.length > 0 && (
                    <div className="text-center p-4 bg-white/70 rounded-xl border-2 border-purple-300 shadow-md">
                        <span className="text-sm font-semibold text-purple-700">{currentTraversal} Result: </span>
                        <span className="text-lg font-bold text-gray-800">
                            [{traversalResult.join(", ")}]
                        </span>
                    </div>
                )}

                {/* Tree Visualizer */}
                <div className="min-h-80 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-inner overflow-auto">
                    {!root ? (
                        <div className="flex items-center justify-center h-80 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🌳</div>
                                <span>Insert numbers to build your binary tree</span>
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
                        <div className="w-6 h-6 bg-blue-400 border-2 border-blue-600 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Unvisited</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 border-2 border-amber-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Currently Visiting</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Visited</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 text-sm border-2 border-blue-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🌳</span>
                        Binary Tree Structure
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        A binary tree is a hierarchical data structure where each node has at most two children, referred to as 
                        the left child and right child. Unlike a binary search tree, a general binary tree doesn't maintain any 
                        specific ordering property between parent and child nodes.
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Tree Properties:</strong> Height is the longest path from root to leaf. A complete binary tree 
                            has all levels filled except possibly the last. This visualizer maintains balance by inserting new nodes 
                            into the smaller subtree.
                        </p>
                    </div>
                </div>

                {/* Traversal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 text-sm border-2 border-red-200">
                        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                            <span>📍</span> Depth-First Traversals
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Preorder (Root-Left-Right):</strong> Process root first, then recursively traverse left and right subtrees. 
                            Useful for copying trees or prefix expressions.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Inorder (Left-Root-Right):</strong> Traverse left subtree, process root, then right subtree. 
                            For BSTs, this gives sorted order.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Postorder (Left-Right-Root):</strong> Process children before parent. 
                            Useful for deleting trees or postfix expressions.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-sm border-2 border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                            <span>🔄</span> Breadth-First Traversal
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Level Order:</strong> Visit nodes level by level from top to bottom, left to right. 
                            Uses a queue data structure (FIFO).
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            Useful for finding shortest path, level-wise processing, or when you need to process nodes 
                            in order of their distance from the root.
                        </p>
                    </div>
                </div>

                {/* Complexity Info */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-sm border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h4 className="font-bold text-blue-900 mb-1">Time & Space Complexity</h4>
                            <p className="text-blue-800">
                                <strong>All traversals:</strong> O(n) time to visit each node once. 
                                <strong> Space:</strong> O(h) for recursion stack where h is height. 
                                For balanced trees h = O(log n), worst case h = O(n) for skewed trees.
                                Level order uses O(w) space where w is maximum width.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}