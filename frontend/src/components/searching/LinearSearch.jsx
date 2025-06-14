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
        <Card className="bg-neutral-900 text-white p-6">
            <CardContent className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Linear Search Visualizer</h2>

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
                        onKeyDown={(e) => e.key === "Enter" && linearSearch()}
                        className="w-full md:w-40"
                    />
                    <Button
                        onClick={linearSearch}
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

                {/* Array Visualizer */}
                <div className="bg-neutral-800 rounded-lg p-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {array.map((val, idx) => {
                            let bgColor = "bg-gray-700";
                            let textColor = "text-white";
                            
                            // Current element being checked
                            if (idx === currentIndex) {
                                bgColor = "bg-yellow-300";
                                textColor = "text-black";
                            }
                            // Found element
                            else if (idx === foundIndex) {
                                bgColor = "bg-green-500";
                                textColor = "text-white";
                            }

                            return (
                                <div
                                    key={idx}
                                    className={`${bgColor} ${textColor} border border-gray-600 rounded px-4 py-3 min-w-12 text-center font-mono transition-all duration-300`}
                                >
                                    <div className="text-sm font-bold">{val}</div>
                                    <div className="text-xs text-gray-400">{idx}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Display */}
                <div className="text-center p-4 bg-neutral-800 rounded-lg">
                    {searching && (
                        <p className="text-lg">
                            Searching for <span className="font-bold">{searchValue}</span>... 
                            Currently checking index {currentIndex}
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