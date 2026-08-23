const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyQ",
  "KeyE",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Escape",
]);

const keys = new Set<string>();
let override: string[] | null = null;
let touchX = 0;
let touchY = 0;
let touchJump = false;
let jumpWasDown = false;
let pauseWasDown = false;
let orbitDrag = 0;
let disposed = true;

function radialDeadzone(x: number, y: number, dz = 0.18) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

function onKeyDown(e: KeyboardEvent) {
  if (GAME_CODES.has(e.code)) e.preventDefault();
  keys.add(e.code);
}

function onKeyUp(e: KeyboardEvent) {
  keys.delete(e.code);
}

function onBlur() {
  keys.clear();
  touchJump = false;
}

export function initInput() {
  if (!disposed) return;
  disposed = false;
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onBlur);
}

export function disposeInput() {
  if (disposed) return;
  disposed = true;
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  document.removeEventListener("visibilitychange", onBlur);
  keys.clear();
}

export function setTouchMove(x: number, y: number) {
  const v = radialDeadzone(x, y, 0.12);
  touchX = Math.max(-1, Math.min(1, v.x));
  touchY = Math.max(-1, Math.min(1, v.y));
}

export function setTouchJump(down: boolean) {
  touchJump = down;
}

export function addOrbitDrag(dx: number) {
  orbitDrag += dx;
}

export function debugSetKeys(codes: string[] | null) {
  override = codes;
}

export type Actions = {
  moveX: number;
  moveY: number;
  jump: boolean;
  jumpPressed: boolean;
  pausePressed: boolean;
  orbit: number;
};

export function sampleInput(): Actions {
  const src = override ? new Set(override) : keys;

  let moveX = 0;
  let moveY = 0;
  if (src.has("KeyA") || src.has("ArrowLeft")) moveX -= 1;
  if (src.has("KeyD") || src.has("ArrowRight")) moveX += 1;
  if (src.has("KeyW") || src.has("ArrowUp")) moveY += 1;
  if (src.has("KeyS") || src.has("ArrowDown")) moveY -= 1;

  if (!override) {
    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
    if (pads) {
      for (const pad of pads) {
        if (!pad || pad.mapping !== "standard") continue;
        const stick = radialDeadzone(pad.axes[0] ?? 0, -(pad.axes[1] ?? 0));
        moveX += stick.x;
        moveY += stick.y;
        if (pad.buttons[0]?.pressed) touchJump = true;
        if (pad.buttons[12]?.pressed) moveY += 1;
        if (pad.buttons[13]?.pressed) moveY -= 1;
        if (pad.buttons[14]?.pressed) moveX -= 1;
        if (pad.buttons[15]?.pressed) moveX += 1;
      }
    }
    moveX += touchX;
    moveY += touchY;
  }

  moveX = Math.max(-1, Math.min(1, moveX));
  moveY = Math.max(-1, Math.min(1, moveY));

  const jumpDown =
    src.has("Space") || touchJump || Boolean(override?.includes("Space"));
  const jumpPressed = jumpDown && !jumpWasDown;
  jumpWasDown = jumpDown;

  const pauseDown = src.has("Escape");
  const pausePressed = pauseDown && !pauseWasDown;
  pauseWasDown = pauseDown;

  let orbit = 0;
  if (src.has("KeyQ")) orbit -= 1;
  if (src.has("KeyE")) orbit += 1;
  orbit += orbitDrag;
  orbitDrag = 0;

  return { moveX, moveY, jump: jumpDown, jumpPressed, pausePressed, orbit };
}
