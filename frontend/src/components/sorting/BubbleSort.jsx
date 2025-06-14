import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const speedOptions = {
    "0.25x": 1000,
    "0.5x": 500,
    "1x": 200,
    "2x": 100,
    "4x": 50,
};

export default function BubbleSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");

    const maxVal = Math.max(...array, 1);
    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val)) {
            setArray((prev) => [...prev, val]);
            setCurrentInput("");
        }
    };

    const generateRandomArray = () => {
        if (sorting) return;
        const randomArr = Array.from({ length: 20 }, () =>
            Math.floor(Math.random() * 90) + 10
        );
        setArray(randomArr);
    };

    const bubbleSort = async () => {
        setSorting(true);
        let arr = [...array];
        const bars = document.querySelectorAll(".bar");

        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = 0; j < arr.length - i - 1; j++) {
                // Highlight bars being compared
                bars[j].style.backgroundColor = "rgb(252 211 77)"; // yellow-300
                bars[j + 1].style.backgroundColor = "rgb(252 211 77)";
                await new Promise((r) => setTimeout(r, delay));

                if (arr[j] > arr[j + 1]) {
                    // Swap values
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setArray([...arr]);
                    await new Promise((r) => setTimeout(r, delay));

                    // Flash swap
                    bars[j].style.backgroundColor = "rgb(248 113 113)"; // red-400
                    bars[j + 1].style.backgroundColor = "rgb(248 113 113)";
                    await new Promise((r) => setTimeout(r, delay));
                }

                // Reset bar colors after comparison
                bars[j].style.backgroundColor = "rgb(59 130 246)"; // blue-500
                bars[j + 1].style.backgroundColor = "rgb(59 130 246)";
            }

            // Mark sorted elements
            bars[arr.length - 1 - i].style.backgroundColor = "rgb(34 197 94)"; // green-500
        }

        bars[0].style.backgroundColor = "rgb(34 197 94)"; // Last element

        setSorting(false);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
    };

    return (
        <Card className="bg-white text-gray-900 p-6 border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bubble Sort Visualizer</h2>

                {/* Input Panel */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Input
                        type="number"
                        placeholder="Enter a number"
                        value={currentInput}
                        disabled={sorting}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                        className="w-full md:w-60 bg-white border-gray-300"
                    />
                    <Button onClick={handleAddValue} disabled={sorting} className="bg-neutral-700 hover:bg-neutral-900 text-white">
                        Add Number
                    </Button>
                    <Button onClick={generateRandomArray} disabled={sorting} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Generate Random
                    </Button>
                    <Button
                        onClick={bubbleSort}
                        disabled={sorting || array.length < 2}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Start Sorting
                    </Button>
                    <Button variant="outline" onClick={reset} disabled={sorting} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600">Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={sorting}
                            className={speedKey === key 
                                ? "bg-neutral-900 hover:bg-neutral-800 text-white" 
                                : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                            }
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Visualizer */}
                <div className="relative h-80 bg-gray-50 rounded-lg p-4 mt-6 overflow-x-auto border border-gray-200">
                    <div className="h-full flex items-end justify-center gap-2">
                        {array.map((val, idx) => {
                            const maxValSafe = Math.max(...array, 1);
                            // Reserve space for labels (32px) and some padding
                            const availableHeight = 280; // Total height minus padding and label space
                            const minHeight = 20;
                            const maxHeight = availableHeight - 40; // Leave room for number labels
                            const barHeight = Math.min(
                                (val / maxValSafe) * maxHeight + minHeight,
                                maxHeight
                            );

                            return (
                                <div key={idx} className="flex flex-col items-center justify-end h-full">
                                    <div
                                        className="bar bg-blue-500 rounded-sm transition-all duration-300 flex-shrink-0 shadow-sm"
                                        style={{
                                            height: `${barHeight}px`,
                                            width: "24px",
                                        }}
                                    ></div>
                                    <span className="text-xs mt-1 font-semibold text-gray-700 flex-shrink-0">{val}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Algorithm Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-sm border border-blue-200">
                    <h3 className="font-bold mb-2 text-blue-700">Interactive Bubble Sort Visualization:</h3>
                    <p className="text-gray-700">
                        Watch as adjacent elements are compared and swapped in real time, slowly "bubbling" the largest values to the end.
                        This visual helps beginners understand how repetitive comparisons push elements into their correct positions.
                        <br /><strong>Time Complexity:</strong> O(n²) | <strong>Space Complexity:</strong> O(1)
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}