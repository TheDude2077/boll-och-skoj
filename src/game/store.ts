import { create } from "zustand";
import type { Floater, SaveData, Screen, UpgradeId } from "./types";
import { LEVELS } from "./levels";
import { loadSave, writeSave } from "./save";
import { statsFrom, UPGRADES } from "./upgrades";
import { runtime } from "./runtime";
import { setMuted, sfxPlay, unlockAudio } from "./audio";

const save = typeof window !== "undefined" ? loadSave() : null;

type ResultKind = "win" | "fail" | null;

type GameState = {
  screen: Screen;
  levelIndex: number;
  stars: number;
  upgrades: SaveData["upgrades"];
  unlockedLevel: number;
  best: SaveData["best"];
  muted: boolean;
  reducedShake: boolean;
  runStars: number;
  runTime: number;
  lastRunStars: number;
  lastRunTime: number;
  lives: number;
  result: ResultKind;
  floaters: Floater[];
  runId: number;
  startLevel: (index: number) => void;
  pause: () => void;
  resume: () => void;
  quitToMenu: () => void;
  go: (screen: Screen) => void;
  collectStar: () => void;
  tickRun: (dt: number) => void;
  fall: () => void;
  win: () => void;
  buy: (id: UpgradeId) => boolean;
  toggleMute: () => void;
  toggleShake: () => void;
  persist: () => void;
  stats: () => ReturnType<typeof statsFrom>;
};

let floaterSeq = 1;

function persistFrom(
  state: Pick<GameState, "stars" | "upgrades" | "unlockedLevel" | "best" | "muted" | "reducedShake">,
) {
  writeSave({
    version: 1,
    stars: state.stars,
    upgrades: state.upgrades,
    unlockedLevel: state.unlockedLevel,
    best: state.best,
    muted: state.muted,
    reducedShake: state.reducedShake,
  });
}

if (save) setMuted(save.muted);

export const useGame = create<GameState>((set, get) => ({
  screen: "menu",
  levelIndex: 0,
  stars: save?.stars ?? 0,
  upgrades: save?.upgrades ?? { speed: 0, jump: 0, grip: 0, magnet: 0, life: 0 },
  unlockedLevel: save?.unlockedLevel ?? 0,
  best: save?.best ?? {},
  muted: save?.muted ?? false,
  reducedShake: save?.reducedShake ?? false,
  runStars: 0,
  runTime: 0,
  lastRunStars: 0,
  lastRunTime: 0,
  lives: 1,
  result: null,
  floaters: [],
  runId: 0,

  stats: () => statsFrom(get().upgrades),

  persist: () => persistFrom(get()),

  go: (screen) => {
    unlockAudio();
    sfxPlay.click();
    set({ screen });
  },

  startLevel: (index) => {
    unlockAudio();
    sfxPlay.click();
    const st = statsFrom(get().upgrades);
    const level = LEVELS[index];
    runtime.resetCam = true;
    runtime.stunnedUntil = 0;
    runtime.trauma = 0;
    runtime.won = false;
    runtime.camYaw = level?.startYaw ?? 0;
    runtime.yaw = level?.startYaw ?? 0;
    if (level) {
      runtime.spawn = { x: level.start[0], y: level.start[1], z: level.start[2] };
      runtime.fallY = level.fallY;
    }
    set((s) => ({
      screen: "playing",
      levelIndex: index,
      runStars: 0,
      runTime: 0,
      lives: 1 + st.extraLives,
      result: null,
      floaters: [],
      runId: s.runId + 1,
    }));
  },

  pause: () => {
    if (get().screen === "playing") set({ screen: "paused" });
  },

  resume: () => {
    unlockAudio();
    if (get().screen === "paused") set({ screen: "playing" });
  },

  quitToMenu: () => {
    const { runStars, stars } = get();
    const next = stars + runStars;
    set({ screen: "menu", runStars: 0, result: null, stars: next });
    persistFrom({ ...get(), stars: next });
  },

  collectStar: () => {
    sfxPlay.collect();
    set((s) => ({
      runStars: s.runStars + 1,
      floaters: [...s.floaters.slice(-6), { id: floaterSeq++, text: "+1" }],
    }));
  },

  tickRun: (dt) => {
    if (get().screen !== "playing") return;
    set((s) => ({ runTime: s.runTime + dt }));
  },

  fall: () => {
    const state = get();
    if (state.screen !== "playing") return;
    sfxPlay.fall();
    const lives = state.lives - 1;
    if (lives <= 0) {
      const stars = state.stars + state.runStars;
      set({
        lives: 0,
        result: "fail",
        screen: "result",
        stars,
        lastRunStars: state.runStars,
        lastRunTime: state.runTime,
        runStars: 0,
      });
      persistFrom({ ...get(), stars });
      return;
    }
    runtime.stunnedUntil = runtime.now + 0.55;
    runtime.resetCam = true;
    set({ lives });
  },

  win: () => {
    const state = get();
    if (state.screen !== "playing" || runtime.won) return;
    runtime.won = true;
    sfxPlay.win();
    const level = LEVELS[state.levelIndex];
    const stars = state.stars + state.runStars;
    const best = { ...state.best };
    if (level) {
      const prev = best[level.id];
      if (!prev || state.runTime < prev.time) {
        best[level.id] = { time: state.runTime, stars: state.runStars };
      } else if (state.runStars > prev.stars) {
        best[level.id] = { time: prev.time, stars: state.runStars };
      }
    }
    const unlockedLevel = Math.max(state.unlockedLevel, state.levelIndex + 1);
    set({
      screen: "result",
      result: "win",
      stars,
      lastRunStars: state.runStars,
      lastRunTime: state.runTime,
      runStars: 0,
      best,
      unlockedLevel,
    });
    persistFrom({ ...get(), stars, best, unlockedLevel });
  },

  buy: (id) => {
    const state = get();
    const def = UPGRADES.find((u) => u.id === id);
    if (!def) return false;
    const level = state.upgrades[id] ?? 0;
    if (level >= def.max) return false;
    const cost = def.costs[level] ?? Infinity;
    if (state.stars < cost) return false;
    sfxPlay.buy();
    const upgrades = { ...state.upgrades, [id]: level + 1 };
    const stars = state.stars - cost;
    set({ upgrades, stars });
    persistFrom({ ...get(), upgrades, stars });
    return true;
  },

  toggleMute: () => {
    const muted = !get().muted;
    setMuted(muted);
    set({ muted });
    persistFrom(get());
  },

  toggleShake: () => {
    set({ reducedShake: !get().reducedShake });
    persistFrom(get());
  },
}));

if (typeof window !== "undefined") {
  const flush = () => useGame.getState().persist();
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
