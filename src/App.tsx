import { useEffect, useRef } from "react";
import { createSpaceScene } from "./SpaceScene";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = createSpaceScene(containerRef.current);

    return cleanup;
  }, []);

  return <div ref={containerRef} className="space" />;
}

export default App;
