export const BALL_RADIUS = 0.42;

export const runtime = {
  ball: { x: 0, y: 1, z: 0 },
  vel: { x: 0, y: 0, z: 0 },
  speed: 0,
  yaw: 0,
  camYaw: 0,
  grounded: false,
  trauma: 0,
  resetCam: true,
  stunnedUntil: 0,
  now: 0,
  spawn: { x: 0, y: 1.4, z: 3 },
  fallY: -8,
  won: false,
};

export function addTrauma(amount: number) {
  runtime.trauma = Math.min(1, runtime.trauma + amount);
}

export function headingFromVelocity(vx: number, vz: number, fallback: number) {
  if (vx * vx + vz * vz < 0.04) return fallback;
  return Math.atan2(-vx, -vz);
}
