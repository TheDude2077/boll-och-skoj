import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  HelpCircle,
  Map,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEVELS, starCount } from "@/game/levels";
import { setTouchJump, setTouchMove } from "@/game/input";
import { useGame } from "@/game/store";
import { UPGRADES } from "@/game/upgrades";
import { cn } from "@/lib/utils";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-[40px] border border-border bg-surface/92 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StarCount({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-fg">
      <Star className="size-4 fill-accent text-accent" strokeWidth={1.75} />
      <span className="tabular font-medium">{value}</span>
    </div>
  );
}

function Menu() {
  const go = useGame((s) => s.go);
  const startLevel = useGame((s) => s.startLevel);
  const stars = useGame((s) => s.stars);
  const muted = useGame((s) => s.muted);
  const toggleMute = useGame((s) => s.toggleMute);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-end px-4 pb-10 pt-16 sm:justify-center sm:pb-16">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs font-medium tracking-[0.22em] text-muted uppercase">3D marble run</p>
        <h1 className="font-display text-5xl font-medium leading-tight tracking-[-0.03em] text-fg sm:text-6xl">
          Boll & Skoj
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
          Roll the ball. Collect stars. Buy upgrades.
        </p>
      </div>
      <Panel>
        <div className="mb-5 flex items-center justify-between">
          <StarCount value={stars} />
          <button
            type="button"
            onClick={toggleMute}
            className="inline-flex size-11 items-center justify-center rounded-[16px] border border-border text-muted hover:text-fg"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => startLevel(0)} className="w-full">
            <Play className="size-4" />
            Play Kajen
          </Button>
          <Button variant="ghost" onClick={() => go("levels")} className="w-full">
            <Map className="size-4" />
            Levels
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="subtle" size="md" onClick={() => go("shop")}>
              <ShoppingBag className="size-4" />
              Shop
            </Button>
            <Button variant="subtle" size="md" onClick={() => go("howto")}>
              <HelpCircle className="size-4" />
              How to play
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Levels() {
  const go = useGame((s) => s.go);
  const startLevel = useGame((s) => s.startLevel);
  const unlocked = useGame((s) => s.unlockedLevel);
  const best = useGame((s) => s.best);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Panel className="max-w-lg">
        <div className="mb-5 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => go("menu")} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="font-display text-2xl tracking-[-0.02em]">Levels</h2>
            <p className="text-sm text-muted">Finish a course to open the next.</p>
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          {LEVELS.map((level, i) => {
            const locked = i > unlocked;
            const record = best[level.id];
            return (
              <li key={level.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => startLevel(i)}
                  className="flex w-full items-center justify-between rounded-[20px] border border-border bg-elevated px-4 py-4 text-left disabled:opacity-40"
                >
                  <span>
                    <span className="block font-medium">{level.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{level.blurb}</span>
                  </span>
                  <span className="text-right text-xs text-muted">
                    {locked ? "Locked" : record ? formatTime(record.time) : "Open"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function HowTo() {
  const go = useGame((s) => s.go);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Panel>
        <div className="mb-5 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => go("menu")} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="font-display text-2xl tracking-[-0.02em]">How to play</h2>
        </div>
        <ul className="space-y-3 text-sm text-muted">
          <li>
            <span className="font-medium text-fg">WASD</span> or arrows roll the ball. Movement is relative to the camera — A goes left on screen, D goes right.
          </li>
          <li>
            <span className="font-medium text-fg">Space</span> jumps. On a phone, use the stick and the jump button.
          </li>
          <li>
            <span className="font-medium text-fg">Q / E</span> or drag to look around.
          </li>
          <li>Collect cream stars. Reach the green pad. Stay on the track.</li>
          <li>Stars you pick up can be spent on upgrades between runs.</li>
        </ul>
      </Panel>
    </div>
  );
}

function Shop({ back }: { back: () => void }) {
  const stars = useGame((s) => s.stars);
  const upgrades = useGame((s) => s.upgrades);
  const buy = useGame((s) => s.buy);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Panel className="max-w-lg">
        <div className="mb-5 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={back} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h2 className="font-display text-2xl tracking-[-0.02em]">Shop</h2>
            <StarCount value={stars} />
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          {UPGRADES.map((u) => {
            const level = upgrades[u.id] ?? 0;
            const maxed = level >= u.max;
            const cost = u.costs[level] ?? 0;
            const can = !maxed && stars >= cost;
            return (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-elevated px-4 py-3"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted">{u.blurb}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {level}/{u.max}
                  </p>
                </div>
                <Button
                  variant={can ? "primary" : "ghost"}
                  size="sm"
                  disabled={!can && !maxed}
                  onClick={() => buy(u.id)}
                >
                  {maxed ? "Max" : cost}
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function HUD() {
  const runStars = useGame((s) => s.runStars);
  const runTime = useGame((s) => s.runTime);
  const lives = useGame((s) => s.lives);
  const levelIndex = useGame((s) => s.levelIndex);
  const pause = useGame((s) => s.pause);
  const floaters = useGame((s) => s.floaters);
  const level = LEVELS[levelIndex];
  const total = level ? starCount(level) : 0;

  useEffect(() => {
    if (floaters.length === 0) return;
    const last = floaters[floaters.length - 1];
    const id = window.setTimeout(() => {
      useGame.setState((s) => ({ floaters: s.floaters.filter((f) => f.id !== last?.id) }));
    }, 700);
    return () => window.clearTimeout(id);
  }, [floaters]);

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="pointer-events-none flex items-center gap-3 rounded-[20px] border border-border bg-bg/55 px-3 py-2 text-sm">
          <Star className="size-4 fill-accent text-accent" />
          <span className="tabular font-medium">
            {runStars}/{total}
          </span>
        </div>
        <div className="text-center">
          <p className="font-display text-lg tracking-[-0.02em]">{level?.name}</p>
          <p className="tabular text-sm text-muted">{formatTime(runTime)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-[20px] border border-border bg-bg/55 px-3 py-2 text-sm tabular">
            {lives} {lives === 1 ? "life" : "lives"}
          </div>
          <button
            type="button"
            onClick={pause}
            className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-[16px] border border-border bg-bg/70"
            aria-label="Pause"
          >
            <Pause className="size-4" />
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2">
        {floaters.map((f) => (
          <p key={f.id} className="font-display text-xl text-accent">
            {f.text}
          </p>
        ))}
      </div>
      <TouchPad />
    </>
  );
}

function PauseOverlay() {
  const resume = useGame((s) => s.resume);
  const quitToMenu = useGame((s) => s.quitToMenu);
  const startLevel = useGame((s) => s.startLevel);
  const levelIndex = useGame((s) => s.levelIndex);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/55 px-4">
      <Panel>
        <h2 className="mb-1 font-display text-3xl tracking-[-0.03em]">Paused</h2>
        <p className="mb-6 text-sm text-muted">The track waits.</p>
        <div className="flex flex-col gap-3">
          <Button onClick={resume} className="w-full">
            Resume
          </Button>
          <Button variant="ghost" onClick={() => startLevel(levelIndex)} className="w-full">
            <RotateCcw className="size-4" />
            Restart
          </Button>
          <Button variant="ghost" onClick={quitToMenu} className="w-full">
            Menu
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function Result() {
  const result = useGame((s) => s.result);
  const lastRunStars = useGame((s) => s.lastRunStars);
  const lastRunTime = useGame((s) => s.lastRunTime);
  const levelIndex = useGame((s) => s.levelIndex);
  const unlocked = useGame((s) => s.unlockedLevel);
  const startLevel = useGame((s) => s.startLevel);
  const go = useGame((s) => s.go);
  const quitToMenu = useGame((s) => s.quitToMenu);
  const level = LEVELS[levelIndex];
  const win = result === "win";
  const hasNext = win && levelIndex + 1 < LEVELS.length && unlocked >= levelIndex + 1;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-bg/55 px-4">
      <Panel>
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
          {level?.name}
        </p>
        <h2 className="mt-1 font-display text-3xl tracking-[-0.03em]">
          {win ? "Course clear" : "Off the edge"}
        </h2>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <p className="text-muted">Stars</p>
            <p className="tabular text-lg font-medium">{lastRunStars}</p>
          </div>
          <div>
            <p className="text-muted">Time</p>
            <p className="tabular text-lg font-medium">{formatTime(lastRunTime)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {hasNext ? (
            <Button onClick={() => startLevel(levelIndex + 1)} className="w-full">
              Next course
            </Button>
          ) : (
            <Button onClick={() => startLevel(levelIndex)} className="w-full">
              <RotateCcw className="size-4" />
              {win ? "Play again" : "Try again"}
            </Button>
          )}
          <Button variant="subtle" onClick={() => go("shop")} className="w-full">
            <ShoppingBag className="size-4" />
            Spend stars
          </Button>
          <Button variant="ghost" onClick={quitToMenu} className="w-full">
            Menu
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function TouchPad() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
    setTouch(coarse);
  }, []);
  if (!touch) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Stick />
      <button
        type="button"
        className="pointer-events-auto mb-2 inline-flex size-16 items-center justify-center rounded-full border border-border-strong bg-elevated/90 text-xs font-medium tracking-wide"
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
          setTouchJump(true);
        }}
        onPointerUp={() => setTouchJump(false)}
        onPointerCancel={() => setTouchJump(false)}
      >
        Jump
      </button>
    </div>
  );
}

function Stick() {
  const ref = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pid = useRef<number | null>(null);

  function apply(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let x = (clientX - cx) / (r.width * 0.5);
    let y = (cy - clientY) / (r.height * 0.5);
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    setTouchMove(x, y);
    setKnob({ x, y });
  }

  function end() {
    pid.current = null;
    setTouchMove(0, 0);
    setKnob({ x: 0, y: 0 });
  }

  return (
    <div
      ref={ref}
      className="pointer-events-auto relative mb-2 size-[132px] touch-none rounded-full border border-border bg-elevated/70"
      onPointerDown={(e) => {
        e.preventDefault();
        pid.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        apply(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pid.current !== e.pointerId) return;
        apply(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        className="absolute left-1/2 top-1/2 size-14 rounded-full border border-border-strong bg-accent/90"
        style={{ transform: `translate(calc(-50% + ${knob.x * 32}px), calc(-50% + ${-knob.y * 32}px))` }}
      />
    </div>
  );
}

export function GameUI() {
  const screen = useGame((s) => s.screen);
  if (screen === "menu") return <Menu />;
  if (screen === "levels") return <Levels />;
  if (screen === "howto") return <HowTo />;
  if (screen === "shop") return <Shop back={() => useGame.getState().go("menu")} />;
  if (screen === "playing") return <HUD />;
  if (screen === "paused") {
    return (
      <>
        <HUD />
        <PauseOverlay />
      </>
    );
  }
  if (screen === "result") return <Result />;
  return null;
}
