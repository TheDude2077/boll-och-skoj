import type { UpgradeDef, UpgradeId } from "./types";

export const UPGRADES: UpgradeDef[] = [
  {
    id: "speed",
    name: "Swift core",
    blurb: "Higher top speed and snappier acceleration.",
    max: 3,
    costs: [8, 16, 28],
  },
  {
    id: "jump",
    name: "Spring",
    blurb: "Jump higher to clear wider gaps.",
    max: 3,
    costs: [10, 18, 30],
  },
  {
    id: "grip",
    name: "Grip",
    blurb: "Tighter steering and less sliding.",
    max: 3,
    costs: [8, 14, 24],
  },
  {
    id: "magnet",
    name: "Star pull",
    blurb: "Nearby stars drift toward you.",
    max: 2,
    costs: [12, 22],
  },
  {
    id: "life",
    name: "Spare",
    blurb: "Start each run with extra lives.",
    max: 2,
    costs: [15, 30],
  },
];

export const EMPTY_UPGRADES: Record<UpgradeId, number> = {
  speed: 0,
  jump: 0,
  grip: 0,
  magnet: 0,
  life: 0,
};

export function statsFrom(upgrades: Record<UpgradeId, number>) {
  const speed = upgrades.speed ?? 0;
  const jump = upgrades.jump ?? 0;
  const grip = upgrades.grip ?? 0;
  const magnet = upgrades.magnet ?? 0;
  const life = upgrades.life ?? 0;
  return {
    maxSpeed: 9 + speed * 2.1,
    accel: 28 + speed * 8,
    jumpImpulse: 5.4 + jump * 1.15,
    linearDamping: 0.32 + grip * 0.22,
    angularDamping: 0.22 + grip * 0.12,
    airControl: 0.28 + grip * 0.08,
    magnetRadius: magnet * 3.8,
    extraLives: life,
  };
}
