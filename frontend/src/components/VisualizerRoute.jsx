import React from "react";
import { cn } from "@/lib/utils";

const VisualizerRoute = ({ children, className = "" }) => {
  return (
    <div className="visualizer-route min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className={cn("max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-6", className)}>
        {children}
      </div>
    </div>
  );
};

export default VisualizerRoute;


