import { useMemo } from "react";
import * as THREE from "three";

export function Lights() {
  return (
    <>
      <hemisphereLight args={["#f0d8b8", "#1a2744", 1.05]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[16, 22, 10]} intensity={1.15} color="#ffe6c8" />
    </>
  );
}

export function Atmosphere() {
  return (
    <>
      <color attach="background" args={["#243552"]} />
      <fog attach="fog" args={["#243552", 40, 120]} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -6.2, -40]}>
        <circleGeometry args={[80, 24]} />
        <meshBasicMaterial color="#152038" />
      </mesh>
    </>
  );
}

export function DistantIsles() {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: "#c9b79a",
      roughness: 0.78,
      metalness: 0.02,
    });
    const inst = new THREE.InstancedMesh(geo, mat, 10);
    const dummy = new THREE.Object3D();
    const spots: [number, number, number, number, number, number][] = [
      [-22, -1.2, -18, 6, 3, 6],
      [26, -0.6, -40, 8, 4.2, 7],
      [-30, 0.2, -70, 7, 5, 7],
      [32, -1, -88, 9, 3.5, 8],
      [-18, -0.4, -120, 10, 4, 9],
      [20, 0.4, -130, 6, 6, 6],
      [38, 0, -60, 5, 7, 5],
      [8, -2.2, -150, 12, 2, 10],
      [24, 1.6, -24, 3.2, 5, 3.2],
      [-14, 0, -140, 5, 4, 5],
    ];
    spots.forEach((s, i) => {
      dummy.position.set(s[0], s[1], s[2]);
      dummy.scale.set(s[3], s[4], s[5]);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
    return inst;
  }, []);

  return <primitive object={mesh} />;
}
