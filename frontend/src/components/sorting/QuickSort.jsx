import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Play, RotateCcw, Shuffle, Plus, ChevronDown, ChevronUp, Pause, Settings } from "lucide-react";

const speedOptions = {
    "0.25x": 1000,
    "0.5x": 500,
    "1x": 200,
    "2x": 100,
    "4x": 50,
};

const pivotOptions = {
    "first": "First Element",
    "last": "Last Element"
};

export default function QuickSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [pivotStrategy, setPivotStrategy] = useState("last");
    const [currentStep, setCurrentStep] = useState("");
    const [pivotIndex, setPivotIndex] = useState(-1);
    const [comparingIndices, setComparingIndices] = useState([]);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [partitionRange, setPartitionRange] = useState([]);
    const [sortedIndices, setSortedIndices] = useState(new Set());
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

    const quickSort = async () => {
        setSorting(true);
        setPaused(false);
        setPivotIndex(-1);
        setComparingIndices([]);
        setSwappingIndices([]);
        setPartitionRange([]);
        setSortedIndices(new Set());
        
        let arr = [...array];
        setCurrentStep("Starting QuickSort...");
        await sleep(delay);

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        await quickSortHelper(arr, 0, arr.length - 1);
        
        setCurrentStep("QuickSort Complete! 🎉");
        setSortedIndices(new Set([...Array(arr.length).keys()]));
        setPivotIndex(-1);
        setComparingIndices([]);
        setPartitionRange([]);
        await sleep(delay * 2);
        
        setSorting(false);
        setPaused(false);
        setCurrentStep("");
    };

    const quickSortHelper = async (arr, low, high) => {
        if (low < high) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Highlight current partition range
            setPartitionRange([low, high]);
            setCurrentStep(`Partitioning range [${low}...${high}]`);
            await sleep(delay);

            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Partition the array and get pivot position
            const pivotPos = await partition(arr, low, high);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Mark pivot as sorted
            setSortedIndices(prev => new Set([...prev, pivotPos]));
            setCurrentStep(`Pivot ${arr[pivotPos]} is now in correct position`);
            await sleep(delay);

            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Recursively sort left partition
            if (pivotPos - 1 > low) {
                setCurrentStep(`Sorting left partition [${low}...${pivotPos - 1}]`);
                await sleep(delay);
                await quickSortHelper(arr, low, pivotPos - 1);
            }

            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Recursively sort right partition
            if (pivotPos + 1 < high) {
                setCurrentStep(`Sorting right partition [${pivotPos + 1}...${high}]`);
                await sleep(delay);
                await quickSortHelper(arr, pivotPos + 1, high);
            }
        } else if (low === high) {
            // Single element is already sorted
            setSortedIndices(prev => new Set([...prev, low]));
        }
    };

    const partition = async (arr, low, high) => {
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Choose pivot based on strategy
        let pivotIdx;
        if (pivotStrategy === "first") {
            pivotIdx = low;
            // Move first element to end for easier partitioning
            [arr[pivotIdx], arr[high]] = [arr[high], arr[pivotIdx]];
            setArray([...arr]);
            setCurrentStep(`Moving first element ${arr[high]} to end as pivot`);
            await sleep(delay);
        }
        
        pivotIdx = high; // Pivot is now at the end
        const pivotValue = arr[pivotIdx];
        setPivotIndex(pivotIdx);
        
        setCurrentStep(`Pivot selected: ${pivotValue} at position ${pivotIdx}`);
        await sleep(delay);

        let i = low - 1; // Index of smaller element

        for (let j = low; j < high; j++) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Highlight elements being compared
            setComparingIndices([j, pivotIdx]);
            setCurrentStep(`Comparing ${arr[j]} with pivot ${pivotValue}`);
            await sleep(delay);

            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (arr[j] <= pivotValue) {
                i++;
                if (i !== j) {
                    // Highlight swap
                    setSwappingIndices([i, j]);
                    setCurrentStep(`Swapping ${arr[i]} and ${arr[j]}`);
                    await sleep(delay);
                    
                    // Wait for pause to be resumed
                    while (paused) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    // Perform swap
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    setArray([...arr]);
                    await sleep(delay);
                    
                    setSwappingIndices([]);
                }
            }
            
            setComparingIndices([]);
        }

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Place pivot in its correct position
        setSwappingIndices([i + 1, pivotIdx]);
        setCurrentStep(`Placing pivot ${pivotValue} in correct position`);
        await sleep(delay);
        
        [arr[i + 1], arr[pivotIdx]] = [arr[pivotIdx], arr[i + 1]];
        setArray([...arr]);
        await sleep(delay);
        
        setSwappingIndices([]);
        setPivotIndex(-1);
        setComparingIndices([]);
        setPartitionRange([]);
        
        return i + 1; // Return pivot position
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setPaused(false);
        setPivotIndex(-1);
        setComparingIndices([]);
        setSwappingIndices([]);
        setPartitionRange([]);
        setSortedIndices(new Set());
        setCurrentStep("");
    };

    const getElementColor = (index) => {
        if (sortedIndices.has(index)) return "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-300";
        if (index === pivotIndex) return "bg-red-100 border-red-500 border-4 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-300";
        if (swappingIndices.includes(index)) return "bg-purple-100 border-purple-500 border-2 text-purple-800 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-300";
        if (comparingIndices.includes(index)) return "bg-yellow-100 border-yellow-500 border-2 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-300";
        if (partitionRange.length === 2 && index >= partitionRange[0] && index <= partitionRange[1]) {
            return "bg-blue-100 border-blue-400 border-2 text-blue-800 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-300";
        }
        return "bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl mx-auto">
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
                            onClick={quickSort}
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

                {/* Pivot Strategy and Speed Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    {/* Pivot Strategy */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Pivot Strategy</span>
                        {Object.entries(pivotOptions).map(([key, label]) => (
                            <Button
                                key={key}
                                size="sm"
                                onClick={() => setPivotStrategy(key)}
                                disabled={sorting}
                                className={`h-8 px-3 text-sm font-medium transition-all rounded-md
    ${pivotStrategy === key
                                    ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 text-black disabled:text-black dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm disabled:hover:bg-slate-50'
                                }`}
                            >
                                {label}
                            </Button>
                        ))}
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
            </div>

            {/* Current Step Display */}
            {currentStep && (
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">{currentStep}</span>
                </div>
            )}

            {/* Current Pivot Info */}
            {pivotIndex >= 0 && (
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                    <span className="text-red-700 dark:text-red-300 font-semibold">
                        Current Pivot: {array[pivotIndex]} (Position {pivotIndex})
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
                        {array.map((val, idx) => (
                            <div
                                key={`${idx}-${val}`}
                                className={`
                                    ${getElementColor(idx)}
                                    font-bold text-lg
                                    w-16 h-16 rounded-lg
                                    flex items-center justify-center
                                    transition-all duration-300 ease-in-out
                                    transform hover:scale-105
                                    shadow-sm
                                    ${swappingIndices.includes(idx) ? 'animate-pulse scale-110' : ''}
                                    ${comparingIndices.includes(idx) ? 'animate-bounce' : ''}
                                    ${idx === pivotIndex ? 'animate-pulse scale-110' : ''}
                                    relative
                                `}
                                style={{
                                    minWidth: '64px',
                                }}
                            >
                                {val}
                                {idx === pivotIndex && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                                        P
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"></div>
                    <span className="text-slate-600 dark:text-white/60">Unsorted</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded dark:bg-blue-900/20 dark:border-blue-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Current Partition</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-4 border-red-500 rounded dark:bg-red-900/20 dark:border-red-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Pivot</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded dark:bg-yellow-900/20 dark:border-yellow-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 border-2 border-purple-500 rounded dark:bg-purple-900/20 dark:border-purple-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Swapping</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-400 rounded dark:bg-green-900/20 dark:border-green-500"></div>
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
                            How QuickSort Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            QuickSort uses a divide-and-conquer approach by selecting a pivot element and partitioning 
                            the array around it. Elements smaller than the pivot go to the left, larger elements to the right. 
                            The process repeats recursively on each partition.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Average Time
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(n log n)
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Worst Case
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(n²)
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Space Complexity
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(log n)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}