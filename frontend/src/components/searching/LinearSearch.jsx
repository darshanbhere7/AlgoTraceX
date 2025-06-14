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

export default function LinearSearch() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [searching, setSearching] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [foundIndex, setFoundIndex] = useState(-1);
    const [searchComplete, setSearchComplete] = useState(false);

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
        <Card className="bg-white text-gray-900 p-6 border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Linear Search Visualizer</h2>

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
                        onKeyDown={(e) => e.key === "Enter" && linearSearch()}
                        className="w-full md:w-40 border-neutral-300"
                    />
                    <Button
                        onClick={linearSearch}
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
                            
                            // Current element being checked
                            if (idx === currentIndex) {
                                bgColor = "bg-yellow-100";
                                textColor = "text-yellow-800";
                                borderColor = "border-yellow-400";
                            }
                            // Found element
                            else if (idx === foundIndex) {
                                bgColor = "bg-green-100";
                                textColor = "text-green-800";
                                borderColor = "border-green-400";
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
                    {searching && (
                        <p className="text-lg text-neutral-800">
                            Searching for <span className="font-bold">{searchValue}</span>... 
                            Currently checking index {currentIndex}
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
                            Add numbers to the array to begin searching
                        </p>
                    )}
                </div>

                {/* Algorithm Info */}
                <div className="bg-neutral-50 rounded-lg p-4 text-sm border border-neutral-200">
                    <h3 className="font-bold mb-2 text-neutral-800">Linear Search Algorithm:</h3>
                    <p className="text-neutral-700">
                        Linear search sequentially checks each element in the array from left to right until the target value is found or the end is reached.
                        <br/><strong>Time Complexity:</strong> O(n) | <strong>Space Complexity:</strong> O(1)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}