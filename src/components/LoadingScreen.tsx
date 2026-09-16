import { useEffect, useRef, useState } from "react";
import { WarpScene } from "../objects/WarpScene";

interface LoadingScreenProps {
  isLoaded: boolean;
  onComplete: () => void;
}

function LoadingScreen({ isLoaded, onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const warpSceneRef = useRef<WarpScene | null>(null);

  const [isWarpFading, setIsWarpFading] = useState(false);
  const [isFadeOut, setIsFadeOut] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // 워프 진행률
  const [warpProgress, setWarpProgress] = useState(0);

  // 표시 속도
  const [displaySpeed, setDisplaySpeed] = useState(10000);

  // =====================================================
  // Warp Scene 생성
  // =====================================================

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const warpScene = new WarpScene({
      container: containerRef.current,
    });

    warpSceneRef.current = warpScene;

    return () => {
      warpScene.dispose();
      warpSceneRef.current = null;
    };
  }, []);

  // =====================================================
  // Loading Progress
  // =====================================================

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    const startTime = performance.now();

    let animationId = 0;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;

      // 2.5초 동안 0 → 90%
      const progress = Math.min(elapsed / 2500, 0.9);

      setWarpProgress(progress);

      if (progress < 0.9) {
        animationId = requestAnimationFrame(updateProgress);
      }
    };

    animationId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isLoaded]);

  // =====================================================
  // Loading Complete Progress
  // =====================================================

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const startProgress = warpProgress;
    const startTime = performance.now();

    // 90 → 100%
    const duration = 500;

    let animationId = 0;

    const completeProgress = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);

      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);

      const nextProgress = startProgress + (1 - startProgress) * eased;

      setWarpProgress(nextProgress);

      if (progress < 1) {
        animationId = requestAnimationFrame(completeProgress);
      }
    };

    animationId = requestAnimationFrame(completeProgress);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isLoaded]);

  // =====================================================
  // Speed Animation
  // =====================================================

  useEffect(() => {
    if (!isWarpFading) {
      return;
    }

    const startTime = performance.now();

    const duration = 2000;

    let animationId = 0;

    const animateSpeed = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      const speed = Math.round(100 + (300000 - 100) * eased);

      setDisplaySpeed(speed);

      if (progress < 1) {
        animationId = requestAnimationFrame(animateSpeed);
      }
    };

    animationId = requestAnimationFrame(animateSpeed);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isWarpFading]);

  // =====================================================
  // Loading Complete
  // =====================================================

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (isWarpFading) {
      return;
    }

    const warpScene = warpSceneRef.current;

    if (!warpScene) {
      return;
    }

    // ===================================================
    // 로딩 완료 후 800ms 대기
    // ===================================================

    const delayId = window.setTimeout(() => {
      setIsWarpFading(true);

      warpScene.startExit(() => {
        const fadeDelayId = window.setTimeout(() => {
          setIsFadeOut(true);

          const completeDelayId = window.setTimeout(() => {
            warpScene.dispose();
            warpSceneRef.current = null;

            setIsVisible(false);

            onComplete();
          }, 800);

          return () => {
            window.clearTimeout(completeDelayId);
          };
        }, 500);

        return () => {
          window.clearTimeout(fadeDelayId);
        };
      });
    }, 800);

    return () => {
      window.clearTimeout(delayId);
    };
  }, [isLoaded, isWarpFading, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={[
        "absolute inset-0 z-20",
        "bg-[#01020a]",
        "transition-opacity duration-800 ease-out",
        isFadeOut ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div
        className={[
          "pointer-events-none absolute",
          "bottom-8 left-1/2",
          "-translate-x-1/2",
          "animate-[prompt-in_0.6s_ease-out]",
        ].join(" ")}
      >
        <div
          className={[
            "w-64",
            "rounded-xl",
            "border border-white/10",
            "bg-black/40",
            "px-5 py-4",
            "backdrop-blur-md",
          ].join(" ")}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-2 w-2">
                <span
                  className={[
                    "absolute h-2 w-2",
                    "animate-ping",
                    "rounded-full",
                    "bg-white/30",
                  ].join(" ")}
                />

                <span
                  className={[
                    "absolute left-0.5 top-0.5",
                    "h-1 w-1",
                    "rounded-full",
                    "bg-white/70",
                  ].join(" ")}
                />
              </div>

              <span
                className={[
                  "text-[10px]",
                  "font-semibold",
                  "tracking-[0.2em]",
                  "text-white/70",
                ].join(" ")}
              >
                WARP DRIVE
              </span>
            </div>

            <span
              className={[
                "text-[9px]",
                "tracking-[0.15em]",
                "text-white/30",
              ].join(" ")}
            >
              ONLINE
            </span>
          </div>

          <div className="flex items-end gap-2">
            <span
              className={[
                "font-mono",
                "text-4xl",
                "font-medium",
                "leading-none",
                "tracking-tight",
                "text-white/90",
              ].join(" ")}
            >
              {displaySpeed.toLocaleString()}
            </span>

            <span
              className={[
                "mb-1",
                "text-[9px]",
                "tracking-[0.15em]",
                "text-white/30",
              ].join(" ")}
            >
              KM/S
            </span>
          </div>

          <div className="mt-4">
            <div
              className={[
                "relative h-1",
                "overflow-hidden",
                "rounded-full",
                "bg-white/10",
              ].join(" ")}
            >
              <div
                className={[
                  "absolute inset-y-0 left-0",
                  "rounded-full",
                  "bg-white/60",
                ].join(" ")}
                style={{
                  width: `${warpProgress * 100}%`,
                }}
              />
            </div>

            <div className="mt-1 flex justify-between">
              <span className="text-[8px] text-white/20">0%</span>

              <span className="text-[8px] text-white/20">100%</span>
            </div>
          </div>

          <div
            className={[
              "mt-3 flex items-center",
              "justify-between",
              "border-t border-white/5",
              "pt-3",
            ].join(" ")}
          >
            <span
              className={[
                "text-[8px]",
                "tracking-[0.15em]",
                "text-white/25",
              ].join(" ")}
            >
              {isLoaded ? "SYSTEM READY" : "ENTERING SOLAR SYSTEM"}
            </span>

            <span
              className={["font-mono", "text-[8px]", "text-white/30"].join(" ")}
            >
              {Math.round(warpProgress * 100)
                .toString()
                .padStart(3, "0")}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
