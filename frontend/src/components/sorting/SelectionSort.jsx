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

export default function SelectionSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [minIndex, setMinIndex] = useState(-1);
    const [comparingIndex, setComparingIndex] = useState(-1);
    const [swappingIndices, setSwappingIndices] = useState([]);
    const [sortedIndices, setSortedIndices] = useState(new Set());
    const [searchingRange, setSearchingRange] = useState([]);

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

    const selectionSort = async () => {
        setSorting(true);
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
        
        // Traverse through all array elements
        for (let i = 0; i < n - 1; i++) {
            setCurrentIndex(i);
            setMinIndex(i);
            setSearchingRange([i, n - 1]);
            setCurrentStep(`Pass ${i + 1}: Finding minimum in range [${i}...${n - 1}]`);
            await sleep(delay);
            
            let minIdx = i;
            setMinIndex(minIdx);
            setCurrentStep(`Assuming ${arr[minIdx]} at position ${minIdx} is minimum`);
            await sleep(delay);
            
            // Find the minimum element in the unsorted portion
            for (let j = i + 1; j < n; j++) {
                setComparingIndex(j);
                setCurrentStep(`Comparing ${arr[j]} with current minimum ${arr[minIdx]}`);
                await sleep(delay);
                
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
            
            // Swap the found minimum element with the first element
            if (minIdx !== i) {
                setSwappingIndices([i, minIdx]);
                setCurrentStep(`Swapping minimum ${arr[minIdx]} with ${arr[i]} at position ${i}`);
                await sleep(delay);
                
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
        setCurrentStep("");
        setCurrentIndex(-1);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setCurrentIndex(-1);
        setMinIndex(-1);
        setComparingIndex(-1);
        setSwappingIndices([]);
        setSortedIndices(new Set());
        setSearchingRange([]);
        setCurrentStep("");
    };

    const getElementColor = (index) => {
        if (sortedIndices.has(index)) return "bg-emerald-100 border-emerald-500 text-emerald-800";
        if (index === minIndex && !swappingIndices.includes(index)) return "bg-rose-200 border-rose-600 border-4 text-rose-900";
        if (swappingIndices.includes(index)) return "bg-fuchsia-200 border-fuchsia-600 border-4 text-fuchsia-900";
        if (index === currentIndex && !swappingIndices.includes(index)) return "bg-sky-200 border-sky-600 border-3 text-sky-900";
        if (index === comparingIndex) return "bg-amber-200 border-amber-500 border-2 text-amber-900";
        if (searchingRange.length === 2 && index >= searchingRange[0] && index <= searchingRange[1]) {
            return "bg-slate-200 border-slate-400 border-2 text-slate-800";
        }
        return "bg-gray-100 border-gray-400 text-gray-700";
    };

    return (
        <Card className="bg-gradient-to-br from-sky-50 via-rose-50 to-amber-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-sky-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                        Selection Sort Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Watch how the algorithm selects the minimum element and places it in position</p>
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
                            className="w-48 border-sky-300 bg-white focus:border-sky-500 focus:ring-sky-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={sorting} size="sm" className="bg-sky-600 hover:bg-sky-700 text-white shadow-md">
                            Add
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomArray} disabled={sorting} className="bg-rose-600 hover:bg-rose-700 text-white shadow-md">
                        Generate Random (12 elements)
                    </Button>
                    
                    <Button
                        onClick={selectionSort}
                        disabled={sorting || array.length < 2}
                        variant="default"
                        className="bg-gradient-to-r from-sky-600 via-rose-600 to-amber-600 hover:from-sky-700 hover:via-rose-700 hover:to-amber-700 text-white shadow-lg font-semibold"
                    >
                        {sorting ? "Sorting..." : "Start Selection Sort"}
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={sorting} className="border-sky-300 text-sky-700 hover:bg-sky-50 shadow-md">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Animation Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={sorting}
                            className={speedKey === key ? "bg-sky-600 text-white hover:bg-sky-700 shadow-md" : "border-sky-300 text-gray-700 hover:bg-sky-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-sky-100 via-rose-100 to-amber-100 rounded-xl border-2 border-sky-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Pass Information */}
                {sorting && currentIndex >= 0 && (
                    <div className="text-center p-3 bg-sky-50 rounded-lg border-2 border-sky-300">
                        <span className="text-sky-800 font-semibold">
                            Current Pass: {currentIndex + 1} | Sorted Elements: {sortedIndices.size} | Remaining: {array.length - sortedIndices.size}
                        </span>
                    </div>
                )}

                {/* Array Visualizer */}
                <div className="min-h-32 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-sky-200 shadow-inner">
                    {array.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🎯</div>
                                <span>Add numbers or generate a random array to see Selection Sort in action</span>
                            </div>
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
                                                <div className="absolute -bottom-5 text-xs text-gray-500 font-normal">
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
                                    <div className="text-emerald-700">
                                        ← Sorted (Minimum Elements)
                                    </div>
                                    <div className="text-gray-600">
                                        Unsorted (Searching for Minimum) →
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 border-2 border-gray-400 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Unsorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-slate-200 border-2 border-slate-400 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Search Range</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-sky-200 border-3 border-sky-600 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Current Position</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-rose-200 border-4 border-rose-600 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Current Minimum</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-amber-200 border-2 border-amber-500 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Comparing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-fuchsia-200 border-4 border-fuchsia-600 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Swapping</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-emerald-100 border-2 border-emerald-500 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Sorted</span>
                    </div>
                </div>

                {/* Current Minimum Display */}
                {minIndex >= 0 && !swappingIndices.includes(minIndex) && (
                    <div className="text-center p-3 bg-rose-50 rounded-lg border-2 border-rose-300">
                        <span className="text-rose-800 font-semibold">
                            Current Minimum: {array[minIndex]} (Position {minIndex})
                        </span>
                    </div>
                )}

                {/* Algorithm Info */}
                <div className="bg-gradient-to-br from-sky-50 to-rose-50 rounded-xl p-5 text-sm border-2 border-sky-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Selection Sort Algorithm
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        Selection Sort divides the array into a sorted and unsorted region. It repeatedly finds the minimum element 
                        from the unsorted region and moves it to the end of the sorted region. The algorithm maintains two boundaries: 
                        everything before the current position is sorted, and everything after needs to be examined.
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>How it works:</strong> Start at the first position. Find the minimum element in the unsorted 
                            portion (from current position to end). Swap it with the element at the current position. Move to the 
                            next position and repeat until the entire array is sorted.
                        </p>
                    </div>
                    <div className="pt-3 border-t border-sky-300">
                        <strong className="text-sky-700">Time Complexity:</strong> <span className="text-gray-700">O(n²) in all cases</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <strong className="text-rose-700">Comparisons:</strong> <span className="text-gray-700">Always n(n-1)/2</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <strong className="text-amber-700">Space:</strong> <span className="text-gray-700">O(1)</span>
                    </div>
                </div>

                {/* Key Characteristics */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-sm border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                            <h4 className="font-bold text-blue-900 mb-1">Key Characteristics</h4>
                            <p className="text-blue-800">
                                Selection Sort performs <strong>fewer swaps</strong> than other O(n²) algorithms (at most n-1 swaps), 
                                making it useful when write operations are expensive. However, it's <strong>not stable</strong> and 
                                performs the same number of comparisons regardless of input, even if the array is already sorted.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}