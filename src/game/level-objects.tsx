import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, CuboidCollider, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import type { CheckpointDef, LevelDef, MoverDef, PlatformDef, SpinnerDef, StarDef } from "./types";
import { addTrauma, runtime } from "./runtime";
import { useGame } from "./store";

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

function PlatformMesh({ def }: { def: PlatformDef }) {
  const [w, h, d] = def.size;
  const isGoal = def.kind === "goal";
  const top = isGoal ? "#6a9a7a" : "#e8dcc8";
  const lip = isGoal ? "#3f6b52" : "#b08968";
  return (
    <RigidBody type="fixed" position={def.pos} colliders={false} friction={1.25} restitution={0.04}>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={top} roughness={0.48} metalness={0.04} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[w + 0.12, h, d + 0.12]} />
        <meshStandardMaterial color={lip} roughness={0.62} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}

function Mover({ def }: { def: MoverDef }) {
  const ref = useRef<RapierRigidBody>(null);
  const [w, h, d] = def.size;
  const phase = def.phase ?? 0;
  useFrame(({ clock }) => {
    const b = ref.current;
    if (!b) return;
    const off = Math.sin(clock.elapsedTime * def.speed + phase) * def.amplitude;
    const x = def.pos[0] + (def.axis === "x" ? off : 0);
    const z = def.pos[2] + (def.axis === "z" ? off : 0);
    b.setNextKinematicTranslation({ x, y: def.pos[1], z });
  });
  return (
    <RigidBody ref={ref} type="kinematicPosition" position={def.pos} colliders={false} friction={1.4}>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#d8c4a8" roughness={0.4} metalness={0.08} />
      </mesh>
    </RigidBody>
  );
}

function Spinner({ def }: { def: SpinnerDef }) {
  const ref = useRef<RapierRigidBody>(null);
  const angle = useRef(0);
  const hitLock = useRef(0);
  useFrame((_, dt) => {
    const b = ref.current;
    if (!b) return;
    angle.current += def.speed * dt;
    _e.set(0, angle.current, 0);
    _q.setFromEuler(_e);
    b.setNextKinematicRotation(_q);
  });
  return (
    <RigidBody
      ref={ref}
      type="kinematicPosition"
      position={def.pos}
      colliders={false}
      friction={0.2}
      restitution={0.55}
      onCollisionEnter={(e) => {
        if (e.other.rigidBodyObject?.name !== "player") return;
        if (runtime.now < hitLock.current) return;
        hitLock.current = runtime.now + 0.25;
        addTrauma(0.28);
      }}
    >
      <CuboidCollider args={[def.length / 2, 0.28, 0.28]} />
      <mesh>
        <boxGeometry args={[def.length, 0.56, 0.56]} />
        <meshStandardMaterial color="#c45c4a" roughness={0.35} metalness={0.12} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 1.1, 10]} />
        <meshStandardMaterial color="#3a3d46" roughness={0.5} />
      </mesh>
    </RigidBody>
  );
}

function StarPickup({ def, magnet }: { def: StarDef; magnet: number }) {
  const [taken, setTaken] = useState(false);
  const vis = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (taken || !vis.current) return;
    const t = clock.elapsedTime;
    vis.current.position.y = Math.sin(t * 2.2 + def.pos[0]) * 0.16;
    vis.current.rotation.y = t * 1.8;
  });
  if (taken) return null;
  const sensor = 0.55 + magnet * 0.22;
  return (
    <RigidBody
      type="fixed"
      position={def.pos}
      colliders={false}
      sensor
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name !== "player") return;
        setTaken(true);
        addTrauma(0.1);
        useGame.getState().collectStar();
      }}
    >
      <BallCollider args={[sensor]} />
      <group ref={vis}>
        <mesh>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#e8e2d6"
            emissive="#b8a882"
            emissiveIntensity={0.55}
            roughness={0.25}
            metalness={0.35}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}

function Checkpoint({ def }: { def: CheckpointDef }) {
  return (
    <RigidBody
      type="fixed"
      position={def.pos}
      colliders={false}
      sensor
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name !== "player") return;
        runtime.spawn = { x: def.pos[0], y: def.pos[1] + 0.2, z: def.pos[2] };
      }}
    >
      <BallCollider args={[def.radius ?? 1.8]} />
    </RigidBody>
  );
}

function Goal({ pos, size }: { pos: [number, number, number]; size: [number, number, number] }) {
  const [w, h, d] = size;
  return (
    <group>
      <RigidBody type="fixed" position={pos} colliders={false} friction={1.2}>
        <CuboidCollider args={[w / 2, h / 2, d / 2]} />
        <mesh>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color="#6a9a7a" roughness={0.4} metalness={0.08} />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <torusGeometry args={[1.15, 0.08, 8, 24]} />
          <meshStandardMaterial color="#e8e2d6" emissive="#cfc6b4" emissiveIntensity={0.35} />
        </mesh>
      </RigidBody>
      <RigidBody
        type="fixed"
        position={[pos[0], pos[1] + 0.9, pos[2]]}
        colliders={false}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBodyObject?.name !== "player") return;
          useGame.getState().win();
        }}
      >
        <CuboidCollider args={[w / 2 - 0.4, 0.8, d / 2 - 0.4]} />
      </RigidBody>
    </group>
  );
}

export function Course({ level }: { level: LevelDef }) {
  const magnet = useGame((s) => s.upgrades.magnet);
  const runId = useGame((s) => s.runId);
  const platforms = useMemo(() => level.platforms, [level]);
  return (
    <group key={runId}>
      {platforms.map((p, i) => (
        <PlatformMesh key={`p-${i}`} def={p} />
      ))}
      {level.movers.map((m, i) => (
        <Mover key={`m-${i}`} def={m} />
      ))}
      {level.spinners.map((s, i) => (
        <Spinner key={`s-${i}`} def={s} />
      ))}
      {level.stars.map((st, i) => (
        <StarPickup key={`st-${i}`} def={st} magnet={magnet * 3.8} />
      ))}
      {level.checkpoints.map((c, i) => (
        <Checkpoint key={`c-${i}`} def={c} />
      ))}
      <Goal pos={level.goal.pos} size={level.goal.size} />
    </group>
  );
}
