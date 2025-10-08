import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
                    fill={isRecoloring ? "#a855f7" : isHighlighted ? "#fbbf24" : isRed ? "#ef4444" : "#1f2937"}
                    stroke={isRecoloring ? "#7c3aed" : isHighlighted ? "#f59e0b" : isRed ? "#dc2626" : "#000000"}
                    strokeWidth="3"
                    className="transition-all duration-300"
                    style={{
                        filter: isHighlighted || isRecoloring ? "drop-shadow(0 0 10px currentColor)" : "none",
                        transform: isHighlighted || isRecoloring ? "scale(1.2)" : "scale(1)",
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
        <Card className="bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-rose-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
                        Red-Black Tree Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Self-balancing BST with color-based balancing rules</p>
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
                            className="w-48 border-rose-300 bg-white focus:border-rose-500 focus:ring-rose-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={animating} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white shadow-md">
                            Insert
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Delete number"
                            value={deleteInput}
                            disabled={animating}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleDeleteValue()}
                            className="w-48 border-orange-300 bg-white focus:border-orange-500 focus:ring-orange-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleDeleteValue} disabled={animating || !root} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                            Delete
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomTree} disabled={animating} className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                        Generate Random Tree
                    </Button>
                    
                    <Button onClick={showInorderTraversal} disabled={animating || !root} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                        Show Inorder
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={animating} className="border-rose-300 text-rose-700 hover:bg-rose-50 shadow-md">
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
                            className={speedKey === key ? "bg-rose-600 text-white hover:bg-rose-700 shadow-md" : "border-rose-300 text-gray-700 hover:bg-rose-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-rose-100 via-red-100 to-orange-100 rounded-xl border-2 border-rose-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Traversal Result */}
                {traversalResult.length > 0 && (
                    <div className="text-center p-4 bg-white/70 rounded-xl border-2 border-red-300 shadow-md">
                        <span className="text-sm font-semibold text-red-700">{currentTraversal} Result: </span>
                        <span className="text-lg font-bold text-gray-800">
                            [{traversalResult.join(", ")}]
                        </span>
                    </div>
                )}

                {/* Tree Visualizer */}
                <div className="min-h-80 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-rose-200 shadow-inner overflow-auto">
                    {!root ? (
                        <div className="flex items-center justify-center h-80 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🔴⚫</div>
                                <span>Insert numbers to build your Red-Black tree</span>
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
                        <div className="w-6 h-6 bg-red-500 border-2 border-red-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Red Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-800 border-2 border-black rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Black Node</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 border-2 border-amber-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Currently Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 border-2 border-purple-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Recoloring</span>
                    </div>
                </div>

                {/* Red-Black Tree Properties */}
                <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-5 text-sm border-2 border-rose-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🔴⚫</span>
                        Red-Black Tree Properties
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        A Red-Black tree is a self-balancing binary search tree where each node has a color (red or black). 
                        It maintains balance through five key properties that ensure the tree height remains O(log n).
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3 space-y-1">
                        <p className="text-gray-700 text-xs"><strong>1.</strong> Every node is either red or black</p>
                        <p className="text-gray-700 text-xs"><strong>2.</strong> The root is always black</p>
                        <p className="text-gray-700 text-xs"><strong>3.</strong> All leaves (NIL) are black</p>
                        <p className="text-gray-700 text-xs"><strong>4.</strong> Red nodes cannot have red children (no two consecutive red nodes)</p>
                        <p className="text-gray-700 text-xs"><strong>5.</strong> Every path from root to leaves contains the same number of black nodes</p>
                    </div>
                </div>

                {/* Insertion Cases */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-sm border-2 border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <span>➕</span> Insertion Cases
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Case 1:</strong> Uncle is RED - Recolor parent, uncle, and grandparent. Move up the tree.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Case 2:</strong> Uncle is BLACK and node is right child (or left) - Rotate to convert to Case 3.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Case 3:</strong> Uncle is BLACK and node is left child (or right) - Recolor parent and grandparent, then rotate.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-sm border-2 border-orange-200">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                            <span>➖</span> Deletion Cases
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Case 1:</strong> Sibling is RED - Recolor and rotate to convert to other cases.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed mb-2">
                            <strong>Case 2:</strong> Sibling and its children are BLACK - Recolor sibling and move up.
                        </p>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Case 3 & 4:</strong> Sibling is BLACK with RED child - Rotate and recolor to fix the tree.
                        </p>
                    </div>
                </div>

                {/* Complexity Info */}
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-4 text-sm border-2 border-rose-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h4 className="font-bold text-rose-900 mb-1">Time & Space Complexity</h4>
                            <p className="text-rose-800">
                                <strong>Search, Insert, Delete:</strong> O(log n) guaranteed. 
                                <strong> Space:</strong> O(n) for storing n nodes, O(log n) recursion stack. 
                                Red-Black trees are less strictly balanced than AVL trees (height ≤ 2 × log(n+1)), 
                                but require fewer rotations during insertion and deletion, making them faster for write-heavy workloads.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Comparison Info */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 text-sm border-2 border-red-200">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <span>⚖️</span> RB Tree vs AVL Tree
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-rose-700">Red-Black Advantages:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>Fewer rotations (max 2 for insertion)</li>
                                <li>Faster insertions and deletions</li>
                                <li>Better for write-intensive applications</li>
                                <li>Used in Linux kernel, Java TreeMap</li>
                            </ul>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-emerald-700">AVL Advantages:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>More strictly balanced (faster lookups)</li>
                                <li>Better for read-intensive applications</li>
                                <li>Simpler balance factor calculation</li>
                                <li>Slightly better search performance</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Real-world Usage */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 text-sm border-2 border-amber-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🌍</span>
                        <div>
                            <h4 className="font-bold text-amber-900 mb-1">Real-World Applications</h4>
                            <p className="text-amber-800 text-xs leading-relaxed">
                                Red-Black trees are widely used in practice: <strong>C++ STL</strong> (map, set, multimap, multiset), 
                                <strong>Java</strong> (TreeMap, TreeSet), <strong>Linux kernel</strong> (scheduler, virtual memory), 
                                <strong>Databases</strong> (indexing structures), and more. Their balanced performance for both 
                                reads and writes makes them a popular choice for general-purpose balanced trees.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}