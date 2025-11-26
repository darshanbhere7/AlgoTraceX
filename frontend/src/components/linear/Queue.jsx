import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Shuffle, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

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
  const [showInfo, setShowInfo] = useState(false);

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
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 pb-8 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Queue Visualizer
        </h1>
        <p className="text-sm text-slate-600 dark:text-white/50">
          Identical shell to the Binary Search Tree experience, tuned for FIFO behavior.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Value (0-999)"
              value={currentInput}
              disabled={processing}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEnqueue()}
              className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
              min="0"
              max="999"
            />
            <Button
              variant="ghost"
              onClick={handleEnqueue}
              disabled={processing || !currentInput.trim()}
              className="h-10 px-4 bg-black hover:bg-slate-800 dark:bg-white/15 dark:hover:bg-white/25 text-white border-0 rounded-md shadow-sm disabled:opacity-60"
            >
              Enqueue
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={maxSize}
              min={3}
              max={15}
              disabled={processing}
              onChange={(e) => setMaxSize(Math.max(3, Math.min(15, parseInt(e.target.value, 10) || 3)))}
              className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:border-slate-400 dark:focus:border-white/20 focus:ring-0 h-10"
            />
            <Button
              variant="ghost"
              onClick={clear}
              disabled={processing && queue.length === 0}
              className="h-10 px-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Queue
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={randomize}
              disabled={processing}
              className="flex-1 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-700 dark:bg-white/15 dark:hover:bg-white/20 dark:text-white rounded-md"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random Fill
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={dequeue}
            disabled={processing || queue.length === 0}
            className="flex-1 sm:flex-none bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-400/20 dark:hover:bg-rose-400/30 text-rose-700 dark:text-rose-300 border border-rose-500/20 h-10 rounded-md"
          >
            Dequeue
          </Button>
          <Button
            variant="ghost"
            onClick={peek}
            disabled={processing || queue.length === 0}
            className="flex-1 sm:flex-none bg-sky-500/20 hover:bg-sky-500/30 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 text-sky-700 dark:text-sky-300 border border-sky-500/20 h-10 rounded-md"
          >
            Peek Front
          </Button>
          <Button
            variant="ghost"
            onClick={size}
            className="flex-1 sm:flex-none bg-amber-500/20 hover:bg-amber-500/30 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 text-amber-700 dark:text-amber-300 border border-amber-500/20 h-10 rounded-md"
          >
            Size
          </Button>
          <Button
            variant="ghost"
            onClick={isEmpty}
            className="flex-1 sm:flex-none bg-slate-500/10 hover:bg-slate-500/20 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-white border border-slate-400/30 h-10 rounded-md"
          >
            Is Empty?
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
              disabled={processing}
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

      <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm sm:text-base shadow-sm mb-4">
        {status}
      </div>

      <div className="bg-slate-100 dark:bg-white/[0.02] backdrop-blur-sm rounded-xl border border-slate-200 dark:border-white/[0.05] p-4 sm:p-6 mb-4 shadow-lg min-h-[320px]">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-white/40">
            <p className="text-base mb-2 text-center">Queue is empty. Enqueue values to begin.</p>
            <p className="text-sm text-slate-400 dark:text-white/30 text-center">FIFO: front removes, rear adds.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {displayQueue.map((node, index) => (
              <div
                key={node.id}
                className={`min-w-[72px] rounded-2xl border-2 px-4 py-3 text-center transition-all ${
                  highlightedIndex === index
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shadow-lg"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <div className="text-xl font-semibold">{node.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {node.isFront && "Front"}
                  {node.isRear && !node.isFront && "Rear"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/60 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>Highlighted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Front pointer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Rear pointer</span>
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
            <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Queue Algorithm Insight</h3>
            <p className="text-slate-600 dark:text-white/60">
              Enqueue pushes to the rear, dequeue removes from the front, both in O(1). Peek observes the current front without removing it.
            </p>
            <p className="text-xs text-slate-500 dark:text-white/40">Max size: {maxSize} elements. Adjust to simulate overflow.</p>
          </div>
        </div>
      )}
    </div>
  );
}

