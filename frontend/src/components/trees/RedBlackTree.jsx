import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const RED = 'RED';
const BLACK = 'BLACK';

class RBNode {
    constructor(value, color = RED) {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

const speedOptions = {
    "0.25x": 1500,
    "0.5x": 1000,
    "1x": 600,
    "2x": 300,
    "4x": 150,
};

export default function RedBlackTree() {
    const [root, setRoot] = useState(null);
    const [currentInput, setCurrentInput] = useState("");
    const [deleteInput, setDeleteInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedNodes, setHighlightedNodes] = useState(new Set());
    const [recoloringNodes, setRecoloringNodes] = useState(new Set());
    const [traversalResult, setTraversalResult] = useState([]);
    const [currentTraversal, setCurrentTraversal] = useState("");
    const [showInfo, setShowInfo] = useState(false);

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const rotateLeft = (node) => {
        const rightChild = node.right;
        node.right = rightChild.left;
        
        if (rightChild.left) {
            rightChild.left.parent = node;
        }
        
        rightChild.parent = node.parent;
        
        if (!node.parent) {
            // node was root
        } else if (node === node.parent.left) {
            node.parent.left = rightChild;
        } else {
            node.parent.right = rightChild;
        }
        
        rightChild.left = node;
        node.parent = rightChild;
        
        return rightChild;
    };

    const rotateRight = (node) => {
        const leftChild = node.left;
        node.left = leftChild.right;
        
        if (leftChild.right) {
            leftChild.right.parent = node;
        }
        
        leftChild.parent = node.parent;
        
        if (!node.parent) {
            // node was root
        } else if (node === node.parent.right) {
            node.parent.right = leftChild;
        } else {
            node.parent.left = leftChild;
        }
        
        leftChild.right = node;
        node.parent = leftChild;
        
        return leftChild;
    };

    const fixInsert = async (newRoot, node) => {
        while (node !== newRoot && node.parent && node.parent.color === RED) {
            if (node.parent === node.parent.parent?.left) {
                const uncle = node.parent.parent.right;
                
                if (uncle && uncle.color === RED) {
                    // Case 1: Uncle is red - recolor
                    setCurrentStep(`Case 1: Uncle is RED - recoloring parent, uncle, and grandparent`);
                    setRecoloringNodes(new Set([node.parent.value, uncle.value, node.parent.parent.value]));
                    await sleep(delay * 2);
                    
                    node.parent.color = BLACK;
                    uncle.color = BLACK;
                    node.parent.parent.color = RED;
                    node = node.parent.parent;
                    setRecoloringNodes(new Set());
                } else {
                    if (node === node.parent.right) {
                        // Case 2: Node is right child - left rotate
                        setCurrentStep(`Case 2: Node is right child - performing left rotation`);
                        setHighlightedNodes(new Set([node.value, node.parent.value]));
                        await sleep(delay * 2);
                        
                        node = node.parent;
                        const oldParent = node.parent;
                        const rotated = rotateLeft(node);
                        if (oldParent) {
                            if (oldParent.left && oldParent.left.value === node.value) {
                                oldParent.left = rotated;
                            } else {
                                oldParent.right = rotated;
                            }
                        } else {
                            newRoot = rotated;
                        }
                    }
                    
                    // Case 3: Node is left child - recolor and right rotate
                    setCurrentStep(`Case 3: Node is left child - recoloring and right rotation`);
                    setRecoloringNodes(new Set([node.parent.value, node.parent.parent.value]));
                    await sleep(delay * 2);
                    
                    node.parent.color = BLACK;
                    node.parent.parent.color = RED;
                    
                    const grandparent = node.parent.parent;
                    const greatGrandparent = grandparent.parent;
                    const rotated = rotateRight(grandparent);
                    
                    if (greatGrandparent) {
                        if (greatGrandparent.left === grandparent) {
                            greatGrandparent.left = rotated;
                        } else {
                            greatGrandparent.right = rotated;
                        }
                    } else {
                        newRoot = rotated;
                    }
                    setRecoloringNodes(new Set());
                }
            } else {
                const uncle = node.parent.parent?.left;
                
                if (uncle && uncle.color === RED) {
                    // Case 1: Uncle is red - recolor
                    setCurrentStep(`Case 1: Uncle is RED - recoloring parent, uncle, and grandparent`);
                    setRecoloringNodes(new Set([node.parent.value, uncle.value, node.parent.parent.value]));
                    await sleep(delay * 2);
                    
                    node.parent.color = BLACK;
                    uncle.color = BLACK;
                    node.parent.parent.color = RED;
                    node = node.parent.parent;
                    setRecoloringNodes(new Set());
                } else {
                    if (node === node.parent.left) {
                        // Case 2: Node is left child - right rotate
                        setCurrentStep(`Case 2: Node is left child - performing right rotation`);
                        setHighlightedNodes(new Set([node.value, node.parent.value]));
                        await sleep(delay * 2);
                        
                        node = node.parent;
                        const oldParent = node.parent;
                        const rotated = rotateRight(node);
                        if (oldParent) {
                            if (oldParent.right && oldParent.right.value === node.value) {
                                oldParent.right = rotated;
                            } else {
                                oldParent.left = rotated;
                            }
                        } else {
                            newRoot = rotated;
                        }
                    }
                    
                    // Case 3: Node is right child - recolor and left rotate
                    setCurrentStep(`Case 3: Node is right child - recoloring and left rotation`);
                    setRecoloringNodes(new Set([node.parent.value, node.parent.parent.value]));
                    await sleep(delay * 2);
                    
                    node.parent.color = BLACK;
                    node.parent.parent.color = RED;
                    
                    const grandparent = node.parent.parent;
                    const greatGrandparent = grandparent.parent;
                    const rotated = rotateLeft(grandparent);
                    
                    if (greatGrandparent) {
                        if (greatGrandparent.right === grandparent) {
                            greatGrandparent.right = rotated;
                        } else {
                            greatGrandparent.left = rotated;
                        }
                    } else {
                        newRoot = rotated;
                    }
                    setRecoloringNodes(new Set());
                }
            }
        }
        
        newRoot.color = BLACK;
        return newRoot;
    };

    const insertBST = (node, value, parent = null) => {
        if (!node) {
            const newNode = new RBNode(value, RED);
            newNode.parent = parent;
            return newNode;
        }

        if (value < node.value) {
            node.left = insertBST(node.left, value, node);
        } else if (value > node.value) {
            node.right = insertBST(node.right, value, node);
        }

        return node;
    };

    const findNode = (node, value) => {
        if (!node) return null;
        if (value === node.value) return node;
        if (value < node.value) return findNode(node.left, value);
        return findNode(node.right, value);
    };

    const handleAddValue = async () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
            setAnimating(true);
            setHighlightedNodes(new Set());
            setRecoloringNodes(new Set());
            setCurrentStep(`Starting insertion of ${val}...`);
            await sleep(delay);

            let newRoot = insertBST(root, val);
            const insertedNode = findNode(newRoot, val);
            
            if (insertedNode) {
                setCurrentStep(`Inserted ${val} as RED node (BST insertion)`);
                setHighlightedNodes(new Set([val]));
                await sleep(delay);
                
                if (!root) {
                    newRoot.color = BLACK;
                    setCurrentStep(`Root must be BLACK - recoloring`);
                    await sleep(delay);
                } else {
                    setCurrentStep(`Fixing Red-Black properties...`);
                    await sleep(delay);
                    newRoot = await fixInsert(newRoot, insertedNode);
                }
            }
            
            setRoot(newRoot);
            setCurrentInput("");

            setCurrentStep(`Successfully inserted ${val}! Tree satisfies RB properties. ✨`);
            await sleep(delay);
            setHighlightedNodes(new Set());
            setRecoloringNodes(new Set());
            setCurrentStep("");
            setAnimating(false);
        }
    };

    const getMinValueNode = (node) => {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    };

    const fixDelete = async (newRoot, x, xParent, isLeft) => {
        while (x !== newRoot && (!x || x.color === BLACK)) {
            if (isLeft) {
                let sibling = xParent.right;
                
                if (sibling && sibling.color === RED) {
                    setCurrentStep(`Case 1: Sibling is RED - recolor and rotate`);
                    setRecoloringNodes(new Set([sibling.value, xParent.value]));
                    await sleep(delay * 2);
                    
                    sibling.color = BLACK;
                    xParent.color = RED;
                    const rotated = rotateLeft(xParent);
                    if (xParent.parent && xParent.parent.parent) {
                        if (xParent.parent.parent.left === xParent.parent) {
                            xParent.parent.parent.left = rotated;
                        } else {
                            xParent.parent.parent.right = rotated;
                        }
                    } else {
                        newRoot = rotated;
                    }
                    sibling = xParent.right;
                    setRecoloringNodes(new Set());
                }
                
                if ((!sibling?.left || sibling.left.color === BLACK) &&
                    (!sibling?.right || sibling.right.color === BLACK)) {
                    if (sibling) {
                        setCurrentStep(`Case 2: Sibling's children are BLACK - recolor sibling`);
                        setRecoloringNodes(new Set([sibling.value]));
                        await sleep(delay * 2);
                        sibling.color = RED;
                        setRecoloringNodes(new Set());
                    }
                    x = xParent;
                    xParent = x.parent;
                    isLeft = xParent && xParent.left === x;
                } else {
                    if (!sibling?.right || sibling.right.color === BLACK) {
                        if (sibling?.left) {
                            setCurrentStep(`Case 3: Sibling's right child is BLACK - recolor and rotate`);
                            await sleep(delay * 2);
                            sibling.left.color = BLACK;
                        }
                        if (sibling) sibling.color = RED;
                        const rotated = rotateRight(sibling);
                        xParent.right = rotated;
                        sibling = xParent.right;
                    }
                    
                    if (sibling) {
                        setCurrentStep(`Case 4: Final rotation and recoloring`);
                        await sleep(delay * 2);
                        sibling.color = xParent.color;
                        xParent.color = BLACK;
                        if (sibling.right) sibling.right.color = BLACK;
                        const rotated = rotateLeft(xParent);
                        if (xParent.parent) {
                            if (xParent.parent.left === xParent) {
                                xParent.parent.left = rotated;
                            } else {
                                xParent.parent.right = rotated;
                            }
                        } else {
                            newRoot = rotated;
                        }
                    }
                    break;
                }
            } else {
                let sibling = xParent.left;
                
                if (sibling && sibling.color === RED) {
                    setCurrentStep(`Case 1: Sibling is RED - recolor and rotate`);
                    setRecoloringNodes(new Set([sibling.value, xParent.value]));
                    await sleep(delay * 2);
                    
                    sibling.color = BLACK;
                    xParent.color = RED;
                    const rotated = rotateRight(xParent);
                    if (xParent.parent && xParent.parent.parent) {
                        if (xParent.parent.parent.right === xParent.parent) {
                            xParent.parent.parent.right = rotated;
                        } else {
                            xParent.parent.parent.left = rotated;
                        }
                    } else {
                        newRoot = rotated;
                    }
                    sibling = xParent.left;
                    setRecoloringNodes(new Set());
                }
                
                if ((!sibling?.right || sibling.right.color === BLACK) &&
                    (!sibling?.left || sibling.left.color === BLACK)) {
                    if (sibling) {
                        setCurrentStep(`Case 2: Sibling's children are BLACK - recolor sibling`);
                        setRecoloringNodes(new Set([sibling.value]));
                        await sleep(delay * 2);
                        sibling.color = RED;
                        setRecoloringNodes(new Set());
                    }
                    x = xParent;
                    xParent = x.parent;
                    isLeft = xParent && xParent.left === x;
                } else {
                    if (!sibling?.left || sibling.left.color === BLACK) {
                        if (sibling?.right) {
                            setCurrentStep(`Case 3: Sibling's left child is BLACK - recolor and rotate`);
                            await sleep(delay * 2);
                            sibling.right.color = BLACK;
                        }
                        if (sibling) sibling.color = RED;
                        const rotated = rotateLeft(sibling);
                        xParent.left = rotated;
                        sibling = xParent.left;
                    }
                    
                    if (sibling) {
                        setCurrentStep(`Case 4: Final rotation and recoloring`);
                        await sleep(delay * 2);
                        sibling.color = xParent.color;
                        xParent.color = BLACK;
                        if (sibling.left) sibling.left.color = BLACK;
                        const rotated = rotateRight(xParent);
                        if (xParent.parent) {
                            if (xParent.parent.right === xParent) {
                                xParent.parent.right = rotated;
                            } else {
                                xParent.parent.left = rotated;
                            }
                        } else {
                            newRoot = rotated;
                        }
                    }
                    break;
                }
            }
        }
        
        if (x) x.color = BLACK;
        return newRoot;
    };

    const deleteNodeRB = async (node, value, parent = null, isLeft = true) => {
        if (!node) return null;

        if (value < node.value) {
            node.left = await deleteNodeRB(node.left, value, node, true);
        } else if (value > node.value) {
            node.right = await deleteNodeRB(node.right, value, node, false);
        } else {
            setCurrentStep(`Found node ${value} - preparing for deletion`);
            setHighlightedNodes(new Set([value]));
            await sleep(delay);

            if (!node.left || !node.right) {
                const child = node.left || node.right;
                
                if (node.color === BLACK) {
                    if (child && child.color === RED) {
                        child.color = BLACK;
                        setCurrentStep(`Simple case: replacing BLACK node with RED child, recoloring to BLACK`);
                        await sleep(delay);
                    } else {
                        setCurrentStep(`Complex case: BLACK node with BLACK/null child - fixing properties`);
                        await sleep(delay);
                        node = await fixDelete(node, child, parent, isLeft);
                        return child;
                    }
                }
                
                return child;
            } else {
                setCurrentStep(`Node has two children - finding inorder successor`);
                await sleep(delay);
                
                const successor = getMinValueNode(node.right);
                setHighlightedNodes(new Set([successor.value]));
                await sleep(delay);
                
                node.value = successor.value;
                setCurrentStep(`Replaced ${value} with successor ${successor.value}`);
                await sleep(delay);
                
                node.right = await deleteNodeRB(node.right, successor.value, node, false);
            }
        }

        return node;
    };

    const handleDeleteValue = async () => {
        const val = parseInt(deleteInput.trim());
        if (!isNaN(val) && root) {
            setAnimating(true);
            setHighlightedNodes(new Set());
            setRecoloringNodes(new Set());
            setCurrentStep(`Starting deletion of ${val}...`);
            await sleep(delay);

            const newRoot = await deleteNodeRB(root, val);
            if (newRoot) newRoot.color = BLACK;
            
            setRoot(newRoot);
            setDeleteInput("");

            setCurrentStep(newRoot ? `Successfully deleted ${val}! Tree satisfies RB properties. ✨` : `Tree is now empty.`);
            await sleep(delay);
            setHighlightedNodes(new Set());
            setRecoloringNodes(new Set());
            setCurrentStep("");
            setAnimating(false);
        }
    };

    const generateRandomTree = async () => {
        if (animating) return;
        setAnimating(true);
        let newRoot = null;
        const values = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
        
        setCurrentStep("Generating random Red-Black tree...");
        await sleep(delay);

        for (const val of values) {
            newRoot = insertBST(newRoot, val);
            const insertedNode = findNode(newRoot, val);
            if (insertedNode) {
                if (!newRoot.parent) {
                    newRoot.color = BLACK;
                } else {
                    newRoot = await fixInsert(newRoot, insertedNode);
                }
            }
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
        setDeleteInput("");
        setAnimating(false);
        setCurrentStep("");
        setHighlightedNodes(new Set());
        setRecoloringNodes(new Set());
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
        const isRecoloring = recoloringNodes.has(node.value);
        const isRed = node.color === RED;

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
                    fill={isRecoloring ? "#a855f7" : isHighlighted ? "#fbbf24" : isRed ? "#ef4444" : "#1f2937"}
                    stroke={isRecoloring ? "#7c3aed" : isHighlighted ? "#f59e0b" : isRed ? "#dc2626" : "#000000"}
                    strokeWidth="3"
                    className={`node-circle transition-all duration-300 ${isHighlighted ? "highlighted" : ""} ${isRecoloring ? "recoloring" : ""} ${isRed ? "red-node" : "black-node"}`}
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
                .node-circle.recoloring {
                    transform: scale(1.08);
                    filter: drop-shadow(0 12px 20px rgba(251, 191, 36, 0.35));
                }
                .node-circle.recoloring {
                    filter: drop-shadow(0 12px 20px rgba(168, 85, 247, 0.4));
                }
                @media (prefers-color-scheme: dark) {
                    .node-circle {
                        filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.7));
                    }
                }
            `}</style>

            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Red-Black Tree Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Insert, delete, recolor, and rotate nodes while keeping the Red-Black properties intact.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="grid gap-3 md:grid-cols-2">
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
                            inputMode="numeric"
                            pattern="\\d{1,3}"
                            title="Enter an integer between 0 and 999."
                        />
                        <Button
                            variant="ghost"
                            onClick={handleAddValue}
                            disabled={animating}
                            className="h-10 px-4 border border-rose-200 dark:border-rose-400/40 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Insert
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Delete value"
                            value={deleteInput}
                            disabled={animating}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleDeleteValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                            inputMode="numeric"
                            pattern="\\d{1,3}"
                            title="Enter an integer between 0 and 999."
                        />
                        <Button
                            variant="ghost"
                            onClick={handleDeleteValue}
                            disabled={animating || !root}
                            className="h-10 px-4 border border-orange-200 dark:border-orange-400/40 bg-orange-50/80 dark:bg-orange-950/30 text-orange-700 dark:text-orange-200 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={generateRandomTree}
                        disabled={animating}
                        className="flex-1 sm:flex-none h-10 border border-slate-200 dark:border-white/10 bg-slate-200/70 dark:bg-white/10 text-slate-900 dark:text-white rounded-md shadow-sm disabled:opacity-60"
                    >
                        <Shuffle className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Random Tree</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={showInorderTraversal}
                        disabled={animating || !root}
                        className="flex-1 sm:flex-none h-10 border border-amber-200 dark:border-amber-400/40 bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-200 rounded-md shadow-sm disabled:opacity-60"
                    >
                        Show Inorder
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={reset}
                        disabled={animating}
                        className="flex-1 sm:flex-none h-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md shadow-sm disabled:opacity-60"
                    >
                        <RotateCcw className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Reset</span>
                    </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Speed</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={animating}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${
                                speedKey === key
                                    ? "bg-slate-900 hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm"
                                    : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5"
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
                        <span className="font-mono text-base">[{traversalResult.join(", ")}]</span>
                    </div>
                )}
            </div>

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg dark:shadow-2xl min-h-[320px]">
                {!root ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-white/40">
                        <p className="text-base mb-2 text-center">Insert or randomize values to build your Red-Black tree</p>
                        <p className="text-sm text-slate-400 dark:text-white/30 text-center">
                            Root must stay black • No two red nodes adjacent • Equal black height on every path
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
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Red Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-900" />
                    <span>Black Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span>Current Case</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Recoloring</span>
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
                            Red-Black Properties
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Every node is red or black, the root and leaves (NIL) are black, red nodes never have red children,
                            and every root-to-leaf path contains the same number of black nodes. These invariants keep height ≤ 2·log₂(n+1).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Insertion Cases
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                Case 1 – red uncle: recolor parent/uncle/grandparent and keep climbing.
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                Case 2 – triangle (LR/RL): rotate around parent to turn it into Case 3.
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Case 3 – line (LL/RR): recolor and rotate grandparent to restore balance.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Deletion Cases
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Handle red siblings (rotate first), black siblings with black kids (recolor and move up),
                                or black siblings with a red child (rotate once more). Each branch preserves black height.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                Complexity
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Search / insert / delete are O(log n). At most two rotations per insert,
                                making RB trees great when writes happen frequently.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">
                                RB vs AVL
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs mb-2">
                                AVL stays tighter (faster reads) while RB uses fewer rotations (faster writes).
                            </p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Used in C++ STL maps/sets, Java TreeMap/TreeSet, Linux schedulers, and many database indexes.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}