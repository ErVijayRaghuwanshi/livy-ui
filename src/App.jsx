import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import TabBar from "./components/TabBar";
import SqlEditor from "./components/SqlEditor";
import ResultTable from "./components/ResultTable";
import SchemaExplorer from "./components/SchemaExplorer";
import { GripHorizontal } from "lucide-react";

export default function App() {
  const [result, setResult] = useState(null);
  const [resultHeight, setResultHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);

  const handleResult = useCallback((r) => {
    setResult(r);
  }, []);

  // Resizable result panel
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const startY = e.clientY;
    const startHeight = resultHeight;

    const onMouseMove = (moveEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + delta, 100), window.innerHeight - 200);
      setResultHeight(newHeight);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* Schema Explorer Sidebar */}
        <SchemaExplorer />

        {/* Main Editor + Results Area */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <TabBar />
          <SqlEditor onResult={handleResult} />

          {/* Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            className={`flex items-center justify-center h-2 cursor-row-resize shrink-0 transition-colors ${
              isDragging
                ? "bg-[var(--color-accent)]"
                : "bg-[var(--color-border)] hover:bg-[var(--color-accent)]/50"
            }`}
          >
            <GripHorizontal size={14} className="text-[var(--color-text-muted)]" />
          </div>

          {/* Result Panel */}
          <div
            className="shrink-0 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]"
            style={{ height: resultHeight }}
          >
            <ResultTable result={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
