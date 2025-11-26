import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

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
    const [showInfo, setShowInfo] = useState(false);

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
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Binary Tree Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Same layout as the Binary Search Tree page, but focused on general tree behavior.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Value (0-999)"
                            value={currentInput}
                            disabled={animating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                        />
                        <Button
                            variant="ghost"
                            onClick={handleAddValue}
                            disabled={animating}
                            className="h-10 px-4 bg-black hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Insert
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={generateRandomTree}
                            disabled={animating}
                            className="flex-1 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/15 dark:hover:bg-white/20 dark:text-white rounded-md"
                        >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Random Tree
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={reset}
                            disabled={animating}
                            className="flex-1 h-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => startTraversal("Preorder")}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
                    >
                        Preorder (Root-L-R)
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => startTraversal("Inorder")}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 h-10 rounded-md"
                    >
                        Inorder (L-Root-R)
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => startTraversal("Postorder")}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none bg-sky-500/20 hover:bg-sky-500/30 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 text-sky-700 dark:text-sky-300 border border-sky-500/20 h-10 rounded-md"
                    >
                        Postorder (L-R-Root)
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={levelOrderTraversal}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none bg-violet-500/20 hover:bg-violet-500/30 dark:bg-violet-400/20 dark:hover:bg-violet-400/30 text-violet-700 dark:text-violet-300 border border-violet-500/20 h-10 rounded-md"
                    >
                        Level Order (BFS)
                    </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Speed</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            variant="ghost"
                            key={key}
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={animating}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${
                                speedKey === key
                                    ? "bg-black hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm"
                                    : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm"
                            }`}
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>

            {currentStep && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm mb-4">
                    {currentStep}
                </div>
            )}

            {traversalResult.length > 0 && (
                <div className="text-center p-4 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 mb-4">
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{currentTraversal} Result: </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                        [{traversalResult.join(", ")}]
                    </span>
                </div>
            )}

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 mb-4 shadow-lg overflow-auto min-h-[320px]">
                {!root ? (
                    <div className="flex items-center justify-center h-64 text-slate-500 dark:text-white/40">
                        <div className="text-center">
                            <span>Insert values to build your tree...</span>
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

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-400 border border-blue-600" />
                    <span>Unvisited</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 border border-amber-600" />
                    <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-400 border border-emerald-600" />
                    <span>Visited</span>
                </div>
            </div>

            <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/70 transition-colors text-sm font-medium"
            >
                <Info className="h-4 w-4" />
                Algorithm Info
                {showInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showInfo && (
                <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 space-y-4 animate-in slide-in-from-top-2 duration-300 text-sm">
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Binary Tree Structure</h3>
                        <p className="text-slate-600 dark:text-white/60">
                            A binary tree allows up to two children per node without enforcing ordering rules. This visualizer keeps the tree roughly balanced
                            by inserting into the smaller subtree when possible.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4">
                            <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Depth-First Traversals</h4>
                            <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                                <strong>Preorder:</strong> Root → Left → Right. Useful for copying trees or prefix notation.
                            </p>
                            <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                                <strong>Inorder:</strong> Left → Root → Right. Produces sorted order only for BSTs.
                            </p>
                            <p className="text-xs text-slate-600 dark:text-white/60">
                                <strong>Postorder:</strong> Left → Right → Root. Ideal for deleting trees or postfix notation.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4">
                            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Breadth-First Traversal</h4>
                            <p className="text-xs text-slate-600 dark:text-white/60 mb-2">
                                Level order uses a queue to visit nodes top-down, left-to-right. Great for shortest-path discovery and level-wise processing.
                            </p>
                            <p className="text-xs text-slate-600 dark:text-white/60">
                                Time is O(n) to visit each node; space is O(w) where w is the maximum width of the tree.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-4">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Complexity Notes</h4>
                        <p className="text-xs text-slate-600 dark:text-white/60">
                            Traversals touch every node (O(n)). Recursive depth consumes O(h) stack space (h = tree height). Balanced trees keep h ≈ log n,
                            while skewed trees degrade to O(n).
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}