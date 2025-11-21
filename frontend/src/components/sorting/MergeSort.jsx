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

export default function MergeSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [paused, setPaused] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [visualTree, setVisualTree] = useState([]);
    const [currentStep, setCurrentStep] = useState("");
    const [activeNodes, setActiveNodes] = useState(new Set());
    const [mergingNodes, setMergingNodes] = useState(new Set());
    const [completedNodes, setCompletedNodes] = useState(new Set());
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

    const buildVisualTree = (arr, left, right, level = 0, position = 0) => {
        const nodeId = `${level}-${position}`;
        const node = {
            id: nodeId,
            array: arr.slice(left, right + 1),
            left,
            right,
            level,
            position,
            isSorted: false
        };

        let tree = [node];

        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            const leftTree = buildVisualTree(arr, left, mid, level + 1, position * 2);
            const rightTree = buildVisualTree(arr, mid + 1, right, level + 1, position * 2 + 1);
            tree = tree.concat(leftTree, rightTree);
        }

        return tree;
    };

    const mergeSort = async () => {
        setSorting(true);
        setPaused(false);
        setActiveNodes(new Set());
        setMergingNodes(new Set());
        setCompletedNodes(new Set());
        
        let arr = [...array];
        const tree = buildVisualTree(arr, 0, arr.length - 1);
        setVisualTree(tree);
        
        setCurrentStep("Building divide tree...");
        await sleep(delay);

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        await mergeSortHelper(arr, 0, arr.length - 1, 0, 0, tree);
        
        setCurrentStep("Merge Sort Complete! 🎉");
        setCompletedNodes(new Set([tree[0].id]));
        await sleep(delay * 2);
        
        setSorting(false);
        setPaused(false);
        setActiveNodes(new Set());
        setMergingNodes(new Set());
        setCurrentStep("");
    };

    const mergeSortHelper = async (arr, left, right, level, position, tree) => {
        const nodeId = `${level}-${position}`;
        
        if (left >= right) {
            setCompletedNodes(prev => new Set([...prev, nodeId]));
            return;
        }

        const mid = Math.floor((left + right) / 2);
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Highlight current divide
        setCurrentStep(`Dividing array at level ${level}`);
        setActiveNodes(new Set([nodeId]));
        await sleep(delay);

        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Recursively sort left half
        await mergeSortHelper(arr, left, mid, level + 1, position * 2, tree);
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Recursively sort right half
        await mergeSortHelper(arr, mid + 1, right, level + 1, position * 2 + 1, tree);
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Merge the sorted halves
        await merge(arr, left, mid, right, nodeId, tree);
    };

    const merge = async (arr, left, mid, right, nodeId, tree) => {
        const leftNodeId = `${parseInt(nodeId.split('-')[0]) + 1}-${parseInt(nodeId.split('-')[1]) * 2}`;
        const rightNodeId = `${parseInt(nodeId.split('-')[0]) + 1}-${parseInt(nodeId.split('-')[1]) * 2 + 1}`;
        
        // Wait for pause to be resumed
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setCurrentStep(`Merging: [${arr.slice(left, mid + 1).join(', ')}] with [${arr.slice(mid + 1, right + 1).join(', ')}]`);
        setMergingNodes(new Set([leftNodeId, rightNodeId]));
        setActiveNodes(new Set([nodeId]));
        await sleep(delay);

        // Create temp arrays
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;

        // Merge process with animation
        while (i < leftArr.length && j < rightArr.length) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            k++;
            
            // Update the tree node with current merged state
            const nodeIndex = tree.findIndex(node => node.id === nodeId);
            if (nodeIndex !== -1) {
                tree[nodeIndex].array = arr.slice(left, k);
                setVisualTree([...tree]);
            }
            await sleep(delay);
        }

        // Copy remaining elements
        while (i < leftArr.length) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            arr[k] = leftArr[i];
            i++;
            k++;
            const nodeIndex = tree.findIndex(node => node.id === nodeId);
            if (nodeIndex !== -1) {
                tree[nodeIndex].array = arr.slice(left, k);
                setVisualTree([...tree]);
            }
            await sleep(delay);
        }

        while (j < rightArr.length) {
            // Wait for pause to be resumed
            while (paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            arr[k] = rightArr[j];
            j++;
            k++;
            const nodeIndex = tree.findIndex(node => node.id === nodeId);
            if (nodeIndex !== -1) {
                tree[nodeIndex].array = arr.slice(left, k);
                setVisualTree([...tree]);
            }
            await sleep(delay);
        }

        // Mark as completed
        const nodeIndex = tree.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
            tree[nodeIndex].array = arr.slice(left, right + 1);
            tree[nodeIndex].isSorted = true;
            setVisualTree([...tree]);
        }
        
        setCompletedNodes(prev => new Set([...prev, nodeId]));
        setMergingNodes(new Set());
        setArray([...arr]);
        await sleep(delay);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setPaused(false);
        setVisualTree([]);
        setActiveNodes(new Set());
        setMergingNodes(new Set());
        setCompletedNodes(new Set());
        setCurrentStep("");
    };

    const getNodeColor = (nodeId) => {
        if (completedNodes.has(nodeId)) return "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-900/20";
        if (activeNodes.has(nodeId)) return "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20";
        if (mergingNodes.has(nodeId)) return "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/20";
        return "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50";
    };

    const renderTree = () => {
        if (visualTree.length === 0) return null;

        const maxLevel = Math.max(...visualTree.map(node => node.level));
        const levels = [];
        
        for (let level = 0; level <= maxLevel; level++) {
            levels.push(visualTree.filter(node => node.level === level));
        }

        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-max py-8">
                    {levels.map((levelNodes, levelIndex) => (
                        <div key={levelIndex} className="flex justify-center items-center mb-8 relative">
                            {levelNodes.map((node, nodeIndex) => (
                                <div key={node.id} className="relative mx-4">
                                    {/* Connection lines to children */}
                                    {levelIndex < levels.length - 1 && node.left < node.right && (
                                        <>
                                            <div className="absolute top-full left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2"></div>
                                            <div className="absolute top-full left-1/4 w-1/2 h-px bg-gray-400 transform translate-y-4"></div>
                                        </>
                                    )}
                                    
                                    {/* Node */}
                                    <div className={`
                                        border-2 rounded-lg p-3 transition-all duration-500 transform
                                        ${getNodeColor(node.id)}
                                        ${activeNodes.has(node.id) ? 'scale-110 shadow-lg' : ''}
                                        ${mergingNodes.has(node.id) ? 'animate-pulse' : ''}
                                        ${completedNodes.has(node.id) ? 'shadow-green-200 shadow-lg' : ''}
                                    `}>
                                        <div className="flex gap-1 justify-center">
                                            {node.array.map((val, idx) => (
                                                <div
                                                    key={`${node.id}-${idx}`}
                                                    className={`
                                                        w-8 h-8 rounded flex items-center justify-center text-sm font-bold
                                                        transition-all duration-300
                                                        ${completedNodes.has(node.id) 
                                                            ? 'bg-green-600 text-white' 
                                                            : activeNodes.has(node.id)
                                                                ? 'bg-blue-600 text-white'
                                                                : mergingNodes.has(node.id)
                                                                    ? 'bg-orange-500 text-white'
                                                                    : 'bg-gray-700 text-white'
                                                        }
                                                    `}
                                                >
                                                    {val}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                                            Level {node.level}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl mx-auto">
            {/* Title Section */}
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Merge Sort Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Watch how bubble sort compares and swaps adjacent elements
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
                            onClick={mergeSort}
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
                ) : !sorting && visualTree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 text-slate-400 dark:text-white/40">
                        <p className="text-center text-base mb-2">
                            Click "Start" to see the merge sort tree in action!
                        </p>
                        <p className="text-sm text-slate-400 dark:text-white/30">
                            Watch the divide and conquer process
                        </p>
                    </div>
                ) : (
                    renderTree()
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
                            How Merge Sort Works
                        </h3>
                        <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">
                            Divides the array into two halves, recursively sorts them, and then merges the sorted halves back together.
                            Watch as the array dynamically divides into a tree structure, then merges back up level by level.
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
                                O(n)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}