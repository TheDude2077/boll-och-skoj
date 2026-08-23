import { useEffect, useState, type ComponentType } from "react";
import { GameUI } from "@/components/game-ui";
import { disposeInput, initInput } from "./input";
import { unlockAudio } from "./audio";

export function GameApp() {
  const [Canvas, setCanvas] = useState<ComponentType | null>(null);

  useEffect(() => {
    initInput();
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    void import("./GameCanvas").then((m) => setCanvas(() => m.GameCanvas));
    return () => {
      disposeInput();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      {Canvas ? (
        <Canvas />
      ) : (
        <div className="absolute inset-0 bg-bg" aria-hidden="true" />
      )}
      <div className="absolute inset-0 z-10">
        <GameUI />
      </div>
    </main>
  );
}
