// Studio-grade Procedural Web Audio API Sound Engine (100% offline, zero external files)
// Chapter-standardized acoustic design:
//   intro -> warm Rhodes/glass pad
//   ch1   -> architectural kalimba / woodblock blueprint plucks
//   ch2   -> algorithmic mechanics (search sonar, insert glide, split shimmer, borrow seesaw, merge fold)
//   ch3   -> tactile code studio (realistic multi-layer mechanical keyboard thock + terminal chimes)
//   ch4   -> precision lab & hardware (RAM silicon pulse, disk seek head, probability decay bells)
//   ch5   -> storage engine & sequential tracks (B+ range scan sweep, copy-up echo, XFS alloc/coalesce)

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
  intro: 'Mở đầu (Glass Pad)',
  ch1: 'Chương 1 · Lý thuyết (Blueprint Pluck)',
  ch2: 'Chương 2 · Phép toán (Algorithmic)',
  ch3: 'Chương 3 · Python (Mechanical Studio)',
  ch4: 'Chương 4 · Độ phức tạp (Lab & I/O)',
  ch5: 'Chương 5 · B+/B*/XFS (Storage Tracks)',
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = true;
  private unlocked = false;
  private currentTheme: ChapterSoundTheme = 'intro';
  private lastKeystrokeAt = 0;
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
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const len = Math.floor(ctx.sampleRate * 0.35);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buf;
    return buf;
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
    if (on) {
      this.unlocked = true;
      this.playClick();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  private connectWithPan(
    ctx: AudioContext,
    source: AudioNode,
    now: number,
    duration: number,
    pan?: number,
    endPan?: number,
  ): void {
    if (pan !== undefined && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      if (endPan !== undefined && endPan !== pan) {
        panner.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, endPan)), now + duration);
      }
      source.connect(panner);
      panner.connect(ctx.destination);
    } else {
      source.connect(ctx.destination);
    }
  }

  private playTone(opts: {
    freq: number;
    endFreq?: number;
    duration: number;
    type?: OscillatorType;
    gain: number;
    delay?: number;
    lpFreq?: number;
    attack?: number;
    pan?: number;
    endPan?: number;
  }): void {
    if (!this.unlocked) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(Math.max(20, opts.freq), now);
    if (opts.endFreq && opts.endFreq !== opts.freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.endFreq), now + opts.duration);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(opts.lpFreq ?? 2800, now);

    const attack = opts.attack ?? Math.min(0.01, opts.duration * 0.22);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(opts.gain, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    osc.connect(filter);
    filter.connect(g);
    this.connectWithPan(ctx, g, now, opts.duration, opts.pan, opts.endPan);

    osc.start(now);
    osc.stop(now + opts.duration + 0.025);
  }

  private playNoiseBurst(opts: {
    duration: number;
    filterType: BiquadFilterType;
    freq: number;
    midFreq?: number;
    endFreq?: number;
    q?: number;
    gain: number;
    delay?: number;
    pan?: number;
    endPan?: number;
  }): void {
    if (!this.unlocked) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType;
    filter.Q.setValueAtTime(opts.q ?? 1.6, now);
    filter.frequency.setValueAtTime(opts.freq, now);
    if (opts.midFreq && opts.endFreq) {
      filter.frequency.exponentialRampToValueAtTime(opts.midFreq, now + opts.duration * 0.44);
      filter.frequency.exponentialRampToValueAtTime(opts.endFreq, now + opts.duration);
    } else if (opts.endFreq && opts.endFreq !== opts.freq) {
      filter.frequency.exponentialRampToValueAtTime(opts.endFreq, now + opts.duration);
    }

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(opts.gain, now + Math.min(0.045, opts.duration * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    src.connect(filter);
    filter.connect(g);
    this.connectWithPan(ctx, g, now, opts.duration, opts.pan, opts.endPan);

    src.start(now, Math.random() * 0.12, opts.duration + 0.02);
  }

  // ==========================================================================
  // 1. CHAPTER-THEMED SLIDE & CHAPTER TRANSITIONS
  // ==========================================================================

  /** Spatial stereo-panned slide transition whoosh tailored to chapter theme */
  public playSlideWhoosh(direction: 'next' | 'prev' = 'next', theme: ChapterSoundTheme = this.currentTheme): void {
    if (!this.unlocked) return;
    this.notifyPulse();

    const dir = direction === 'next' ? 1 : -1;
    // Spatial left-to-right (or right-to-left) curved bandpass air whoosh
    this.playNoiseBurst({
      duration: 0.34,
      filterType: 'bandpass',
      freq: direction === 'next' ? 280 : 680,
      midFreq: direction === 'next' ? 2150 : 1850,
      endFreq: direction === 'next' ? 620 : 260,
      q: theme === 'ch4' ? 1.4 : 0.95,
      gain: 0.068,
      pan: -0.58 * dir,
      endPan: 0.58 * dir,
    });

    const pitchMap: Record<ChapterSoundTheme, [number, number]> = {
      intro: [293.66, 440.0],
      ch1: [329.63, 440.0],
      ch2: [349.23, 523.25],
      ch3: [261.63, 392.0],
      ch4: [392.0, 587.33],
      ch5: [311.13, 466.16],
    };
    const [lo, hi] = pitchMap[theme];
    this.playTone({
      freq: direction === 'next' ? lo : hi,
      endFreq: direction === 'next' ? hi : lo,
      duration: 0.15,
      type: theme === 'ch3' ? 'triangle' : 'sine',
      gain: 0.034,
      lpFreq: 2100,
      pan: -0.35 * dir,
      endPan: 0.35 * dir,
    });
  }

  /** Alternating stereo sparkle chime for constellation settle & timeline jumps */
  public playSparkleChime(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    const notes = [1318.5, 1567.98, 2093.0, 2637.02, 2349.32];
    notes.forEach((f, i) => {
      this.playTone({
        freq: f,
        duration: 0.42,
        type: 'sine',
        gain: 0.022,
        delay: i * 0.055,
        lpFreq: 3800,
        pan: i % 2 === 0 ? -0.42 : 0.42,
      });
    });
    this.playTone({ freq: 783.99, duration: 0.55, type: 'triangle', gain: 0.026, lpFreq: 1800 });
  }

  /** Distinct signature sonic ident when crossing into a new chapter */
  public playChapterIdent(theme: ChapterSoundTheme): void {
    if (!this.unlocked) return;
    this.notifyPulse();

    switch (theme) {
      case 'intro':
        // Warm open fifth glass pad
        this.playTone({ freq: 261.63, duration: 0.28, type: 'sine', gain: 0.05 });
        this.playTone({ freq: 392.0, duration: 0.28, type: 'triangle', gain: 0.042, delay: 0.045 });
        this.playTone({ freq: 523.25, duration: 0.32, type: 'sine', gain: 0.04, delay: 0.095 });
        break;
      case 'ch1':
        // Architectural blueprint kalimba triad
        this.playTone({ freq: 523.25, duration: 0.12, type: 'triangle', gain: 0.055 });
        this.playTone({ freq: 659.25, duration: 0.14, type: 'triangle', gain: 0.05, delay: 0.055 });
        this.playTone({ freq: 783.99, duration: 0.19, type: 'sine', gain: 0.05, delay: 0.11 });
        break;
      case 'ch2':
        // Algorithmic mechanical pulse + crystalline chime
        this.playNoiseBurst({ duration: 0.025, filterType: 'bandpass', freq: 2200, q: 2.5, gain: 0.035 });
        this.playTone({ freq: 440.0, duration: 0.11, type: 'triangle', gain: 0.055 });
        this.playTone({ freq: 659.25, duration: 0.16, type: 'sine', gain: 0.05, delay: 0.06 });
        this.playTone({ freq: 880.0, duration: 0.2, type: 'sine', gain: 0.045, delay: 0.12 });
        break;
      case 'ch3':
        // Code Studio boot-up (soft mechanical click + dual terminal chime)
        this.playKeystroke('\n');
        this.playTone({ freq: 587.33, duration: 0.1, type: 'triangle', gain: 0.048, delay: 0.055 });
        this.playTone({ freq: 880.0, duration: 0.16, type: 'sine', gain: 0.046, delay: 0.115 });
        break;
      case 'ch4':
        // Precision Lab harmonic bell
        this.playTone({ freq: 698.46, duration: 0.14, type: 'sine', gain: 0.05 });
        this.playTone({ freq: 1046.5, duration: 0.22, type: 'sine', gain: 0.042, delay: 0.065 });
        break;
      case 'ch5':
        // Storage Tracks sequential sweep
        [392.0, 493.88, 587.33, 783.99].forEach((f, idx) => {
          this.playTone({ freq: f, duration: 0.11, type: 'triangle', gain: 0.045, delay: idx * 0.042 });
        });
        break;
    }
  }

  /** Chapter-tailored step cue when stepping through slide fragments */
  public playStepTick(step: number, maxStep: number, theme: ChapterSoundTheme = this.currentTheme): void {
    if (!this.unlocked) return;
    this.notifyPulse();

    const scales: Record<ChapterSoundTheme, number[]> = {
      intro: [440.0, 523.25, 659.25, 783.99, 880.0, 1046.5],
      ch1: [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5], // C major pentatonic (kalimba)
      ch2: [493.88, 587.33, 659.25, 739.99, 880.0, 987.77], // crisp bright algorithmic
      ch3: [392.0, 440.0, 523.25, 587.33, 659.25, 783.99],  // warm studio focus
      ch4: [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66], // crystal lab math
      ch5: [466.16, 523.25, 587.33, 698.46, 783.99, 932.33], // warm Bb pentatonic storage
    };
    const scale = scales[theme];
    const base = scale[Math.max(0, Math.min(step, scale.length - 1))];

    if (theme === 'ch3') {
      // Subtle IDE focus tick before tone
      this.playNoiseBurst({ duration: 0.012, filterType: 'highpass', freq: 2400, gain: 0.025 });
    } else if (theme === 'ch1') {
      // Soft woodblock knock
      this.playTone({ freq: base * 0.5, endFreq: base * 0.35, duration: 0.032, type: 'sine', gain: 0.04 });
    }

    if (step > 0 && step >= maxStep) {
      this.playTone({ freq: base, duration: 0.14, type: 'triangle', gain: 0.056 });
      this.playTone({ freq: base * 1.25, duration: 0.2, type: 'sine', gain: 0.052, delay: 0.055 });
    } else {
      this.playTone({
        freq: base * 0.96,
        endFreq: base,
        duration: 0.09,
        type: theme === 'ch4' ? 'sine' : 'triangle',
        gain: 0.052,
      });
    }
  }

  // ==========================================================================
  // 2. REALISTIC MULTI-LAYER MECHANICAL KEYBOARD (Slide 17 Live Python Demo)
  // ==========================================================================

  /**
   * Realistic 3-layer tactile mechanical keyboard switch (PBT Thock + Stem Snap):
   * - Normal chars: crisp varied thock + tactile click
   * - Space (' '): deeper wider stabilizer thock
   * - Enter ('\n'): firm return-key double impulse
   * - Symbols/brackets: slightly brighter crisp click
   */
  public playKeystroke(ch = 'a'): void {
    if (!this.unlocked) return;
    const nowMs = performance.now();
    const isReturn = ch === '\n';
    const isSpace = ch === ' ';
    if (!isReturn && nowMs - this.lastKeystrokeAt < 24) return;
    this.lastKeystrokeAt = nowMs;

    const jitter = 0.9 + Math.random() * 0.2;
    const vel = 0.85 + Math.random() * 0.3;

    if (isReturn) {
      // Enter key: heavier stabilizer thock + crisp spring release
      this.playTone({
        freq: 155 * jitter,
        endFreq: 68,
        duration: 0.038,
        type: 'triangle',
        gain: 0.085,
        lpFreq: 520,
        attack: 0.002,
      });
      this.playNoiseBurst({
        duration: 0.011,
        filterType: 'bandpass',
        freq: 2900 * jitter,
        q: 2.6,
        gain: 0.055,
      });
      // Soft keycap upstroke click 32ms later
      this.playNoiseBurst({
        duration: 0.008,
        filterType: 'bandpass',
        freq: 3800,
        q: 3.4,
        gain: 0.025,
        delay: 0.032,
      });
      return;
    }

    if (isSpace) {
      // Spacebar: deeper hollow PBT stabilizer thock
      this.playTone({
        freq: 122 * jitter,
        endFreq: 62,
        duration: 0.036,
        type: 'triangle',
        gain: 0.075 * vel,
        lpFreq: 420,
        attack: 0.002,
      });
      this.playNoiseBurst({
        duration: 0.012,
        filterType: 'bandpass',
        freq: 1650 * jitter,
        q: 2.0,
        gain: 0.036 * vel,
      });
      return;
    }

    const isPunct = '()[]{}:=.,<>+-*/"\''.includes(ch);

    // Layer 1: Physical bottom-out keycap thock (warm low-mid body)
    this.playTone({
      freq: (isPunct ? 215 : 178) * jitter,
      endFreq: 78,
      duration: 0.024,
      type: 'triangle',
      gain: 0.068 * vel,
      lpFreq: 540,
      attack: 0.0015,
    });

    // Layer 2: Tactile switch leaf snap (crisp high-mid band-pass burst)
    this.playNoiseBurst({
      duration: 0.0065,
      filterType: 'bandpass',
      freq: (isPunct ? 3550 : 2850) * jitter,
      q: 3.1,
      gain: 0.052 * vel,
    });

    // Layer 3: Subtle desk-plate micro-resonance (short muted mid-low click)
    this.playNoiseBurst({
      duration: 0.014,
      filterType: 'lowpass',
      freq: 920 * jitter,
      gain: 0.028 * vel,
      delay: 0.003,
    });
  }

  /** Crisp Python terminal output confirmation */
  public playTerminalRun(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 523.25, duration: 0.08, type: 'triangle', gain: 0.055 });
    this.playTone({ freq: 783.99, duration: 0.14, type: 'sine', gain: 0.055, delay: 0.055 });
  }

  // ==========================================================================
  // 3. ALGORITHMIC & DOMAIN-SPECIFIC SEMANTIC SOUND CUES
  // ==========================================================================

  /** Search traversal sonar ping (gentle descending pitch per level) */
  public playSearchHop(depth = 0): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    const freqs = [783.99, 659.25, 587.33, 523.25];
    const f = freqs[Math.min(depth, freqs.length - 1)];
    this.playTone({ freq: f, endFreq: f * 1.03, duration: 0.1, type: 'sine', gain: 0.055 });
  }

  /** Smooth magnetic slide-in when a key glides into a B-tree node */
  public playInsertSlide(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 380, endFreq: 660, duration: 0.11, type: 'sine', gain: 0.048 });
    this.playNoiseBurst({ duration: 0.014, filterType: 'bandpass', freq: 2400, q: 2.8, gain: 0.032, delay: 0.085 });
  }

  /** Node overflow tension shimmer */
  public playOverflow(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 311.13, endFreq: 293.66, duration: 0.14, type: 'sawtooth', gain: 0.032, lpFreq: 1100 });
    this.playTone({ freq: 440.0, endFreq: 415.3, duration: 0.14, type: 'triangle', gain: 0.04, delay: 0.04 });
  }

  /** Physical split thud + stereo crystalline node split chord (halves separate left/right) */
  public playSplit(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    // Low-end physical weight of node splitting
    this.playTone({ freq: 138, endFreq: 52, duration: 0.24, type: 'sine', gain: 0.085, lpFreq: 420 });
    this.playNoiseBurst({ duration: 0.09, filterType: 'lowpass', freq: 420, gain: 0.045 });
    // Stereo halves + middle rising
    this.playTone({ freq: 440.0, endFreq: 587.33, duration: 0.15, type: 'triangle', gain: 0.048, pan: -0.46 });
    this.playTone({ freq: 523.25, endFreq: 783.99, duration: 0.18, type: 'sine', gain: 0.048, delay: 0.045, pan: 0 });
    this.playTone({ freq: 659.25, endFreq: 1046.5, duration: 0.22, type: 'sine', gain: 0.045, delay: 0.09, pan: 0.46 });
  }

  /** Clean downward pull pop when deleting a key (leaving empty node) */
  public playDeletePop(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 460, endFreq: 190, duration: 0.11, type: 'triangle', gain: 0.06, lpFreq: 1400 });
  }

  /** Spatial stereo seesaw for Borrow / B* Redistribution (left -> parent -> right) */
  public playBorrowRotate(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 440.0, endFreq: 659.25, duration: 0.13, type: 'triangle', gain: 0.054, pan: -0.44 });
    this.playTone({ freq: 659.25, endFreq: 493.88, duration: 0.16, type: 'sine', gain: 0.052, delay: 0.085, pan: 0.44 });
  }

  /** Resonant stereo fold-together for Merge (left & right nodes converging to center) */
  public playMergeFold(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 523.25, endFreq: 392.0, duration: 0.17, type: 'triangle', gain: 0.052, pan: -0.48, endPan: 0 });
    this.playTone({ freq: 293.66, endFreq: 392.0, duration: 0.17, type: 'sine', gain: 0.052, pan: 0.48, endPan: 0 });
    this.playTone({ freq: 392.0, duration: 0.2, type: 'sine', gain: 0.045, delay: 0.1, pan: 0 });
  }

  /** B+ Tree rapid sequential leaf-scan stereo arpeggio (sweeps left -> right) */
  public playRangeScan(hops = 4): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0];
    const n = Math.min(hops, notes.length);
    for (let i = 0; i < n; i++) {
      const pan = n > 1 ? -0.55 + (1.1 * i) / (n - 1) : 0;
      this.playTone({
        freq: notes[i],
        duration: 0.095,
        type: 'triangle',
        gain: 0.048,
        delay: i * 0.055,
        pan,
      });
    }
  }

  /** B+ Copy-up dual-echo (leaf stays warm, copy echoes high to parent) */
  public playCopyUp(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 440.0, duration: 0.14, type: 'triangle', gain: 0.05 });
    this.playTone({ freq: 880.0, duration: 0.19, type: 'sine', gain: 0.048, delay: 0.075 });
  }

  /** Hardware disk-head seek click + low platter hum (Slide 21 & HFS+/XFS) */
  public playDiskSeek(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playNoiseBurst({ duration: 0.018, filterType: 'bandpass', freq: 1400, q: 3.5, gain: 0.065 });
    this.playNoiseBurst({ duration: 0.015, filterType: 'bandpass', freq: 1950, q: 4.0, gain: 0.048, delay: 0.036 });
    this.playTone({ freq: 145, endFreq: 110, duration: 0.09, type: 'triangle', gain: 0.055, lpFreq: 500 });
  }

  /** XFS block allocation slice (crisp block-cut ticks) */
  public playDiskAlloc(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playNoiseBurst({ duration: 0.014, filterType: 'bandpass', freq: 2100, q: 2.8, gain: 0.05 });
    this.playTone({ freq: 493.88, endFreq: 392.0, duration: 0.09, type: 'triangle', gain: 0.05 });
    this.playTone({ freq: 329.63, duration: 0.11, type: 'sine', gain: 0.048, delay: 0.065 });
  }

  /** XFS extent coalesce / merge back to full free extent */
  public playDiskCoalesce(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 392.0, endFreq: 523.25, duration: 0.12, type: 'triangle', gain: 0.052 });
    this.playTone({ freq: 659.25, duration: 0.16, type: 'sine', gain: 0.052, delay: 0.065 });
    this.playTone({ freq: 783.99, duration: 0.22, type: 'sine', gain: 0.048, delay: 0.125 });
  }

  /** Crisp tactile UI click tailored to current chapter theme */
  public playClick(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    if (this.currentTheme === 'ch3') {
      this.playKeystroke('(');
      return;
    }
    const freqMap: Record<ChapterSoundTheme, number> = {
      intro: 600,
      ch1: 680,
      ch2: 640,
      ch3: 560,
      ch4: 740,
      ch5: 580,
    };
    const f = freqMap[this.currentTheme];
    this.playTone({ freq: f, endFreq: f * 0.68, duration: 0.05, type: 'sine', gain: 0.052 });
  }

  /** Bright harmonic bell chime for valid hits, found keys & positive answers */
  public playSuccess(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 659.25, duration: 0.11, type: 'triangle', gain: 0.06 });
    this.playTone({ freq: 880.0, duration: 0.19, type: 'sine', gain: 0.055, delay: 0.065 });
  }

  /** Soft muted double-pulse for misses (None / False / insufficient block length) */
  public playAlert(): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({ freq: 245, endFreq: 210, duration: 0.085, type: 'triangle', gain: 0.06 });
    this.playTone({ freq: 195, endFreq: 168, duration: 0.11, type: 'triangle', gain: 0.052, delay: 0.075 });
  }

  /** Glass modal open/close cue */
  public playModal(open: boolean): void {
    if (!this.unlocked) return;
    this.notifyPulse();
    this.playTone({
      freq: open ? 420 : 560,
      endFreq: open ? 660 : 370,
      duration: 0.095,
      type: 'sine',
      gain: 0.048,
    });
  }
}

export const soundFx = new SoundEngine();
