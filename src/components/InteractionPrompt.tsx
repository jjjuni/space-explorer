interface InteractionPromptProps {
  planetName?: string;
  focused: boolean;
}

function InteractionPrompt({ planetName, focused }: InteractionPromptProps) {
  if (!planetName) {
    return null;
  }

  return (
    <div
      className="
        pointer-events-none
        absolute bottom-8 left-1/2 z-10
        -translate-x-1/2
        animate-[prompt-in_0.4s_ease-out]
      "
    >
      <div className="rounded-xl border border-white/10 bg-black/50 px-5 py-3 text-center backdrop-blur-md">
        <div className="text-sm text-white/80">
          {focused ? `${planetName} 탐험 중` : `${planetName}에 접근했습니다`}
        </div>

        <div className="mt-1 text-xs text-white/40">
          {focused ? "F 를 눌러 나가기" : "F 를 눌러 상호작용"}
        </div>
      </div>
    </div>
  );
}

export default InteractionPrompt;
