function Controls() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-10 select-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white/70 backdrop-blur-md">
      <div className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-white/40">
        CONTROLS
      </div>

      <div className="mb-1 flex gap-1">
        <Key>W</Key>
        <Key>A</Key>
        <Key>S</Key>
        <Key>D</Key>
      </div>

      <div className="mb-2 flex gap-1">
        <Key wide>SPACE</Key>
        <Key>C</Key>
        <Key>F</Key>
      </div>

      <div className="space-y-1 text-[10px] text-white/40">
        <div>WASD 이동 · SPACE 상승 · C 하강 · F 상호작용</div>

        <div>마우스 클릭 시 시점 전환 · ESC 마우스 락 해제</div>
      </div>
    </div>
  );
}

interface KeyProps {
  children: React.ReactNode;
  wide?: boolean;
}

function Key({ children, wide = false }: KeyProps) {
  return (
    <span
      className={[
        "flex h-7 items-center justify-center rounded-md",
        "border border-white/15 bg-white/5",
        "text-[10px] font-semibold text-white/70",
        wide ? "w-16" : "w-7",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Controls;
