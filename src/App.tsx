import { useCallback, useEffect, useRef, useState } from "react";

import Controls from "./components/Controls";
import InteractionPrompt from "./components/InteractionPrompt";
import LoadingScreen from "./components/LoadingScreen";
import PlanetInfo from "./components/PlanetInfo";

import { useSpaceStore } from "./stores/spaceStore";

import { createSpaceScene } from "./SpaceScene";

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const spaceSceneRef = useRef<{
    start: () => void;
    cleanup: () => void;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [showLoading, setShowLoading] = useState(true);

  const [showSpaceScene, setShowSpaceScene] = useState(false);

  const nearbyPlanet = useSpaceStore((state) => state.nearbyPlanet);

  const focusedPlanet = useSpaceStore((state) => state.focusedPlanet);

  // =====================================================
  // GLB Loading Complete
  // =====================================================

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  // =====================================================
  // Warp Complete
  // =====================================================

  const handleLoadingComplete = useCallback(() => {
    // ================================================
    // WarpScene은 이미 dispose된 상태
    // ================================================

    // 실제 SpaceScene 렌더링 시작
    spaceSceneRef.current?.start();

    // SpaceScene 표시
    setShowSpaceScene(true);

    // LoadingScreen 제거
    setShowLoading(false);
  }, []);

  // =====================================================
  // Create SpaceScene
  // =====================================================

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const spaceScene = createSpaceScene(containerRef.current, handleLoaded);

    spaceSceneRef.current = spaceScene;

    return () => {
      spaceScene.cleanup();
      spaceSceneRef.current = null;
    };
  }, [handleLoaded]);

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* =================================================
          SpaceScene
      ================================================= */}

      <div
        ref={containerRef}
        className={[
          "absolute inset-0",
          "h-full w-full",
          "transition-opacity duration-300 ease-out",
          showSpaceScene ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* =================================================
          Loading / Warp
      ================================================= */}

      {showLoading && (
        <LoadingScreen
          isLoaded={!isLoading}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* =================================================
          Controls
      ================================================= */}

      {!showLoading && <Controls />}

      {/* =================================================
          Interaction Prompt
      ================================================= */}

      {!showLoading && (
        <InteractionPrompt
          planetName={focusedPlanet?.name ?? nearbyPlanet?.name}
          focused={focusedPlanet !== null}
        />
      )}

      {/* =================================================
          Planet Info
      ================================================= */}

      {!showLoading && focusedPlanet && <PlanetInfo planet={focusedPlanet} />}
    </main>
  );
}

export default App;
