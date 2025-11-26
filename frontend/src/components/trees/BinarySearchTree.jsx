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
    const [showInfo, setShowInfo] = useState(false);

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
            <g key={`${node.value}-${x}-${y}`} className="tree-node">
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
                    className={`node-circle transition-all duration-300 ${isHighlighted ? "highlighted" : ""} ${isVisited ? "visited" : ""} ${isFound ? "found" : ""} ${isInPath ? "in-path" : ""}`}
                    style={{
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
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto">
            <style>{`
                .node-circle {
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.08));
                }
                .node-circle.highlighted {
                    transform: scale(1.08);
                    filter: drop-shadow(0 10px 18px rgba(251, 191, 36, 0.3));
                }
                .node-circle.in-path {
                    filter: drop-shadow(0 10px 18px rgba(59, 130, 246, 0.25));
                }
                .node-circle.found {
                    filter: drop-shadow(0 12px 20px rgba(16, 185, 129, 0.4));
                }
                @media (prefers-color-scheme: dark) {
                    .node-circle {
                        filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.7));
                    }
                }
            `}</style>

            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Binary Search Tree Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Practice insert, search, delete, and min/max operations with a layout that mirrors the Bubble Sort experience.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Insert value (0-999)"
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
                            className="h-10 px-4 bg-black hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white dark:text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Insert
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Search value"
                            value={searchInput}
                            disabled={animating}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && searchValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                        />
                        <Button
                            variant="ghost"
                            onClick={searchValue}
                            disabled={animating || !root}
                            className="h-10 px-4 
                            bg-emerald-500/20 hover:bg-emerald-500/30
                            dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30
                            text-emerald-700 dark:text-emerald-300
                            border border-emerald-500/20
                            rounded-md shadow-none 
                            disabled:opacity-40"
                        >
                            Search
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Delete value"
                            value={deleteInput}
                            disabled={animating}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && deleteValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                        />
                        <Button
                            variant="ghost"
                            onClick={deleteValue}
                            disabled={animating || !root}
                            className="h-10 px-4 
                            bg-rose-500/20 hover:bg-rose-500/30
                            dark:bg-rose-400/20 dark:hover:bg-rose-400/30
                            text-rose-700 dark:text-rose-300
                            border border-rose-500/20
                            rounded-md shadow-none
                            disabled:opacity-40"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => findMinMax("min")}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none
                                bg-cyan-500/20 hover:bg-cyan-500/30
                                dark:bg-cyan-400/20 dark:hover:bg-cyan-400/30
                                text-cyan-700 dark:text-cyan-300
                                border border-cyan-500/20
                                h-10 rounded-md shadow-none
                                disabled:opacity-40"
                    >
                        Find Minimum
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => findMinMax("max")}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none
                                bg-amber-500/20 hover:bg-amber-500/30
                                dark:bg-amber-400/20 dark:hover:bg-amber-400/30
                                text-amber-700 dark:text-amber-300
                                border border-amber-500/20
                                h-10 rounded-md shadow-none
                                disabled:opacity-40"
                    >
                        Find Maximum
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={generateRandomBST}
                        disabled={animating}
                        className="flex-1 sm:flex-none h-10 relative transition-all duration-300 ease-out
                                        bg-slate-200/80 hover:bg-slate-300
                                        text-slate-700
                                        dark:bg-white/15 dark:hover:bg-white/15 dark:text-white
                                        rounded-md shadow-sm dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        <Shuffle className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Random BST</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={reset}
                        disabled={animating}
                        className="flex-1 sm:flex-none h-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-white/10 px-4"
                    >
                        <RotateCcw className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Reset</span>
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

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg dark:shadow-2xl min-h-[320px]">
                {!root ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-white/40">
                        <p className="text-base mb-2 text-center">Insert values or generate a random BST to get started</p>
                        <p className="text-sm text-slate-400 dark:text-white/30 text-center">
                            BST property: left subtree &lt; node &lt; right subtree
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center overflow-x-auto py-2">
                        <svg width="900" height={svgHeight} className="mx-auto">
                            {renderTree(root)}
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span>Unvisited</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400" />
                    <span>Search Path</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span>Current Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-500" />
                    <span>Visited</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Found</span>
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
                <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2 text-base">
                            Binary Search Tree Properties
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Each node keeps smaller values on the left and larger values on the right. This ordering makes inorder traversal naturally sorted,
                            and gives BSTs their logarithmic behavior when the tree stays balanced.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-2">
                            Average case: O(log n) for insert/search/delete. Worst case: O(n) for skewed trees. Space: O(n).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Insert & Search
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                Compare against each node starting from the root. Go left if the value is smaller, right if larger.
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Search stops early when the value is found or a null child is reached, mirroring binary search on arrays.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Delete (3 cases)
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Remove leaves directly, bypass nodes with one child, or replace nodes with two children using the inorder successor (smallest value in the right subtree) before deleting the duplicate.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Min & Max
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Minimum lives on the left-most branch, maximum on the right-most branch. Both operations run in O(h) where h is the height.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Why BSTs?
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                BSTs keep data sorted while still allowing dynamic updates. Self-balancing variants like AVL or Red-Black trees ensure O(log n) guaranteed performance.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}