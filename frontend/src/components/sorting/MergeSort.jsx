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

export default function MergeSort() {
    const [array, setArray] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [sorting, setSorting] = useState(false);
    const [speedKey, setSpeedKey] = useState("1x");
    const [visualTree, setVisualTree] = useState([]);
    const [currentStep, setCurrentStep] = useState("");
    const [activeNodes, setActiveNodes] = useState(new Set());
    const [mergingNodes, setMergingNodes] = useState(new Set());
    const [completedNodes, setCompletedNodes] = useState(new Set());

    const delay = speedOptions[speedKey];

    const handleAddValue = () => {
        const val = parseInt(currentInput.trim());
        if (!isNaN(val) && val >= 0 && val <= 999) {
            setArray((prev) => [...prev, val]);
            setCurrentInput("");
        }
    };

    const generateRandomArray = () => {
        if (sorting) return;
        const randomArr = Array.from({ length: 8 }, () =>
            Math.floor(Math.random() * 90) + 10
        );
        setArray(randomArr);
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const buildVisualTree = (arr, left, right, level = 0, position = 0) => {
        const nodeId = `${level}-${position}`;
        const node = {
            id: nodeId,
            array: arr.slice(left, right + 1),
            left,
            right,
            level,
            position,
            isSorted: false
        };

        let tree = [node];

        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            const leftTree = buildVisualTree(arr, left, mid, level + 1, position * 2);
            const rightTree = buildVisualTree(arr, mid + 1, right, level + 1, position * 2 + 1);
            tree = tree.concat(leftTree, rightTree);
        }

        return tree;
    };

    const mergeSort = async () => {
        setSorting(true);
        setActiveNodes(new Set());
        setMergingNodes(new Set());
        setCompletedNodes(new Set());
        
        let arr = [...array];
        const tree = buildVisualTree(arr, 0, arr.length - 1);
        setVisualTree(tree);
        
        setCurrentStep("Building divide tree...");
        await sleep(delay);

        await mergeSortHelper(arr, 0, arr.length - 1, 0, 0, tree);
        
        setCurrentStep("Merge Sort Complete! 🎉");
        setCompletedNodes(new Set([tree[0].id]));
        await sleep(delay * 2);
        
        setSorting(false);
        setActiveNodes(new Set());
        setMergingNodes(new Set());
        setCurrentStep("");
    };

    const mergeSortHelper = async (arr, left, right, level, position, tree) => {
        const nodeId = `${level}-${position}`;
        
        if (left >= right) {
            setCompletedNodes(prev => new Set([...prev, nodeId]));
            return;
        }

        const mid = Math.floor((left + right) / 2);
        
        // Highlight current divide
        setCurrentStep(`Dividing array at level ${level}`);
        setActiveNodes(new Set([nodeId]));
        await sleep(delay);

        // Recursively sort left half
        await mergeSortHelper(arr, left, mid, level + 1, position * 2, tree);
        
        // Recursively sort right half
        await mergeSortHelper(arr, mid + 1, right, level + 1, position * 2 + 1, tree);
        
        // Merge the sorted halves
        await merge(arr, left, mid, right, nodeId, tree);
    };

    const merge = async (arr, left, mid, right, nodeId, tree) => {
        const leftNodeId = `${parseInt(nodeId.split('-')[0]) + 1}-${parseInt(nodeId.split('-')[1]) * 2}`;
        const rightNodeId = `${parseInt(nodeId.split('-')[0]) + 1}-${parseInt(nodeId.split('-')[1]) * 2 + 1}`;
        
        setCurrentStep(`Merging: [${arr.slice(left, mid + 1).join(', ')}] with [${arr.slice(mid + 1, right + 1).join(', ')}]`);
        setMergingNodes(new Set([leftNodeId, rightNodeId]));
        setActiveNodes(new Set([nodeId]));
        await sleep(delay);

        // Create temp arrays
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;

        // Merge process with animation
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            k++;
            
            // Update the tree node with current merged state
            const nodeIndex = tree.findIndex(node => node.id === nodeId);
            if (nodeIndex !== -1) {
                tree[nodeIndex].array = arr.slice(left, k);
                setVisualTree([...tree]);
            }
            await sleep(delay);
        }

        // Copy remaining elements
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            i++;
            k++;
            const nodeIndex = tree.findIndex(node => node.id === nodeId);
            if (nodeIndex !== -1) {
                tree[nodeIndex].array = arr.slice(left, k);
                setVisualTree([...tree]);
            }
            await sleep(delay);
        }

        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            j++;
            k++;
            const nodeIndex = tree.findIndex(node => node.id === nodeId);
            if (nodeIndex !== -1) {
                tree[nodeIndex].array = arr.slice(left, k);
                setVisualTree([...tree]);
            }
            await sleep(delay);
        }

        // Mark as completed
        const nodeIndex = tree.findIndex(node => node.id === nodeId);
        if (nodeIndex !== -1) {
            tree[nodeIndex].array = arr.slice(left, right + 1);
            tree[nodeIndex].isSorted = true;
            setVisualTree([...tree]);
        }
        
        setCompletedNodes(prev => new Set([...prev, nodeId]));
        setMergingNodes(new Set());
        setArray([...arr]);
        await sleep(delay);
    };

    const reset = () => {
        setArray([]);
        setCurrentInput("");
        setSorting(false);
        setVisualTree([]);
        setActiveNodes(new Set());
        setMergingNodes(new Set());
        setCompletedNodes(new Set());
        setCurrentStep("");
    };

    const getNodeColor = (nodeId) => {
        if (completedNodes.has(nodeId)) return "border-green-600 bg-green-50";
        if (activeNodes.has(nodeId)) return "border-blue-600 bg-blue-50";
        if (mergingNodes.has(nodeId)) return "border-orange-500 bg-orange-50";
        return "border-gray-300 bg-gray-50";
    };

    const renderTree = () => {
        if (visualTree.length === 0) return null;

        const maxLevel = Math.max(...visualTree.map(node => node.level));
        const levels = [];
        
        for (let level = 0; level <= maxLevel; level++) {
            levels.push(visualTree.filter(node => node.level === level));
        }

        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-max py-8">
                    {levels.map((levelNodes, levelIndex) => (
                        <div key={levelIndex} className="flex justify-center items-center mb-8 relative">
                            {levelNodes.map((node, nodeIndex) => (
                                <div key={node.id} className="relative mx-4">
                                    {/* Connection lines to children */}
                                    {levelIndex < levels.length - 1 && node.left < node.right && (
                                        <>
                                            <div className="absolute top-full left-1/2 w-px h-8 bg-gray-400 transform -translate-x-1/2"></div>
                                            <div className="absolute top-full left-1/4 w-1/2 h-px bg-gray-400 transform translate-y-4"></div>
                                        </>
                                    )}
                                    
                                    {/* Node */}
                                    <div className={`
                                        border-2 rounded-lg p-3 transition-all duration-500 transform
                                        ${getNodeColor(node.id)}
                                        ${activeNodes.has(node.id) ? 'scale-110 shadow-lg' : ''}
                                        ${mergingNodes.has(node.id) ? 'animate-pulse' : ''}
                                        ${completedNodes.has(node.id) ? 'shadow-green-200 shadow-lg' : ''}
                                    `}>
                                        <div className="flex gap-1 justify-center">
                                            {node.array.map((val, idx) => (
                                                <div
                                                    key={`${node.id}-${idx}`}
                                                    className={`
                                                        w-8 h-8 rounded flex items-center justify-center text-sm font-bold
                                                        transition-all duration-300
                                                        ${completedNodes.has(node.id) 
                                                            ? 'bg-green-600 text-white' 
                                                            : activeNodes.has(node.id)
                                                                ? 'bg-blue-600 text-white'
                                                                : mergingNodes.has(node.id)
                                                                    ? 'bg-orange-500 text-white'
                                                                    : 'bg-gray-700 text-white'
                                                        }
                                                    `}
                                                >
                                                    {val}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-center mt-1 text-gray-500">
                                            Level {node.level}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Card className="bg-white text-gray-900 p-6 max-w-7xl mx-auto border border-gray-200 shadow-lg">
            <CardContent className="space-y-6">
                <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Merge Sort Visualizer
                </h2>

                {/* Input Panel */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Enter number (0-999)"
                            value={currentInput}
                            disabled={sorting}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                            className="w-48 bg-white border-gray-300"
                            min="0"
                            max="999"
                        />
                        <Button onClick={handleAddValue} disabled={sorting} size="sm" className="bg-neutral-700 hover:bg-neutral-900 text-white">
                            Add
                        </Button>
                    </div>
                    
                    <Button onClick={generateRandomArray} disabled={sorting} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Generate Random (8 elements)
                    </Button>
                    
                    <Button
                        onClick={mergeSort}
                        disabled={sorting || array.length < 2}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {sorting ? "Visualizing..." : "Start Dynamic Sort"}
                    </Button>
                    
                    <Button variant="outline" onClick={reset} disabled={sorting} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Reset
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
                            disabled={sorting}
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

                {/* Original Array Display */}
                {array.length > 0 && (
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Original Array:</h3>
                        <div className="flex justify-center gap-2">
                            {array.map((val, idx) => (
                                <div key={idx} className="w-10 h-10 bg-gray-200 border border-gray-300 rounded flex items-center justify-center font-bold text-gray-700">
                                    {val}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamic Tree Visualization */}
                <div className="min-h-96 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    {array.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                                <span>Add numbers or generate a random array to see the dynamic tree visualization</span>
                            </div>
                        </div>
                    ) : !sorting && visualTree.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                            <span>Click "Start Dynamic Sort" to see the merge sort tree in action!</span>
                        </div>
                    ) : (
                        renderTree()
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
                        <span className="text-gray-600">Waiting</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600 rounded"></div>
                        <span className="text-gray-600">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-50 border-2 border-orange-500 rounded"></div>
                        <span className="text-gray-600">Merging</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-50 border-2 border-green-600 rounded"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                </div>

                {/* Algorithm Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-sm border border-blue-200">
                    <h3 className="font-bold mb-2 text-blue-700">Merge Sort Visualization:</h3>
                    <p className="text-gray-700">
                        Watch as the array dynamically divides into a tree structure, then merges back up level by level. 
                        Each node shows the current state of that subarray as it gets sorted and merged with its sibling.
                        <br/><strong>Time Complexity:</strong> O(n log n) | <strong>Space Complexity:</strong> O(n)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}