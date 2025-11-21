import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Play, RotateCcw, Shuffle, Plus, ChevronDown, ChevronUp, Pause } from "lucide-react";

const speedOptions = {
    "0.25x": 1000,
    "0.5x": 500,
    "1x": 200,
    "2x": 100,
    "4x": 50,
};

export default function BubbleSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [showInfo, setShowInfo] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

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

    const handleDragStart = (e, index) => {
        if (sorting) {
            e.preventDefault();
            return;
        }
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (sorting || draggedIndex === null || draggedIndex === index) return;

        const newArray = [...array];
        const draggedItem = newArray[draggedIndex];
        newArray.splice(draggedIndex, 1);
        newArray.splice(index, 0, draggedItem);

        setArray(newArray);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const togglePause = () => {
        setPaused(!paused);
    };

    const bubbleSort = async () => {
        setSorting(true);
        setPaused(false);
        let arr = [...array];
        const bars = document.querySelectorAll(".bar");

        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                while (paused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                bars[j].classList.add("comparing");
                bars[j + 1].classList.add("comparing");
                await new Promise((r) => setTimeout(r, delay));

                while (paused) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setArray([...arr]);
                    await new Promise((r) => setTimeout(r, delay));

                    while (paused) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    bars[j].classList.add("swapping");
                    bars[j + 1].classList.add("swapping");
                    await new Promise((r) => setTimeout(r, delay));
                    bars[j].classList.remove("swapping");
                    bars[j + 1].classList.remove("swapping");
                }

                bars[j].classList.remove("comparing");
                bars[j + 1].classList.remove("comparing");
            }

            bars[arr.length - 1 - i].classList.add("sorted");
        }

        bars[0].classList.add("sorted");
        setSorting(false);
        setPaused(false);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setPaused(false);
        const bars = document.querySelectorAll(".bar");
        bars.forEach(bar => {
            bar.classList.remove("comparing", "swapping", "sorted");
        });
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto">
            <style>{`
                .bar {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 4px;
                }
                
                @media (prefers-color-scheme: dark) {
                    .bar {
                        background: rgba(100, 116, 139, 0.6);
                    }
                    .bar.comparing {
                        background: rgba(251, 191, 36, 0.85) !important;
                        transform: translateY(-6px);
                        box-shadow: 0 8px 16px rgba(251, 191, 36, 0.2);
                    }
                    .bar.swapping {
                        background: rgba(239, 68, 68, 0.85) !important;
                        transform: scale(1.08);
                        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
                    }
                    .bar.sorted {
                        background: rgba(34, 197, 94, 0.75) !important;
                        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
                    }
                    .bar:not(.comparing):not(.swapping):not(.sorted):hover {
                        ${!sorting ? 'transform: translateY(-3px); background: rgba(100, 116, 139, 0.8); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);' : ''}
                    }
                }
                
                @media (prefers-color-scheme: light) {
                    .bar {
                        background: rgba(71, 85, 105, 0.75);
                    }
                    .bar.comparing {
                        background: rgba(234, 179, 8, 0.9) !important;
                        transform: translateY(-6px);
                        box-shadow: 0 8px 16px rgba(234, 179, 8, 0.25);
                    }
                    .bar.swapping {
                        background: rgba(220, 38, 38, 0.9) !important;
                        transform: scale(1.08);
                        box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
                    }
                    .bar.sorted {
                        background: rgba(22, 163, 74, 0.85) !important;
                        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
                    }
                    .bar:not(.comparing):not(.swapping):not(.sorted):hover {
                        ${!sorting ? 'transform: translateY(-3px); background: rgba(71, 85, 105, 0.9); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);' : ''}
                    }
                }
            `}</style>

            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Bubble Sort Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    See how merge sort divides the array and merges sorted halves efficiently.
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
                            className="relative flex items-center justify-center h-10 w-10 shrink-0 border-0 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out rounded-md"
                        >
                            <Plus className="h-4 w-4 text-slate-900 dark:text-white" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={generateRandomArray}
                            disabled={sorting}
                            className="flex-1 sm:flex-none h-10 border-0 relative transition-all duration-300 ease-out bg-slate-200 hover:bg-slate-300 text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shadow-[0_0_10px_rgba(0,0,0,0.05)] rounded-md"
                        >
                            <Shuffle className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Random</span>
                        </Button>

                        <Button
                            onClick={bubbleSort}
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
                            Drag bars to rearrange • Press Enter to add
                        </p>
                    </div>
                ) : (
                    <div className="h-full min-h-[240px] sm:min-h-[280px] flex items-end justify-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                        {array.map((val, idx) => {
                            const maxValSafe = Math.max(...array, 1);
                            const availableHeight = window.innerWidth < 640 ? 180 : 240;
                            const minHeight = 30;
                            const maxHeight = availableHeight - 40;
                            const barHeight = Math.min(
                                (val / maxValSafe) * maxHeight + minHeight,
                                maxHeight
                            );

                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center justify-end h-full"
                                    draggable={!sorting}
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div
                                        className={`bar ${!sorting ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                        style={{
                                            height: `${barHeight}px`,
                                            width: window.innerWidth < 640 ? "24px" : "32px",
                                        }}
                                    ></div>
                                    <span className="text-xs mt-2 font-medium text-slate-600 dark:text-white/60">
                                        {val}
                                    </span>
                                </div>
                            );
                        })}
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
                            How Bubble Sort Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Repeatedly steps through the array, compares adjacent elements and swaps them if they're in the wrong order.
                            The largest elements "bubble up" to their correct position with each pass through the array.
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