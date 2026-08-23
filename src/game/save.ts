import type { SaveData } from "./types";
import { EMPTY_UPGRADES } from "./upgrades";

const KEY = "boll-och-skoj-save";
export const SAVE_VERSION = 1;

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  stars: 0,
  upgrades: { ...EMPTY_UPGRADES },
  unlockedLevel: 0,
  best: {},
  muted: false,
  reducedShake: false,
});

function migrate(raw: SaveData): SaveData {
  const base = defaultSave();
  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    upgrades: { ...base.upgrades, ...raw.upgrades },
    best: raw.best ?? {},
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveData;
    return migrate(parsed);
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // private mode / quota — keep playing in memory
  }
}
