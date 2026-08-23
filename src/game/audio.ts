let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC({ latencyHint: "interactive" });
  master = ctx.createGain();
  sfx = ctx.createGain();
  sfx.connect(master);
  master.connect(ctx.destination);
  master.gain.value = muted ? 0 : 0.7;
  sfx.gain.value = 0.9;
  return ctx;
}

export function unlockAudio() {
  const c = ensure();
  if (c.state === "suspended") void c.resume();
}

export function setMuted(value: boolean) {
  muted = value;
  if (master && ctx) {
    master.gain.setTargetAtTime(value ? 0 : 0.7, ctx.currentTime, 0.02);
  }
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.12,
  slide?: number,
) {
  if (muted) return;
  const c = ensure();
  if (c.state === "suspended") return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), c.currentTime + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g);
  g.connect(sfx!);
  o.start();
  o.stop(c.currentTime + dur + 0.03);
}

export const sfxPlay = {
  click() {
    tone(880, 0.06, "triangle", 0.05);
  },
  jump() {
    tone(240, 0.14, "sine", 0.1, 140);
  },
  land() {
    tone(90, 0.08, "triangle", 0.08);
  },
  collect() {
    tone(740, 0.12, "sine", 0.09);
    tone(1108, 0.16, "triangle", 0.05);
  },
  hit() {
    tone(140, 0.18, "sawtooth", 0.07, 70);
  },
  fall() {
    tone(280, 0.45, "sine", 0.1, 60);
  },
  win() {
    tone(523, 0.18, "sine", 0.08);
    window.setTimeout(() => tone(659, 0.18, "sine", 0.08), 90);
    window.setTimeout(() => tone(784, 0.28, "sine", 0.1), 180);
  },
  buy() {
    tone(660, 0.1, "triangle", 0.07);
    tone(990, 0.16, "sine", 0.05);
  },
};
