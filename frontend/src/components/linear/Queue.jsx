import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const speedOptions = {
  "0.25x": 1400,
  "0.5x": 900,
  "1x": 500,
  "2x": 250,
  "4x": 125,
};

const createNode = (value) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  value,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function QueueVisualizer() {
  const [queue, setQueue] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [speedKey, setSpeedKey] = useState("1x");
  const [status, setStatus] = useState("Queue ready. Add values to get started.");
  const [processing, setProcessing] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [maxSize, setMaxSize] = useState(8);

  const delay = speedOptions[speedKey];

  const updateStatus = (message) => {
    setStatus(message);
  };

  const enqueue = async (value) => {
    if (processing) return;
    setProcessing(true);

    if (queue.length >= maxSize) {
      updateStatus(`❌ Queue overflow. Max size ${maxSize} reached.`);
      setProcessing(false);
      return;
    }

    updateStatus(`Enqueuing ${value}...`);
    await sleep(delay / 2);

    setQueue((prev) => [...prev, createNode(value)]);
    updateStatus(`✅ Successfully enqueued ${value}.`);
    await sleep(delay / 2);
    setProcessing(false);
  };

  const handleEnqueue = async () => {
    const val = parseInt(currentInput.trim(), 10);
    if (isNaN(val)) return;
    setCurrentInput("");
    await enqueue(val);
  };

  const dequeue = async () => {
    if (processing) return;

    if (queue.length === 0) {
      updateStatus("Queue is empty. Nothing to dequeue.");
      return;
    }

    setProcessing(true);
    updateStatus(`Dequeuing ${queue[0].value}...`);
    setHighlightedIndex(0);
    await sleep(delay);

    setQueue((prev) => prev.slice(1));
    updateStatus(`✅ Removed ${queue[0].value} from the queue.`);
    setHighlightedIndex(null);
    await sleep(delay / 2);
    setProcessing(false);
  };

  const peek = async () => {
    if (queue.length === 0) {
      updateStatus("Queue is empty. Nothing to peek.");
      return;
    }
    updateStatus(`Front element is ${queue[0].value}.`);
    setHighlightedIndex(0);
    await sleep(delay);
    setHighlightedIndex(null);
  };

  const size = () => {
    updateStatus(`📏 Queue size: ${queue.length}`);
  };

  const isEmpty = () => {
    updateStatus(queue.length === 0 ? "✅ Queue is empty." : "❌ Queue currently has elements.");
  };

  const clear = async () => {
    if (processing || queue.length === 0) {
      setQueue([]);
      updateStatus("Queue cleared.");
      return;
    }
    setProcessing(true);
    updateStatus("Clearing queue...");
    for (let i = 0; i < queue.length; i++) {
      setHighlightedIndex(i);
      await sleep(delay / 4);
    }
    setHighlightedIndex(null);
    setQueue([]);
    updateStatus("✅ Queue cleared.");
    await sleep(delay / 4);
    setProcessing(false);
  };

  const randomize = () => {
    if (processing) return;
    const length = Math.floor(Math.random() * Math.min(5, maxSize)) + 3;
    const values = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setQueue(values.map(createNode));
    updateStatus("Random queue generated.");
  };

  const displayQueue = useMemo(
    () =>
      queue.map((node, idx) => ({
        ...node,
        isFront: idx === 0,
        isRear: idx === queue.length - 1,
      })),
    [queue]
  );

  return (
    <Card className="border border-gray-200 dark:border-neutral-800 shadow-xl">
      <CardContent className="space-y-8 p-6 text-gray-900 dark:text-gray-100">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Queue Visualizer</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A First-In-First-Out (FIFO) structure. Enqueue adds to the rear, dequeue removes from the front.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <Input
              type="number"
              placeholder="Enter a value"
              value={currentInput}
              disabled={processing}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnqueue()}
              className="md:w-48"
            />
            <Button onClick={handleEnqueue} disabled={processing || !currentInput.trim()} className="w-full md:w-auto">
              Enqueue
            </Button>
            <Button onClick={randomize} variant="outline" disabled={processing} className="w-full md:w-auto">
              Random Fill
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Max size:</span>
              <Input
                type="number"
                value={maxSize}
                min={3}
                max={15}
                disabled={processing}
                onChange={(e) => setMaxSize(Math.max(3, Math.min(15, parseInt(e.target.value, 10) || 3)))}
                className="w-20"
              />
            </div>
            <Button onClick={clear} variant="outline" disabled={processing && queue.length === 0}>
              Clear Queue
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={dequeue} disabled={processing || queue.length === 0}>
            Dequeue
          </Button>
          <Button onClick={peek} variant="outline" disabled={processing || queue.length === 0}>
            Peek Front
          </Button>
          <Button onClick={size} variant="outline">
            Size
          </Button>
          <Button onClick={isEmpty} variant="outline">
            Is Empty?
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
          {Object.keys(speedOptions).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={speedKey === key ? "default" : "outline"}
              onClick={() => setSpeedKey(key)}
              disabled={processing}
            >
              {key}
            </Button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 p-6">
          {queue.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Queue is empty. Enqueue values to visualize.</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {displayQueue.map((node, index) => (
                <div
                  key={node.id}
                  className={`min-w-[72px] rounded-xl border-2 px-4 py-3 text-center transition-colors ${
                    highlightedIndex === index
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                      : "border-gray-300 dark:border-neutral-700"
                  }`}
                >
                  <div className="text-xl font-semibold">{node.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {node.isFront && "Front"}
                    {node.isRear && !node.isFront && "Rear"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/70 p-4 text-sm">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Queue Algorithm Insight</p>
          <p className="text-gray-600 dark:text-gray-400">
            Enqueue inserts at the rear while dequeue removes from the front, ensuring FIFO order. Peek lets you inspect the front element without
            removing it.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/60 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">Status: {status}</p>
        </div>
      </CardContent>
    </Card>
  );
}

