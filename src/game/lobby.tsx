import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BALL_RADIUS } from "./runtime";

export function LobbyScene() {
  const ball = useRef<THREE.Mesh>(null);
  const starA = useRef<THREE.Mesh>(null);
  const starB = useRef<THREE.Mesh>(null);
  const starC = useRef<THREE.Mesh>(null);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    if (ball.current) {
      ball.current.position.y = 0.9 + Math.sin(t * 1.4) * 0.08;
      ball.current.rotation.y = t * 0.6;
      ball.current.rotation.x = t * 0.25;
    }
    for (const [ref, off] of [
      [starA, 0],
      [starB, 2.1],
      [starC, 4.2],
    ] as const) {
      if (!ref.current) continue;
      const a = t * 0.7 + off;
      ref.current.position.set(Math.cos(a) * 1.8, 1.15 + Math.sin(t * 2 + off) * 0.2, Math.sin(a) * 1.8);
      ref.current.rotation.y = t * 1.4;
    }
    const cx = Math.sin(t * 0.18) * 5.4;
    const cz = Math.cos(t * 0.18) * 5.4;
    camera.position.set(cx, 2.6, cz);
    camera.lookAt(0, 0.7, 0);
  });

  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.4, 2.6, 0.45, 20]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[2.7, 2.8, 0.28, 20]} />
        <meshStandardMaterial color="#b08968" roughness={0.7} />
      </mesh>
      <mesh ref={ball} position={[0, 0.9, 0]}>
        <sphereGeometry args={[BALL_RADIUS * 1.35, 20, 16]} />
        <meshStandardMaterial color="#d45a4a" roughness={0.28} metalness={0.08} />
      </mesh>
      <mesh ref={starA}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#e8e2d6" emissive="#b8a882" emissiveIntensity={0.45} />
      </mesh>
      <mesh ref={starB}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#e8e2d6" emissive="#b8a882" emissiveIntensity={0.45} />
      </mesh>
      <mesh ref={starC}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#e8e2d6" emissive="#b8a882" emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
}
