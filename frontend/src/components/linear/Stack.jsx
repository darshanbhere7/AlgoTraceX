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

class StackNode {
    constructor(value) {
        this.value = value;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

export default function Stack() {
    const [stack, setStack] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [operating, setOperating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedNode, setHighlightedNode] = useState(null);
    const [newNode, setNewNode] = useState(null);
    const [poppedNode, setPoppedNode] = useState(null);
    const [maxSize, setMaxSize] = useState(10);

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleAddValue = async () => {
        const val = parseInt(currentInput.trim());
        if (isNaN(val) || val < 0 || val > 999) return;
        
        await push(val);
        setCurrentInput("");
    };

    const push = async (value) => {
        if (stack.length >= maxSize) {
            setCurrentStep(`❌ Stack Overflow! Maximum size (${maxSize}) reached`);
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }

        setOperating(true);
        setCurrentStep(`Pushing ${value} onto the stack...`);
        
        const newNodeObj = new StackNode(value);
        setNewNode(newNodeObj);
        await sleep(delay);
        
        setStack(prev => [...prev, newNodeObj]);
        setCurrentStep(`✅ Successfully pushed ${value} onto the stack!`);
        await sleep(delay);
        
        setNewNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const pop = async () => {
        if (stack.length === 0) {
            setCurrentStep("❌ Stack Underflow! Stack is empty");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }

        setOperating(true);
        const topElement = stack[stack.length - 1];
        
        setCurrentStep(`Popping ${topElement.value} from the stack...`);
        setHighlightedNode(topElement.id);
        await sleep(delay);
        
        // Show popped element floating away
        setPoppedNode(topElement);
        setStack(prev => prev.slice(0, -1));
        setCurrentStep(`✅ Successfully popped ${topElement.value} from the stack!`);
        await sleep(delay);
        
        setHighlightedNode(null);
        setPoppedNode(null);
        setCurrentStep("");
        setOperating(false);
        
        return topElement.value;
    };

    const peek = async () => {
        if (stack.length === 0) {
            setCurrentStep("❌ Stack is empty! Nothing to peek");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }

        setOperating(true);
        const topElement = stack[stack.length - 1];
        
        setCurrentStep(`Peeking at top element...`);
        setHighlightedNode(topElement.id);
        await sleep(delay);
        
        setCurrentStep(`👁️ Top element is: ${topElement.value}`);
        await sleep(delay * 2);
        
        setHighlightedNode(null);
        setCurrentStep("");
        setOperating(false);
        
        return topElement.value;
    };

    const isEmpty = () => {
        setCurrentStep(stack.length === 0 ? "✅ Stack is empty" : "❌ Stack is not empty");
        setTimeout(() => setCurrentStep(""), 2000);
    };

    const size = () => {
        setCurrentStep(`📏 Stack size: ${stack.length} elements`);
        setTimeout(() => setCurrentStep(""), 2000);
    };

    const clear = async () => {
        if (stack.length === 0) return;
        
        setOperating(true);
        setCurrentStep("Clearing all elements from the stack...");
        
        // Animate clearing from top to bottom
        for (let i = stack.length - 1; i >= 0; i--) {
            setHighlightedNode(stack[i].id);
            await sleep(delay / 2);
            setStack(prev => prev.slice(0, i));
        }
        
        setCurrentStep("✅ Stack cleared!");
        await sleep(delay);
        
        setHighlightedNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const generateRandomStack = () => {
        if (operating) return;
        
        const randomValues = Array.from({ length: Math.min(6, maxSize) }, () =>
            Math.floor(Math.random() * 90) + 10
        );
        
        const newStack = randomValues.map(value => new StackNode(value));
        setStack(newStack);
    };

    const reset = () => {
        setStack([]);
        setCurrentInput("");
        setOperating(false);
        setCurrentStep("");
        setHighlightedNode(null);
        setNewNode(null);
        setPoppedNode(null);
    };

    const getNodeColor = (nodeId, index) => {
        if (highlightedNode === nodeId) return "border-blue-600 bg-blue-50";
        if (index === stack.length - 1) return "border-purple-500 bg-purple-50"; // Top element
        return "border-gray-400 bg-white";
    };

    const renderStack = () => {
        if (stack.length === 0 && !newNode) {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📚</div>
                        <span>Stack is empty - Push some values to see the visualization</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-end min-h-64 relative">
                {/* Stack Base */}
                <div className="w-32 h-4 bg-gray-800 rounded-b-lg mb-2 relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-600">
                        BOTTOM
                    </div>
                </div>
                
                {/* Popped Node Animation */}
                {poppedNode && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 animate-bounce">
                        <div className="border-2 border-red-500 bg-red-50 rounded-lg p-4 shadow-lg">
                            <div className="w-16 h-16 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                                {poppedNode.value}
                            </div>
                            <div className="text-xs text-center mt-1 text-red-600 font-semibold">
                                POPPED
                            </div>
                        </div>
                    </div>
                )}
                
                {/* New Node Animation */}
                {newNode && (
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 animate-pulse">
                        <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 shadow-lg scale-110">
                            <div className="w-16 h-16 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                                {newNode.value}
                            </div>
                            <div className="text-xs text-center mt-1 text-green-600 font-semibold">
                                PUSHING
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Stack Elements */}
                <div className="flex flex-col-reverse items-center">
                    {stack.map((node, index) => (
                        <div
                            key={node.id}
                            className={`
                                border-2 rounded-lg p-4 mb-1 transition-all duration-500 transform
                                ${getNodeColor(node.id, index)}
                                ${highlightedNode === node.id ? 'scale-110 shadow-lg animate-pulse' : ''}
                                ${index === stack.length - 1 ? 'shadow-purple-200 shadow-lg' : ''}
                            `}
                            style={{
                                zIndex: stack.length - index,
                            }}
                        >
                            <div className={`
                                w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg text-white
                                ${highlightedNode === node.id ? 'bg-blue-600' : 
                                  index === stack.length - 1 ? 'bg-purple-600' : 'bg-gray-700'}
                            `}>
                                {node.value}
                            </div>
                            <div className="text-xs text-center mt-1">
                                <span className={`
                                    font-semibold
                                    ${index === stack.length - 1 ? 'text-purple-600' : 'text-gray-500'}
                                `}>
                                    {index === stack.length - 1 ? 'TOP' : `[${index}]`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Stack Size Indicator */}
                <div className="absolute -right-16 top-1/2 transform -translate-y-1/2">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-600 font-semibold">SIZE</div>
                        <div className="text-lg font-bold text-gray-800">{stack.length}</div>
                        <div className="text-xs text-gray-500">/ {maxSize}</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="bg-white text-gray-900 p-6 max-w-7xl mx-auto border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Stack (LIFO) Visualizer
                </h2>

                {/* Input Panel */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Enter value (0-999)"
                            value={currentInput}
                            disabled={operating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="w-48 bg-white border-gray-300"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={operating || !currentInput.trim() || stack.length >= maxSize} size="sm" className="bg-neutral-700 hover:bg-neutral-900 text-white">
                            Push
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Max Size:</span>
                        <Input
                            type="number"
                            value={maxSize}
                            disabled={operating}
                            onChange={(e) => setMaxSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                            className="w-20 bg-white border-gray-300"
                            min="1"
                            max="20"
                        />
                    </div>
                    
                    <Button onClick={generateRandomStack} disabled={operating} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Generate Random (6 elements)
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={operating} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Reset
                    </Button>
                </div>

                {/* Operation Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        onClick={pop}
                        disabled={operating || stack.length === 0}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Pop
                    </Button>
                    
                    <Button
                        onClick={peek}
                        disabled={operating || stack.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Peek
                    </Button>
                    
                    <Button
                        onClick={isEmpty}
                        disabled={operating}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        Is Empty?
                    </Button>
                    
                    <Button
                        onClick={size}
                        disabled={operating}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Get Size
                    </Button>
                    
                    <Button
                        onClick={clear}
                        disabled={operating || stack.length === 0}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                        Clear All
                    </Button>
                </div>

                {/* Speed Selection */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="text-sm text-gray-600">Animation Speed:</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={speedKey === key ? "default" : "outline"}
                            onClick={() => setSpeedKey(key)}
                            disabled={operating}
                            className={speedKey === key 
                                ? "bg-neutral-800 hover:bg-neutral-900 text-white" 
                                : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                            }
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <span className="text-lg font-semibold text-blue-700">{currentStep}</span>
                    </div>
                )}

                {/* Stack Stats */}
                <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-700">Current Size</div>
                        <div className="text-2xl font-bold text-purple-600">{stack.length}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-700">Max Capacity</div>
                        <div className="text-2xl font-bold text-gray-600">{maxSize}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <div className="font-semibold text-gray-700">Available Space</div>
                        <div className="text-2xl font-bold text-green-600">{maxSize - stack.length}</div>
                    </div>
                </div>

                {/* Stack Visualization */}
                <div className="min-h-80 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="w-full h-full" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #000 20px, #000 21px)',
                        }}></div>
                    </div>
                    
                    <div className="relative z-10">
                        {renderStack()}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                        <span className="text-gray-600">Normal Element</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-50 border-2 border-purple-500 rounded"></div>
                        <span className="text-gray-600">Top Element</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded"></div>
                        <span className="text-gray-600">Highlighted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                        <span className="text-gray-600">Pushing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-50 border-2 border-red-500 rounded"></div>
                        <span className="text-gray-600">Popped</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-sm border border-blue-200">
                    <h3 className="font-bold mb-2 text-blue-700">Stack (LIFO - Last In, First Out) Operations:</h3>
                    <div className="text-gray-700 space-y-1">
                        <p><strong>Push:</strong> O(1) - Add element to the top of the stack</p>
                        <p><strong>Pop:</strong> O(1) - Remove and return the top element</p>
                        <p><strong>Peek/Top:</strong> O(1) - View the top element without removing it</p>
                        <p><strong>isEmpty:</strong> O(1) - Check if the stack is empty</p>
                        <p><strong>Size:</strong> O(1) - Get the number of elements in the stack</p>
                        <p className="text-red-600"><strong>Stack Overflow:</strong> Occurs when trying to push to a full stack</p>
                        <p className="text-red-600"><strong>Stack Underflow:</strong> Occurs when trying to pop from an empty stack</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}