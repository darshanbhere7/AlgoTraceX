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

export default function JumpSearch() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searching, setSearching] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [jumpIndex, setJumpIndex] = useState(-1);
    const [blockStart, setBlockStart] = useState(-1);
    const [blockEnd, setBlockEnd] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [searchComplete, setSearchComplete] = useState(false);
    const [searchPhase, setSearchPhase] = useState(""); // "jumping" or "linear"

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

    const jumpSearch = async () => {
        const target = parseInt(searchValue.trim());
        if (isNaN(target) || array.length === 0) return;

        setSearching(true);
        setFoundIndex(-1);
        setSearchComplete(false);
        setSearchPhase("jumping");

        const n = array.length;
        const stepSize = Math.floor(Math.sqrt(n));
        let step = stepSize;
        let prev = 0;

        // Jump through blocks
        while (prev < n && array[Math.min(step, n) - 1] < target) {
            setJumpIndex(Math.min(step, n) - 1);
            setBlockStart(prev);
            setBlockEnd(Math.min(step, n) - 1);
            await new Promise((r) => setTimeout(r, delay));

            prev = step;
            step += stepSize;

            if (prev >= n) {
                // Not found
                setCurrentIndex(-1);
                setJumpIndex(-1);
                setBlockStart(-1);
                setBlockEnd(-1);
                setSearchComplete(true);
                setSearching(false);
                setSearchPhase("");
                return;
            }
        }

        // Linear search in the identified block
        setSearchPhase("linear");
        setJumpIndex(-1);
        setBlockStart(prev);
        setBlockEnd(Math.min(step, n) - 1);
        await new Promise((r) => setTimeout(r, delay));

        for (let i = prev; i < Math.min(step, n); i++) {
            setCurrentIndex(i);
            await new Promise((r) => setTimeout(r, delay));

            if (array[i] === target) {
                setFoundIndex(i);
                setCurrentIndex(-1);
                setBlockStart(-1);
                setBlockEnd(-1);
                setSearchComplete(true);
                setSearching(false);
                setSearchPhase("");
                return;
            }

            if (array[i] > target) {
                break;
            }
        }

        // Not found
        setCurrentIndex(-1);
        setBlockStart(-1);
        setBlockEnd(-1);
        setSearchComplete(true);
        setSearching(false);
        setSearchPhase("");
    };

    const reset = () => {
        setCurrentIndex(-1);
        setJumpIndex(-1);
        setBlockStart(-1);
        setBlockEnd(-1);
        setFoundIndex(-1);
        setSearchComplete(false);
        setSearching(false);
        setSearchPhase("");
    };

    const clearAll = () => {
        setArray([]);
        setCurrentInput("");
        setSearchValue("");
        reset();
    };

    return (
        <Card className="bg-white text-gray-900 p-6 border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Jump Search Visualizer</h2>

                {/* Input Panel */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Input
                        type="number"
                        placeholder="Enter a number"
                        value={currentInput}
                        disabled={searching}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                        className="w-full md:w-40 border-neutral-300"
                    />
                    <Button onClick={handleAddValue} disabled={searching} className="bg-neutral-800 hover:bg-neutral-700 text-white">
                        Add
                    </Button>
                    <Button onClick={generateRandomArray} disabled={searching} className="bg-neutral-800 hover:bg-neutral-700 text-white">
                        Random Array
                    </Button>
                    <Button onClick={clearAll} disabled={searching} variant="outline" className="border-neutral-300 text-neutral-800 hover:bg-neutral-50">
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
                        onKeyDown={(e) => e.key === "Enter" && jumpSearch()}
                        className="w-full md:w-40 border-neutral-300"
                    />
                    <Button
                        onClick={jumpSearch}
                        disabled={searching || array.length === 0 || !searchValue.trim()}
                        variant="default"
                        className="bg-neutral-800 hover:bg-neutral-700 text-white"
                    >
                        Start Search
                    </Button>

                    <Button onClick={reset} disabled={searching} variant="outline" className="border-neutral-300 text-neutral-800 hover:bg-neutral-50">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-neutral-600">Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={searching}
                            className={speedKey === key ? "bg-neutral-800 text-white hover:bg-neutral-700" : "border-neutral-300 text-neutral-800 hover:bg-neutral-50"}
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Array Visualizer */}
                <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {array.map((val, idx) => {
                            let bgColor = "bg-white";
                            let textColor = "text-neutral-800";
                            let borderColor = "border-neutral-300";
                            
                            // Found element
                            if (idx === foundIndex) {
                                bgColor = "bg-green-100";
                                textColor = "text-green-800";
                                borderColor = "border-green-400";
                            }
                            // Jump position being checked
                            else if (idx === jumpIndex) {
                                bgColor = "bg-blue-100";
                                textColor = "text-blue-800";
                                borderColor = "border-blue-400";
                            }
                            // Current element in linear search
                            else if (idx === currentIndex) {
                                bgColor = "bg-yellow-100";
                                textColor = "text-yellow-800";
                                borderColor = "border-yellow-400";
                            }
                            // Block being searched
                            else if (idx >= blockStart && idx <= blockEnd && blockStart !== -1) {
                                bgColor = "bg-purple-50";
                                textColor = "text-purple-800";
                                borderColor = "border-purple-300";
                            }

                            return (
                                <div
                                    key={idx}
                                    className={`${bgColor} ${textColor} border ${borderColor} rounded px-4 py-3 min-w-12 text-center font-mono transition-all duration-300 shadow-sm`}
                                >
                                    <div className="text-sm font-bold">{val}</div>
                                    <div className="text-xs text-neutral-500">{idx}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Display */}
                <div className="text-center p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    {searching && searchPhase === "jumping" && (
                        <p className="text-lg text-neutral-800">
                            <span className="font-bold text-blue-700">Jumping Phase:</span> Checking block at index {jumpIndex} for <span className="font-bold">{searchValue}</span>
                        </p>
                    )}
                    {searching && searchPhase === "linear" && (
                        <p className="text-lg text-neutral-800">
                            <span className="font-bold text-purple-700">Linear Search Phase:</span> Searching block [{blockStart}-{blockEnd}], currently at index {currentIndex}
                        </p>
                    )}
                    {searchComplete && foundIndex !== -1 && (
                        <p className="text-lg text-green-700">
                            Found <span className="font-bold">{searchValue}</span> at index {foundIndex}!
                        </p>
                    )}
                    {searchComplete && foundIndex === -1 && (
                        <p className="text-lg text-red-700">
                            <span className="font-bold">{searchValue}</span> not found in the array.
                        </p>
                    )}
                    {!searching && !searchComplete && array.length > 0 && (
                        <p className="text-neutral-600">
                            Enter a value to search and click "Start Search"
                        </p>
                    )}
                    {array.length === 0 && (
                        <p className="text-neutral-600">
                            Add numbers to the array to begin searching (array will be sorted automatically)
                        </p>
                    )}
                </div>

                {/* Algorithm Info */}
                <div className="bg-neutral-50 rounded-lg p-4 text-sm border border-neutral-200">
                    <h3 className="font-bold mb-2 text-neutral-800">Jump Search Algorithm:</h3>
                    <p className="text-neutral-700">
                        Jump search works on sorted arrays by jumping ahead by fixed steps (√n), then performing linear search in the identified block. 
                        It combines the benefits of linear and binary search.
                        <br/><strong>Time Complexity:</strong> O(√n) | <strong>Space Complexity:</strong> O(1)
                        <br/><strong>Note:</strong> The array is automatically sorted when you add numbers.
                    </p>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 justify-center text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
                        <span className="text-neutral-700">Jump Position</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-50 border border-purple-300 rounded"></div>
                        <span className="text-neutral-700">Current Block</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
                        <span className="text-neutral-700">Checking</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
                        <span className="text-neutral-700">Found</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}