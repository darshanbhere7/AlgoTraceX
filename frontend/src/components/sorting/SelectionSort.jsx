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

export default function SelectionSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [minIndex, setMinIndex] = useState(-1);
    const [comparingIndex, setComparingIndex] = useState(-1);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [sortedIndices, setSortedIndices] = useState(new Set());
    const [searchingRange, setSearchingRange] = useState([]);
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

    const selectionSort = async () => {
        setSorting(true);
        setPaused(false);
        setCurrentIndex(-1);
        setMinIndex(-1);
        setComparingIndex(-1);
        setSwappingIndices([]);
        setSortedIndices(new Set());
        setSearchingRange([]);
        
        let arr = [...array];
        const n = arr.length;
        
        setCurrentStep("Starting Selection Sort...");
        await sleep(delay);

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Traverse through all array elements
        for (let i = 0; i < n - 1; i++) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setCurrentIndex(i);
            setMinIndex(i);
            setSearchingRange([i, n - 1]);
            setCurrentStep(`Pass ${i + 1}: Finding minimum in range [${i}...${n - 1}]`);
            await sleep(delay);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            let minIdx = i;
            setMinIndex(minIdx);
            setCurrentStep(`Assuming ${arr[minIdx]} at position ${minIdx} is minimum`);
            await sleep(delay);
            
            // Find the minimum element in the unsorted portion
            for (let j = i + 1; j < n; j++) {
                // Wait for pause to be resumed
                while (paused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                setComparingIndex(j);
                setCurrentStep(`Comparing ${arr[j]} with current minimum ${arr[minIdx]}`);
                await sleep(delay);
                
                // Wait for pause to be resumed
                while (paused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                if (arr[j] < arr[minIdx]) {
                    setCurrentStep(`Found new minimum: ${arr[j]} < ${arr[minIdx]}`);
                    minIdx = j;
                    setMinIndex(minIdx);
                    await sleep(delay);
                } else {
                    setCurrentStep(`${arr[j]} >= ${arr[minIdx]}, current minimum unchanged`);
                    await sleep(delay / 2);
                }
            }
            
            setComparingIndex(-1);
            
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Swap the found minimum element with the first element
            if (minIdx !== i) {
                setSwappingIndices([i, minIdx]);
                setCurrentStep(`Swapping minimum ${arr[minIdx]} with ${arr[i]} at position ${i}`);
                await sleep(delay);
                
                // Wait for pause to be resumed
                while (paused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                setArray([...arr]);
                await sleep(delay);
                
                setSwappingIndices([]);
            } else {
                setCurrentStep(`${arr[i]} is already at correct position`);
                await sleep(delay);
            }
            
            // Mark this position as sorted
            setSortedIndices(prev => new Set([...prev, i]));
            setCurrentStep(`Position ${i} is now sorted with value ${arr[i]}`);
            await sleep(delay);
            
            setMinIndex(-1);
            setSearchingRange([]);
        }
        
        // Mark the last element as sorted
        setSortedIndices(prev => new Set([...prev, n - 1]));
        setCurrentStep("Selection Sort Complete! 🎉");
        await sleep(delay * 2);
        
        setSorting(false);
        setPaused(false);
        setCurrentStep("");
        setCurrentIndex(-1);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setPaused(false);
        setCurrentIndex(-1);
        setMinIndex(-1);
        setComparingIndex(-1);
        setSwappingIndices([]);
        setSortedIndices(new Set());
        setSearchingRange([]);
        setCurrentStep("");
    };

    const getElementColor = (index) => {
        if (sortedIndices.has(index)) return "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-300";
        if (index === minIndex && !swappingIndices.includes(index)) return "bg-rose-200 border-rose-600 border-4 text-rose-900 dark:bg-rose-900/20 dark:border-rose-500 dark:text-rose-300";
        if (swappingIndices.includes(index)) return "bg-fuchsia-200 border-fuchsia-600 border-4 text-fuchsia-900 dark:bg-fuchsia-900/20 dark:border-fuchsia-500 dark:text-fuchsia-300";
        if (index === currentIndex && !swappingIndices.includes(index)) return "bg-sky-200 border-sky-600 border-3 text-sky-900 dark:bg-sky-900/20 dark:border-sky-500 dark:text-sky-300";
        if (index === comparingIndex) return "bg-amber-200 border-amber-500 border-2 text-amber-900 dark:bg-amber-900/20 dark:border-amber-500 dark:text-amber-300";
        if (searchingRange.length === 2 && index >= searchingRange[0] && index <= searchingRange[1]) {
            return "bg-slate-200 border-slate-400 border-2 text-slate-800 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-300";
        }
        return "bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Selection Sort Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Watch selection sort repeatedly pick the smallest element and place it in its correct position.
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
                            onClick={selectionSort}
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

            {/* Pass Information */}
            {sorting && currentIndex >= 0 && (
                <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800 mb-4">
                    <span className="text-sky-800 dark:text-sky-300 font-semibold">
                        Current Pass: {currentIndex + 1} | Sorted Elements: {sortedIndices.size} | Remaining: {array.length - sortedIndices.size}
                    </span>
                </div>
            )}

            {/* Current Minimum Display */}
            {minIndex >= 0 && !swappingIndices.includes(minIndex) && (
                <div className="text-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 mb-4">
                    <span className="text-rose-800 dark:text-rose-300 font-semibold">
                        Current Minimum: {array[minIndex]} (Position {minIndex})
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
                    <div className="space-y-6">
                        <div className="flex flex-wrap justify-center items-center gap-3">
                            {array.map((val, idx) => {
                                const isBoundary = idx === sortedIndices.size && sorting && sortedIndices.size > 0 && sortedIndices.size < array.length;
                                return (
                                    <div key={`${idx}-${val}`} className="relative">
                                        <div
                                            className={`
                                                ${getElementColor(idx)}
                                                font-bold text-lg
                                                w-16 h-16 rounded-xl
                                                flex items-center justify-center
                                                transition-all duration-300 ease-in-out
                                                transform hover:scale-105
                                                shadow-lg
                                                ${swappingIndices.includes(idx) ? 'animate-pulse scale-125 shadow-2xl' : ''}
                                                ${idx === comparingIndex ? 'animate-bounce' : ''}
                                                ${idx === minIndex && !swappingIndices.includes(idx) ? 'animate-pulse scale-110 shadow-2xl' : ''}
                                                relative
                                            `}
                                            style={{
                                                minWidth: '64px',
                                            }}
                                        >
                                            {val}
                                            {idx === minIndex && !swappingIndices.includes(idx) && (
                                                <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                                    MIN
                                                </div>
                                            )}
                                            {idx === currentIndex && !swappingIndices.includes(idx) && !sortedIndices.has(idx) && (
                                                <div className="absolute -top-2 -left-2 bg-sky-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                                    POS
                                                </div>
                                            )}
                                            {swappingIndices.includes(idx) && (
                                                <div className="absolute -top-2 -right-2 bg-fuchsia-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                                    SWAP
                                                </div>
                                            )}
                                            <div className="absolute -bottom-5 text-xs text-slate-500 dark:text-slate-400 font-normal">
                                                {idx}
                                            </div>
                                        </div>
                                        {isBoundary && (
                                            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-3xl text-emerald-600 font-bold">
                                                |
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Labels for sorted/unsorted regions */}
                        {sorting && sortedIndices.size > 0 && sortedIndices.size < array.length && (
                            <div className="flex justify-center gap-12 text-sm font-semibold">
                                <div className="text-emerald-700 dark:text-emerald-300">
                                    ← Sorted (Minimum Elements)
                                </div>
                                <div className="text-slate-600 dark:text-white/60">
                                    Unsorted (Searching for Minimum) →
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-400 rounded dark:bg-gray-800 dark:border-gray-600"></div>
                    <span className="text-slate-600 dark:text-white/60">Unsorted</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 border-2 border-slate-400 rounded dark:bg-slate-800/50 dark:border-slate-600"></div>
                    <span className="text-slate-600 dark:text-white/60">Search Range</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-sky-200 border-3 border-sky-600 rounded dark:bg-sky-900/20 dark:border-sky-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Current Position</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-200 border-4 border-rose-600 rounded dark:bg-rose-900/20 dark:border-rose-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Current Minimum</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-200 border-2 border-amber-500 rounded dark:bg-amber-900/20 dark:border-amber-500"></div>
                    <span className="text-slate-600 dark:text-white/60">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-fuchsia-200 border-4 border-fuchsia-600 rounded dark:bg-fuchsia-900/20 dark:border-fuchsia-500"></div>
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
                            How Selection Sort Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Selection Sort divides the array into a sorted and unsorted region. It repeatedly finds the minimum element 
                            from the unsorted region and moves it to the end of the sorted region. The algorithm maintains two boundaries: 
                            everything before the current position is sorted, and everything after needs to be examined.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Time Complexity
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(n²)
                            </p>
                        </div>
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Comparisons
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                n(n-1)/2
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