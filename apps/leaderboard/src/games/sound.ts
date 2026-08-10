// ============================================================================
//  Sound manager.
//
//  Muted by default (a viewer arriving from a live stream already has audio
//  playing) and the preference is persisted. Every cue is synthesised with the
//  WebAudio oscillator API — there are no audio files in this repo, so nothing
//  here can be a licensing problem.
// ============================================================================

export type SoundCue = "click" | "bet" | "reveal" | "win" | "bigwin" | "lose" | "cashout";

const STORAGE_KEY = "yr.games.sound";

interface CueSpec {
  /** Frequency ramp, Hz. */
  from: number;
  to: number;
  durationMs: number;
  type: OscillatorType;
  gain: number;
}

const CUES: Record<SoundCue, CueSpec> = {
  click: { from: 440, to: 440, durationMs: 40, type: "square", gain: 0.03 },
  bet: { from: 320, to: 520, durationMs: 110, type: "triangle", gain: 0.05 },
  reveal: { from: 620, to: 760, durationMs: 90, type: "sine", gain: 0.05 },
  win: { from: 520, to: 880, durationMs: 260, type: "sine", gain: 0.07 },
  bigwin: { from: 440, to: 1320, durationMs: 520, type: "sawtooth", gain: 0.06 },
  lose: { from: 300, to: 140, durationMs: 260, type: "sine", gain: 0.05 },
  cashout: { from: 660, to: 990, durationMs: 220, type: "triangle", gain: 0.06 },
};

type AudioContextCtor = new () => AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  const g = globalThis as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return g.AudioContext || g.webkitAudioContext || null;
}

export class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = true;
  private readonly storage: Storage | null;

  constructor(storage: Storage | null = safeStorage()) {
    this.storage = storage;
    // Default is muted; only an explicit stored "on" unmutes.
    this.muted = this.storage?.getItem(STORAGE_KEY) !== "on";
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      this.storage?.setItem(STORAGE_KEY, muted ? "off" : "on");
    } catch {
      // Private-mode storage denial must never break audio or the game.
    }
  }

  toggle(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /** Fire and forget; silently no-ops when muted or WebAudio is unavailable. */
  play(cue: SoundCue): void {
    if (this.muted) return;
    const spec = CUES[cue];
    if (!spec) return;
    const ctx = this.context();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.from, now);
      osc.frequency.linearRampToValueAtTime(spec.to, now + spec.durationMs / 1000);
      gain.gain.setValueAtTime(spec.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.durationMs / 1000);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + spec.durationMs / 1000);
    } catch {
      // An autoplay-policy rejection is not worth surfacing to the viewer.
    }
  }

  private context(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = audioContextCtor();
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      this.ctx = null;
    }
    return this.ctx;
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export const sound = new SoundManager();
