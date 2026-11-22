// Studio-Mastered Procedural Web Audio API Sound Engine (100% offline, zero external files)
// Master bus: Master Gain (0.52) -> DynamicsCompressor (-16 dB, 4:1) -> Destination
// Spatial stereo panning (StereoPannerNode) + smooth exponential ADSR envelopes
//
// Chapter-standardized acoustic design:
//   intro -> warm glass/chime pad
//   ch1   -> architectural blueprint kalimba plucks
//   ch2   -> algorithmic mechanics (search sonar, insert pop, physical split thud, stereo borrow, merge fold)
//   ch3   -> tactile code studio (3-layer realistic mechanical keyboard thock + spacebar + Enter + terminal)
//   ch4   -> precision lab & hardware (silicon ticks, disk-head seek, probability bells)
//   ch5   -> storage engine & sequential tracks (B+ stereo range scan, copy-up echo, XFS alloc/coalesce)

export type ChapterSoundTheme = 'intro' | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5';

export function getChapterThemeForSlide(slideNumber: number): ChapterSoundTheme {
  if (slideNumber <= 2) return 'intro';
  if (slideNumber <= 5) return 'ch1';
  if (slideNumber <= 12) return 'ch2';
  if (slideNumber <= 17) return 'ch3';
  if (slideNumber <= 22) return 'ch4';
  return 'ch5';
}

export const CHAPTER_THEME_LABELS: Record<ChapterSoundTheme, string> = {
  intro: 'Mở đầu (Glass Chime)',
  ch1: 'Chương 1 · Lý thuyết (Blueprint Pluck)',
  ch2: 'Chương 2 · Phép toán (Algorithmic)',
  ch3: 'Chương 3 · Python (Mechanical Studio)',
  ch4: 'Chương 4 · Độ phức tạp (Lab & I/O)',
  ch5: 'Chương 5 · B+/B*/XFS (Storage Tracks)',
};

const STORAGE_KEY = 'btree-sound-on';
const MASTER_VOL = 0.52;

function loadSavedAudioPref(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === '0' || raw === 'false') return false;
  } catch {
    // ignore storage errors
  }
  return true;
}

function saveAudioPref(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  } catch {
    // ignore storage errors
  }
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = loadSavedAudioPref();
  private unlocked = false;
  private currentTheme: ChapterSoundTheme = 'intro';
  private lastKeystrokeAt = 0;
  private lastHoverAt = 0;
  private onPulseCallback: (() => void) | null = null;

  public setOnPulse(cb: (() => void) | null): void {
    this.onPulseCallback = cb;
  }

  public setChapterTheme(theme: ChapterSoundTheme): void {
    this.currentTheme = theme;
  }

  public getChapterTheme(): ChapterSoundTheme {
    return this.currentTheme;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      try {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.value = this.enabled ? MASTER_VOL : 0;

        // Broadcast-style DynamicsCompressor keeps every cue punchy, clear & clip-free
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.knee.value = 12;
        comp.ratio.value = 4;
        comp.attack.value = 0.004;
        comp.release.value = 0.14;

        master.connect(comp);
        comp.connect(ctx.destination);

        // 1.5s white noise buffer for rich, non-repeating air whooshes & keystrokes
        const len = Math.floor(ctx.sampleRate * 1.5);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        this.ctx = ctx;
        this.master = master;
        this.noiseBuffer = buf;
      } catch {
        return null;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private isReady(): boolean {
    if (!this.enabled || !this.unlocked) return false;
    const ctx = this.ensureContext();
    return Boolean(ctx && this.master);
  }

  private notifyPulse(): void {
    this.onPulseCallback?.();
  }

  public unlock(): void {
    this.unlocked = true;
    this.ensureContext();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(on: boolean): void {
    this.enabled = on;
    saveAudioPref(on);
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(on ? MASTER_VOL : 0, this.ctx.currentTime, 0.025);
    }
    if (on) {
      this.unlocked = true;
      this.ensureContext();
      this.playClick();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  private connectOutput(
    ctx: AudioContext,
    source: AudioNode,
    now: number,
    duration: number,
    pan?: number,
    endPan?: number,
  ): void {
    const target = this.master ?? ctx.destination;
    if (pan !== undefined && typeof ctx.createStereoPanner === 'function') {
      const p = ctx.createStereoPanner();
      p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      if (endPan !== undefined && endPan !== pan) {
        p.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, endPan)), now + duration);
      }
      source.connect(p);
      p.connect(target);
    } else {
      source.connect(target);
    }
  }

  private playTone(opts: {
    freq: number;
    endFreq?: number;
    glide?: number;
    duration: number;
    type?: OscillatorType;
    gain: number;
    delay?: number;
    lpFreq?: number;
    attack?: number;
    pan?: number;
    endPan?: number;
  }): void {
    if (!this.isReady() || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + (opts.delay ?? 0);
    const attack = opts.attack ?? 0.005;
    const decay = opts.duration;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(Math.max(24, opts.freq), now);
    if (opts.endFreq && opts.endFreq !== opts.freq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(24, opts.endFreq),
        now + (opts.glide ?? decay),
      );
    }

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, opts.gain), now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    if (opts.lpFreq) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(opts.lpFreq, now);
      osc.connect(lp);
      lp.connect(g);
    } else {
      osc.connect(g);
    }

    this.connectOutput(ctx, g, now, attack + decay, opts.pan, opts.endPan);
    osc.start(now);
    osc.stop(now + attack + decay + 0.05);
  }

  private playNoise(opts: {
    duration: number;
    filterType: BiquadFilterType;
    freq: number;
    midFreq?: number;
    endFreq?: number;
    q?: number;
    gain: number;
    attack?: number;
    delay?: number;
    pan?: number;
    endPan?: number;
  }): void {
    if (!this.isReady() || !this.ctx || !this.noiseBuffer) return;
    const ctx = this.ctx;
    const now = ctx.currentTime + (opts.delay ?? 0);
    const attack = opts.attack ?? 0.008;
    const decay = opts.duration;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const f = ctx.createBiquadFilter();
    f.type = opts.filterType;
    f.Q.setValueAtTime(opts.q ?? 1, now);
    f.frequency.setValueAtTime(opts.freq, now);
    if (opts.midFreq && opts.endFreq) {
      f.frequency.exponentialRampToValueAtTime(opts.midFreq, now + decay * 0.42);
      f.frequency.exponentialRampToValueAtTime(opts.endFreq, now + decay);
    } else if (opts.endFreq && opts.endFreq !== opts.freq) {
      f.frequency.exponentialRampToValueAtTime(opts.endFreq, now + decay);
    }

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, opts.gain), now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    src.connect(f);
    f.connect(g);
    this.connectOutput(ctx, g, now, attack + decay, opts.pan, opts.endPan);

    src.start(now, Math.random() * 0.7);
    src.stop(now + attack + decay + 0.05);
  }

  // ==========================================================================
  // 1. SPATIAL STEREO SLIDE WHOOSH & CHAPTER TRANSITION IDENTS
  // ==========================================================================

  /** Curved bandpass stereo air whoosh (pans Left->Right on next, Right->Left on prev) */
  public playSlideWhoosh(
    direction: 'next' | 'prev' = 'next',
    theme: ChapterSoundTheme = this.currentTheme,
  ): void {
    if (!this.isReady()) return;
    this.notifyPulse();

    const dir = direction === 'next' ? 1 : -1;
    this.playNoise({
      duration: 0.44,
      attack: 0.11,
      filterType: 'bandpass',
      freq: direction === 'next' ? 260 : 680,
      midFreq: direction === 'next' ? 2300 : 2050,
      endFreq: direction === 'next' ? 640 : 250,
      q: theme === 'ch4' ? 1.2 : 0.85,
      gain: 0.24,
      pan: -0.55 * dir,
      endPan: 0.55 * dir,
    });

    // Subtle chapter-colored harmonic tail
    const pitchMap: Record<ChapterSoundTheme, [number, number]> = {
      intro: [392.0, 523.25],
      ch1: [329.63, 440.0],
      ch2: [349.23, 523.25],
      ch3: [293.66, 440.0],
      ch4: [440.0, 587.33],
      ch5: [311.13, 466.16],
    };
    const [lo, hi] = pitchMap[theme];
    this.playTone({
      freq: direction === 'next' ? lo : hi,
      endFreq: direction === 'next' ? hi : lo,
      glide: 0.14,
      duration: 0.22,
      type: theme === 'ch3' ? 'triangle' : 'sine',
      gain: 0.075,
      lpFreq: 2200,
      pan: -0.35 * dir,
      endPan: 0.35 * dir,
    });
  }

  /** Distinct sonic ident when crossing into a new chapter */
  public playChapterIdent(theme: ChapterSoundTheme): void {
    if (!this.isReady()) return;
    this.notifyPulse();

    // Soft forward stereo breeze underneath every chapter shift
    this.playNoise({
      duration: 0.38,
      attack: 0.09,
      filterType: 'bandpass',
      freq: 280,
      midFreq: 2100,
      endFreq: 600,
      q: 0.9,
      gain: 0.16,
      pan: -0.5,
      endPan: 0.5,
    });

    switch (theme) {
      case 'intro':
        this.playSparkleChime();
        break;
      case 'ch1':
        // Architectural blueprint kalimba triad
        this.playTone({ freq: 523.25, duration: 0.22, type: 'triangle', gain: 0.12, pan: -0.3 });
        this.playTone({ freq: 659.25, duration: 0.26, type: 'triangle', gain: 0.11, delay: 0.06, pan: 0 });
        this.playTone({ freq: 783.99, duration: 0.36, type: 'sine', gain: 0.11, delay: 0.12, pan: 0.3 });
        break;
      case 'ch2':
        // Algorithmic mechanical pulse + bright chime
        this.playTone({ freq: 440.0, duration: 0.18, type: 'triangle', gain: 0.12, pan: -0.35 });
        this.playTone({ freq: 659.25, duration: 0.24, type: 'sine', gain: 0.12, delay: 0.065, pan: 0 });
        this.playTone({ freq: 880.0, duration: 0.34, type: 'sine', gain: 0.11, delay: 0.13, pan: 0.35 });
        break;
      case 'ch3':
        // Code Studio boot-up (Return key + crisp terminal fifth)
        this.playKeystroke('\n');
        this.playTone({ freq: 587.33, duration: 0.18, type: 'triangle', gain: 0.11, delay: 0.06, pan: -0.2 });
        this.playTone({ freq: 880.0, duration: 0.3, type: 'sine', gain: 0.11, delay: 0.125, pan: 0.2 });
        break;
      case 'ch4':
        // Precision Lab crystalline interval
        this.playTone({ freq: 659.25, duration: 0.16, type: 'sine', gain: 0.11, pan: -0.25 });
        this.playTone({ freq: 987.77, duration: 0.24, type: 'sine', gain: 0.1, delay: 0.055, pan: 0.25 });
        this.playTone({ freq: 1318.51, duration: 0.36, type: 'sine', gain: 0.09, delay: 0.115, pan: 0 });
        break;
      case 'ch5':
        // Storage Tracks stereo sweep + warm anchor chord
        this.playRangeScan(4);
        break;
    }
  }

  /** Alternating stereo shimmer chime (sparkle settle / cover / closing reveal) */
  public playSparkleChime(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const notes = [1567.98, 2093.0, 2637.02, 3135.96, 2349.32, 3520.0];
    notes.forEach((f, i) => {
      this.playTone({
        freq: f,
        attack: 0.004,
        duration: 0.62,
        type: 'sine',
        gain: 0.045,
        delay: i * 0.065,
        pan: i % 2 ? 0.42 : -0.42,
      });
    });
    this.playTone({ freq: 783.99, duration: 0.85, type: 'triangle', gain: 0.045 });
  }

  // ==========================================================================
  // 2. CHAPTER-STANDARDIZED STEP PROGRESSION
  // ==========================================================================

  /** Musical step tick tailored to the active chapter's scale and timbre */
  public playStepTick(
    step: number,
    maxStep: number,
    theme: ChapterSoundTheme = this.currentTheme,
  ): void {
    if (!this.isReady()) return;
    this.notifyPulse();

    const scales: Record<ChapterSoundTheme, number[]> = {
      intro: [523.25, 659.25, 783.99, 1046.5],
      ch1: [523.25, 587.33, 659.25, 783.99, 880.0],
      ch2: [493.88, 587.33, 659.25, 739.99, 880.0, 987.77],
      ch3: [587.33, 659.25, 783.99, 880.0, 1046.5],
      ch4: [659.25, 783.99, 987.77, 1174.66, 1318.51],
      ch5: [440.0, 523.25, 587.33, 659.25, 783.99],
    };

    const notes = scales[theme];
    const idx = Math.max(0, Math.min(notes.length - 1, step));
    const freq = notes[idx];

    if (theme === 'ch3') {
      this.playKeystroke('a');
      this.playTone({ freq, duration: 0.14, type: 'triangle', gain: 0.085, delay: 0.015 });
    } else if (theme === 'ch4') {
      // Crisp lab comparison tick + node step
      this.playTone({ freq: 1850, attack: 0.002, duration: 0.045, type: 'triangle', gain: 0.075 });
      this.playTone({ freq, duration: 0.14, type: 'sine', gain: 0.09, delay: 0.015 });
    } else if (theme === 'ch1') {
      this.playTone({ freq, endFreq: freq * 1.015, duration: 0.16, type: 'triangle', gain: 0.12 });
    } else {
      this.playTone({ freq, duration: 0.15, type: 'triangle', gain: 0.11 });
    }

    if (maxStep > 0 && step >= maxStep) {
      this.playTone({ freq: freq * 1.25, duration: 0.24, type: 'sine', gain: 0.085, delay: 0.055 });
    }
  }

  // ==========================================================================
  // 3. REALISTIC MULTI-LAYER MECHANICAL KEYBOARD (SLIDE 17 LIVE CODING)
  // ==========================================================================

  /**
   * Mẫu #2 — Laptop Scissor-Switch synthesis (MacBook / ThinkPad physical noise-impulse model):
   * Pure ultra-short filtered transients (5–12ms), zero synthetic oscillator whistle.
   * - Normal chars: crisp plastic scissor contact (3.6kHz) + subtle flat board tap (1.05kHz)
   * - Spacebar (' '): wider, lower flat stabilizer tap (2.2kHz / 680Hz)
   * - Enter ('\n'): crisp return double-impulse (2.6kHz + 1.8kHz @ +12ms)
   */
  public playKeystroke(ch = 'a', colRatio?: number): void {
    if (!this.isReady() || !this.ctx) return;

    const nowMs = performance.now();
    if (ch !== '\n' && ch !== ' ' && nowMs - this.lastKeystrokeAt < 16) return;
    this.lastKeystrokeAt = nowMs;
    this.notifyPulse();

    const j = 0.92 + Math.random() * 0.16;
    const isSpace = ch === ' ';
    const isEnter = ch === '\n';
    const isPunct = !isSpace && !isEnter && /[\[\](){}=:,.'"\+\-\*\/]/.test(ch);
    const pan = isSpace
      ? 0
      : isEnter
        ? 0.25
        : colRatio !== undefined
          ? -0.22 + Math.max(0, Math.min(1, colRatio)) * 0.44
          : (Math.random() - 0.5) * 0.24;

    const fHi = isSpace ? 2200 : isEnter ? 2600 : (isPunct ? 3900 : 3600) * j;
    const fLo = isSpace ? 680 : isEnter ? 980 : 1050 * j;

    // Layer 1: Ultra-short crisp plastic scissor-switch contact click
    this.playNoise({
      duration: 0.007,
      attack: 0.0007,
      filterType: 'bandpass',
      freq: fHi,
      q: 1.7,
      gain: isPunct ? 0.34 : 0.32,
      pan,
    });

    // Layer 2: Subtle flat laptop chassis / board tap
    this.playNoise({
      duration: 0.011,
      attack: 0.001,
      filterType: 'bandpass',
      freq: fLo,
      q: 1.5,
      gain: isSpace || isEnter ? 0.38 : 0.26,
      pan,
    });

    // Layer 3: Enter key return double-impulse
    if (isEnter) {
      this.playNoise({
        duration: 0.012,
        attack: 0.001,
        filterType: 'bandpass',
        freq: 1800,
        q: 1.4,
        gain: 0.22,
        delay: 0.012,
        pan,
      });
    }
  }

  /** Brief Python interpreter execution hum right after pressing Enter on Slide 17 */
  public playPythonExecHum(): void {
    if (!this.isReady()) return;
    this.playTone({ freq: 112, endFreq: 224, glide: 0.055, attack: 0.004, duration: 0.065, type: 'sine', gain: 0.085 });
  }

  /** Ultra-subtle mechanical hover micro-tick with 90ms anti-spam cooldown */
  public playHoverTick(): void {
    if (!this.isReady()) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverAt < 90) return;
    this.lastHoverAt = nowMs;
    this.playTone({ freq: 1650, endFreq: 1200, glide: 0.015, attack: 0.001, duration: 0.018, type: 'sine', gain: 0.022 });
  }

  /** Crisp terminal stdout print confirmation chime */
  public playTerminalRun(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 587.33, duration: 0.16, type: 'triangle', gain: 0.12, pan: -0.2 });
    this.playTone({ freq: 880.0, duration: 0.26, type: 'sine', gain: 0.12, delay: 0.055, pan: 0.2 });
  }

  // ==========================================================================
  // 4. SEMANTIC ALGORITHMIC & STORAGE DOMAIN CUES
  // ==========================================================================

  /** Sonar comparison tick + level descent step for B-tree Search(k) */
  public playSearchHop(depth = 0): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const base = 640 + depth * 120;
    this.playTone({ freq: 1900, attack: 0.002, duration: 0.045, type: 'triangle', gain: 0.075 });
    this.playTone({ freq: base, attack: 0.003, duration: 0.12, type: 'sine', gain: 0.11, delay: 0.02 });
  }

  /** Elastic upward pop when inserting a key into a leaf slot */
  public playInsertSlide(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 460, endFreq: 980, glide: 0.07, attack: 0.004, duration: 0.14, type: 'sine', gain: 0.18 });
  }

  /** Tense low warning pulse when a node overflows or underflows */
  public playOverflow(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 311.13, endFreq: 277.18, glide: 0.14, duration: 0.19, type: 'sawtooth', gain: 0.085, lpFreq: 950 });
    this.playTone({ freq: 440.0, endFreq: 415.3, glide: 0.14, duration: 0.19, type: 'triangle', gain: 0.09, delay: 0.045 });
  }

  /** Physical low-end Split Thud + stereo crystalline chord (halves separate left/right) */
  public playSplit(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Signature deep physical node-split thud (inspired by reference thud)
    this.playTone({ freq: 130, endFreq: 48, glide: 0.28, attack: 0.004, duration: 0.34, type: 'sine', gain: 0.34 });
    this.playNoise({ duration: 0.14, attack: 0.005, filterType: 'lowpass', freq: 380, gain: 0.14 });
    // Stereo halves separating + median rising
    this.playTone({ freq: 440.0, endFreq: 587.33, glide: 0.12, duration: 0.2, type: 'triangle', gain: 0.1, pan: -0.45 });
    this.playTone({ freq: 523.25, endFreq: 783.99, glide: 0.14, duration: 0.24, type: 'sine', gain: 0.1, delay: 0.045, pan: 0 });
    this.playTone({ freq: 659.25, endFreq: 1046.5, glide: 0.16, duration: 0.28, type: 'sine', gain: 0.095, delay: 0.09, pan: 0.45 });
  }

  /** Crisp downward pull pop when deleting a key */
  public playDeletePop(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 480, endFreq: 196, glide: 0.14, attack: 0.004, duration: 0.18, type: 'triangle', gain: 0.16, lpFreq: 1400 });
  }

  /** Spatial 3-phase stereo seesaw for Borrow / B* Redistribution (parent demote -> sibling promote -> equilibrium lock) */
  public playBorrowRotate(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Phase 1 (0ms): separator pulled down from parent
    this.playTone({ freq: 659.25, endFreq: 440.0, glide: 0.11, duration: 0.15, type: 'triangle', gain: 0.13, pan: 0, endPan: -0.44 });
    // Phase 2 (145ms): sibling boundary key rises into parent
    this.playTone({ freq: 440.0, endFreq: 659.25, glide: 0.12, duration: 0.17, type: 'sine', gain: 0.13, delay: 0.145, pan: 0.44, endPan: 0 });
    // Phase 3 (310ms): subtle equilibrium fifth lock
    this.playTone({ freq: 440.0, duration: 0.2, type: 'sine', gain: 0.075, delay: 0.31, pan: -0.24 });
    this.playTone({ freq: 659.25, duration: 0.22, type: 'sine', gain: 0.075, delay: 0.31, pan: 0.24 });
  }

  /** Warm 3-phase stereo fold-together for Merge (separator drop -> left/right converge -> magnetic snap) */
  public playMergeFold(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Phase 1 (0ms): parent separator drops down
    this.playTone({ freq: 587.33, endFreq: 293.66, glide: 0.11, duration: 0.14, type: 'triangle', gain: 0.125, pan: 0 });
    // Phase 2 (135ms): left & right siblings converge in stereo
    this.playTone({ freq: 330.0, endFreq: 220.0, glide: 0.15, duration: 0.17, type: 'sine', gain: 0.14, delay: 0.135, pan: -0.52, endPan: 0 });
    this.playTone({ freq: 293.66, endFreq: 220.0, glide: 0.15, duration: 0.17, type: 'triangle', gain: 0.13, delay: 0.135, pan: 0.52, endPan: 0 });
    // Phase 3 (305ms): crisp magnetic snap at center
    this.playNoise({ duration: 0.018, attack: 0.002, filterType: 'bandpass', freq: 1950, q: 3.0, gain: 0.13, delay: 0.305 });
    this.playTone({ freq: 220.0, duration: 0.25, type: 'sine', gain: 0.14, delay: 0.305, pan: 0 });
  }

  /** B+ Tree rapid sequential leaf-scan stereo arpeggio (sweeps left -> right) */
  public playRangeScan(hops = 4): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0];
    const n = Math.min(hops, notes.length);
    for (let i = 0; i < n; i++) {
      const pan = n > 1 ? -0.55 + (1.1 * i) / (n - 1) : 0;
      this.playTone({
        freq: notes[i],
        duration: 0.16,
        type: 'triangle',
        gain: 0.11,
        delay: i * 0.055,
        pan,
      });
    }
  }

  /** B+ Copy-up 3-phase dual-echo (leaf split -> upward clone flight -> octave dual-presence echo) */
  public playCopyUp(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Phase 1 (0ms): leaf split thud + warm anchor stays in leaf
    this.playTone({ freq: 135, endFreq: 54, glide: 0.18, duration: 0.22, type: 'sine', gain: 0.24 });
    this.playTone({ freq: 440.0, duration: 0.24, type: 'triangle', gain: 0.12, pan: 0.26 });
    // Phase 2 (130ms): copy glides upward toward parent index
    this.playTone({ freq: 440.0, endFreq: 880.0, glide: 0.135, duration: 0.16, type: 'sine', gain: 0.11, delay: 0.13, pan: 0.26, endPan: 0 });
    // Phase 3 (285ms): simultaneous leaf warmth + bright parent octave echo
    this.playTone({ freq: 440.0, duration: 0.28, type: 'sine', gain: 0.08, delay: 0.285, pan: 0.35 });
    this.playTone({ freq: 880.0, duration: 0.32, type: 'sine', gain: 0.13, delay: 0.285, pan: -0.15 });
  }

  /** Hardware disk-head seek click + low platter hum (RAM vs Disk, HFS+, XFS) */
  public playDiskSeek(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playNoise({ duration: 0.022, attack: 0.002, filterType: 'bandpass', freq: 1450, q: 3.2, gain: 0.18 });
    this.playNoise({ duration: 0.018, attack: 0.002, filterType: 'bandpass', freq: 2000, q: 3.6, gain: 0.13, delay: 0.038 });
    this.playTone({ freq: 145, endFreq: 105, glide: 0.08, duration: 0.12, type: 'triangle', gain: 0.14, lpFreq: 500 });
  }

  /** XFS block allocation slice */
  public playDiskAlloc(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playNoise({ duration: 0.018, attack: 0.002, filterType: 'bandpass', freq: 2150, q: 2.6, gain: 0.14 });
    this.playTone({ freq: 493.88, endFreq: 392.0, glide: 0.09, duration: 0.14, type: 'triangle', gain: 0.13, pan: -0.25 });
    this.playTone({ freq: 329.63, duration: 0.18, type: 'sine', gain: 0.12, delay: 0.07, pan: 0.25 });
  }

  /** XFS extent coalesce / merge back to full free extent */
  public playDiskCoalesce(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 392.0, endFreq: 523.25, glide: 0.12, duration: 0.18, type: 'triangle', gain: 0.12, pan: -0.35 });
    this.playTone({ freq: 659.25, duration: 0.24, type: 'sine', gain: 0.12, delay: 0.065, pan: 0 });
    this.playTone({ freq: 783.99, duration: 0.34, type: 'sine', gain: 0.11, delay: 0.125, pan: 0.35 });
  }

  /** Crisp tactile UI click tailored to current chapter theme */
  public playClick(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    if (this.currentTheme === 'ch3') {
      this.playKeystroke('(');
      return;
    }
    const freqMap: Record<ChapterSoundTheme, number> = {
      intro: 1080,
      ch1: 1150,
      ch2: 1020,
      ch3: 960,
      ch4: 1240,
      ch5: 980,
    };
    const f = freqMap[this.currentTheme];
    this.playTone({ freq: f, attack: 0.002, duration: 0.04, type: 'sine', gain: 0.075 });
  }

  /** Bright 4-note harmonic fanfare for found keys, valid hits & positive answers */
  public playSuccess(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.playTone({
        freq: f,
        duration: 0.42,
        type: 'triangle',
        gain: 0.115,
        delay: i * 0.07,
        pan: -0.28 + i * 0.18,
      });
    });
  }

  /** Warm low-passed alert for misses (None / False / insufficient block length) */
  public playAlert(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 330, endFreq: 196, glide: 0.2, duration: 0.24, type: 'triangle', gain: 0.13 });
    this.playTone({ freq: 146.5, duration: 0.26, type: 'sawtooth', gain: 0.075, lpFreq: 800, delay: 0.05 });
  }

  /** Glass modal open/close cue */
  public playModal(open: boolean): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({
      freq: open ? 440 : 600,
      endFreq: open ? 680 : 380,
      glide: 0.09,
      duration: 0.13,
      type: 'sine',
      gain: 0.1,
    });
  }

  // ==========================================================================
  // 5. BESPOKE SIGNATURE EFFECTS TAILORED TO EACH B-TREE CONCEPT & SLIDE
  // ==========================================================================

  /** Slide 01: Loading a 4 KB disk page into RAM (actuator click + spin-up + RAM lock) */
  public playPageLoad(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playNoise({ duration: 0.02, attack: 0.002, filterType: 'bandpass', freq: 1550, q: 3.4, gain: 0.16, pan: -0.35 });
    this.playTone({ freq: 165, endFreq: 520, glide: 0.16, duration: 0.2, type: 'triangle', gain: 0.14, lpFreq: 1600, delay: 0.03, pan: -0.3, endPan: 0.3 });
    this.playTone({ freq: 783.99, duration: 0.28, type: 'sine', gain: 0.12, delay: 0.15, pan: 0.3 });
    this.playTone({ freq: 1046.5, duration: 0.34, type: 'sine', gain: 0.1, delay: 0.21, pan: 0 });
  }

  /** Slide 03: Billion-key scale collapsing into 3 clean disk reads */
  public playScaleCollapse(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    for (let i = 0; i < 6; i++) {
      this.playTone({
        freq: 1400 - i * 115,
        attack: 0.002,
        duration: 0.032,
        type: 'triangle',
        gain: 0.07,
        delay: i * 0.028,
        pan: -0.45 + i * 0.18,
      });
    }
    // 3 solid resonant beats (= ≤ 3 disk reads)
    [329.63, 392.0, 523.25].forEach((f, i) => {
      this.playTone({ freq: f, duration: 0.24, type: 'triangle', gain: 0.13, delay: 0.2 + i * 0.095 });
    });
  }

  /** Slide 04: Spatial 4-gate M-way partition ping (ports 0..3 left->right, or direct key hit) */
  public playIntervalGate(portIdx: number, isDirectHit = false): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    if (isDirectHit) {
      this.playTone({ freq: 659.25, duration: 0.2, type: 'triangle', gain: 0.14, pan: 0 });
      this.playTone({ freq: 1318.51, duration: 0.32, type: 'sine', gain: 0.12, delay: 0.05, pan: 0 });
      return;
    }
    const clamped = Math.max(0, Math.min(3, portIdx));
    const pans = [-0.66, -0.22, 0.22, 0.66];
    const freqs = [440.0, 523.25, 659.25, 783.99];
    this.playTone({ freq: 1750, attack: 0.002, duration: 0.035, type: 'triangle', gain: 0.075, pan: pans[clamped] });
    this.playTone({
      freq: freqs[clamped],
      endFreq: freqs[clamped] * 0.96,
      glide: 0.12,
      duration: 0.22,
      type: 'triangle',
      gain: 0.14,
      delay: 0.025,
      pan: pans[clamped],
    });
  }

  /** Slide 05: All leaves aligned at identical depth (symmetric stereo equilibrium chord) */
  public playBalanceLevel(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playTone({ freq: 392.0, duration: 0.42, type: 'sine', gain: 0.11, pan: -0.55 });
    this.playTone({ freq: 587.33, duration: 0.42, type: 'triangle', gain: 0.11, delay: 0.04, pan: 0 });
    this.playTone({ freq: 783.99, duration: 0.46, type: 'sine', gain: 0.11, delay: 0.08, pan: 0.55 });
  }

  /** Slide 06: Binary search halving micro-ping (L/R compare) + child port dive */
  public playBisectProbe(depth = 0): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const pitch = 720 + depth * 140;
    this.playTone({ freq: 1950, attack: 0.002, duration: 0.032, type: 'triangle', gain: 0.07, pan: -0.28 });
    this.playTone({ freq: 2250, attack: 0.002, duration: 0.032, type: 'triangle', gain: 0.07, delay: 0.045, pan: 0.28 });
    this.playTone({ freq: pitch, endFreq: pitch * 0.8, glide: 0.1, duration: 0.15, type: 'sine', gain: 0.12, delay: 0.085, pan: 0 });
  }

  /** Slide 07: 3-phase horizontal key-shift zip + magnetic slot drop-in clack */
  public playSlotShiftSlide(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Phase 1 (0ms): external key glides toward seam
    this.playNoise({
      duration: 0.095,
      attack: 0.008,
      filterType: 'bandpass',
      freq: 950,
      endFreq: 2150,
      q: 2.2,
      gain: 0.11,
      pan: -0.25,
      endPan: 0,
    });
    // Phase 2 (130ms): larger neighbor key shifts right
    this.playTone({ freq: 580, endFreq: 360, glide: 0.09, duration: 0.11, type: 'triangle', gain: 0.13, delay: 0.13, pan: 0, endPan: 0.35 });
    // Phase 3 (290ms): magnetic lock clack into slot
    this.playTone({ freq: 740, endFreq: 1046.5, glide: 0.055, attack: 0.002, duration: 0.14, type: 'sine', gain: 0.16, delay: 0.29 });
    this.playNoise({ duration: 0.015, attack: 0.0015, filterType: 'highpass', freq: 3200, gain: 0.085, delay: 0.29 });
  }

  /** Slide 07 & 08: 3-phase escalating cascading split (level 1 = leaf, level 2 = internal, level 3 = new root crown) */
  public playCascadeSplit(level = 1): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const mult = 1 + (Math.max(1, level) - 1) * 0.15;
    // Phase 1 (0ms): physical split thud
    this.playTone({ freq: 132 * mult, endFreq: 48, glide: 0.26, attack: 0.004, duration: 0.32, type: 'sine', gain: 0.33 });
    this.playNoise({ duration: 0.125, attack: 0.005, filterType: 'lowpass', freq: 400, gain: 0.14 });
    // Phase 2 (140ms): left & right halves separate in stereo
    this.playTone({ freq: 440 * mult, endFreq: 587 * mult, glide: 0.12, duration: 0.21, type: 'triangle', gain: 0.11, delay: 0.14, pan: -0.52 });
    this.playTone({ freq: 523 * mult, endFreq: 784 * mult, glide: 0.14, duration: 0.23, type: 'sine', gain: 0.11, delay: 0.155, pan: 0.52 });
    // Phase 3 (305ms): median key locks into parent (or New Root Crown chord when h -> h+1)
    this.playTone({ freq: 880 * mult, endFreq: Math.min(1568, 1174.66 * mult), glide: 0.08, duration: 0.24, type: 'sine', gain: 0.12, delay: 0.305, pan: 0 });
    if (level >= 3) {
      [783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
        this.playTone({
          freq: f,
          duration: 0.4,
          type: 'sine',
          gain: 0.095,
          delay: 0.32 + i * 0.055,
          pan: i % 2 ? 0.4 : -0.4,
        });
      });
    }
  }

  /** Slide 09 & 15: 3-phase Predecessor dive -> rightmost hop -> upward crane overwrite */
  public playPredecessorSwap(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Phase 1 (0ms): left subtree dive
    this.playTone({ freq: 660, endFreq: 310, glide: 0.115, duration: 0.135, type: 'triangle', gain: 0.13, pan: -0.38 });
    // Phase 2 (130ms): rightmost leaf micro-radar
    this.playTone({ freq: 1480, attack: 0.002, duration: 0.042, type: 'triangle', gain: 0.07, delay: 0.13, pan: -0.32 });
    this.playTone({ freq: 1760, attack: 0.002, duration: 0.045, type: 'triangle', gain: 0.075, delay: 0.185, pan: -0.1 });
    // Phase 3 (260ms): predecessor promoted to overwrite internal separator
    this.playTone({ freq: 349.23, endFreq: 783.99, glide: 0.15, duration: 0.24, type: 'sine', gain: 0.14, delay: 0.26, pan: -0.1, endPan: 0 });
  }

  /** Slide 11 step 5: Empty root removed, tree height shrinks h -> h-1 */
  public playRootCollapse(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Smooth downward gravity shrink
    this.playTone({ freq: 230, endFreq: 66, glide: 0.28, attack: 0.006, duration: 0.36, type: 'sine', gain: 0.28 });
    this.playNoise({ duration: 0.18, attack: 0.01, filterType: 'lowpass', freq: 520, endFreq: 160, gain: 0.11 });
    // Balanced settling triad at the new shorter root
    this.playTone({ freq: 392.0, duration: 0.34, type: 'triangle', gain: 0.11, delay: 0.18, pan: -0.25 });
    this.playTone({ freq: 523.25, duration: 0.4, type: 'sine', gain: 0.11, delay: 0.24, pan: 0.25 });
  }

  /** Slide 12: Flowchart Q1/Q2/Q3 electro-mechanical logic relay branch click */
  public playDecisionRelay(branch = 1): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const tones = [523.25, 659.25, 783.99, 987.77];
    const f = tones[Math.max(0, Math.min(tones.length - 1, branch - 1))];
    this.playNoise({ duration: 0.016, attack: 0.0015, filterType: 'bandpass', freq: 2600, q: 2.5, gain: 0.11 });
    this.playTone({ freq: f, duration: 0.14, type: 'triangle', gain: 0.12, delay: 0.015 });
  }

  /** Slide 13: Metallic precision knob detent click for selecting order M = 3..6 */
  public playOrderDial(mVal: number): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const idx = Math.max(0, Math.min(3, mVal - 3));
    const freqs = [480, 580, 700, 840];
    this.playNoise({ duration: 0.014, attack: 0.001, filterType: 'highpass', freq: 2800, gain: 0.1 });
    this.playTone({ freq: freqs[idx], endFreq: freqs[idx] * 1.08, glide: 0.04, attack: 0.002, duration: 0.09, type: 'triangle', gain: 0.13 });
  }

  /** Code Zoom modal macro lens focus click */
  public playCodeZoom(open: boolean): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    this.playNoise({
      duration: 0.032,
      attack: 0.002,
      filterType: 'bandpass',
      freq: open ? 1800 : 2800,
      endFreq: open ? 3200 : 1400,
      q: 2.2,
      gain: 0.12,
    });
    this.playTone({
      freq: open ? 520 : 760,
      endFreq: open ? 860 : 440,
      glide: 0.075,
      duration: 0.12,
      type: 'sine',
      gain: 0.1,
    });
  }

  /** Slide 18: Exponential fan-out bloom (N_max) vs sparse minimum skeleton (N_min) */
  public playTreeGrowth(mode: 'max' | 'min'): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    if (mode === 'max') {
      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        this.playTone({
          freq: f,
          duration: 0.3,
          type: 'triangle',
          gain: 0.1,
          delay: i * 0.045,
          pan: -0.55 + i * 0.275,
        });
      });
    } else {
      const notes = [329.63, 440.0, 523.25];
      notes.forEach((f, i) => {
        this.playTone({
          freq: f,
          duration: 0.2,
          type: 'sine',
          gain: 0.1,
          delay: i * 0.08,
          pan: i === 0 ? 0 : i === 1 ? -0.35 : 0.35,
        });
      });
    }
  }

  /** Slide 20: Geometric probability tail decay bells (each level rings softer & higher) */
  public playDecayProbability(level = 1): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const notes = [587.33, 739.99, 880.0, 1174.66];
    const startIdx = Math.max(0, Math.min(2, level - 1));
    for (let i = startIdx; i < notes.length; i++) {
      const step = i - startIdx;
      this.playTone({
        freq: notes[i],
        duration: 0.36,
        type: 'sine',
        gain: 0.12 * Math.pow(0.62, step),
        delay: step * 0.075,
        pan: -0.3 + step * 0.25,
      });
    }
  }

  /** Slide 21: Ultra-fast silicon RAM pulse vs heavy mechanical HDD disk seek */
  public playRamVsDisk(mode: 'ram' | 'disk'): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    if (mode === 'ram') {
      // Crisp nanosecond silicon burst
      [1480, 1975, 2637].forEach((f, i) => {
        this.playTone({ freq: f, attack: 0.0015, duration: 0.055, type: 'sine', gain: 0.09, delay: i * 0.025, pan: -0.2 + i * 0.2 });
      });
    } else {
      // Heavy mechanical actuator seek + low platter inertia
      this.playDiskSeek();
      this.playTone({ freq: 92, endFreq: 76, glide: 0.22, duration: 0.28, type: 'triangle', gain: 0.15, lpFreq: 340, delay: 0.04 });
    }
  }

  /** Slide 22: Recursion call-stack frame push / pop chirp */
  public playStackFrame(action: 'push' | 'pop'): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    const seq = action === 'push' ? [440, 554.37, 659.25] : [659.25, 554.37, 440];
    seq.forEach((f, i) => {
      this.playTone({ freq: f, attack: 0.003, duration: 0.11, type: 'triangle', gain: 0.1, delay: i * 0.045 });
    });
  }

  /** Slide 26: Signature B* Tree 2-into-3 Tri-Split (thud + 3 stereo voices Left/Center/Right) */
  public playBStarSplit2to3(): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    // Deep split impulse
    this.playTone({ freq: 128, endFreq: 50, glide: 0.26, attack: 0.004, duration: 0.32, type: 'sine', gain: 0.32 });
    this.playNoise({ duration: 0.12, attack: 0.005, filterType: 'lowpass', freq: 400, gain: 0.13 });
    // 3 balanced nodes locking in stereo: Left (-0.68), Center (0), Right (+0.68)
    this.playTone({ freq: 440.0, duration: 0.28, type: 'triangle', gain: 0.12, delay: 0.05, pan: -0.68 });
    this.playTone({ freq: 554.37, duration: 0.3, type: 'triangle', gain: 0.12, delay: 0.11, pan: 0 });
    this.playTone({ freq: 659.25, duration: 0.34, type: 'sine', gain: 0.12, delay: 0.17, pan: 0.68 });
  }

  /** Slides 29 & 30: XFS dual B+ tree (bnobt left + cntbt right) lockstep sync */
  public playXfsDualIndexSync(action: 'alloc' | 'coalesce'): void {
    if (!this.isReady()) return;
    this.notifyPulse();
    if (action === 'alloc') {
      // Crisp 10-block slice cut
      this.playNoise({ duration: 0.02, attack: 0.002, filterType: 'bandpass', freq: 2250, q: 2.8, gain: 0.15 });
      // Left channel: bnobt in-place update tap
      this.playTone({ freq: 493.88, duration: 0.14, type: 'triangle', gain: 0.13, delay: 0.04, pan: -0.58 });
      // Right channel: cntbt cross-leaf jump downward glide (length 12 -> 2)
      this.playTone({ freq: 740.0, endFreq: 370.0, glide: 0.16, duration: 0.22, type: 'sine', gain: 0.13, delay: 0.1, pan: 0.58 });
    } else {
      // Two adjacent free extents magnetically snapping together
      this.playNoise({ duration: 0.018, attack: 0.002, filterType: 'bandpass', freq: 1850, q: 2.5, gain: 0.13 });
      // Left bnobt & right cntbt jumping back into synchronized harmony
      this.playTone({ freq: 392.0, endFreq: 523.25, glide: 0.13, duration: 0.22, type: 'triangle', gain: 0.13, delay: 0.03, pan: -0.52 });
      this.playTone({ freq: 440.0, endFreq: 659.25, glide: 0.15, duration: 0.26, type: 'sine', gain: 0.13, delay: 0.085, pan: 0.52 });
      this.playTone({ freq: 783.99, duration: 0.36, type: 'sine', gain: 0.11, delay: 0.15, pan: 0 });
    }
  }
}

export const soundFx = new SoundEngine();
