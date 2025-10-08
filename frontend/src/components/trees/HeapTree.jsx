import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const speedOptions = {
    "0.25x": 1500,
    "0.5x": 1000,
    "1x": 600,
    "2x": 300,
    "4x": 150,
};

export default function HeapTree() {
    const [heap, setHeap] = useState([]);
    const [heapType, setHeapType] = useState("max"); // "max" or "min"
    const [currentInput, setCurrentInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedIndices, setHighlightedIndices] = useState(new Set());
    const [swappingIndices, setSwappingIndices] = useState(new Set());
    const [arrayView, setArrayView] = useState([]);

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const parent = (i) => Math.floor((i - 1) / 2);
    const leftChild = (i) => 2 * i + 1;
    const rightChild = (i) => 2 * i + 2;

    const compare = (a, b) => {
        return heapType === "max" ? a > b : a < b;
    };

    const heapifyUp = async (arr, index) => {
        let current = index;
        
        while (current > 0) {
            const parentIdx = parent(current);
            
            setHighlightedIndices(new Set([current, parentIdx]));
            setCurrentStep(`Comparing ${arr[current]} with parent ${arr[parentIdx]}`);
            await sleep(delay);

            if (compare(arr[current], arr[parentIdx])) {
                setCurrentStep(`Swapping ${arr[current]} with ${arr[parentIdx]}`);
                setSwappingIndices(new Set([current, parentIdx]));
                await sleep(delay);

                [arr[current], arr[parentIdx]] = [arr[parentIdx], arr[current]];
                setHeap([...arr]);
                
                await sleep(delay);
                setSwappingIndices(new Set());
                
                current = parentIdx;
            } else {
                setCurrentStep(`Heap property satisfied at index ${current}`);
                await sleep(delay);
                break;
            }
        }
    };

    const heapifyDown = async (arr, size, index) => {
        let current = index;

        while (true) {
            let target = current;
            const left = leftChild(current);
            const right = rightChild(current);

            setHighlightedIndices(new Set([current, left, right].filter(i => i < size)));
            setCurrentStep(`Checking children of ${arr[current]} at index ${current}`);
            await sleep(delay);

            if (left < size && compare(arr[left], arr[target])) {
                target = left;
            }
            if (right < size && compare(arr[right], arr[target])) {
                target = right;
            }

            if (target !== current) {
                setCurrentStep(`Swapping ${arr[current]} with ${arr[target]}`);
                setSwappingIndices(new Set([current, target]));
                await sleep(delay);

                [arr[current], arr[target]] = [arr[target], arr[current]];
                setHeap([...arr]);
                
                await sleep(delay);
                setSwappingIndices(new Set());
                
                current = target;
            } else {
                setCurrentStep(`Heap property satisfied at index ${current}`);
                await sleep(delay);
                break;
            }
        }
    };

    const handleInsert = async () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
            setAnimating(true);
            setHighlightedIndices(new Set());
            setSwappingIndices(new Set());
            
            const newHeap = [...heap, val];
            setHeap(newHeap);
            setCurrentStep(`Inserted ${val} at end of heap`);
            
            const newIndex = newHeap.length - 1;
            setHighlightedIndices(new Set([newIndex]));
            await sleep(delay);

            setCurrentStep(`Heapifying up from index ${newIndex}...`);
            await sleep(delay);

            await heapifyUp(newHeap, newIndex);
            
            setHeap(newHeap);
            setCurrentInput("");
            setCurrentStep(`Successfully inserted ${val}! Heap property maintained. ✨`);
            await sleep(delay);
            setHighlightedIndices(new Set());
            setCurrentStep("");
            setAnimating(false);
        }
    };

    const handleExtract = async () => {
        if (heap.length === 0) return;
        
        setAnimating(true);
        const root = heap[0];
        setHighlightedIndices(new Set([0]));
        setCurrentStep(`Extracting ${heapType === "max" ? "maximum" : "minimum"} value: ${root}`);
        await sleep(delay);

        if (heap.length === 1) {
            setHeap([]);
            setCurrentStep(`Heap is now empty`);
            await sleep(delay);
            setHighlightedIndices(new Set());
            setCurrentStep("");
            setAnimating(false);
            return;
        }

        const newHeap = [...heap];
        newHeap[0] = newHeap[newHeap.length - 1];
        newHeap.pop();
        
        setHeap(newHeap);
        setCurrentStep(`Moved last element ${newHeap[0]} to root`);
        setHighlightedIndices(new Set([0]));
        await sleep(delay);

        setCurrentStep(`Heapifying down from root...`);
        await sleep(delay);

        await heapifyDown(newHeap, newHeap.length, 0);
        
        setHeap(newHeap);
        setCurrentStep(`Extracted ${root}! Heap property restored. ✨`);
        await sleep(delay);
        setHighlightedIndices(new Set());
        setCurrentStep("");
        setAnimating(false);
    };

    const buildHeap = async (values) => {
        setAnimating(true);
        const newHeap = [...values];
        setHeap(newHeap);
        
        setCurrentStep("Building heap from array...");
        await sleep(delay);

        const startIdx = Math.floor(newHeap.length / 2) - 1;
        
        for (let i = startIdx; i >= 0; i--) {
            setCurrentStep(`Heapifying subtree rooted at index ${i}`);
            await sleep(delay / 2);
            await heapifyDown(newHeap, newHeap.length, i);
        }

        setHeap(newHeap);
        setCurrentStep("Heap built successfully! ✨");
        await sleep(delay);
        setHighlightedIndices(new Set());
        setCurrentStep("");
        setAnimating(false);
    };

    const generateRandomHeap = async () => {
        if (animating) return;
        const values = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
        await buildHeap(values);
    };

    const heapSort = async () => {
        if (heap.length === 0 || animating) return;
        
        setAnimating(true);
        const arr = [...heap];
        const sorted = [];
        
        setCurrentStep("Starting heap sort...");
        await sleep(delay);

        while (arr.length > 0) {
            const root = arr[0];
            sorted.push(root);
            
            setHighlightedIndices(new Set([0]));
            setCurrentStep(`Extracting ${root}`);
            await sleep(delay / 2);

            if (arr.length === 1) {
                arr.pop();
                break;
            }

            arr[0] = arr[arr.length - 1];
            arr.pop();
            setHeap([...arr]);
            await sleep(delay / 2);

            await heapifyDown(arr, arr.length, 0);
        }

        setArrayView(sorted);
        setCurrentStep(`Heap sort complete! ${heapType === "max" ? "Descending" : "Ascending"} order: [${sorted.join(", ")}]`);
        await sleep(delay * 2);
        setHighlightedIndices(new Set());
        setCurrentStep("");
        setAnimating(false);
    };

    const toggleHeapType = () => {
        if (animating) return;
        const newType = heapType === "max" ? "min" : "max";
        setHeapType(newType);
        if (heap.length > 0) {
            buildHeap(heap);
        }
        setArrayView([]);
    };

    const reset = () => {
        setHeap([]);
        setCurrentInput("");
        setAnimating(false);
        setCurrentStep("");
        setHighlightedIndices(new Set());
        setSwappingIndices(new Set());
        setArrayView([]);
    };

    const renderNode = (index, x, y, level, xOffset) => {
        if (index >= heap.length) return null;

        const value = heap[index];
        const left = leftChild(index);
        const right = rightChild(index);
        const nextOffset = xOffset / 2;
        const leftX = x - xOffset;
        const rightX = x + xOffset;
        const childY = y + 80;

        const isHighlighted = highlightedIndices.has(index);
        const isSwapping = swappingIndices.has(index);
        const isRoot = index === 0;

        return (
            <g key={`node-${index}`}>
                {/* Lines to children */}
                {left < heap.length && (
                    <line
                        x1={x}
                        y1={y}
                        x2={leftX}
                        y2={childY}
                        stroke="#7c3aed"
                        strokeWidth="2"
                        className="transition-all duration-300"
                    />
                )}
                {right < heap.length && (
                    <line
                        x1={x}
                        y1={y}
                        x2={rightX}
                        y2={childY}
                        stroke="#7c3aed"
                        strokeWidth="2"
                        className="transition-all duration-300"
                    />
                )}

                {/* Render children */}
                {left < heap.length && renderNode(left, leftX, childY, level + 1, nextOffset)}
                {right < heap.length && renderNode(right, rightX, childY, level + 1, nextOffset)}

                {/* Node circle */}
                <circle
                    cx={x}
                    cy={y}
                    r="28"
                    fill={isSwapping ? "#ec4899" : isHighlighted ? "#f59e0b" : isRoot ? "#8b5cf6" : "#a78bfa"}
                    stroke={isSwapping ? "#be185d" : isHighlighted ? "#d97706" : isRoot ? "#6d28d9" : "#7c3aed"}
                    strokeWidth="3"
                    className="transition-all duration-300"
                    style={{
                        filter: isHighlighted || isSwapping ? "drop-shadow(0 0 10px currentColor)" : "none",
                        transform: isHighlighted || isSwapping ? "scale(1.2)" : "scale(1)",
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
                    {value}
                </text>
                
                {/* Index */}
                <text
                    x={x}
                    y={y + 45}
                    textAnchor="middle"
                    fill="#6b7280"
                    fontSize="10"
                    className="pointer-events-none"
                >
                    [{index}]
                </text>
            </g>
        );
    };

    const getTreeHeight = () => {
        if (heap.length === 0) return 0;
        return Math.floor(Math.log2(heap.length)) + 1;
    };

    const treeHeight = getTreeHeight();
    const svgHeight = Math.max(300, treeHeight * 80 + 60);

    return (
        <Card className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-purple-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {heapType === "max" ? "Max" : "Min"} Heap Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Complete binary tree with heap property</p>
                </div>

                {/* Control Panel */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Enter number (0-999)"
                            value={currentInput}
                            disabled={animating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                            className="w-48 border-purple-300 bg-white focus:border-purple-500 focus:ring-purple-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleInsert} disabled={animating} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                            Insert
                        </Button>
                    </div>
                    
                    <Button onClick={handleExtract} disabled={animating || heap.length === 0} className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
                        Extract {heapType === "max" ? "Max" : "Min"}
                    </Button>
                    
                    <Button onClick={generateRandomHeap} disabled={animating} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-md">
                        Generate Random Heap
                    </Button>
                    
                    <Button onClick={heapSort} disabled={animating || heap.length === 0} className="bg-pink-600 hover:bg-pink-700 text-white shadow-md">
                        Heap Sort
                    </Button>
                    
                    <Button onClick={toggleHeapType} disabled={animating} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        Switch to {heapType === "max" ? "Min" : "Max"} Heap
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={animating} className="border-purple-300 text-purple-700 hover:bg-purple-50 shadow-md">
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
                            className={speedKey === key ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md" : "border-purple-300 text-gray-700 hover:bg-purple-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-purple-100 via-violet-100 to-fuchsia-100 rounded-xl border-2 border-purple-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Array View */}
                {arrayView.length > 0 && (
                    <div className="text-center p-4 bg-white/70 rounded-xl border-2 border-violet-300 shadow-md">
                        <span className="text-sm font-semibold text-violet-700">Sorted Result: </span>
                        <span className="text-lg font-bold text-gray-800">
                            [{arrayView.join(", ")}]
                        </span>
                    </div>
                )}

                {/* Heap Array Representation */}
                {heap.length > 0 && (
                    <div className="bg-white/70 rounded-xl border-2 border-purple-200 p-4">
                        <h4 className="text-sm font-semibold text-purple-700 mb-2">Array Representation:</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {heap.map((val, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-2 rounded-lg font-mono text-sm font-bold shadow-sm transition-all ${
                                        highlightedIndices.has(idx)
                                            ? "bg-amber-400 text-white scale-110"
                                            : swappingIndices.has(idx)
                                            ? "bg-pink-400 text-white scale-110"
                                            : idx === 0
                                            ? "bg-purple-500 text-white"
                                            : "bg-purple-200 text-purple-900"
                                    }`}
                                >
                                    {val}
                                    <span className="text-xs ml-1 opacity-70">[{idx}]</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tree Visualizer */}
                <div className="min-h-80 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-inner overflow-auto">
                    {heap.length === 0 ? (
                        <div className="flex items-center justify-center h-80 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🏔️</div>
                                <span>Insert numbers to build your heap</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <svg width="800" height={svgHeight} className="mx-auto">
                                {renderNode(0, 400, 60, 0, 200)}
                            </svg>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-600 border-2 border-purple-800 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Root ({heapType === "max" ? "Maximum" : "Minimum"})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-300 border-2 border-purple-600 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Internal Nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 border-2 border-amber-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Comparing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-pink-500 border-2 border-pink-700 rounded-full shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Swapping</span>
                    </div>
                </div>

                {/* Heap Info */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 text-sm border-2 border-purple-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🏔️</span>
                        {heapType === "max" ? "Max" : "Min"} Heap Structure
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        A heap is a complete binary tree that satisfies the heap property. In a <strong>{heapType} heap</strong>, 
                        {heapType === "max" 
                            ? " every parent node is greater than or equal to its children (root is maximum)."
                            : " every parent node is less than or equal to its children (root is minimum)."}
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Complete Binary Tree:</strong> All levels are fully filled except possibly the last level, 
                            which is filled from left to right. This property allows heaps to be efficiently stored in arrays 
                            without pointers.
                        </p>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>Array Indexing:</strong> For node at index i: Parent = ⌊(i-1)/2⌋, Left Child = 2i+1, Right Child = 2i+2
                        </p>
                    </div>
                </div>

                {/* Operations Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-sm border-2 border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                            <span>⬆️</span> Heapify Up (Bubble Up)
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            Used during insertion. The new element is added at the end (bottom-right) and repeatedly 
                            swapped with its parent if it violates the heap property, moving up the tree until the 
                            correct position is found. Time complexity: O(log n).
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 text-sm border-2 border-rose-200">
                        <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2">
                            <span>⬇️</span> Heapify Down (Bubble Down)
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed">
                            Used during extraction. After removing the root, the last element replaces it and is 
                            repeatedly swapped with its {heapType === "max" ? "larger" : "smaller"} child if it violates 
                            the heap property, moving down until correct. Time complexity: O(log n).
                        </p>
                    </div>
                </div>

                {/* Complexity Info */}
                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl p-4 text-sm border-2 border-purple-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h4 className="font-bold text-purple-900 mb-1">Time & Space Complexity</h4>
                            <p className="text-purple-800">
                                <strong>Insert:</strong> O(log n) - heapify up. 
                                <strong> Extract {heapType === "max" ? "Max" : "Min"}:</strong> O(log n) - heapify down. 
                                <strong> Peek:</strong> O(1) - just access root. 
                                <strong> Build Heap:</strong> O(n) using bottom-up approach. 
                                <strong> Space:</strong> O(n) for array storage. 
                                <strong> Heap Sort:</strong> O(n log n) time, O(1) extra space.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Applications */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-sm border-2 border-violet-200">
                    <h4 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
                        <span>💡</span> Common Applications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-purple-700">Priority Queues:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>Task scheduling systems</li>
                                <li>Event-driven simulation</li>
                                <li>Dijkstra's shortest path algorithm</li>
                                <li>Huffman coding (data compression)</li>
                            </ul>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-fuchsia-700">Real-world Uses:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>Heap sort algorithm</li>
                                <li>Finding K largest/smallest elements</li>
                                <li>Median maintenance (using two heaps)</li>
                                <li>Memory management (OS heap allocation)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Max vs Min Heap */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 text-sm border-2 border-indigo-200">
                    <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                        <span>⚖️</span> Max Heap vs Min Heap
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-indigo-700">Max Heap:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>Root is always the maximum element</li>
                                <li>Parent ≥ Children at every node</li>
                                <li>Used for descending priority queues</li>
                                <li>Heap sort produces descending order</li>
                            </ul>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                            <strong className="text-purple-700">Min Heap:</strong>
                            <ul className="mt-1 ml-4 list-disc text-gray-700 space-y-1">
                                <li>Root is always the minimum element</li>
                                <li>Parent ≤ Children at every node</li>
                                <li>Used for ascending priority queues</li>
                                <li>Heap sort produces ascending order</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}