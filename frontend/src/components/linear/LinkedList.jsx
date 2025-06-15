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
        <Card className="bg-white text-gray-900 p-6 max-w-7xl mx-auto border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Singly Linked List Visualizer
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
                        <Button onClick={handleAddValue} disabled={operating || !currentInput.trim()} size="sm" className="bg-neutral-700 hover:bg-neutral-900 text-white">
                            Add to Tail
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomList} disabled={operating} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Generate Random (5 nodes)
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={operating} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Reset
                    </Button>
                </div>

                {/* Operation Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Index"
                            value={indexInput}
                            disabled={operating}
                            onChange={(e) => setIndexInput(e.target.value)}
                            className="w-20 bg-white border-gray-300"
                            min="0"
                        />
                        <Button
                            onClick={() => insertAtIndex(parseInt(currentInput), parseInt(indexInput))}
                            disabled={operating || !currentInput.trim() || indexInput === ""}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Insert at Index
                        </Button>
                    </div>
                    
                    <Button
                        onClick={() => insertAtHead(parseInt(currentInput))}
                        disabled={operating || !currentInput.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Insert at Head
                    </Button>
                    
                    <Button
                        onClick={deleteAtHead}
                        disabled={operating || !head}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete Head
                    </Button>
                    
                    <Button
                        onClick={deleteAtTail}
                        disabled={operating || !head}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete Tail
                    </Button>
                    
                    <Button
                        onClick={() => deleteAtIndex(parseInt(indexInput))}
                        disabled={operating || !head || indexInput === ""}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Delete at Index
                    </Button>
                    
                    <Button
                        onClick={() => searchValue(parseInt(currentInput))}
                        disabled={operating || !head || !currentInput.trim()}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        Search Value
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

                {/* List Stats */}
                {head && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg border">
                        <span className="text-sm font-semibold text-gray-700">
                            List Size: {getListSize(head)} nodes
                        </span>
                    </div>
                )}

                {/* LinkedList Visualization */}
                <div className="min-h-48 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    {renderLinkedList()}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                        <span className="text-gray-600">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded"></div>
                        <span className="text-gray-600">Traversing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-50 border-2 border-red-500 rounded"></div>
                        <span className="text-gray-600">Target/Delete</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                        <span className="text-gray-600">New Node</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-sm border border-blue-200">
                    <h3 className="font-bold mb-2 text-blue-700">Singly Linked List Operations:</h3>
                    <div className="text-gray-700 space-y-1">
                        <p><strong>Insert at Head:</strong> O(1) - Direct insertion at the beginning</p>
                        <p><strong>Insert at Tail:</strong> O(n) - Must traverse to find the end</p>
                        <p><strong>Insert at Index:</strong> O(n) - Must traverse to the specific position</p>
                        <p><strong>Delete:</strong> O(n) for tail/index, O(1) for head</p>
                        <p><strong>Search:</strong> O(n) - Must check each node sequentially</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}