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

const pivotOptions = {
    "first": "First Element",
    "last": "Last Element"
};

export default function QuickSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [pivotStrategy, setPivotStrategy] = useState("last");
    const [currentStep, setCurrentStep] = useState("");
    const [pivotIndex, setPivotIndex] = useState(-1);
    const [comparingIndices, setComparingIndices] = useState([]);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [partitionRange, setPartitionRange] = useState([]);
    const [sortedIndices, setSortedIndices] = useState(new Set());

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

    const quickSort = async () => {
        setSorting(true);
        setPivotIndex(-1);
        setComparingIndices([]);
        setSwappingIndices([]);
        setPartitionRange([]);
        setSortedIndices(new Set());
        
        let arr = [...array];
        setCurrentStep("Starting QuickSort...");
        await sleep(delay);
        
        await quickSortHelper(arr, 0, arr.length - 1);
        
        setCurrentStep("QuickSort Complete! 🎉");
        setSortedIndices(new Set([...Array(arr.length).keys()]));
        setPivotIndex(-1);
        setComparingIndices([]);
        setPartitionRange([]);
        await sleep(delay * 2);
        
        setSorting(false);
        setCurrentStep("");
    };

    const quickSortHelper = async (arr, low, high) => {
        if (low < high) {
            // Highlight current partition range
            setPartitionRange([low, high]);
            setCurrentStep(`Partitioning range [${low}...${high}]`);
            await sleep(delay);

            // Partition the array and get pivot position
            const pivotPos = await partition(arr, low, high);
            
            // Mark pivot as sorted
            setSortedIndices(prev => new Set([...prev, pivotPos]));
            setCurrentStep(`Pivot ${arr[pivotPos]} is now in correct position`);
            await sleep(delay);

            // Recursively sort left partition
            if (pivotPos - 1 > low) {
                setCurrentStep(`Sorting left partition [${low}...${pivotPos - 1}]`);
                await sleep(delay);
                await quickSortHelper(arr, low, pivotPos - 1);
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
            // Highlight elements being compared
            setComparingIndices([j, pivotIdx]);
            setCurrentStep(`Comparing ${arr[j]} with pivot ${pivotValue}`);
            await sleep(delay);

            if (arr[j] <= pivotValue) {
                i++;
                if (i !== j) {
                    // Highlight swap
                    setSwappingIndices([i, j]);
                    setCurrentStep(`Swapping ${arr[i]} and ${arr[j]}`);
                    await sleep(delay);
                    
                    // Perform swap
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    setArray([...arr]);
                    await sleep(delay);
                    
                    setSwappingIndices([]);
                }
            }
            
            setComparingIndices([]);
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
        setPivotIndex(-1);
        setComparingIndices([]);
        setSwappingIndices([]);
        setPartitionRange([]);
        setSortedIndices(new Set());
        setCurrentStep("");
    };

    const getElementColor = (index) => {
        if (sortedIndices.has(index)) return "bg-green-500 border-green-400";
        if (index === pivotIndex) return "bg-red-500 border-red-400 border-4";
        if (swappingIndices.includes(index)) return "bg-purple-500 border-purple-400 border-2";
        if (comparingIndices.includes(index)) return "bg-yellow-400 border-yellow-300 border-2 text-black";
        if (partitionRange.length === 2 && index >= partitionRange[0] && index <= partitionRange[1]) {
            return "bg-blue-500 border-blue-300 border-2";
        }
        return "bg-gray-600 border-gray-500";
    };

    return (
        <Card className="bg-neutral-900 text-white p-6 max-w-7xl mx-auto">
            <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                    Quick Sort Visualizer
                </h2>

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
                            className="w-48"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={sorting} size="sm">
                            Add
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomArray} disabled={sorting} className="hover:bg-white hover:text-black">
                        Generate Random (12 elements)
                    </Button>
                    
                    <Button
                        onClick={quickSort}
                        disabled={sorting || array.length < 2}
                        variant="default"
                        className="hover:bg-white hover:text-black"
                    >
                        {sorting ? "Sorting..." : "Start QuickSort"}
                    </Button>
                    
                    <Button variant="secondary" onClick={reset} disabled={sorting}>
                        Reset
                    </Button>
                </div>

                {/* Pivot Strategy Selection */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm text-gray-400">Pivot Strategy:</span>
                    {Object.entries(pivotOptions).map(([key, label]) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={pivotStrategy === key ? "default" : "outline"}
                            onClick={() => setPivotStrategy(key)}
                            disabled={sorting}
                            className={pivotStrategy !== key ? "text-gray-500 border-gray-500 hover:text-black hover:bg-green-400 hover:border-green-900" : "text-gray-500 bg-white hover:bg-red-400 hover:text-white hover:border-red-900"}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm text-gray-400">Animation Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={sorting}
                            className={speedKey !== key ? "text-gray-500 border-gray-500 hover:text-black hover:border-white" : ""}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-lg border border-red-500/30">
                        <span className="text-lg font-semibold text-yellow-400">{currentStep}</span>
                    </div>
                )}

                {/* Array Visualizer */}
                <div className="min-h-32 bg-gradient-to-b from-neutral-800/50 to-neutral-900/50 rounded-xl p-6 border border-gray-700">
                    {array.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400">
                            <div className="text-center">
                                <span>Add numbers or generate a random array to see QuickSort in action</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center items-center gap-3">
                            {array.map((val, idx) => (
                                <div
                                    key={`${idx}-${val}`}
                                    className={`
                                        ${getElementColor(idx)}
                                        text-white font-bold text-lg
                                        w-16 h-16 rounded-lg
                                        flex items-center justify-center
                                        transition-all duration-300 ease-in-out
                                        transform hover:scale-105
                                        shadow-lg
                                        ${swappingIndices.includes(idx) ? 'animate-pulse scale-110' : ''}
                                        ${comparingIndices.includes(idx) ? 'animate-bounce' : ''}
                                        ${idx === pivotIndex ? 'animate-pulse scale-110 shadow-red-500/50' : ''}
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
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-600 border border-gray-500 rounded"></div>
                        <span>Unsorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 border-2 border-blue-300 rounded"></div>
                        <span>Current Partition</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 border-4 border-red-400 rounded"></div>
                        <span>Pivot</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-300 rounded"></div>
                        <span>Comparing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 border-2 border-purple-400 rounded"></div>
                        <span>Swapping</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 border border-green-400 rounded"></div>
                        <span>Sorted</span>
                    </div>
                </div>

                {/* Current Pivot Info */}
                {pivotIndex >= 0 && (
                    <div className="text-center p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                        <span className="text-red-400 font-semibold">
                            Current Pivot: {array[pivotIndex]} (Position {pivotIndex})
                        </span>
                    </div>
                )}

                {/* Algorithm Info */}
                <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 rounded-lg p-4 text-sm border border-gray-600">
                    <h3 className="font-bold mb-2 text-yellow-400">QuickSort Algorithm:</h3>
                    <p className="text-gray-300">
                        QuickSort uses a divide-and-conquer approach by selecting a pivot element and partitioning 
                        the array around it. Elements smaller than the pivot go to the left, larger elements to the right. 
                        The process repeats recursively on each partition.
                        <br/><strong>Average Time Complexity:</strong> O(n log n) | <strong>Worst Case:</strong> O(n²) | <strong>Space Complexity:</strong> O(log n)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}