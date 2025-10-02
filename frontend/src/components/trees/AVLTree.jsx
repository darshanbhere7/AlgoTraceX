import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
            <g key={`${node.value}-${x}-${y}`}>
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
                    className="transition-all duration-300"
                    style={{
                        filter: isHighlighted || isRotating ? "drop-shadow(0 0 10px currentColor)" : "none",
                        transform: isHighlighted || isRotating ? "scale(1.2)" : "scale(1)",
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
        <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-emerald-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        AVL Tree Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Self-balancing binary search tree with automatic rotations</p>
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
                            className="w-48 border-emerald-300 bg-white focus:border-emerald-500 focus:ring-emerald-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={animating} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                            Insert
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomTree} disabled={animating} className="bg-teal-600 hover:bg-teal-700 text-white shadow-md">
                        Generate Random Tree
                    </Button>
                    
                    <Button onClick={showInorderTraversal} disabled={animating || !root} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md">
                        Show Inorder
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={animating} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-md">
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
                            className={speedKey === key ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md" : "border-emerald-300 text-gray-700 hover:bg-emerald-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 rounded-xl border-2 border-emerald-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Traversal Result */}
                {traversalResult.length > 0 && (
                    <div className="text-center p-4 bg-white/70 rounded-xl border-2 border-teal-300 shadow-md">
                        <span className="text-sm font-semibold text-teal-700">{currentTraversal} Result: </span>
                        <span className="text-lg font-bold text-gray-800">
                            [{traversalResult.join(", ")}]
                        </span>
                    </div>
                )}

                {/* Tree Visualizer */}
                <div className="min-h-80 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-200 shadow-inner overflow-auto">
                    {!root ? (
                        <div className="flex items-center justify-center h-80 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">⚖️</div>
                                <span>Insert numbers to build your AVL tree</span>
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
                        <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Balanced (|BF| ≤ 1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 border-2 border-amber-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Currently Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-pink-500 border-2 border-pink-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Rotating</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500 border-2 border-red-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Imbalanced (|BF| &gt; 1)</span>
                    </div>
                </div>

                {/* AVL Tree Info */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 text-sm border-2 border-emerald-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">⚖️</span>
                        AVL Tree Structure
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        An AVL tree is a self-balancing binary search tree where the heights of the left and right subtrees 
                        of any node differ by at most one. Named after inventors Adelson-Velsky and Landis, it maintains 
                        balance through rotations during insertion and deletion operations.
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Balance Factor (BF):</strong> BF = Height(Left Subtree) - Height(Right Subtree). 
                            For an AVL tree, BF must be -1, 0, or +1 for every node. If |BF| &gt; 1, rotations are performed 
                            to restore balance.
                        </p>
                    </div>
                </div>

                {/* Rotation Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-sm border-2 border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <span>🔄</span> Single Rotations
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Left-Left (LL):</strong> When left subtree is too heavy and insertion was in left child's 
                            left subtree. Fix: Single right rotation.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Right-Right (RR):</strong> When right subtree is too heavy and insertion was in right child's 
                            right subtree. Fix: Single left rotation.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-sm border-2 border-purple-200">
                        <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                            <span>↔️</span> Double Rotations
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Left-Right (LR):</strong> When left subtree is heavy but insertion was in left child's 
                            right subtree. Fix: Left rotation on left child, then right rotation on root.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Right-Left (RL):</strong> When right subtree is heavy but insertion was in right child's 
                            left subtree. Fix: Right rotation on right child, then left rotation on root.
                        </p>
                    </div>
                </div>

                {/* Complexity Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4 text-sm border-2 border-emerald-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h4 className="font-bold text-emerald-900 mb-1">Time & Space Complexity</h4>
                            <p className="text-emerald-800">
                                <strong>Search, Insert, Delete:</strong> O(log n) guaranteed due to balanced height. 
                                <strong> Space:</strong> O(n) for storing n nodes, O(log n) recursion stack. 
                                The strict balancing ensures height never exceeds 1.44 × log n, making AVL trees ideal 
                                for lookup-intensive applications like databases and file systems.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advantages Info */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 text-sm border-2 border-teal-200">
                    <h4 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                        <span>✨</span> AVL vs Regular BST
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-emerald-700">AVL Advantages:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>Guaranteed O(log n) operations</li>
                                <li>Better for search-heavy workloads</li>
                                <li>Predictable performance</li>
                                <li>More strictly balanced than Red-Black trees</li>
                            </ul>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-orange-700">Trade-offs:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>More rotations during insertion/deletion</li>
                                <li>Slightly slower insertions vs Red-Black trees</li>
                                <li>Additional storage for height info</li>
                                <li>More complex implementation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}