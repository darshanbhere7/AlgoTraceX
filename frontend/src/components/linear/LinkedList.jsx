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

class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

export default function LinkedList() {
    const [head, setHead] = useState(null);
    const [currentInput, setCurrentInput] = useState("");
    const [indexInput, setIndexInput] = useState("");
    const [operating, setOperating] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [currentStep, setCurrentStep] = useState("");
    const [highlightedNode, setHighlightedNode] = useState(null);
    const [traversingNode, setTraversingNode] = useState(null);
    const [newNode, setNewNode] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    const delay = speedOptions[speedKey];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const linkedListToArray = (head) => {
        const result = [];
        let current = head;
        while (current) {
            result.push(current);
            current = current.next;
        }
        return result;
    };

    const getListSize = (head) => {
        let count = 0;
        let current = head;
        while (current) {
            count++;
            current = current.next;
        }
        return count;
    };

    const handleAddValue = async () => {
        const val = parseInt(currentInput.trim());
        if (isNaN(val) || val < 0 || val > 999) return;
        
        setOperating(true);
        await insertAtTail(val);
        setCurrentInput("");
        setOperating(false);
    };

    const insertAtHead = async (value) => {
        setOperating(true);
        setCurrentStep(`Inserting ${value} at head...`);
        
        const newNodeObj = new ListNode(value);
        setNewNode(newNodeObj);
        await sleep(delay);
        
        newNodeObj.next = head;
        setHead(newNodeObj);
        setCurrentStep(`✅ Successfully inserted ${value} at head!`);
        await sleep(delay);
        
        setNewNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const insertAtTail = async (value) => {
        setOperating(true);
        const newNodeObj = new ListNode(value);
        
        if (!head) {
            setCurrentStep(`List is empty. Inserting ${value} as head...`);
            setNewNode(newNodeObj);
            await sleep(delay);
            setHead(newNodeObj);
            setCurrentStep(`✅ Successfully inserted ${value}!`);
            await sleep(delay);
            setNewNode(null);
        } else {
            setCurrentStep(`Traversing to find tail for inserting ${value}...`);
            let current = head;
            
            while (current.next) {
                setTraversingNode(current.id);
                await sleep(delay);
                current = current.next;
            }
            
            setTraversingNode(current.id);
            setCurrentStep(`Found tail! Inserting ${value}...`);
            setNewNode(newNodeObj);
            await sleep(delay);
            
            current.next = newNodeObj;
            setHead({...head}); // Trigger re-render
            setCurrentStep(`✅ Successfully inserted ${value} at tail!`);
            await sleep(delay);
            
            setNewNode(null);
            setTraversingNode(null);
        }
        
        setCurrentStep("");
        setOperating(false);
    };

    const insertAtIndex = async (value, index) => {
        if (index < 0) return;
        
        setOperating(true);
        const size = getListSize(head);
        
        if (index > size) {
            setCurrentStep(`❌ Index ${index} out of bounds! List size: ${size}`);
            await sleep(delay * 2);
            setCurrentStep("");
            setOperating(false);
            return;
        }
        
        if (index === 0) {
            await insertAtHead(value);
            return;
        }
        
        setCurrentStep(`Traversing to index ${index} for inserting ${value}...`);
        let current = head;
        let currentIndex = 0;
        
        while (currentIndex < index - 1) {
            setTraversingNode(current.id);
            await sleep(delay);
            current = current.next;
            currentIndex++;
        }
        
        setTraversingNode(current.id);
        setCurrentStep(`Found position! Inserting ${value} at index ${index}...`);
        
        const newNodeObj = new ListNode(value);
        setNewNode(newNodeObj);
        await sleep(delay);
        
        newNodeObj.next = current.next;
        current.next = newNodeObj;
        setHead({...head}); // Trigger re-render
        
        setCurrentStep(`✅ Successfully inserted ${value} at index ${index}!`);
        await sleep(delay);
        
        setNewNode(null);
        setTraversingNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const deleteAtHead = async () => {
        if (!head) {
            setCurrentStep("❌ List is empty!");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }
        
        setOperating(true);
        setCurrentStep(`Deleting head node (${head.value})...`);
        setHighlightedNode(head.id);
        await sleep(delay);
        
        setHead(head.next);
        setCurrentStep(`✅ Successfully deleted head!`);
        await sleep(delay);
        
        setHighlightedNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const deleteAtTail = async () => {
        if (!head) {
            setCurrentStep("❌ List is empty!");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }
        
        setOperating(true);
        
        if (!head.next) {
            setCurrentStep(`Deleting only node (${head.value})...`);
            setHighlightedNode(head.id);
            await sleep(delay);
            setHead(null);
            setCurrentStep(`✅ Successfully deleted tail!`);
            await sleep(delay);
            setHighlightedNode(null);
        } else {
            setCurrentStep("Traversing to find tail...");
            let current = head;
            let prev = null;
            
            while (current.next) {
                setTraversingNode(current.id);
                await sleep(delay);
                prev = current;
                current = current.next;
            }
            
            setTraversingNode(null);
            setHighlightedNode(current.id);
            setCurrentStep(`Deleting tail node (${current.value})...`);
            await sleep(delay);
            
            prev.next = null;
            setHead({...head}); // Trigger re-render
            setCurrentStep(`✅ Successfully deleted tail!`);
            await sleep(delay);
            
            setHighlightedNode(null);
        }
        
        setCurrentStep("");
        setOperating(false);
    };

    const deleteAtIndex = async (index) => {
        if (index < 0 || !head) {
            setCurrentStep("❌ Invalid index or empty list!");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }
        
        setOperating(true);
        const size = getListSize(head);
        
        if (index >= size) {
            setCurrentStep(`❌ Index ${index} out of bounds! List size: ${size}`);
            await sleep(delay * 2);
            setCurrentStep("");
            setOperating(false);
            return;
        }
        
        if (index === 0) {
            await deleteAtHead();
            return;
        }
        
        setCurrentStep(`Traversing to index ${index}...`);
        let current = head;
        let prev = null;
        let currentIndex = 0;
        
        while (currentIndex < index) {
            setTraversingNode(current.id);
            await sleep(delay);
            prev = current;
            current = current.next;
            currentIndex++;
        }
        
        setTraversingNode(null);
        setHighlightedNode(current.id);
        setCurrentStep(`Deleting node at index ${index} (${current.value})...`);
        await sleep(delay);
        
        prev.next = current.next;
        setHead({...head}); // Trigger re-render
        
        setCurrentStep(`✅ Successfully deleted node at index ${index}!`);
        await sleep(delay);
        
        setHighlightedNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const searchValue = async (value) => {
        if (!head) {
            setCurrentStep("❌ List is empty!");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }
        
        setOperating(true);
        setCurrentStep(`Searching for ${value}...`);
        
        let current = head;
        let index = 0;
        
        while (current) {
            setTraversingNode(current.id);
            await sleep(delay);
            
            if (current.value === value) {
                setTraversingNode(null);
                setHighlightedNode(current.id);
                setCurrentStep(`✅ Found ${value} at index ${index}!`);
                await sleep(delay * 2);
                setHighlightedNode(null);
                setCurrentStep("");
                setOperating(false);
                return;
            }
            
            current = current.next;
            index++;
        }
        
        setTraversingNode(null);
        setCurrentStep(`❌ Value ${value} not found in the list!`);
        await sleep(delay * 2);
        setCurrentStep("");
        setOperating(false);
    };

    const generateRandomList = () => {
        if (operating) return;
        
        const randomValues = Array.from({ length: 5 }, () =>
            Math.floor(Math.random() * 90) + 10
        );
        
        let newHead = null;
        let current = null;
        
        randomValues.forEach(value => {
            const newNode = new ListNode(value);
            if (!newHead) {
                newHead = newNode;
                current = newNode;
            } else {
                current.next = newNode;
                current = newNode;
            }
        });
        
        setHead(newHead);
    };

    const reset = () => {
        setHead(null);
        setCurrentInput("");
        setIndexInput("");
        setOperating(false);
        setCurrentStep("");
        setHighlightedNode(null);
        setTraversingNode(null);
        setNewNode(null);
    };

    const getNodeColor = (nodeId) => {
        if (highlightedNode === nodeId) return "border-red-500 bg-red-50";
        if (traversingNode === nodeId) return "border-blue-600 bg-blue-50";
        return "border-gray-400 bg-white";
    };

    const renderLinkedList = () => {
        const nodes = linkedListToArray(head);
        const size = nodes.length;
        
        if (size === 0 && !newNode) {
            return (
                <div className="flex items-center justify-center h-32 text-gray-500">
                    <span>List is empty - Add some values to see the visualization</span>
                </div>
            );
        }
        
        return (
            <div className="w-full overflow-x-auto">
                <div className="flex items-center justify-center min-w-max py-8 px-4">
                    {/* Head label */}
                    <div className="text-sm font-semibold text-blue-600 mr-4">
                        HEAD
                    </div>
                    
                    {/* New node being inserted */}
                    {newNode && (
                        <>
                            <div className={`
                                border-2 rounded-lg p-4 transition-all duration-500 transform
                                border-green-500 bg-green-50 shadow-lg scale-110
                            `}>
                                <div className="w-12 h-12 bg-green-600 text-white rounded flex items-center justify-center font-bold">
                                    {newNode.value}
                                </div>
                                <div className="text-xs text-center mt-1 text-green-600 font-semibold">
                                    NEW
                                </div>
                            </div>
                            
                            {nodes.length > 0 && (
                                <div className="flex items-center mx-2">
                                    <div className="w-8 h-0.5 bg-green-500"></div>
                                    <div className="w-0 h-0 border-l-8 border-l-green-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {/* Existing nodes */}
                    {nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                            <div className={`
                                border-2 rounded-lg p-4 transition-all duration-500 transform
                                ${getNodeColor(node.id)}
                                ${traversingNode === node.id ? 'scale-110 shadow-lg' : ''}
                                ${highlightedNode === node.id ? 'scale-110 shadow-lg animate-pulse' : ''}
                            `}>
                                <div className={`
                                    w-12 h-12 rounded flex items-center justify-center font-bold text-white
                                    ${highlightedNode === node.id ? 'bg-red-500' : 
                                      traversingNode === node.id ? 'bg-blue-600' : 'bg-gray-700'}
                                `}>
                                    {node.value}
                                </div>
                                <div className="text-xs text-center mt-1 text-gray-500">
                                    [{index}]
                                </div>
                            </div>
                            
                            {/* Arrow to next node */}
                            {index < nodes.length - 1 && (
                                <div className="flex items-center mx-2">
                                    <div className="w-8 h-0.5 bg-gray-400"></div>
                                    <div className="w-0 h-0 border-l-8 border-l-gray-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* NULL pointer */}
                    {(nodes.length > 0 || newNode) && (
                        <div className="flex items-center mx-2">
                            <div className="w-8 h-0.5 bg-gray-400"></div>
                            <div className="w-12 h-8 border-2 border-gray-400 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                                NULL
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
            <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    Singly Linked List Visualizer
                </h1>
                <p className="text-sm text-slate-600 dark:text-white/50">
                    Binary Search Tree styling carried over to forward-only pointer operations.
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
                            disabled={operating || !currentInput.trim()}
                            className="h-10 px-4 bg-black hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white border-0 rounded-md shadow-sm disabled:opacity-60"
                        >
                            Add to Tail
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Index"
                            value={indexInput}
                            disabled={operating}
                            onChange={(e) => setIndexInput(e.target.value)}
                            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
                            min="0"
                            inputMode="numeric"
                            pattern="\\d+"
                            title="Enter a non-negative index."
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
                            onClick={generateRandomList}
                            disabled={operating}
                            className="flex-1 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/15 dark:hover:bg-white/20 dark:text-white rounded-md"
                        >
                            <Shuffle className="h-4 w-4 mr-2" />
                            Random SLL
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => insertAtIndex(parseInt(currentInput), parseInt(indexInput))}
                        disabled={operating || !currentInput.trim() || indexInput === ""}
                        className="flex-1 sm:flex-none bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-400/20 dark:hover:bg-emerald-400/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 h-10 rounded-md"
                    >
                        Insert at Index
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => insertAtHead(parseInt(currentInput))}
                        disabled={operating || !currentInput.trim()}
                        className="flex-1 sm:flex-none bg-sky-500/20 hover:bg-sky-500/30 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 text-sky-700 dark:text-sky-300 border border-sky-500/20 h-10 rounded-md"
                    >
                        Insert at Head
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={deleteAtHead}
                        disabled={operating || !head}
                        className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
                    >
                        Delete Head
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={deleteAtTail}
                        disabled={operating || !head}
                        className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
                    >
                        Delete Tail
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => deleteAtIndex(parseInt(indexInput))}
                        disabled={operating || !head || indexInput === ""}
                        className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
                    >
                        Delete at Index
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => searchValue(parseInt(currentInput))}
                        disabled={operating || !head || !currentInput.trim()}
                        className="flex-1 sm:flex-none bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 text-amber-700 dark:text-amber-300 border border-amber-500/20 h-10 rounded-md"
                    >
                        Search Value
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

            <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg min-h-[320px]">
                {renderLinkedList()}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span>Normal</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Traversing</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Target/Delete</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>New Node</span>
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
                        <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Singly Linked List Operations</h3>
                        <p className="text-slate-600 dark:text-white/60">
                            Head operations run in O(1). Tail/index operations require traversal since the list only points forward.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-2">Current size: {getListSize(head)} nodes.</p>
                    </div>
                </div>
            )}
        </div>
    );
}