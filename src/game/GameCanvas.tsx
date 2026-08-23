import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense, useMemo } from "react";
import { addOrbitDrag } from "./input";
import { Atmosphere, DistantIsles, Lights } from "./environment";
import { Course } from "./level-objects";
import { FollowCamera, Player } from "./Player";
import { levelByIndex } from "./levels";
import { useGame } from "./store";
import { LobbyScene } from "./lobby";

export function GameCanvas() {
  const screen = useGame((s) => s.screen);
  const levelIndex = useGame((s) => s.levelIndex);
  const playing = screen === "playing" || screen === "paused";
  const paused = screen === "paused";
  const level = useMemo(() => levelByIndex(levelIndex), [levelIndex]);

  return (
    <Canvas
      dpr={1}
      camera={{ fov: 48, near: 0.15, far: 140, position: [0, 4.2, 10] }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
        stencil: false,
        depth: true,
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none", background: "#243552" }}
      onPointerMove={(e) => {
        if (e.buttons === 1 && playing) addOrbitDrag(-e.movementX * 0.0045);
      }}
    >
      <Lights />
      <Atmosphere />
      <DistantIsles />
      {playing ? (
        <Suspense fallback={null}>
          <Physics gravity={[0, -18, 0]} interpolate paused={paused} timeStep={1 / 60} key={level.id}>
            <Player />
            <FollowCamera />
            <Course level={level} />
          </Physics>
        </Suspense>
      ) : (
        <LobbyScene />
      )}
    </Canvas>
  );
}
