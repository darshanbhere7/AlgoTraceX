import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Play, RotateCcw, Shuffle, Plus, ChevronDown, ChevronUp, Pause } from "lucide-react";

const speedOptions = {
    "0.25x": 1000,
    "0.5x": 500,
    "1x": 200,
    "2x": 100,
    "4x": 50,
};

export default function HeapSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [heapSize, setHeapSize] = useState(0);
    const [comparingIndices, setComparingIndices] = useState([]);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [heapifiedIndices, setHeapifiedIndices] = useState(new Set());
    const [sortedIndices, setSortedIndices] = useState(new Set());
    const [currentRoot, setCurrentRoot] = useState(-1);
    const [showInfo, setShowInfo] = useState(false);

    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val > 0) {
            setArray((prev) => [...prev, val]);
            setCurrentInput("");
        }
    };

    const generateRandomArray = () => {
        if (sorting) return;
        const randomArr = Array.from({ length: 12 }, () =>
            Math.floor(Math.random() * 90) + 10
        );
        setArray(randomArr);
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const togglePause = () => {
        setPaused(!paused);
    };

    const heapSort = async () => {
        setSorting(true);
        setPaused(false);
        setComparingIndices([]);
        setSwappingIndices([]);
        setHeapifiedIndices(new Set());
        setSortedIndices(new Set());
        setCurrentRoot(-1);
        
        let arr = [...array];
        const n = arr.length;
        setHeapSize(n);
        
        setCurrentStep("Building Max Heap...");
        await sleep(delay);

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            await heapify(arr, n, i);
        }
        
        setCurrentStep("Max Heap Built! Starting extraction...");
        setHeapifiedIndices(new Set([...Array(n).keys()]));
        await sleep(delay * 2);

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setHeapSize(i);
            setCurrentStep(`Extracting max element: ${arr[0]}`);
            
            // Highlight swap
            setSwappingIndices([0, i]);
            await sleep(delay);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Move current root to end (swap)
            [arr[0], arr[i]] = [arr[i], arr[0]];
            setArray([...arr]);
            await sleep(delay);
            
            // Mark as sorted
            setSortedIndices(prev => new Set([...prev, i]));
            setSwappingIndices([]);
            
            setCurrentStep(`${arr[i]} placed in sorted position. Heapifying remaining elements...`);
            await sleep(delay);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Heapify the reduced heap
            await heapify(arr, i, 0);
        }
        
        // Mark the last element as sorted
        setSortedIndices(prev => new Set([...prev, 0]));
        setCurrentStep("Heap Sort Complete! 🎉");
        setHeapifiedIndices(new Set());
        setHeapSize(0);
        await sleep(delay * 2);
        
        setSorting(false);
        setPaused(false);
        setCurrentStep("");
        setCurrentRoot(-1);
    };

    const heapify = async (arr, n, i) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setCurrentRoot(i);
        setCurrentStep(`Heapifying subtree rooted at index ${i} (value: ${arr[i]})`);
        await sleep(delay);
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Compare with left child
        if (left < n) {
            setComparingIndices([i, left]);
            setCurrentStep(`Comparing ${arr[i]} with left child ${arr[left]}`);
            await sleep(delay);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Compare with right child
        if (right < n) {
            setComparingIndices([largest, right]);
            setCurrentStep(`Comparing ${arr[largest]} with right child ${arr[right]}`);
            await sleep(delay);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }
        
        setComparingIndices([]);
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // If largest is not root, swap and continue heapifying
        if (largest !== i) {
            setSwappingIndices([i, largest]);
            setCurrentStep(`Swapping ${arr[i]} and ${arr[largest]}`);
            await sleep(delay);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            setArray([...arr]);
            await sleep(delay);
            
            setSwappingIndices([]);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Recursively heapify the affected subtree
            await heapify(arr, n, largest);
        } else {
            setCurrentStep(`Node ${arr[i]} is already in correct heap position`);
            await sleep(delay / 2);
        }
        
        setCurrentRoot(-1);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setPaused(false);
        setComparingIndices([]);
        setSwappingIndices([]);
        setHeapifiedIndices(new Set());
        setSortedIndices(new Set());
        setCurrentStep("");
        setHeapSize(0);
        setCurrentRoot(-1);
    };

    const getElementColor = (index) => {
        if (sortedIndices.has(index)) return "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-300";
        if (index === currentRoot) return "bg-indigo-100 border-indigo-600 border-4 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300";
        if (swappingIndices.includes(index)) return "bg-rose-100 border-rose-500 border-2 text-rose-800 dark:bg-rose-900/20 dark:border-rose-500 dark:text-rose-300";
        if (comparingIndices.includes(index)) return "bg-amber-100 border-amber-500 border-2 text-amber-800 dark:bg-amber-900/20 dark:border-amber-500 dark:text-amber-300";
        if (heapifiedIndices.has(index) && index < heapSize) return "bg-cyan-100 border-cyan-400 border-2 text-cyan-800 dark:bg-cyan-900/20 dark:border-cyan-500 dark:text-cyan-300";
        return "bg-slate-50 border-slate-300 text-slate-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";
    };

    const getHeapLevel = (index) => {
        return Math.floor(Math.log2(index + 1));
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Heap Sort Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Observe how heap sort builds a max heap and extracts the largest elements one by one.
                </p>
            </div>
            {/* Controls Section */}
            <div className="space-y-4 mb-6">
                {/* Input Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2 flex-1 max-w-md">
                        <Input
                            type="number"
                            placeholder="Enter a number"
                            value={currentInput}
                            disabled={sorting}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                        />
                        <Button
                            onClick={handleAddValue}
                            disabled={sorting}
                            size="icon"
                            className="
                            relative flex items-center justify-center h-10 w-10 shrink-0 border-0 
                            bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15
                            text-slate-900 dark:text-white
                            hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                            shadow-[0_0_10px_rgba(0,0,0,0.05)]
                            transition-all duration-300 ease-out
                            rounded-md"
                        >
                            <Plus className="h-4 w-4 text-slate-900 dark:text-white" />
                        </Button>

                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={generateRandomArray}
                            disabled={sorting}
                            className="flex-1 sm:flex-none h-10 border-0 relative transition-all duration-300 ease-out
                            bg-slate-200 hover:bg-slate-300 text-slate-900
                            dark:bg-white/10 dark:hover:bg-white/15 dark:text-white
                            hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                            shadow-[0_0_10px_rgba(0,0,0,0.05)]
                            rounded-md">
                            <Shuffle className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Random</span>
                        </Button>

                        <Button
                            onClick={heapSort}
                            disabled={sorting || array.length < 2}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600/90 dark:hover:bg-emerald-600 text-white border-0 h-10 shadow-lg shadow-emerald-600/20"
                        >
                            <Play className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Start</span>
                        </Button>

                        {sorting && (
                            <Button
                                onClick={togglePause}
                                className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-700 dark:bg-amber-600/90 dark:hover:bg-amber-600 text-white border-0 h-10 shadow-lg shadow-amber-600/20"
                            >
                                {paused ? (
                                    <>
                                        <Play className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Resume</span>
                                    </>
                                ) : (
                                    <>
                                        <Pause className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Pause</span>
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            onClick={reset}
                            disabled={sorting}
                            size="icon"
                            className="bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white border-0 h-10 w-10 shrink-0"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Speed</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={sorting}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md
    ${speedKey === key
                                    ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 text-black disabled:text-black dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm disabled:hover:bg-slate-50'
                                }`}
                        >
                            {key}
                        </Button>

                    ))}
                </div>
            </div>

            {/* Current Step Display */}
            {currentStep && (
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">{currentStep}</span>
                </div>
            )}

            {/* Heap Size Display */}
            {sorting && heapSize > 0 && (
                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800 mb-4">
                    <span className="text-cyan-800 dark:text-cyan-300 font-semibold">
                        Current Heap Size: {heapSize}
                    </span>
                </div>
            )}

            {/* Visualization Area */}
            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 mb-4 shadow-lg dark:shadow-2xl min-h-[350px] sm:min-h-[400px]">
                {array.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 text-slate-400 dark:text-white/40">
                        <p className="text-center text-base mb-2">
                            Add numbers or generate a random array
                        </p>
                        <p className="text-sm text-slate-400 dark:text-white/30">
                            Press Enter to add • Click Start to visualize
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center items-center gap-3">
                        {array.map((val, idx) => {
                            const level = getHeapLevel(idx);
                            return (
                                <div
                                    key={`${idx}-${val}`}
                                    className={`
                                        ${getElementColor(idx)}
                                        font-bold text-lg
                                        w-16 h-16 rounded-xl
                                        flex items-center justify-center
                                        transition-all duration-300 ease-in-out
                                        transform hover:scale-105
                                        shadow-lg
                                        ${swappingIndices.includes(idx) ? 'animate-pulse scale-110 shadow-2xl' : ''}
                                        ${comparingIndices.includes(idx) ? 'animate-bounce' : ''}
                                        ${idx === currentRoot ? 'animate-pulse scale-110 shadow-2xl' : ''}
                                        relative
                                    `}
                                    style={{
                                        minWidth: '64px',
                                    }}
                                >
                                    {val}
                                    {idx === currentRoot && (
                                        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                            ROOT
                                        </div>
                                    )}
                                    <div className="absolute -bottom-5 text-xs text-slate-500 dark:text-slate-400 font-normal">
                                        {idx}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-50 border-2 border-slate-300 rounded dark:bg-gray-800 dark:border-gray-600"></div>
                    <span className="text-slate-600 dark:text-white/60">Unsorted</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-cyan-100 border-2 border-cyan-400 rounded dark:bg-cyan-900/20 dark:border-cyan-500"></div>
                    <span className="text-slate-600 dark:text-white/60">In Heap</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-100 border-4 border-indigo-600 rounded dark:bg-indigo-900/20 dark:border-indigo-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Current Root</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-100 border-2 border-amber-500 rounded dark:bg-amber-900/20 dark:border-amber-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-100 border-2 border-rose-500 rounded dark:bg-rose-900/20 dark:border-rose-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Swapping</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-500 rounded dark:bg-emerald-900/20 dark:border-emerald-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Sorted</span>
                </div>
            </div>

            {/* Algorithm Info Toggle */}
            <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/70 transition-colors text-sm font-medium"
            >
                <Info className="h-4 w-4" />
                Algorithm Info
                {showInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Collapsible Info */}
            {showInfo && (
                <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2 text-base">
                            How Heap Sort Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Heap Sort first builds a max heap from the input array, where the largest element is at the root. 
                            It then repeatedly extracts the maximum element from the heap (moving it to the end of the array) and 
                            re-heapifies the remaining elements. This process continues until all elements are sorted.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Time Complexity
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(n log n)
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Space Complexity
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(1)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}