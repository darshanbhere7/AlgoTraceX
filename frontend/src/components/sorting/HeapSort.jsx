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

export default function HeapSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [heapSize, setHeapSize] = useState(0);
    const [comparingIndices, setComparingIndices] = useState([]);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [heapifiedIndices, setHeapifiedIndices] = useState(new Set());
    const [sortedIndices, setSortedIndices] = useState(new Set());
    const [currentRoot, setCurrentRoot] = useState(-1);

    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
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

    const heapSort = async () => {
        setSorting(true);
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
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await heapify(arr, n, i);
        }
        
        setCurrentStep("Max Heap Built! Starting extraction...");
        setHeapifiedIndices(new Set([...Array(n).keys()]));
        await sleep(delay * 2);
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            setHeapSize(i);
            setCurrentStep(`Extracting max element: ${arr[0]}`);
            
            // Highlight swap
            setSwappingIndices([0, i]);
            await sleep(delay);
            
            // Move current root to end (swap)
            [arr[0], arr[i]] = [arr[i], arr[0]];
            setArray([...arr]);
            await sleep(delay);
            
            // Mark as sorted
            setSortedIndices(prev => new Set([...prev, i]));
            setSwappingIndices([]);
            
            setCurrentStep(`${arr[i]} placed in sorted position. Heapifying remaining elements...`);
            await sleep(delay);
            
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
        setCurrentStep("");
        setCurrentRoot(-1);
    };

    const heapify = async (arr, n, i) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        setCurrentRoot(i);
        setCurrentStep(`Heapifying subtree rooted at index ${i} (value: ${arr[i]})`);
        await sleep(delay);
        
        // Compare with left child
        if (left < n) {
            setComparingIndices([i, left]);
            setCurrentStep(`Comparing ${arr[i]} with left child ${arr[left]}`);
            await sleep(delay);
            
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }
        
        // Compare with right child
        if (right < n) {
            setComparingIndices([largest, right]);
            setCurrentStep(`Comparing ${arr[largest]} with right child ${arr[right]}`);
            await sleep(delay);
            
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }
        
        setComparingIndices([]);
        
        // If largest is not root, swap and continue heapifying
        if (largest !== i) {
            setSwappingIndices([i, largest]);
            setCurrentStep(`Swapping ${arr[i]} and ${arr[largest]}`);
            await sleep(delay);
            
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            setArray([...arr]);
            await sleep(delay);
            
            setSwappingIndices([]);
            
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
        setComparingIndices([]);
        setSwappingIndices([]);
        setHeapifiedIndices(new Set());
        setSortedIndices(new Set());
        setCurrentStep("");
        setHeapSize(0);
        setCurrentRoot(-1);
    };

    const getElementColor = (index) => {
        if (sortedIndices.has(index)) return "bg-emerald-100 border-emerald-500 text-emerald-800";
        if (index === currentRoot) return "bg-indigo-100 border-indigo-600 border-4 text-indigo-900";
        if (swappingIndices.includes(index)) return "bg-rose-100 border-rose-500 border-2 text-rose-800";
        if (comparingIndices.includes(index)) return "bg-amber-100 border-amber-500 border-2 text-amber-800";
        if (heapifiedIndices.has(index) && index < heapSize) return "bg-cyan-100 border-cyan-400 border-2 text-cyan-800";
        return "bg-slate-50 border-slate-300 text-slate-800";
    };

    const getHeapLevel = (index) => {
        return Math.floor(Math.log2(index + 1));
    };

    return (
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-slate-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Heap Sort Visualizer
                    </h2>
                    <p className="text-sm text-slate-600">Watch how heap sort builds a max heap and extracts elements</p>
                </div>

                {/* Input Panel */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Enter number (0-999)"
                            value={currentInput}
                            disabled={sorting}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="w-48 border-slate-300 bg-white focus:border-blue-500 focus:ring-blue-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={sorting} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                            Add
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomArray} disabled={sorting} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md">
                        Generate Random (12 elements)
                    </Button>
                    
                    <Button
                        onClick={heapSort}
                        disabled={sorting || array.length < 2}
                        variant="default"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                        {sorting ? "Sorting..." : "Start Heap Sort"}
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={sorting} className="border-slate-300 text-slate-700 hover:bg-slate-100 shadow-md">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm font-medium text-slate-700">Animation Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={sorting}
                            className={speedKey === key ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "border-slate-300 text-slate-700 hover:bg-slate-100"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-md">
                        <span className="text-lg font-semibold text-slate-800">{currentStep}</span>
                    </div>
                )}

                {/* Heap Size Display */}
                {sorting && heapSize > 0 && (
                    <div className="text-center p-3 bg-cyan-50 rounded-lg border-2 border-cyan-300">
                        <span className="text-cyan-800 font-semibold">
                            Current Heap Size: {heapSize}
                        </span>
                    </div>
                )}

                {/* Array Visualizer */}
                <div className="min-h-32 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 shadow-inner">
                    {array.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-slate-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🌳</div>
                                <span>Add numbers or generate a random array to see Heap Sort in action</span>
                            </div>
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
                                        <div className="absolute -bottom-5 text-xs text-slate-500 font-normal">
                                            {idx}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-slate-50 border-2 border-slate-300 rounded-lg shadow-sm"></div>
                        <span className="text-slate-700 font-medium">Unsorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-cyan-100 border-2 border-cyan-400 rounded-lg shadow-sm"></div>
                        <span className="text-slate-700 font-medium">In Heap</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-indigo-100 border-4 border-indigo-600 rounded-lg shadow-sm"></div>
                        <span className="text-slate-700 font-medium">Current Root</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-amber-100 border-2 border-amber-500 rounded-lg shadow-sm"></div>
                        <span className="text-slate-700 font-medium">Comparing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-rose-100 border-2 border-rose-500 rounded-lg shadow-sm"></div>
                        <span className="text-slate-700 font-medium">Swapping</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-100 border-2 border-emerald-500 rounded-lg shadow-sm"></div>
                        <span className="text-slate-700 font-medium">Sorted</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 text-sm border-2 border-slate-200 shadow-md">
                    <h3 className="font-bold mb-3 text-slate-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Heap Sort Algorithm
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                        Heap Sort first builds a <strong>max heap</strong> from the input array, where the largest element is at the root. 
                        It then repeatedly extracts the maximum element from the heap (moving it to the end of the array) and 
                        re-heapifies the remaining elements. This process continues until all elements are sorted.
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-300">
                        <strong className="text-blue-700">Time Complexity:</strong> <span className="text-slate-700">O(n log n) in all cases</span>
                        <span className="mx-2 text-slate-400">|</span>
                        <strong className="text-purple-700">Space Complexity:</strong> <span className="text-slate-700">O(1) - sorts in place</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}