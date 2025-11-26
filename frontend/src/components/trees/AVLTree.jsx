import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

const speedOptions = {
    "0.25x": 1500,
    "0.5x": 1000,
    "1x": 600,
    "2x": 300,
    "4x": 150,
};

export default function AVLTree() {
    const [root, setRoot] = useState(null);
    const [currentInput, setCurrentInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [rotationNodes, setRotationNodes] = useState(new Set());
    const [traversalResult, setTraversalResult] = useState([]);
    const [currentTraversal, setCurrentTraversal] = useState("");
    const [showInfo, setShowInfo] = useState(false);

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const getHeight = (node) => {
        return node ? node.height : 0;
    };

    const getBalance = (node) => {
        return node ? getHeight(node.left) - getHeight(node.right) : 0;
    };

    const updateHeight = (node) => {
        if (node) {
            node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
        }
    };

    const rightRotate = async (y) => {
        setCurrentStep(`Performing RIGHT rotation on node ${y.value}`);
        setRotationNodes(new Set([y.value, y.left?.value]));
        await sleep(delay * 2);

        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        updateHeight(y);
        updateHeight(x);

        setRotationNodes(new Set());
        return x;
    };

    const leftRotate = async (x) => {
        setCurrentStep(`Performing LEFT rotation on node ${x.value}`);
        setRotationNodes(new Set([x.value, x.right?.value]));
        await sleep(delay * 2);

        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        updateHeight(x);
        updateHeight(y);

        setRotationNodes(new Set());
        return y;
    };

    const insertNode = async (node, value, isAnimating = false) => {
        if (node === null) {
            if (isAnimating) {
                setCurrentStep(`Inserting ${value} at leaf position`);
                setHighlightedNodes(new Set([value]));
                await sleep(delay);
            }
            return new AVLNode(value);
        }

        if (isAnimating) {
            setHighlightedNodes(new Set([node.value]));
            setCurrentStep(`Comparing ${value} with ${node.value}`);
            await sleep(delay);
        }

        if (value < node.value) {
            if (isAnimating) {
                setCurrentStep(`${value} < ${node.value}, going left`);
                await sleep(delay / 2);
            }
            node.left = await insertNode(node.left, value, isAnimating);
        } else if (value > node.value) {
            if (isAnimating) {
                setCurrentStep(`${value} > ${node.value}, going right`);
                await sleep(delay / 2);
            }
            node.right = await insertNode(node.right, value, isAnimating);
        } else {
            if (isAnimating) {
                setCurrentStep(`Value ${value} already exists, skipping`);
                await sleep(delay);
            }
            return node;
        }

        updateHeight(node);

        const balance = getBalance(node);

        if (isAnimating) {
            setCurrentStep(`Checking balance at node ${node.value}: ${balance}`);
            setHighlightedNodes(new Set([node.value]));
            await sleep(delay);
        }

        // Left Left Case
        if (balance > 1 && value < node.left.value) {
            if (isAnimating) {
                setCurrentStep(`Left-Left imbalance detected at ${node.value}`);
                await sleep(delay);
            }
            return await rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && value > node.right.value) {
            if (isAnimating) {
                setCurrentStep(`Right-Right imbalance detected at ${node.value}`);
                await sleep(delay);
            }
            return await leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && value > node.left.value) {
            if (isAnimating) {
                setCurrentStep(`Left-Right imbalance detected at ${node.value}`);
                await sleep(delay);
            }
            node.left = await leftRotate(node.left);
            return await rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && value < node.right.value) {
            if (isAnimating) {
                setCurrentStep(`Right-Left imbalance detected at ${node.value}`);
                await sleep(delay);
            }
            node.right = await rightRotate(node.right);
            return await leftRotate(node);
        }

        return node;
    };

    const handleAddValue = async () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
            setAnimating(true);
            setHighlightedNodes(new Set());
            setCurrentStep(`Starting insertion of ${val}...`);
            await sleep(delay);

            const newRoot = await insertNode(root, val, true);
            setRoot(newRoot);
            setCurrentInput("");

            setCurrentStep(`Successfully inserted ${val}! Tree is balanced. ✨`);
            await sleep(delay);
            setHighlightedNodes(new Set());
            setCurrentStep("");
            setAnimating(false);
        }
    };

    const generateRandomTree = async () => {
        if (animating) return;
        setAnimating(true);
        let newRoot = null;
        const values = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);

        setCurrentStep("Generating random AVL tree...");
        await sleep(delay);

        for (const val of values) {
            newRoot = await insertNode(newRoot, val, false);
        }

        setRoot(newRoot);
        setTraversalResult([]);
        setCurrentStep("Random tree generated!");
        await sleep(delay);
        setCurrentStep("");
        setAnimating(false);
    };

    const reset = () => {
        setRoot(null);
        setCurrentInput("");
        setAnimating(false);
        setCurrentStep("");
        setHighlightedNodes(new Set());
        setRotationNodes(new Set());
        setTraversalResult([]);
        setCurrentTraversal("");
    };

    const inorderTraversal = (node, result = []) => {
        if (node === null) return result;
        inorderTraversal(node.left, result);
        result.push(node.value);
        inorderTraversal(node.right, result);
        return result;
    };

    const showInorderTraversal = () => {
        if (!root) return;
        const result = inorderTraversal(root);
        setTraversalResult(result);
        setCurrentTraversal("Inorder");
        setCurrentStep("Inorder traversal shows values in sorted order");
    };

    const renderTree = (node, x = 400, y = 60, level = 0, xOffset = 200) => {
        if (!node) return null;

        const nextOffset = xOffset / 2;
        const leftX = x - xOffset;
        const rightX = x + xOffset;
        const childY = y + 80;

        const isHighlighted = highlightedNodes.has(node.value);
        const isRotating = rotationNodes.has(node.value);
        const balance = getBalance(node);
        const isBalanced = Math.abs(balance) <= 1;

        return (
            <g key={`${node.value}-${x}-${y}`} className="tree-node">
                {/* Lines to children */}
                {node.left && (
                    <line
                        x1={x}
                        y1={y}
                        x2={leftX}
                        y2={childY}
                        stroke="#94a3b8"
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
                        stroke="#94a3b8"
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
                    fill={isRotating ? "#ec4899" : isHighlighted ? "#f59e0b" : isBalanced ? "#10b981" : "#ef4444"}
                    stroke={isRotating ? "#be185d" : isHighlighted ? "#d97706" : isBalanced ? "#059669" : "#dc2626"}
                    strokeWidth="3"
                    className={`node-circle transition-all duration-300 ${isHighlighted ? "highlighted" : ""} ${isRotating ? "rotating" : ""} ${isBalanced ? "balanced" : "imbalanced"}`}
                    style={{
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

                {/* Balance factor */}
                <text
                    x={x}
                    y={y - 40}
                    textAnchor="middle"
                    fill={Math.abs(balance) > 1 ? "#ef4444" : "#059669"}
                    fontSize="12"
                    fontWeight="bold"
                    className="pointer-events-none"
                >
                    BF: {balance}
                </text>

                {/* Height */}
                <text
                    x={x + 35}
                    y={y}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="10"
                    className="pointer-events-none"
                >
                    h:{node.height}
                </text>
            </g>
        );
    };

    const getTreeHeight = (node) => {
        if (!node) return 0;
        return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
    };

    const treeHeight = getTreeHeight(root);
    const svgHeight = Math.max(300, treeHeight * 80 + 60);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto">
            <style>{`
                .node-circle {
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.08));
                }
                .node-circle.highlighted,
                .node-circle.rotating {
                    transform: scale(1.08);
                    filter: drop-shadow(0 12px 20px rgba(16, 185, 129, 0.35));
                }
                .node-circle.rotating {
                    filter: drop-shadow(0 12px 20px rgba(236, 72, 153, 0.35));
                }
                @media (prefers-color-scheme: dark) {
                    .node-circle {
                        filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.7));
                    }
                }
            `}</style>

            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    AVL Tree Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Watch how rotations keep the tree balanced while maintaining the Bubble Sort inspired UI.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2 flex-1 max-w-md">
                        <Input
                            type="number"
                            placeholder="Enter number (0-999)"
                            value={currentInput}
                            disabled={animating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                        />
                        <Button
                            onClick={handleAddValue}
                            disabled={animating}
                            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white dark:text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Insert
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={generateRandomTree}
                            disabled={animating}
                            className="flex-1 sm:flex-none h-10 relative transition-all duration-300 ease-out
                                        bg-slate-200/80 hover:bg-slate-300
                                        text-slate-700
                                        dark:bg-white/15 dark:hover:bg-white/15 dark:text-white
                                        rounded-md shadow-sm dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        >
                            <Shuffle className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Random</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={showInorderTraversal}
                            disabled={animating || !root}
                            className="flex-1 sm:flex-none
                                    bg-emerald-500/20 hover:bg-emerald-500/30
                                    dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30
                                    text-emerald-700 dark:text-emerald-300
                                    border border-emerald-500/20
                                    h-10 rounded-md shadow-none
                                    disabled:opacity-40"
                        >
                            Show Inorder
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={reset}
                            disabled={animating}
                            className="flex-1 sm:flex-none h-10 
                                        border border-slate-300 dark:border-white/10
                                        bg-white dark:bg-white/5
                                        text-slate-700 dark:text-white
                                        rounded-md 
                                        hover:bg-slate-100 dark:hover:bg-white/10
                                        px-4"
                        >
                            <RotateCcw className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Reset</span>
                        </Button>
                    </div>
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
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${speedKey === key
                                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm"
                                    : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm"
                                }`}
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {currentStep && (
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm">
                        {currentStep}
                    </div>
                )}
                {traversalResult.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-600 dark:text-white/60">
                            {currentTraversal} Result:
                        </span>
                        <span className="font-mono text-base">
                            [{traversalResult.join(", ")}]
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg dark:shadow-2xl min-h-[320px]">
                {!root ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-white/40">
                        <p className="text-base mb-2 text-center">Insert values or generate a tree to see AVL rotations</p>
                        <p className="text-sm text-slate-400 dark:text-white/30 text-center">
                            AVL keeps |balance factor| ≤ 1 at every node by performing rotations automatically
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
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Balanced</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span>Processing</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <span>Rotating</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Imbalanced</span>
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
                            AVL Tree Structure
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            AVL trees keep the difference between left and right subtree heights within one.
                            Each insertion may trigger single or double rotations, but guarantees the height stays O(log n).
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-2">
                            Balance Factor (BF) = height(left) − height(right). Valid values: −1, 0, +1. Rotations fire when |BF| &gt; 1.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Single Rotations
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                <strong>LL:</strong> Heavy on left-left → perform right rotation.
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                <strong>RR:</strong> Heavy on right-right → perform left rotation.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Double Rotations
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                <strong>LR:</strong> Left heavy but inserted on left-right → left rotation on child, then right rotation.
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                <strong>RL:</strong> Right heavy but inserted on right-left → right rotation on child, then left rotation.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Complexity
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Search/Insert/Delete all run in O(log n). Height never exceeds ≈1.44·log₂n, so lookup-heavy workloads remain fast.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                AVL vs BST
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                AVL trades more rotations and stored height metadata for guaranteed balance.
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Ideal for read-heavy systems (databases, file indexes) where consistent performance matters.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}