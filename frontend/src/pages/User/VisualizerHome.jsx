import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function VisualizerHome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      <h1 className="text-3xl font-bold">DSA Visualizer</h1>
      <Button onClick={() => navigate("/user/bubble-sort")}>
        Go to Bubble Sort
      </Button>

      <Button onClick={() => navigate("/user/merge-sort")}>
        Go to Merge Sort
      </Button>

      <Button onClick={() => navigate("/user/quick-sort")}>
        Go to Quick Sort
      </Button>


      <Button onClick={() => navigate("/user/linear-search")}>
        Go to Linear Search
      </Button>

      <Button onClick={() => navigate("/user/binary-search")}>
        Go to Binary Search
      </Button>
    </div>
  );
}
