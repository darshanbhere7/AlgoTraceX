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

export default function InsertionSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [keyIndex, setKeyIndex] = useState(-1);
    const [comparingIndex, setComparingIndex] = useState(-1);
    const [sortedBoundary, setSortedBoundary] = useState(0);
    const [shiftingIndices, setShiftingIndices] = useState([]);
    const [insertingAt, setInsertingAt] = useState(-1);
    const [paused, setPaused] = useState(false);
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

    const insertionSort = async () => {
        setSorting(true);
        setPaused(false);
        setKeyIndex(-1);
        setComparingIndex(-1);
        setSortedBoundary(0);
        setShiftingIndices([]);
        setInsertingAt(-1);
        
        let arr = [...array];
        const n = arr.length;
        
        setCurrentStep("Starting Insertion Sort...");
        setSortedBoundary(1);
        await sleep(delay);
        
        // Start from the second element (index 1)
        for (let i = 1; i < n; i++) {
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            const key = arr[i];
            setKeyIndex(i);
            setCurrentStep(`Selecting key element: ${key} at position ${i}`);
            await sleep(delay);
            
            let j = i - 1;
            
            setCurrentStep(`Finding correct position for ${key} in the sorted portion`);
            await sleep(delay);
            
            // Move elements greater than key one position ahead
            while (j >= 0) {
                while (paused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                setComparingIndex(j);
                setCurrentStep(`Comparing ${key} with ${arr[j]}`);
                await sleep(delay);
                
                if (arr[j] > key) {
                    setShiftingIndices([j, j + 1]);
                    setCurrentStep(`${arr[j]} > ${key}, shifting ${arr[j]} to the right`);
                    await sleep(delay);
                    
                    arr[j + 1] = arr[j];
                    setArray([...arr]);
                    await sleep(delay);
                    
                    setShiftingIndices([]);
                    j--;
                } else {
                    setCurrentStep(`${arr[j]} ≤ ${key}, found correct position`);
                    await sleep(delay);
                    break;
                }
            }
            
            // Insert the key at its correct position
            const insertPos = j + 1;
            setInsertingAt(insertPos);
            setCurrentStep(`Inserting ${key} at position ${insertPos}`);
            await sleep(delay);
            
            arr[insertPos] = key;
            setArray([...arr]);
            await sleep(delay);
            
            setInsertingAt(-1);
            setKeyIndex(-1);
            setComparingIndex(-1);
            setSortedBoundary(i + 1);
            
            setCurrentStep(`${key} inserted. Sorted portion now: [0...${i}]`);
            await sleep(delay);
        }
        
        setCurrentStep("Insertion Sort Complete! 🎉");
        setSortedBoundary(n);
        await sleep(delay * 2);
        
        setSorting(false);
        setPaused(false);
        setCurrentStep("");
        setKeyIndex(-1);
        setComparingIndex(-1);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setPaused(false);
        setKeyIndex(-1);
        setComparingIndex(-1);
        setSortedBoundary(0);
        setShiftingIndices([]);
        setInsertingAt(-1);
        setCurrentStep("");
    };

    const getElementColor = (index) => {
        if (index === keyIndex) return "bg-violet-200 border-violet-600 border-4 text-violet-900 dark:bg-violet-900/20 dark:border-violet-500 dark:text-violet-300";
        if (index === insertingAt) return "bg-lime-200 border-lime-600 border-4 text-lime-900 dark:bg-lime-900/20 dark:border-lime-500 dark:text-lime-300";
        if (shiftingIndices.includes(index)) return "bg-orange-200 border-orange-500 border-2 text-orange-900 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-300";
        if (index === comparingIndex) return "bg-yellow-200 border-yellow-500 border-2 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-300";
        if (index < sortedBoundary) return "bg-teal-100 border-teal-400 border-2 text-teal-800 dark:bg-teal-900/20 dark:border-teal-500 dark:text-teal-300";
        return "bg-gray-100 border-gray-400 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300";
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Insertion Sort Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Follow the process of inserting elements into their correct position in a growing sorted section.
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
                            onClick={insertionSort}
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

            {/* Sorted Boundary Display */}
            {sorting && sortedBoundary > 0 && (
                <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800 mb-4">
                    <span className="text-teal-800 dark:text-teal-200 font-semibold">
                        Sorted Portion: [0...{sortedBoundary - 1}] ({sortedBoundary} elements)
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
                                const isBoundary = idx === sortedBoundary - 1 && sorting && sortedBoundary > 0;
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
                                                ${shiftingIndices.includes(idx) ? 'animate-pulse scale-110 shadow-2xl' : ''}
                                                ${idx === comparingIndex ? 'animate-bounce' : ''}
                                                ${idx === keyIndex ? 'animate-pulse scale-125 shadow-2xl' : ''}
                                                ${idx === insertingAt ? 'animate-bounce scale-125 shadow-2xl' : ''}
                                                relative
                                            `}
                                            style={{ minWidth: '64px' }}
                                        >
                                            {val}
                                            {idx === keyIndex && (
                                                <div className="absolute -top-2 -right-2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                                    KEY
                                                </div>
                                            )}
                                            {idx === insertingAt && (
                                                <div className="absolute -top-2 -right-2 bg-lime-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                                    INSERT
                                                </div>
                                            )}
                                            <div className="absolute -bottom-5 text-xs text-slate-500 dark:text-slate-400 font-normal">
                                                {idx}
                                            </div>
                                        </div>
                                        {isBoundary && (
                                            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-3xl text-teal-600 dark:text-teal-400">
                                                |
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {sorting && sortedBoundary > 0 && sortedBoundary < array.length && (
                            <div className="flex justify-center gap-12 text-sm font-semibold">
                                <div className="text-teal-700 dark:text-teal-300">
                                    ← Sorted Region
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">
                                    Unsorted Region →
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
                            How Insertion Sort Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Builds the sorted array one element at a time by repeatedly taking the next unsorted element 
                            and inserting it into its correct position within the sorted portion. Like sorting playing cards in your hand.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
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