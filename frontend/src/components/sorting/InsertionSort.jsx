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

    const insertionSort = async () => {
        setSorting(true);
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
            const key = arr[i];
            setKeyIndex(i);
            setCurrentStep(`Selecting key element: ${key} at position ${i}`);
            await sleep(delay);
            
            let j = i - 1;
            
            setCurrentStep(`Finding correct position for ${key} in the sorted portion`);
            await sleep(delay);
            
            // Move elements greater than key one position ahead
            while (j >= 0) {
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
        setCurrentStep("");
        setKeyIndex(-1);
        setComparingIndex(-1);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setKeyIndex(-1);
        setComparingIndex(-1);
        setSortedBoundary(0);
        setShiftingIndices([]);
        setInsertingAt(-1);
        setCurrentStep("");
    };

    const getElementColor = (index) => {
        if (index === keyIndex) return "bg-violet-200 border-violet-600 border-4 text-violet-900";
        if (index === insertingAt) return "bg-lime-200 border-lime-600 border-4 text-lime-900";
        if (shiftingIndices.includes(index)) return "bg-orange-200 border-orange-500 border-2 text-orange-900";
        if (index === comparingIndex) return "bg-yellow-200 border-yellow-500 border-2 text-yellow-900";
        if (index < sortedBoundary) return "bg-teal-100 border-teal-400 border-2 text-teal-800";
        return "bg-gray-100 border-gray-400 text-gray-700";
    };

    return (
        <Card className="bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 text-gray-900 p-6 max-w-7xl mx-auto border-2 border-violet-200 shadow-2xl">
            <CardContent className="space-y-6">
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                        Insertion Sort Visualizer
                    </h2>
                    <p className="text-sm text-gray-600">Watch how elements are inserted into their correct positions one by one</p>
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
                            className="w-48 border-violet-300 bg-white focus:border-violet-500 focus:ring-violet-500"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={sorting} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-md">
                            Add
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomArray} disabled={sorting} className="bg-pink-600 hover:bg-pink-700 text-white shadow-md">
                        Generate Random (12 elements)
                    </Button>
                    
                    <Button
                        onClick={insertionSort}
                        disabled={sorting || array.length < 2}
                        variant="default"
                        className="bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 hover:from-violet-700 hover:via-pink-700 hover:to-orange-700 text-white shadow-lg font-semibold"
                    >
                        {sorting ? "Sorting..." : "Start Insertion Sort"}
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={sorting} className="border-violet-300 text-violet-700 hover:bg-violet-50 shadow-md">
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
                            className={speedKey === key ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md" : "border-violet-300 text-gray-700 hover:bg-violet-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-violet-100 via-pink-100 to-orange-100 rounded-xl border-2 border-violet-300 shadow-md">
                        <span className="text-lg font-semibold text-gray-800">{currentStep}</span>
                    </div>
                )}

                {/* Sorted Boundary Display */}
                {sorting && sortedBoundary > 0 && (
                    <div className="text-center p-3 bg-teal-50 rounded-lg border-2 border-teal-300">
                        <span className="text-teal-800 font-semibold">
                            Sorted Portion: [0...{sortedBoundary - 1}] ({sortedBoundary} elements)
                        </span>
                    </div>
                )}

                {/* Array Visualizer */}
                <div className="min-h-32 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-violet-200 shadow-inner">
                    {array.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                                <div className="text-4xl mb-2">🎴</div>
                                <span>Add numbers or generate a random array to see Insertion Sort in action</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Visual separator between sorted and unsorted */}
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
                                                style={{
                                                    minWidth: '64px',
                                                }}
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
                                                <div className="absolute -bottom-5 text-xs text-gray-500 font-normal">
                                                    {idx}
                                                </div>
                                            </div>
                                            {isBoundary && (
                                                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-3xl text-teal-600">
                                                    |
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Labels for sorted/unsorted regions */}
                            {sorting && sortedBoundary > 0 && sortedBoundary < array.length && (
                                <div className="flex justify-center gap-12 text-sm font-semibold">
                                    <div className="text-teal-700">
                                        ← Sorted Region
                                    </div>
                                    <div className="text-gray-600">
                                        Unsorted Region →
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
                        <div className="w-5 h-5 bg-teal-100 border-2 border-teal-400 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Sorted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-violet-200 border-4 border-violet-600 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Key (Current)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-yellow-200 border-2 border-yellow-500 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Comparing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-200 border-2 border-orange-500 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Shifting</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-lime-200 border-4 border-lime-600 rounded-lg shadow-sm"></div>
                        <span className="text-gray-700 font-medium">Inserting</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-xl p-5 text-sm border-2 border-violet-200 shadow-md">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                        <span className="text-2xl">🃏</span>
                        Insertion Sort Algorithm
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        Insertion Sort builds the sorted array one element at a time by repeatedly taking the next unsorted element 
                        and inserting it into its correct position within the sorted portion. Like sorting playing cards in your hand, 
                        you pick one card at a time and place it in the right spot among the cards you've already sorted.
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-xs leading-relaxed">
                            <strong>How it works:</strong> Start with the second element as the "key". Compare it with elements 
                            in the sorted portion (to its left). Shift all larger elements one position right, then insert the 
                            key in its correct position. Repeat for all elements.
                        </p>
                    </div>
                    <div className="pt-3 border-t border-violet-300">
                        <strong className="text-violet-700">Best Case:</strong> <span className="text-gray-700">O(n) - already sorted</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <strong className="text-pink-700">Average/Worst:</strong> <span className="text-gray-700">O(n²)</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <strong className="text-orange-700">Space:</strong> <span className="text-gray-700">O(1)</span>
                    </div>
                </div>

                {/* Fun Fact */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 text-sm border-2 border-amber-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h4 className="font-bold text-amber-900 mb-1">Fun Fact!</h4>
                            <p className="text-amber-800">
                                Insertion Sort is one of the fastest algorithms for small datasets or nearly sorted data. 
                                It's also <strong>stable</strong> (preserves relative order of equal elements) and <strong>adaptive</strong> (efficient for data that's already partially sorted).
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}