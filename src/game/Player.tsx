import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BallCollider, RigidBody, useRapier } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { debugSetKeys, sampleInput } from "./input";
import { addTrauma, BALL_RADIUS, headingFromVelocity, runtime } from "./runtime";
import { sfxPlay } from "./audio";
import { useGame } from "./store";
import { levelByIndex } from "./levels";

const _impulse = { x: 0, y: 0, z: 0 };

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const { world, rapier } = useRapier();
  const lastGrounded = useRef(0);
  const jumpBuffer = useRef(0);
  const wasGrounded = useRef(false);
  const landLock = useRef(0);
  const levelIndex = useGame((s) => s.levelIndex);
  const runId = useGame((s) => s.runId);
  const level = levelByIndex(levelIndex);

  useEffect(() => {
    runtime.spawn = { x: level.start[0], y: level.start[1], z: level.start[2] };
    runtime.fallY = level.fallY;
    runtime.won = false;
    runtime.resetCam = true;
    const b = body.current;
    if (b) {
      b.setTranslation(runtime.spawn, true);
      b.setLinvel({ x: 0, y: 0, z: 0 }, true);
      b.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    window.__controlsTest = {
      getYaw: () => runtime.yaw,
      getSpeed: () => runtime.speed,
      setKeys: (codes) => debugSetKeys(codes),
      setSteer: (v) => {
        const codes = ["KeyW"];
        if (v > 0.2) codes.push("KeyA");
        if (v < -0.2) codes.push("KeyD");
        debugSetKeys(codes);
      },
    };
    return () => {
      debugSetKeys(null);
      delete window.__controlsTest;
    };
  }, [runId, level]);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.08);
    runtime.now += d;

    const screen = useGame.getState().screen;
    const actions = sampleInput();
    runtime.camYaw += actions.orbit * 1.7 * d;

    if (actions.pausePressed) {
      if (screen === "playing") useGame.getState().pause();
      else if (screen === "paused") useGame.getState().resume();
    }

    const b = body.current;
    if (!b || screen !== "playing") return;

    useGame.getState().tickRun(d);

    const t = b.translation();
    const lv = b.linvel();
    runtime.ball.x = t.x;
    runtime.ball.y = t.y;
    runtime.ball.z = t.z;
    runtime.vel.x = lv.x;
    runtime.vel.y = lv.y;
    runtime.vel.z = lv.z;
    runtime.speed = Math.hypot(lv.x, lv.z);
    runtime.yaw = headingFromVelocity(lv.x, lv.z, runtime.camYaw);

    let grounded = false;
    try {
      const ray = new rapier.Ray({ x: t.x, y: t.y, z: t.z }, { x: 0, y: -1, z: 0 });
      const hit = world.castRay(ray, BALL_RADIUS + 0.16, true, undefined, undefined, undefined, b);
      grounded = hit !== null && hit.timeOfImpact < BALL_RADIUS + 0.14;
    } catch {
      grounded = lv.y > -0.4 && lv.y < 0.4 && t.y < runtime.spawn.y + 0.8;
    }
    runtime.grounded = grounded;
    if (grounded) lastGrounded.current = runtime.now;
    if (grounded && !wasGrounded.current && runtime.now > landLock.current) {
      sfxPlay.land();
      addTrauma(0.12);
      landLock.current = runtime.now + 0.2;
    }
    wasGrounded.current = grounded;

    if (actions.jumpPressed) jumpBuffer.current = runtime.now + 0.12;

    const stats = useGame.getState().stats();
    b.setLinearDamping(0.12);
    b.setAngularDamping(stats.angularDamping);
    const stunned = runtime.now < runtime.stunnedUntil;

    if (!stunned) {
      const wishX =
        -Math.sin(runtime.camYaw) * actions.moveY + Math.cos(runtime.camYaw) * actions.moveX;
      const wishZ =
        -Math.cos(runtime.camYaw) * actions.moveY + -Math.sin(runtime.camYaw) * actions.moveX;
      const wishLen = Math.hypot(wishX, wishZ);
      const nx = wishLen > 1 ? wishX / wishLen : wishX;
      const nz = wishLen > 1 ? wishZ / wishLen : wishZ;
      const control = grounded ? 1 : stats.airControl;
      const rate = (stats.accel / Math.max(4, stats.maxSpeed)) * control;
      const k = 1 - Math.exp(-rate * d);
      const tvx = nx * stats.maxSpeed;
      const tvz = nz * stats.maxSpeed;
      const nlvx = lv.x + (tvx - lv.x) * k;
      const nlvz = lv.z + (tvz - lv.z) * k;
      b.setLinvel({ x: nlvx, y: lv.y, z: nlvz }, true);
      runtime.speed = Math.hypot(nlvx, nlvz);
      runtime.yaw = headingFromVelocity(nlvx, nlvz, runtime.camYaw);

      const canJump = grounded || runtime.now - lastGrounded.current < 0.1;
      if (canJump && jumpBuffer.current > runtime.now) {
        jumpBuffer.current = 0;
        const v = b.linvel();
        b.setLinvel({ x: v.x, y: Math.max(v.y, 0), z: v.z }, true);
        _impulse.x = 0;
        _impulse.y = stats.jumpImpulse * (b.mass() || 1.15);
        _impulse.z = 0;
        b.applyImpulse(_impulse, true);
        sfxPlay.jump();
      }
    }

    if (t.y < runtime.fallY && runtime.now > runtime.stunnedUntil) {
      useGame.getState().fall();
      if (useGame.getState().screen === "playing") {
        b.setTranslation(runtime.spawn, true);
        b.setLinvel({ x: 0, y: 0, z: 0 }, true);
        b.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
    }

    if (mesh.current) {
      const stretch = 1 + Math.min(0.16, Math.abs(lv.y) * 0.035);
      const squash = 1 / Math.sqrt(stretch);
      mesh.current.scale.set(squash, stretch, squash);
    }
  });

  return (
    <RigidBody
      ref={body}
      name="player"
      position={level.start}
      colliders={false}
      friction={1.2}
      restitution={0.14}
      linearDamping={0.12}
      angularDamping={0.28}
      ccd
      canSleep={false}
    >
      <BallCollider args={[BALL_RADIUS]} restitution={0.14} friction={1.2} />
      <mesh ref={mesh}>
        <sphereGeometry args={[BALL_RADIUS, 20, 16]} />
        <meshStandardMaterial color="#d45a4a" roughness={0.28} metalness={0.08} />
      </mesh>
    </RigidBody>
  );
}

export function FollowCamera() {
  const { camera } = useThree();
  const reduced = useGame((s) => s.reducedShake);
  const follow = 7.4;
  const height = 3.55;
  const blob = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.08);

    if (runtime.speed > 0.7) {
      const diff = Math.atan2(
        Math.sin(runtime.yaw - runtime.camYaw),
        Math.cos(runtime.yaw - runtime.camYaw),
      );
      runtime.camYaw += diff * (1 - Math.exp(-2.6 * d));
    }

    const fx = -Math.sin(runtime.camYaw);
    const fz = -Math.cos(runtime.camYaw);
    const desiredX = runtime.ball.x - fx * follow;
    const desiredY = runtime.ball.y + height;
    const desiredZ = runtime.ball.z - fz * follow;

    if (runtime.resetCam) {
      camera.position.set(desiredX, desiredY, desiredZ);
      runtime.resetCam = false;
    } else {
      const k = 1 - Math.exp(-5.4 * d);
      camera.position.x += (desiredX - camera.position.x) * k;
      camera.position.y += (desiredY - camera.position.y) * k;
      camera.position.z += (desiredZ - camera.position.z) * k;
    }

    runtime.trauma = Math.max(0, runtime.trauma - d * 1.7);
    const shake = reduced ? 0 : runtime.trauma * runtime.trauma;
    const ox = (Math.random() - 0.5) * shake * 0.32;
    const oy = (Math.random() - 0.5) * shake * 0.22;
    camera.lookAt(runtime.ball.x + ox, runtime.ball.y + 0.4 + oy, runtime.ball.z);

    if (blob.current) {
      blob.current.position.set(runtime.ball.x, runtime.ball.y - BALL_RADIUS + 0.02, runtime.ball.z);
    }
  });

  return (
    <mesh ref={blob} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <circleGeometry args={[0.5, 12]} />
      <meshBasicMaterial color="#0b0c10" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}
