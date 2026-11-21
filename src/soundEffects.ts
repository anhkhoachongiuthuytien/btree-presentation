// Procedural Web Audio API sound effects engine (100% offline, zero external files)
// Subtle, warm, presentation-hall-friendly acoustic cues for slides & interactions.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private unlocked = false;
  private lastKeystrokeAt = 0;

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

  private playTone(opts: {
    freq: number;
    endFreq?: number;
    duration: number;
    type?: OscillatorType;
    gain: number;
    delay?: number;
  }): void {
    if (!this.unlocked) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(opts.freq, now);
    if (opts.endFreq && opts.endFreq !== opts.freq) {
      osc.frequency.exponentialRampToValueAtTime(opts.endFreq, now + opts.duration);
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(opts.gain, now + Math.min(0.012, opts.duration * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    osc.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + opts.duration + 0.02);
  }

  /** Soft airy whoosh + subtle harmonic lift when transitioning between slides */
  public playSlideWhoosh(direction: 'next' | 'prev' = 'next'): void {
    if (!this.unlocked) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = 0.14;
    const sampleCount = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / sampleCount) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.setValueAtTime(1.8, now);
    bandpass.frequency.setValueAtTime(direction === 'next' ? 520 : 1150, now);
    bandpass.frequency.exponentialRampToValueAtTime(direction === 'next' ? 1350 : 480, now + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.045, now + 0.035);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(bandpass);
    bandpass.connect(g);
    g.connect(ctx.destination);
    noise.start(now);

    this.playTone({
      freq: direction === 'next' ? 330 : 392,
      endFreq: direction === 'next' ? 440 : 294,
      duration: 0.12,
      type: 'triangle',
      gain: 0.045,
    });
  }

  /** Ascending pentatonic glass-marimba step cue for slide fragments */
  public playStepTick(step: number, maxStep: number): void {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const idx = Math.max(0, Math.min(step, scale.length - 1));
    const base = scale[idx];

    if (step > 0 && step >= maxStep) {
      // Warm gentle resolution chord on final step of slide
      this.playTone({ freq: base, duration: 0.14, type: 'triangle', gain: 0.06 });
      this.playTone({ freq: base * 1.25, duration: 0.19, type: 'sine', gain: 0.055, delay: 0.055 });
    } else {
      this.playTone({
        freq: base * 0.96,
        endFreq: base,
        duration: 0.09,
        type: 'triangle',
        gain: 0.055,
      });
    }
  }

  /** Crisp tactile pop for interactive buttons, tabs, and tree probes */
  public playClick(): void {
    this.playTone({
      freq: 620,
      endFreq: 420,
      duration: 0.055,
      type: 'sine',
      gain: 0.055,
    });
  }

  /** Bright bell chime for valid hits, found keys, and completed demo execution */
  public playSuccess(): void {
    this.playTone({ freq: 659.25, duration: 0.11, type: 'triangle', gain: 0.065 });
    this.playTone({ freq: 880.0, duration: 0.18, type: 'sine', gain: 0.06, delay: 0.065 });
  }

  /** Soft muted double-pulse for misses (None / False / insufficient block length) */
  public playAlert(): void {
    this.playTone({ freq: 240, endFreq: 210, duration: 0.085, type: 'triangle', gain: 0.065 });
    this.playTone({ freq: 195, endFreq: 170, duration: 0.11, type: 'triangle', gain: 0.055, delay: 0.075 });
  }

  /** Subtle mechanical keycap tick for Slide 17 live Python typing */
  public playKeystroke(): void {
    if (!this.unlocked) return;
    const nowMs = performance.now();
    if (nowMs - this.lastKeystrokeAt < 38) return; // gentle throttle so fast typing stays crisp
    this.lastKeystrokeAt = nowMs;

    const jitter = 0.92 + Math.random() * 0.16;
    this.playTone({
      freq: 980 * jitter,
      endFreq: 540 * jitter,
      duration: 0.024,
      type: 'triangle',
      gain: 0.026,
    });
  }

  /** Glass modal open/close cue */
  public playModal(open: boolean): void {
    this.playTone({
      freq: open ? 420 : 560,
      endFreq: open ? 640 : 380,
      duration: 0.095,
      type: 'sine',
      gain: 0.05,
    });
  }
}

export const soundFx = new SoundEngine();
