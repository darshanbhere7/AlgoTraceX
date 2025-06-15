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

export default function ArrayVisualizer() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [indexInput, setIndexInput] = useState("");
    const [animating, setAnimating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [operation, setOperation] = useState("");
    const [operationComplete, setOperationComplete] = useState(false);
    const [lastOperationResult, setLastOperationResult] = useState("");

    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val)) {
            setArray((prev) => [...prev, val]);
            setCurrentInput("");
        }
    };

    const generateRandomArray = () => {
        if (animating) return;
        const randomArr = Array.from({ length: 10 }, () =>
            Math.floor(Math.random() * 99) + 1
        );
        setArray(randomArr);
        reset();
    };

    const reset = () => {
        setHighlightedIndex(-1);
        setOperation("");
        setOperationComplete(false);
        setLastOperationResult("");
        setAnimating(false);
    };

    const clearAll = () => {
        setArray([]);
        setCurrentInput("");
        setIndexInput("");
        reset();
    };

    // Push operation (add to end)
    const handlePush = async () => {
        const val = parseInt(currentInput.trim());
        if (isNaN(val) || animating) return;

        setAnimating(true);
        setOperation("push");
        setOperationComplete(false);

        // Highlight the position where element will be added
        setHighlightedIndex(array.length);
        await new Promise(r => setTimeout(r, delay));

        setArray(prev => [...prev, val]);
        setCurrentInput("");
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Pushed ${val} to the end`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };

    // Pop operation (remove from end)
    const handlePop = async () => {
        if (array.length === 0 || animating) return;

        setAnimating(true);
        setOperation("pop");
        setOperationComplete(false);

        const lastIndex = array.length - 1;
        const poppedValue = array[lastIndex];
        
        // Highlight the element to be removed
        setHighlightedIndex(lastIndex);
        await new Promise(r => setTimeout(r, delay));

        setArray(prev => prev.slice(0, -1));
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Popped ${poppedValue} from the end`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };



    // Insert at index
    const handleInsertAt = async () => {
        const val = parseInt(currentInput.trim());
        const idx = parseInt(indexInput.trim());
        if (isNaN(val) || isNaN(idx) || idx < 0 || idx > array.length || animating) return;

        setAnimating(true);
        setOperation("insert");
        setOperationComplete(false);

        // Highlight the insertion point
        setHighlightedIndex(idx);
        await new Promise(r => setTimeout(r, delay));

        // Highlight elements that will shift
        for (let i = idx; i < array.length; i++) {
            setHighlightedIndex(i);
            await new Promise(r => setTimeout(r, delay / 3));
        }

        const newArray = [...array];
        newArray.splice(idx, 0, val);
        setArray(newArray);
        setCurrentInput("");
        setIndexInput("");
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Inserted ${val} at index ${idx}`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };

    // Remove at index
    const handleRemoveAt = async () => {
        const idx = parseInt(indexInput.trim());
        if (isNaN(idx) || idx < 0 || idx >= array.length || animating) return;

        setAnimating(true);
        setOperation("remove");
        setOperationComplete(false);

        const removedValue = array[idx];
        
        // Highlight the element to be removed
        setHighlightedIndex(idx);
        await new Promise(r => setTimeout(r, delay));

        // Highlight elements that will shift
        for (let i = idx + 1; i < array.length; i++) {
            setHighlightedIndex(i);
            await new Promise(r => setTimeout(r, delay / 3));
        }

        const newArray = [...array];
        newArray.splice(idx, 1);
        setArray(newArray);
        setIndexInput("");
        
        await new Promise(r => setTimeout(r, delay));
        setLastOperationResult(`Removed ${removedValue} from index ${idx}`);
        setOperationComplete(true);
        setAnimating(false);
        setHighlightedIndex(-1);
    };



    return (
        <Card className="bg-white border border-gray-200 p-6">
            <CardContent className="space-y-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Array Operations Visualizer</h2>

                {/* Input Panel */}
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    <Input
                        type="number"
                        placeholder="Enter a number"
                        value={currentInput}
                        disabled={animating}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                        className="w-full lg:w-32 border-gray-300"
                    />
                    <Button onClick={handleAddValue} disabled={animating} className="bg-gray-900 text-white hover:bg-gray-800">
                        Add
                    </Button>
                    <Input
                        type="number"
                        placeholder="Index"
                        value={indexInput}
                        disabled={animating}
                        onChange={(e) => setIndexInput(e.target.value)}
                        className="w-full lg:w-24 border-gray-300"
                    />
                    <Button onClick={generateRandomArray} disabled={animating} className="bg-neutral-900 text-gray-900 border border-gray-300 hover:bg-neutral-800">
                        Random
                    </Button>
                    <Button onClick={clearAll} disabled={animating} className="bg-neutral-500 text-gray-900 border border-gray-300 hover:bg-neutral-400">
                        Clear
                    </Button>
                </div>

                {/* Operation Buttons */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handlePush}
                        disabled={animating || !currentInput.trim()}
                        className="bg-neutral-900 text-white hover:bg-green-500"
                    >
                        Push
                    </Button>
                    <Button
                        onClick={handlePop}
                        disabled={animating || array.length === 0}
                        className="bg-neutral-900 text-white hover:bg-red-500"
                    >
                        Pop
                    </Button>
                    <Button
                        onClick={handleInsertAt}
                        disabled={animating || !currentInput.trim() || !indexInput.trim()}
                        className="bg-neutral-900 text-white hover:bg-blue-500"
                    >
                        Insert At
                    </Button>
                    <Button
                        onClick={handleRemoveAt}
                        disabled={animating || !indexInput.trim() || array.length === 0}
                        className="bg-neutral-900 text-white hover:bg-yellow-500"
                    >
                        Remove At
                    </Button>
                    <Button onClick={reset} disabled={animating} className="bg-neutral-400 text-neutral-900 border border-gray-300 hover:bg-gray-500">
                        Reset
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-600">Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={animating}
                            className={
                                speedKey === key 
                                    ? "bg-neutral-900 text-white hover:bg-neutral-800" 
                                    : "bg-gray-200 text-gray-900 border border-gray-300 hover:bg-gray-400"
                            }
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Info Banner */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                        <strong>Array Length:</strong> {array.length} | 
                        <strong> Operations:</strong> Push (add to end), Pop (remove from end), Insert At (add at index), Remove At (remove from index)
                    </p>
                </div>

                {/* Array Visualizer */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {array.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                Array is empty. Add some elements to get started!
                            </div>
                        ) : (
                            array.map((val, idx) => {
                                let bgColor = "bg-white";
                                let textColor = "text-gray-900";
                                let borderColor = "border-gray-300";
                                
                                // Highlight current operation element
                                if (idx === highlightedIndex) {
                                    switch (operation) {
                                        case "push":
                                            bgColor = "bg-green-500";
                                            textColor = "text-white";
                                            borderColor = "border-green-500";
                                            break;
                                        case "pop":
                                            bgColor = "bg-red-500";
                                            textColor = "text-white";
                                            borderColor = "border-red-500";
                                            break;
                                        case "insert":
                                            bgColor = "bg-blue-500";
                                            textColor = "text-white";
                                            borderColor = "border-blue-500";
                                            break;
                                        case "remove":
                                            bgColor = "bg-orange-500";
                                            textColor = "text-white";
                                            borderColor = "border-orange-500";
                                            break;
                                        default:
                                            bgColor = "bg-yellow-400";
                                            textColor = "text-gray-900";
                                            borderColor = "border-yellow-400";
                                    }
                                }

                                return (
                                    <div
                                        key={`${idx}-${val}`}
                                        className={`${bgColor} ${textColor} border ${borderColor} rounded px-4 py-3 min-w-12 text-center font-mono transition-all duration-300`}
                                    >
                                        <div className="text-sm font-bold">{val}</div>
                                        <div className="text-xs text-gray-500">{idx}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Legend */}
                    {animating && operation && (
                        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${
                                    operation === "push" ? "bg-green-500" :
                                    operation === "pop" ? "bg-red-500" :
                                    operation === "insert" ? "bg-blue-500" :
                                    operation === "remove" ? "bg-orange-500" :
                                    "bg-yellow-400"
                                }`}></div>
                                <span>Current operation: {operation}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Display */}
                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    {animating && (
                        <p className="text-lg text-gray-900">
                            Performing <span className="font-bold">{operation}</span> operation...
                        </p>
                    )}
                    {operationComplete && lastOperationResult && (
                        <p className="text-lg text-green-600">
                            {lastOperationResult}
                        </p>
                    )}
                    {!animating && !operationComplete && array.length > 0 && (
                        <p className="text-gray-600">
                            Choose an operation to perform on the array
                        </p>
                    )}
                    {array.length === 0 && !animating && (
                        <p className="text-gray-600">
                            Add elements to the array to begin operations
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}