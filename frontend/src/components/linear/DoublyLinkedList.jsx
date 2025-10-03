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

class DoublyListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

export default function DoublyLinkedList() {
    const [head, setHead] = useState(null);
    const [tail, setTail] = useState(null);
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
        
        const newNodeObj = new DoublyListNode(value);
        setNewNode(newNodeObj);
        await sleep(delay);
        
        if (!head) {
            setHead(newNodeObj);
            setTail(newNodeObj);
            setCurrentStep(`✅ Successfully inserted ${value} as first node!`);
        } else {
            newNodeObj.next = head;
            head.prev = newNodeObj;
            setHead(newNodeObj);
            setCurrentStep(`✅ Successfully inserted ${value} at head!`);
        }
        await sleep(delay);
        
        setNewNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const insertAtTail = async (value) => {
        setOperating(true);
        const newNodeObj = new DoublyListNode(value);
        
        if (!tail) {
            setCurrentStep(`List is empty. Inserting ${value} as first node...`);
            setNewNode(newNodeObj);
            await sleep(delay);
            setHead(newNodeObj);
            setTail(newNodeObj);
            setCurrentStep(`✅ Successfully inserted ${value}!`);
            await sleep(delay);
            setNewNode(null);
        } else {
            setCurrentStep(`Inserting ${value} at tail...`);
            setTraversingNode(tail.id);
            setNewNode(newNodeObj);
            await sleep(delay);
            
            newNodeObj.prev = tail;
            tail.next = newNodeObj;
            setTail(newNodeObj);
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
        
        if (index === size) {
            await insertAtTail(value);
            return;
        }
        
        setCurrentStep(`Traversing to index ${index} for inserting ${value}...`);
        let current = head;
        let currentIndex = 0;
        
        while (currentIndex < index) {
            setTraversingNode(current.id);
            await sleep(delay);
            current = current.next;
            currentIndex++;
        }
        
        setTraversingNode(current.id);
        setCurrentStep(`Found position! Inserting ${value} at index ${index}...`);
        
        const newNodeObj = new DoublyListNode(value);
        setNewNode(newNodeObj);
        await sleep(delay);
        
        newNodeObj.next = current;
        newNodeObj.prev = current.prev;
        current.prev.next = newNodeObj;
        current.prev = newNodeObj;
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
        
        if (head.next) {
            head.next.prev = null;
            setHead(head.next);
        } else {
            setHead(null);
            setTail(null);
        }
        
        setCurrentStep(`✅ Successfully deleted head!`);
        await sleep(delay);
        
        setHighlightedNode(null);
        setCurrentStep("");
        setOperating(false);
    };

    const deleteAtTail = async () => {
        if (!tail) {
            setCurrentStep("❌ List is empty!");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }
        
        setOperating(true);
        setCurrentStep(`Deleting tail node (${tail.value})...`);
        setHighlightedNode(tail.id);
        await sleep(delay);
        
        if (tail.prev) {
            tail.prev.next = null;
            setTail(tail.prev);
            setHead({...head}); // Trigger re-render
        } else {
            setHead(null);
            setTail(null);
        }
        
        setCurrentStep(`✅ Successfully deleted tail!`);
        await sleep(delay);
        
        setHighlightedNode(null);
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
        
        if (index === size - 1) {
            await deleteAtTail();
            return;
        }
        
        setCurrentStep(`Traversing to index ${index}...`);
        let current = head;
        let currentIndex = 0;
        
        while (currentIndex < index) {
            setTraversingNode(current.id);
            await sleep(delay);
            current = current.next;
            currentIndex++;
        }
        
        setTraversingNode(null);
        setHighlightedNode(current.id);
        setCurrentStep(`Deleting node at index ${index} (${current.value})...`);
        await sleep(delay);
        
        current.prev.next = current.next;
        current.next.prev = current.prev;
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

    const reverseList = async () => {
        if (!head || !head.next) {
            setCurrentStep("❌ List needs at least 2 nodes to reverse!");
            await sleep(delay * 2);
            setCurrentStep("");
            return;
        }
        
        setOperating(true);
        setCurrentStep("Reversing the list...");
        
        let current = head;
        let newTail = head;
        
        while (current) {
            setTraversingNode(current.id);
            await sleep(delay);
            
            // Swap next and prev pointers
            const temp = current.next;
            current.next = current.prev;
            current.prev = temp;
            
            if (!temp) {
                setHead(current);
            }
            
            current = temp;
        }
        
        setTail(newTail);
        setTraversingNode(null);
        setCurrentStep("✅ Successfully reversed the list!");
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
        let newTail = null;
        let current = null;
        
        randomValues.forEach(value => {
            const newNode = new DoublyListNode(value);
            if (!newHead) {
                newHead = newNode;
                current = newNode;
            } else {
                current.next = newNode;
                newNode.prev = current;
                current = newNode;
            }
            newTail = newNode;
        });
        
        setHead(newHead);
        setTail(newTail);
    };

    const reset = () => {
        setHead(null);
        setTail(null);
        setCurrentInput("");
        setIndexInput("");
        setOperating(false);
        setCurrentStep("");
        setHighlightedNode(null);
        setTraversingNode(null);
        setNewNode(null);
    };

    const getNodeColor = (nodeId) => {
        if (highlightedNode === nodeId) return "border-rose-500 bg-rose-50";
        if (traversingNode === nodeId) return "border-teal-600 bg-teal-50";
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
                <div className="flex flex-col items-center justify-center min-w-max py-8 px-4 gap-4">
                    {/* Head and Tail labels */}
                    <div className="flex items-center justify-between w-full px-12">
                        <div className="text-sm font-semibold text-teal-600">
                            HEAD
                        </div>
                        <div className="text-sm font-semibold text-orange-600">
                            TAIL
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                        {/* NULL for prev of head */}
                        {(nodes.length > 0 || newNode) && (
                            <div className="flex items-center mr-2">
                                <div className="w-12 h-8 border-2 border-gray-400 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                                    NULL
                                </div>
                                <div className="w-8 h-0.5 bg-gray-400"></div>
                            </div>
                        )}
                        
                        {/* New node being inserted */}
                        {newNode && (
                            <>
                                <div className={`
                                    border-2 rounded-lg p-4 transition-all duration-500 transform
                                    border-emerald-500 bg-emerald-50 shadow-lg scale-110
                                `}>
                                    <div className="w-12 h-12 bg-emerald-600 text-white rounded flex items-center justify-center font-bold">
                                        {newNode.value}
                                    </div>
                                    <div className="text-xs text-center mt-1 text-emerald-600 font-semibold">
                                        NEW
                                    </div>
                                </div>
                                
                                {nodes.length > 0 && (
                                    <div className="flex items-center mx-2">
                                        <div className="w-0 h-0 border-r-8 border-r-emerald-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                        <div className="w-8 h-0.5 bg-emerald-500"></div>
                                        <div className="w-0 h-0 border-l-8 border-l-emerald-500 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
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
                                        ${highlightedNode === node.id ? 'bg-rose-500' : 
                                          traversingNode === node.id ? 'bg-teal-600' : 'bg-indigo-600'}
                                    `}>
                                        {node.value}
                                    </div>
                                    <div className="text-xs text-center mt-1 text-gray-500">
                                        [{index}]
                                    </div>
                                </div>
                                
                                {/* Bidirectional arrow to next node */}
                                {index < nodes.length - 1 && (
                                    <div className="flex items-center mx-2">
                                        <div className="w-0 h-0 border-r-8 border-r-gray-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                        <div className="w-8 h-0.5 bg-gray-400"></div>
                                        <div className="w-0 h-0 border-l-8 border-l-gray-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* NULL pointer at end */}
                        {(nodes.length > 0 || newNode) && (
                            <div className="flex items-center ml-2">
                                <div className="w-8 h-0.5 bg-gray-400"></div>
                                <div className="w-12 h-8 border-2 border-gray-400 bg-gray-100 rounded flex items-center justify-center text-xs font-semibold text-gray-600">
                                    NULL
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="bg-white text-gray-900 p-6 max-w-7xl mx-auto border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                    Doubly Linked List Visualizer
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
                        <Button onClick={handleAddValue} disabled={operating || !currentInput.trim()} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Add to Tail
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomList} disabled={operating} className="bg-orange-600 hover:bg-orange-700 text-white">
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Insert at Index
                        </Button>
                    </div>
                    
                    <Button
                        onClick={() => insertAtHead(parseInt(currentInput))}
                        disabled={operating || !currentInput.trim()}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        Insert at Head
                    </Button>
                    
                    <Button
                        onClick={deleteAtHead}
                        disabled={operating || !head}
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                        Delete Head
                    </Button>
                    
                    <Button
                        onClick={deleteAtTail}
                        disabled={operating || !tail}
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                        Delete Tail
                    </Button>
                    
                    <Button
                        onClick={() => deleteAtIndex(parseInt(indexInput))}
                        disabled={operating || !head || indexInput === ""}
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                        Delete at Index
                    </Button>
                    
                    <Button
                        onClick={() => searchValue(parseInt(currentInput))}
                        disabled={operating || !head || !currentInput.trim()}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        Search Value
                    </Button>
                    
                    <Button
                        onClick={reverseList}
                        disabled={operating || !head}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                        Reverse List
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
                                ? "bg-indigo-700 hover:bg-indigo-800 text-white" 
                                : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                            }
                        >
                            {key}
                        </Button>
                    ))}
                </div>

                {/* Current Step Display */}
                {currentStep && (
                    <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-orange-50 rounded-lg border border-teal-200">
                        <span className="text-lg font-semibold text-teal-700">{currentStep}</span>
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
                <div className="min-h-48 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                    {renderLinkedList()}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                        <span className="text-gray-600">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-teal-50 border-2 border-teal-600 rounded"></div>
                        <span className="text-gray-600">Traversing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-rose-50 border-2 border-rose-500 rounded"></div>
                        <span className="text-gray-600">Target/Delete</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-50 border-2 border-emerald-500 rounded"></div>
                        <span className="text-gray-600">New Node</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-r from-teal-50 to-orange-50 rounded-lg p-4 text-sm border border-teal-200">
                    <h3 className="font-bold mb-2 text-teal-700">Doubly Linked List Operations:</h3>
                    <div className="text-gray-700 space-y-1">
                        <p><strong>Insert at Head:</strong> O(1) - Direct insertion with prev pointer update</p>
                        <p><strong>Insert at Tail:</strong> O(1) - Direct insertion using tail pointer</p>
                        <p><strong>Insert at Index:</strong> O(n) - Must traverse to the specific position</p>
                        <p><strong>Delete at Head:</strong> O(1) - Direct deletion with next.prev update</p>
                        <p><strong>Delete at Tail:</strong> O(1) - Direct deletion using tail pointer</p>
                        <p><strong>Delete at Index:</strong> O(n) - Must traverse to the specific position</p>
                        <p><strong>Search:</strong> O(n) - Must check each node sequentially</p>
                        <p><strong>Reverse:</strong> O(n) - Swap prev and next pointers for all nodes</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}