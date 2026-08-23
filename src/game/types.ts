export type Vec3 = [number, number, number];

export type Screen =
  | "menu"
  | "levels"
  | "howto"
  | "shop"
  | "playing"
  | "paused"
  | "result";

export type UpgradeId = "speed" | "jump" | "grip" | "magnet" | "life";

export type PlatformKind = "stone" | "goal" | "check";

export type PlatformDef = {
  pos: Vec3;
  size: Vec3;
  kind?: PlatformKind;
};

export type MoverDef = {
  pos: Vec3;
  size: Vec3;
  axis: "x" | "z";
  amplitude: number;
  speed: number;
  phase?: number;
};

export type SpinnerDef = {
  pos: Vec3;
  length: number;
  speed: number;
};

export type StarDef = { pos: Vec3 };
export type CheckpointDef = { pos: Vec3; radius?: number };

export type LevelDef = {
  id: string;
  name: string;
  blurb: string;
  parTime: number;
  start: Vec3;
  startYaw: number;
  fallY: number;
  platforms: PlatformDef[];
  movers: MoverDef[];
  spinners: SpinnerDef[];
  stars: StarDef[];
  checkpoints: CheckpointDef[];
  goal: { pos: Vec3; size: Vec3 };
};

export type UpgradeDef = {
  id: UpgradeId;
  name: string;
  blurb: string;
  max: number;
  costs: number[];
};

export type BestRun = { time: number; stars: number };

export type SaveData = {
  version: number;
  stars: number;
  upgrades: Record<UpgradeId, number>;
  unlockedLevel: number;
  best: Record<string, BestRun>;
  muted: boolean;
  reducedShake: boolean;
};

export type Floater = {
  id: number;
  text: string;
};
