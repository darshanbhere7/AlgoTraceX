import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

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
    const [showInfo, setShowInfo] = useState(false);

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
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Stack (LIFO) Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Same shell as the Binary Search Tree view, centered on top-of-stack operations.
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Value (0-999)"
                            value={currentInput}
                            disabled={operating}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            max="999"
                            inputMode="numeric"
                            pattern="\\d{1,3}"
                            title="Enter an integer between 0 and 999."
                        />
                        <Button
                            variant="ghost"
                            onClick={handleAddValue}
                            disabled={operating || !currentInput.trim() || stack.length >= maxSize}
                            className="h-10 px-4 bg-black hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Push
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={maxSize}
                            disabled={operating}
                            onChange={(e) => setMaxSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="1"
                            max="20"
                            inputMode="numeric"
                            pattern="\\d+"
                            title="Enter a size between 1 and 20."
                        />
                        <Button
                            variant="ghost"
                            onClick={reset}
                            disabled={operating}
                            className="h-10 px-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={generateRandomStack}
                            disabled={operating}
                            className="flex-1 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/15 dark:hover:bg-white/20 dark:text-white rounded-md"
                        >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Random Stack
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={pop}
                        disabled={operating || stack.length === 0}
                        className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
                    >
                        Pop
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={peek}
                        disabled={operating || stack.length === 0}
                        className="flex-1 sm:flex-none bg-sky-500/20 hover:bg-sky-500/30 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 text-sky-700 dark:text-sky-300 border border-sky-500/20 h-10 rounded-md"
                    >
                        Peek
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={isEmpty}
                        disabled={operating}
                        className="flex-1 sm:flex-none bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 text-amber-700 dark:text-amber-300 border border-amber-500/20 h-10 rounded-md"
                    >
                        Is Empty?
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={size}
                        disabled={operating}
                        className="flex-1 sm:flex-none bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 h-10 rounded-md"
                    >
                        Size
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={clear}
                        disabled={operating || stack.length === 0}
                        className="flex-1 sm:flex-none bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white border border-slate-400/30 h-10 rounded-md"
                    >
                        Clear All
                    </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 dark:text-white/50 text-sm font-medium">Speed</span>
                    {Object.keys(speedOptions).map((key) => (
                        <Button
                            variant="ghost"
                            key={key}
                            size="sm"
                            onClick={() => setSpeedKey(key)}
                            disabled={operating}
                            className={`h-8 px-3 text-sm font-medium transition-all rounded-md ${
                                speedKey === key
                                    ? "bg-black hover:bg-slate-800 dark:bg-white/15 text-white shadow-sm"
                                    : "bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 dark:bg-transparent dark:text-white/50 dark:hover:text-white/80 dark:hover:bg-white/5 hover:shadow-sm"
                            }`}
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            </div>

            {currentStep && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm mb-4">
                    {currentStep}
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 text-sm mb-4">
                <div className="text-center p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-40">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">Current Size</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{stack.length}</div>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-40">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">Max Capacity</div>
                    <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">{maxSize}</div>
                </div>
                <div className="text-center p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 w-40">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">Available Space</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{maxSize - stack.length}</div>
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 mb-4 shadow-lg min-h-[320px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, #000 20px, #000 21px)',
                        }}
                    ></div>
                </div>
                <div className="relative z-10">{renderStack()}</div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span>Normal</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Top</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Highlighted</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Pushing</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Popped</span>
                </div>
            </div>

            <button
                onClick={() => setShowInfo(!showInfo)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/70 transition-colors text-sm font-medium"
            >
                <Info className="h-4 w-4" />
                Algorithm Info
                {showInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showInfo && (
                <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-6 space-y-4 animate-in slide-in-from-top-2 duration-300 text-sm">
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Stack Operations</h3>
                        <p className="text-slate-600 dark:text-white/60">
                            Push/Pop/Peek are O(1) operations at the stack top. Overflow occurs when reaching the configured max size; underflow occurs when the stack is empty.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/40">Green nodes indicate incoming pushes, red nodes show popped elements.</p>
                    </div>
                </div>
            )}
        </div>
    );
}