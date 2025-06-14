import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const speedOptions = {
    "0.25x": 1200,
    "0.5x": 800,
    "1x": 400,
    "2x": 200,
    "4x": 100,
};

export default function BinarySearch() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searching, setSearching] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [leftIndex, setLeftIndex] = useState(-1);
    const [rightIndex, setRightIndex] = useState(-1);
    const [midIndex, setMidIndex] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [searchComplete, setSearchComplete] = useState(false);

    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val)) {
            setArray((prev) => [...prev, val].sort((a, b) => a - b));
            setCurrentInput("");
        }
    };

    const generateRandomArray = () => {
        if (searching) return;
        const randomArr = Array.from({ length: 15 }, () =>
            Math.floor(Math.random() * 90) + 10
        ).sort((a, b) => a - b);
        setArray(randomArr);
        reset();
    };

    const binarySearch = async () => {
        const target = parseInt(searchValue.trim());
        if (isNaN(target) || array.length === 0) return;

        setSearching(true);
        setFoundIndex(-1);
        setSearchComplete(false);

        let left = 0;
        let right = array.length - 1;

        while (left <= right) {
            setLeftIndex(left);
            setRightIndex(right);
            await new Promise((r) => setTimeout(r, delay));

            const mid = Math.floor((left + right) / 2);
            setMidIndex(mid);
            await new Promise((r) => setTimeout(r, delay));

            if (array[mid] === target) {
                setFoundIndex(mid);
                setLeftIndex(-1);
                setRightIndex(-1);
                setMidIndex(-1);
                setSearchComplete(true);
                setSearching(false);
                return;
            } else if (array[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }

            await new Promise((r) => setTimeout(r, delay));
        }

        // Not found
        setLeftIndex(-1);
        setRightIndex(-1);
        setMidIndex(-1);
        setSearchComplete(true);
        setSearching(false);
    };

    const reset = () => {
        setLeftIndex(-1);
        setRightIndex(-1);
        setMidIndex(-1);
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
        <Card className="bg-neutral-900 text-white p-6">
            <CardContent className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Binary Search Visualizer</h2>

                {/* Input Panel */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Input
                        type="number"
                        placeholder="Enter a number"
                        value={currentInput}
                        disabled={searching}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                        className="w-full md:w-40"
                    />
                    <Button onClick={handleAddValue} disabled={searching} className={"hover:bg-white hover:text-black"}>
                        Add
                    </Button>
                    <Button onClick={generateRandomArray} disabled={searching} className={"bg-white text-gray-500 hover:bg-neutral-900 hover:text-white"}>
                        Random Array
                    </Button>
                    <Button onClick={clearAll} disabled={searching} variant="secondary">
                        Clear All
                    </Button>
                </div>

                {/* Search Panel */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Input
                        type="number"
                        placeholder="Value to search"
                        value={searchValue}
                        disabled={searching}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && binarySearch()}
                        className="w-full md:w-40"
                    />
                    <Button
                        onClick={binarySearch}
                        disabled={searching || array.length === 0 || !searchValue.trim()}
                        variant="default"
                    >
                        Start Search
                    </Button>

                    <Button onClick={reset} disabled={searching} variant="secondary">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-400">Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={searching}
                            className={speedKey !== key ? "text-gray-500 border-white hover:text-black" : ""}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Info Banner */}
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-3">
                    <p className="text-sm text-blue-200">
                        <strong>Note:</strong> Binary search requires a sorted array. Numbers are automatically sorted when added.
                    </p>
                </div>

                {/* Array Visualizer */}
                <div className="bg-neutral-800 rounded-lg p-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {array.map((val, idx) => {
                            let bgColor = "bg-gray-700";
                            let textColor = "text-white";
                            let borderColor = "border-gray-600";
                            
                            // Found element
                            if (idx === foundIndex) {
                                bgColor = "bg-green-500";
                                textColor = "text-white";
                                borderColor = "border-green-400";
                            }
                            // Current middle element
                            else if (idx === midIndex) {
                                bgColor = "bg-blue-500";
                                textColor = "text-white";
                                borderColor = "border-blue-400";
                            }
                            // Left and right pointers
                            else if (idx === leftIndex || idx === rightIndex) {
                                bgColor = "bg-orange-500";
                                textColor = "text-white";
                                borderColor = "border-orange-400";
                            }
                            // Elements in current search range
                            else if (leftIndex !== -1 && rightIndex !== -1 && idx >= leftIndex && idx <= rightIndex) {
                                bgColor = "bg-gray-600";
                                textColor = "text-white";
                                borderColor = "border-gray-500";
                            }

                            return (
                                <div
                                    key={idx}
                                    className={`${bgColor} ${textColor} border ${borderColor} rounded px-4 py-3 min-w-12 text-center font-mono transition-all duration-300`}
                                >
                                    <div className="text-sm font-bold">{val}</div>
                                    <div className="text-xs text-gray-400">{idx}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    {searching && (
                        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                <span>Left/Right bounds</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span>Middle element</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                                <span>Search range</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Display */}
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                    {searching && (
                        <p className="text-lg">
                            Searching for <span className="font-bold">{searchValue}</span>... 
                            <br />
                            Left: {leftIndex}, Mid: {midIndex}, Right: {rightIndex}
                        </p>
                    )}
                    {searchComplete && foundIndex !== -1 && (
                        <p className="text-lg text-green-600">
                            Found <span className="font-bold">{searchValue}</span> at index {foundIndex}!
                        </p>
                    )}
                    {searchComplete && foundIndex === -1 && (
                        <p className="text-lg text-red-600">
                            <span className="font-bold">{searchValue}</span> not found in the array.
                        </p>
                    )}
                    {!searching && !searchComplete && array.length > 0 && (
                        <p className="text-gray-400">
                            Enter a value to search and click "Start Search"
                        </p>
                    )}
                    {array.length === 0 && (
                        <p className="text-gray-400">
                            Add numbers to the array to begin searching
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}