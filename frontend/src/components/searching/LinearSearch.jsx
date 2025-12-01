import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Play, RotateCcw, Shuffle, Plus, ChevronDown, ChevronUp } from "lucide-react";

const speedOptions = {
    "0.25x": 1200,
    "0.5x": 800,
    "1x": 400,
    "2x": 200,
    "4x": 100,
};

export default function LinearSearch() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searching, setSearching] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [searchComplete, setSearchComplete] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val)) {
            setArray((prev) => [...prev, val]);
            setCurrentInput("");
        }
    };

    const generateRandomArray = () => {
        if (searching) return;
        const randomArr = Array.from({ length: 15 }, () =>
            Math.floor(Math.random() * 90) + 10
        );
        setArray(randomArr);
        reset();
    };

    const linearSearch = async () => {
        const target = parseInt(searchValue.trim());
        if (isNaN(target) || array.length === 0) return;

        setSearching(true);
        setFoundIndex(-1);
        setSearchComplete(false);

        for (let i = 0; i < array.length; i++) {
            setCurrentIndex(i);
            await new Promise((r) => setTimeout(r, delay));

            if (array[i] === target) {
                setFoundIndex(i);
                setCurrentIndex(-1);
                setSearchComplete(true);
                setSearching(false);
                return;
            }
        }

        // Not found
        setCurrentIndex(-1);
        setSearchComplete(true);
        setSearching(false);
    };

    const reset = () => {
        setCurrentIndex(-1);
        setFoundIndex(-1);
        setSearchComplete(false);
        setSearching(false);
    };

    const clearAll = () => {
        setArray([]);
        setCurrentInput("");
        setSearchValue("");
        reset();
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto">
            <style>{`
                .search-element {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 4px;
                }
                
                @media (prefers-color-scheme: dark) {
                    .search-element {
                        background: rgba(100, 116, 139, 0.6);
                        border-color: rgba(148, 163, 184, 0.3);
                    }
                    .search-element.comparing {
                        background: rgba(251, 191, 36, 0.85) !important;
                        transform: translateY(-6px);
                        box-shadow: 0 8px 16px rgba(251, 191, 36, 0.2);
                        border-color: rgba(251, 191, 36, 0.5);
                    }
                    .search-element.found {
                        background: rgba(34, 197, 94, 0.75) !important;
                        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
                        border-color: rgba(34, 197, 94, 0.5);
                    }
                    .search-element:not(.comparing):not(.found):hover {
                        ${!searching ? 'transform: translateY(-3px); background: rgba(100, 116, 139, 0.8); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);' : ''}
                    }
                }
                
                @media (prefers-color-scheme: light) {
                    .search-element {
                        background: rgba(71, 85, 105, 0.75);
                        border-color: rgba(148, 163, 184, 0.4);
                    }
                    .search-element.comparing {
                        background: rgba(234, 179, 8, 0.9) !important;
                        transform: translateY(-6px);
                        box-shadow: 0 8px 16px rgba(234, 179, 8, 0.25);
                        border-color: rgba(234, 179, 8, 0.6);
                    }
                    .search-element.found {
                        background: rgba(22, 163, 74, 0.85) !important;
                        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                        border-color: rgba(22, 163, 74, 0.6);
                    }
                    .search-element:not(.comparing):not(.found):hover {
                        ${!searching ? 'transform: translateY(-3px); background: rgba(71, 85, 105, 0.9); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);' : ''}
                    }
                }
            `}</style>

            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Linear Search Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    See how linear search sequentially checks each element from left to right.
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
                            disabled={searching}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            inputMode="numeric"
                            pattern="\\d+"
                            title="Enter a valid integer."
                        />
                        <Button
                            onClick={handleAddValue}
                            disabled={searching}
                            size="icon"
                            className="relative flex items-center justify-center h-10 w-10 shrink-0 border-0 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out rounded-md"
                        >
                            <Plus className="h-4 w-4 text-slate-900 dark:text-white" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={generateRandomArray}
                            disabled={searching}
                            className="flex-1 sm:flex-none h-10 border-0 relative transition-all duration-300 ease-out bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-md"
                        >
                            <Shuffle className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Random</span>
                        </Button>

                        <Button
                            onClick={clearAll}
                            disabled={searching}
                            size="icon"
                            className="bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white border-0 h-10 w-10 shrink-0"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Search Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2 flex-1 max-w-md">
                        <Input
                            type="number"
                            placeholder="Value to search"
                            value={searchValue}
                            disabled={searching}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && linearSearch()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            inputMode="numeric"
                            pattern="\\d+"
                            title="Enter a valid integer."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={linearSearch}
                            disabled={searching || array.length === 0 || !searchValue.trim()}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600/90 dark:hover:bg-emerald-600 text-white border-0 h-10 shadow-lg shadow-emerald-600/20"
                        >
                            <Play className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Start Search</span>
                        </Button>

                        <Button
                            onClick={reset}
                            disabled={searching}
                            className="flex-1 sm:flex-none h-10 border-0 relative transition-all duration-300 ease-out bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-md"
                        >
                            <RotateCcw className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Reset</span>
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
                            disabled={searching}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${
                                speedKey === key
                                    ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm'
                                    : 'bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm disabled:hover:bg-slate-100'
                            }`}
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Visualization Area */}
            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg dark:shadow-2xl min-h-[300px] sm:min-h-[350px]">
                {array.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 sm:h-72 text-slate-400 dark:text-white/40">
                        <p className="text-center text-base mb-2">
                            Add numbers or generate a random array
                        </p>
                        <p className="text-sm text-slate-400 dark:text-white/30">
                            Press Enter to add numbers
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center min-h-[240px] sm:min-h-[280px] py-4">
                        {array.map((val, idx) => {
                            const isComparing = idx === currentIndex;
                            const isFound = idx === foundIndex;

                            return (
                                <div
                                    key={idx}
                                    className={`search-element border px-4 py-3 min-w-[60px] text-center font-mono ${
                                        isComparing ? 'comparing' : ''
                                    } ${isFound ? 'found' : ''} ${!searching ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{val}</div>
                                    <div className="text-xs text-slate-600 dark:text-white/60 mt-1">{idx}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Status Display */}
            {array.length > 0 && (
                <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg dark:shadow-2xl">
                    <div className="text-center">
                        {searching && (
                            <p className="text-base sm:text-lg text-slate-900 dark:text-white">
                                Searching for <span className="font-bold">{searchValue}</span>... 
                                {currentIndex !== -1 && (
                                    <span className="block sm:inline sm:ml-2 text-sm text-slate-600 dark:text-white/60">
                                        Currently checking index {currentIndex}
                                    </span>
                                )}
                            </p>
                        )}
                        {searchComplete && foundIndex !== -1 && (
                            <p className="text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-semibold">
                                Found <span className="font-bold">{searchValue}</span> at index {foundIndex}!
                            </p>
                        )}
                        {searchComplete && foundIndex === -1 && (
                            <p className="text-base sm:text-lg text-red-600 dark:text-red-400 font-semibold">
                                <span className="font-bold">{searchValue}</span> not found in the array.
                            </p>
                        )}
                        {!searching && !searchComplete && (
                            <p className="text-sm text-slate-600 dark:text-white/60">
                                Enter a value to search and click "Start Search"
                            </p>
                        )}
                    </div>
                </div>
            )}

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
                            How Linear Search Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Linear search sequentially checks each element in the array from left to right until the target value is found or the end is reached.
                            It's the simplest search algorithm and works on both sorted and unsorted arrays.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-white dark:bg-white/[0.03] rounded-lg p-4 border border-slate-200 dark:border-white/[0.05]">
                            <p className="text-slate-500 dark:text-white/40 text-xs font-medium uppercase tracking-wide mb-1">
                                Time Complexity
                            </p>
                            <p className="text-slate-900 dark:text-white font-mono text-lg">
                                O(n)
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
