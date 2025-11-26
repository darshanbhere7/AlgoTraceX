import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

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
    const [showInfo, setShowInfo] = useState(false);

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
        const fillColor = isSwapping
            ? "#ec4899"
            : isHighlighted
            ? "#f59e0b"
            : isRoot
            ? "#8b5cf6"
            : "#a78bfa";
        const strokeColor = isSwapping
            ? "#be185d"
            : isHighlighted
            ? "#d97706"
            : isRoot
            ? "#6d28d9"
            : "#7c3aed";

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
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="3"
                    className={`node-circle transition-all duration-300 ${isHighlighted ? "highlighted" : ""} ${
                        isSwapping ? "swapping" : ""
                    } ${isRoot ? "root-node" : ""}`}
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
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto">
            <style>{`
                .node-circle {
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.08));
                }
                .node-circle.highlighted,
                .node-circle.swapping {
                    transform: scale(1.08);
                    filter: drop-shadow(0 12px 20px rgba(251, 191, 36, 0.35));
                }
                .node-circle.swapping {
                    filter: drop-shadow(0 12px 20px rgba(236, 72, 153, 0.35));
                }
                .node-circle.root-node {
                    filter: drop-shadow(0 12px 18px rgba(139, 92, 246, 0.35));
                }
                @media (prefers-color-scheme: dark) {
                    .node-circle {
                        filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.7));
                    }
                }
            `}</style>

            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {heapType === "max" ? "Max Heap Visualizer" : "Min Heap Visualizer"}
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Insert, extract, sort, and switch heap types in a Bubble Sort inspired layout with full light/dark support.
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
                            onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                        />
                        <Button
                            onClick={handleInsert}
                            disabled={animating}
                            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Insert
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleExtract}
                            disabled={animating || heap.length === 0}
                            className="flex-1 sm:flex-none
                                    bg-emerald-500/20 hover:bg-emerald-500/30
                                    dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30
                                    text-emerald-700 dark:text-emerald-300
                                    border border-emerald-500/20
                                    h-10 rounded-md shadow-none
                                    disabled:opacity-40"
                        >
                            Extract {heapType === "max" ? "Max" : "Min"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={heapSort}
                            disabled={animating || heap.length === 0}
                            className="flex-1 sm:flex-none
                                    bg-indigo-500/20 hover:bg-indigo-500/30
                                    dark:bg-indigo-400/20 dark:hover:bg-indigo-400/30
                                    text-indigo-700 dark:text-indigo-300
                                    border border-indigo-500/20
                                    h-10 rounded-md shadow-none
                                    disabled:opacity-40"
                        >
                            Heap Sort
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={toggleHeapType}
                            disabled={animating}
                            className="flex-1 sm:flex-none
                                    bg-amber-500/20 hover:bg-amber-500/30
                                    dark:bg-amber-400/20 dark:hover:bg-amber-400/30
                                    text-amber-700 dark:text-amber-300
                                    border border-amber-500/20
                                    h-10 rounded-md shadow-none
                                    disabled:opacity-40"
                        >
                            Switch to {heapType === "max" ? "Min" : "Max"} Heap
                        </Button>
                        <Button
                        variant="ghost"
                            onClick={generateRandomHeap}
                            disabled={animating}
                            className="flex-1 sm:flex-none h-10 border-0 relative transition-all duration-300 ease-out bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-md"
                        >
                            <Shuffle className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Random Heap</span>
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
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Speed</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={animating}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${
                                speedKey === key
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
                {arrayView.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-600 dark:text-white/60">Sorted Result:</span>
                        <span className="font-mono text-base">[{arrayView.join(", ")}]</span>
                    </div>
                )}
                {heap.length > 0 && (
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-white/70 mb-2">Array Representation</h4>
                        <div className="flex flex-wrap gap-2">
                            {heap.map((val, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-2 rounded-lg font-mono text-sm font-semibold shadow-sm transition-all ${
                                        highlightedIndices.has(idx)
                                            ? "bg-amber-400 text-white scale-105 dark:bg-amber-500"
                                            : swappingIndices.has(idx)
                                            ? "bg-pink-500 text-white scale-105 dark:bg-pink-500/90"
                                            : idx === 0
                                            ? "bg-violet-600 text-white"
                                            : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80"
                                    }`}
                                >
                                    {val}
                                    <span className="text-xs ml-1 opacity-70">[{idx}]</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg dark:shadow-2xl min-h-[320px]">
                {heap.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-white/40">
                        <p className="text-base mb-2 text-center">Insert numbers or generate a random heap to get started</p>
                        <p className="text-sm text-slate-400 dark:text-white/30 text-center">
                            Complete binary tree | Array-based storage | {heapType === "max" ? "Root is always max" : "Root is always min"}
                        </p>
                    </div>
                ) : (
                    <div className="flex justify-center overflow-x-auto py-2">
                        <svg width="900" height={svgHeight} className="mx-auto">
                            {renderNode(0, 400, 60, 0, 200)}
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-violet-600" />
                    <span>Root ({heapType === "max" ? "Max" : "Min"})</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span>Internal Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span>Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500" />
                    <span>Swapping</span>
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
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2 text-base">Heap Basics</h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Heaps are complete binary trees stored inside arrays. Parent index = ⌊(i-1)/2⌋, children = 2i+1 and 2i+2.
                            The {heapType === "max" ? "max" : "min"} heap property guarantees the root is always the {heapType === "max" ? "largest" : "smallest"} value.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-2">
                            Complete trees fill every level left-to-right, so no pointers are needed—just math on indices.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">Heapify Up</p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Used when inserting. The new node starts at the end and swaps with its parent until the heap property holds. O(log n).
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">Heapify Down</p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Used when extracting. The last node moves to the root and repeatedly swaps with the {heapType === "max" ? "larger" : "smaller"} child. O(log n).
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">Complexity</p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Insert/extract → O(log n), peek → O(1), build heap → O(n), heap sort → O(n log n) with O(1) extra space.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">Applications</p>
                            <p className="text-slate-600 dark:text-white/65 text-xs">
                                Priority queues, schedulers, Dijkstra, Huffman coding, finding top-K elements, median maintenance (two heaps), OS memory management.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">Max Heap</p>
                            <ul className="list-disc ml-4 text-slate-600 dark:text-white/65 text-xs space-y-1">
                                <li>Root stores the maximum value</li>
                                <li>Great for descending priority queues</li>
                                <li>Heap sort outputs descending order</li>
                            </ul>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05] text-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/40 font-semibold mb-2">Min Heap</p>
                            <ul className="list-disc ml-4 text-slate-600 dark:text-white/65 text-xs space-y-1">
                                <li>Root stores the minimum value</li>
                                <li>Perfect for event schedulers / ascending queues</li>
                                <li>Heap sort outputs ascending order</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}