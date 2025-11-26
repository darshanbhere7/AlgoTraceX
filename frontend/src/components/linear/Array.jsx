import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const speedOptions = {
    "0.25x": 1200,
    "0.5x": 800,
    "1x": 400,
    "2x": 200,
    "4x": 100,
};

export default function ArrayVisualizer() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [indexInput, setIndexInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [operation, setOperation] = useState("");
    const [operationComplete, setOperationComplete] = useState(false);
    const [lastOperationResult, setLastOperationResult] = useState("");
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
        if (animating) return;
        const randomArr = Array.from({ length: 10 }, () =>
            Math.floor(Math.random() * 99) + 1
        );
        setArray(randomArr);
        reset();
    };

    const reset = () => {
        setHighlightedIndex(-1);
        setOperation("");
        setOperationComplete(false);
        setLastOperationResult("");
        setAnimating(false);
    };

    const clearAll = () => {
        setArray([]);
        setCurrentInput("");
        setIndexInput("");
        reset();
    };

    // Push operation (add to end)
    const handlePush = async () => {
        const val = parseInt(currentInput.trim());
        if (isNaN(val) || animating) return;

        setAnimating(true);
        setOperation("push");
        setOperationComplete(false);

        // Highlight the position where element will be added
        setHighlightedIndex(array.length);
        await new Promise(r => setTimeout(r, delay));

        setArray(prev => [...prev, val]);
        setCurrentInput("");
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Pushed ${val} to the end`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };

    // Pop operation (remove from end)
    const handlePop = async () => {
        if (array.length === 0 || animating) return;

        setAnimating(true);
        setOperation("pop");
        setOperationComplete(false);

        const lastIndex = array.length - 1;
        const poppedValue = array[lastIndex];
        
        // Highlight the element to be removed
        setHighlightedIndex(lastIndex);
        await new Promise(r => setTimeout(r, delay));

        setArray(prev => prev.slice(0, -1));
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Popped ${poppedValue} from the end`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };



    // Insert at index
    const handleInsertAt = async () => {
        const val = parseInt(currentInput.trim());
        const idx = parseInt(indexInput.trim());
        if (isNaN(val) || isNaN(idx) || idx < 0 || idx > array.length || animating) return;

        setAnimating(true);
        setOperation("insert");
        setOperationComplete(false);

        // Highlight the insertion point
        setHighlightedIndex(idx);
        await new Promise(r => setTimeout(r, delay));

        // Highlight elements that will shift
        for (let i = idx; i < array.length; i++) {
            setHighlightedIndex(i);
            await new Promise(r => setTimeout(r, delay / 3));
        }

        const newArray = [...array];
        newArray.splice(idx, 0, val);
        setArray(newArray);
        setCurrentInput("");
        setIndexInput("");
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Inserted ${val} at index ${idx}`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };

    // Remove at index
    const handleRemoveAt = async () => {
        const idx = parseInt(indexInput.trim());
        if (isNaN(idx) || idx < 0 || idx >= array.length || animating) return;

        setAnimating(true);
        setOperation("remove");
        setOperationComplete(false);

        const removedValue = array[idx];
        
        // Highlight the element to be removed
        setHighlightedIndex(idx);
        await new Promise(r => setTimeout(r, delay));

        // Highlight elements that will shift
        for (let i = idx + 1; i < array.length; i++) {
            setHighlightedIndex(i);
            await new Promise(r => setTimeout(r, delay / 3));
        }

        const newArray = [...array];
        newArray.splice(idx, 1);
        setArray(newArray);
        setIndexInput("");
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Removed ${removedValue} from index ${idx}`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };



    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Array Operations Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Enjoy the exact Binary Search Tree layout while manipulating contiguous memory operations.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Value (0-999)"
                            value={currentInput}
                            disabled={animating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                        />
                        <Button
                            variant="ghost"
                            onClick={handleAddValue}
                            disabled={animating}
                            className="h-10 px-4 bg-black hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Add
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Index"
                            value={indexInput}
                            disabled={animating}
                            onChange={(e) => setIndexInput(e.target.value)}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                        />
                        <Button
                            variant="ghost"
                            onClick={reset}
                            disabled={animating}
                            className="h-10 px-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                            Reset
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={generateRandomArray}
                            disabled={animating}
                            className="flex-1 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/15 dark:hover:bg-white/20 dark:text-white rounded-md"
                        >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Random Array
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={clearAll}
                            disabled={animating}
                            className="flex-1 h-10 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={handlePush}
                        disabled={animating || !currentInput.trim()}
                        className="flex-1 sm:flex-none bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 h-10 rounded-md"
                    >
                        Push
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handlePop}
                        disabled={animating || array.length === 0}
                        className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
                    >
                        Pop
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleInsertAt}
                        disabled={animating || !currentInput.trim() || !indexInput.trim()}
                        className="flex-1 sm:flex-none bg-sky-500/20 hover:bg-sky-500/30 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 text-sky-700 dark:text-sky-300 border border-sky-500/20 h-10 rounded-md"
                    >
                        Insert at Index
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleRemoveAt}
                        disabled={animating || !indexInput.trim() || array.length === 0}
                        className="flex-1 sm:flex-none bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 text-amber-700 dark:text-amber-300 border border-amber-500/20 h-10 rounded-md"
                    >
                        Remove at Index
                    </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Speed</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            variant="ghost"
                            key={key}
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={animating}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${
                                speedKey === key
                                    ? "bg-black hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm"
                                    : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm"
                            }`}
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm mb-4">
                {animating && (
                    <p>
                        Performing <span className="font-semibold text-indigo-600 dark:text-indigo-300">{operation}</span>...
                    </p>
                )}
                {operationComplete && lastOperationResult && (
                    <p className="text-emerald-600 dark:text-emerald-300">{lastOperationResult}</p>
                )}
                {!animating && !operationComplete && array.length === 0 && (
                    <p>Insert numbers to populate the array.</p>
                )}
                {!animating && !operationComplete && array.length > 0 && (
                    <p>Select an operation to manipulate the array in-place.</p>
                )}
            </div>

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg min-h-[320px]">
                {array.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-white/40">
                        <p className="text-base mb-2 text-center">Array is empty. Add or randomize values to begin.</p>
                        <p className="text-sm text-slate-400 dark:text-white/30 text-center">Watch how contiguous memory shifts during inserts/removals.</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                        {array.map((val, idx) => {
                            let bgColor = "bg-white dark:bg-slate-800";
                            let textColor = "text-slate-900 dark:text-white";
                            let borderColor = "border-slate-300 dark:border-slate-700";

                            if (idx === highlightedIndex) {
                                switch (operation) {
                                    case "push":
                                        bgColor = "bg-emerald-500/20";
                                        textColor = "text-emerald-700 dark:text-emerald-200";
                                        borderColor = "border-emerald-500/60";
                                        break;
                                    case "pop":
                                        bgColor = "bg-rose-500/20";
                                        textColor = "text-rose-700 dark:text-rose-200";
                                        borderColor = "border-rose-500/60";
                                        break;
                                    case "insert":
                                        bgColor = "bg-sky-500/20";
                                        textColor = "text-sky-700 dark:text-sky-200";
                                        borderColor = "border-sky-500/60";
                                        break;
                                    case "remove":
                                        bgColor = "bg-amber-500/20";
                                        textColor = "text-amber-700 dark:text-amber-200";
                                        borderColor = "border-amber-500/60";
                                        break;
                                    default:
                                        bgColor = "bg-indigo-500/20";
                                        textColor = "text-indigo-700 dark:text-indigo-200";
                                        borderColor = "border-indigo-500/60";
                                }
                            }

                            return (
                                <div
                                    key={`${idx}-${val}`}
                                    className={`${bgColor} ${textColor} border ${borderColor} rounded-xl px-5 py-4 min-w-16 text-center font-mono text-lg shadow transition-all duration-300`}
                                >
                                    <div className="font-bold">{val}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">[{idx}]</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span>Normal</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span>Push target</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span>Pop/remove target</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-sky-400" />
                    <span>Insert point</span>
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
                <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 space-y-4 animate-in slide-in-from-top-2 duration-300 text-sm">
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Array Operation Notes</h3>
                        <p className="text-slate-600 dark:text-white/60">
                            Arrays store data contiguously, so push/pop at the tail remain O(1) while inserts and deletes in the middle require shifting elements (O(n)).
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-2">
                            Current length: {array.length}. Use slower speeds to observe how shifts propagate.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}