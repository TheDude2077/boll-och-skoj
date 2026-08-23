import type { LevelDef, PlatformDef, StarDef, Vec3 } from "./types";

const stone = (x: number, y: number, z: number, w: number, h: number, d: number): PlatformDef => ({
  pos: [x, y, z],
  size: [w, h, d],
  kind: "stone",
});

const star = (x: number, y: number, z: number): StarDef => ({ pos: [x, y, z] });

export const LEVELS: LevelDef[] = [
  {
    id: "kajen",
    name: "Kajen",
    blurb: "Wide docks, a moving barge, one slow spinner.",
    parTime: 55,
    start: [0, 1.4, 3],
    startYaw: 0,
    fallY: -8,
    platforms: [
      stone(0, 0, 0, 12, 0.55, 12),
      stone(0, 0, -14, 7.2, 0.55, 16),
      stone(5, 0, -28, 14, 0.55, 8),
      stone(10, 0, -40, 4.4, 0.55, 16),
      stone(10, 0, -62, 8.5, 0.55, 10),
      stone(10, 1.15, -74, 6.2, 0.55, 10),
      stone(10, 2.3, -86, 9, 0.55, 12),
      stone(1.5, 1.15, -98, 9, 0.55, 8),
      stone(-4, 0, -110, 6.5, 0.55, 14),
    ],
    movers: [{ pos: [10, 0, -52], size: [4.4, 0.5, 4.4], axis: "x", amplitude: 4.2, speed: 0.85 }],
    spinners: [{ pos: [10, 3.15, -86], length: 6.4, speed: 1.15 }],
    stars: [
      star(0, 1.2, -8),
      star(-1.6, 1.2, -16),
      star(1.6, 1.2, -20),
      star(8, 1.2, -28),
      star(10, 1.2, -38),
      star(10, 1.2, -44),
      star(10, 1.3, -52),
      star(10, 1.2, -62),
      star(10, 2.4, -74),
      star(12.2, 3.5, -86),
      star(7.8, 3.5, -86),
      star(-4, 1.2, -108),
    ],
    checkpoints: [
      { pos: [0, 1.2, 0] },
      { pos: [10, 1.2, -62] },
      { pos: [10, 3.5, -86] },
    ],
    goal: { pos: [-4, 0, -122], size: [12, 0.6, 12] },
  },
  {
    id: "broarna",
    name: "Broarna",
    blurb: "Narrow beams, two barges, a real jump.",
    parTime: 70,
    start: [0, 1.4, 3],
    startYaw: 0,
    fallY: -10,
    platforms: [
      stone(0, 0, 0, 9, 0.5, 9),
      stone(0, 0, -12, 3.4, 0.5, 14),
      stone(-6, 0, -24, 12, 0.5, 4.2),
      stone(-12, 0, -36, 3.2, 0.5, 16),
      stone(-12, 0, -58, 7, 0.5, 8),
      stone(-12, 1.4, -72, 5.2, 0.5, 8),
      stone(-4, 1.4, -82, 10, 0.5, 3.4),
      stone(6, 0, -94, 6, 0.5, 10),
    ],
    movers: [
      { pos: [-12, 0, -48], size: [3.4, 0.45, 4], axis: "x", amplitude: 3.6, speed: 1.1 },
      { pos: [1, 1.4, -82], size: [4.2, 0.45, 3.2], axis: "z", amplitude: 2.4, speed: 1.05, phase: 0.6 },
    ],
    spinners: [
      { pos: [-12, 1.2, -58], length: 5.2, speed: -1.4 },
      { pos: [6, 1.2, -94], length: 5.6, speed: 1.6 },
    ],
    stars: [
      star(0, 1.15, -10),
      star(-4, 1.15, -24),
      star(-12, 1.15, -34),
      star(-12, 1.2, -48),
      star(-12, 1.15, -58),
      star(-12, 2.55, -72),
      star(-4, 2.55, -82),
      star(6, 1.15, -90),
      star(6, 1.15, -98),
      star(8, 1.15, -108),
    ],
    checkpoints: [
      { pos: [0, 1.2, 0] },
      { pos: [-12, 1.2, -58] },
      { pos: [6, 1.2, -94] },
    ],
    goal: { pos: [6, 0, -110], size: [10, 0.55, 10] },
  },
  {
    id: "fyren",
    name: "Fyren",
    blurb: "High wind, fast arms, little room to miss.",
    parTime: 80,
    start: [0, 1.5, 2],
    startYaw: 0,
    fallY: -12,
    platforms: [
      stone(0, 0, 0, 8, 0.5, 8),
      stone(0, 0.8, -11, 3, 0.5, 10),
      stone(0, 1.6, -22, 6, 0.5, 6),
      stone(8, 1.6, -32, 10, 0.5, 3.2),
      stone(14, 2.4, -42, 3.2, 0.5, 12),
      stone(14, 3.2, -58, 8, 0.5, 8),
      stone(6, 2.4, -70, 3.2, 0.5, 10),
      stone(-2, 1.6, -80, 8, 0.5, 6),
      stone(-2, 0.6, -92, 3.4, 0.5, 12),
    ],
    movers: [
      { pos: [8, 1.6, -32], size: [4, 0.45, 3], axis: "x", amplitude: 3.2, speed: 1.25 },
      { pos: [6, 2.4, -70], size: [3.2, 0.45, 3.4], axis: "x", amplitude: 3.8, speed: 1.35 },
    ],
    spinners: [
      { pos: [0, 2.6, -22], length: 4.8, speed: 1.8 },
      { pos: [14, 4.2, -58], length: 6.2, speed: -2.1 },
      { pos: [-2, 2.6, -80], length: 5.4, speed: 1.9 },
    ],
    stars: [
      star(0, 2.0, -11),
      star(0, 2.8, -22),
      star(8, 2.8, -32),
      star(14, 3.6, -42),
      star(14, 4.4, -54),
      star(16.5, 4.4, -58),
      star(11.5, 4.4, -58),
      star(6, 3.6, -70),
      star(-2, 2.8, -80),
      star(-2, 1.8, -92),
      star(-2, 1.8, -104),
    ],
    checkpoints: [
      { pos: [0, 1.3, 0] },
      { pos: [14, 4.4, -58] },
      { pos: [-2, 2.8, -80] },
    ],
    goal: { pos: [-2, 0.6, -106], size: [10, 0.55, 10] },
  },
];

export function levelByIndex(i: number): LevelDef {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, i))]!;
}

export function starCount(level: LevelDef) {
  return level.stars.length;
}

export const START_LOOK: Vec3 = [0, 3.4, 10];
