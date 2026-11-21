// Lightweight 60fps Blueprint Constellation Particle Field (inspired by persistent ParticleEngine)
// Stays ultra-subtle on content slides, forms a soft B-tree node constellation around Cover Slide 01,
// and reacts with a smooth directional impulse swirl on every slide transition.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  homeX: number;
  homeY: number;
  isNode: boolean;
}

class AmbientParticlesController {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private rafId: number | null = null;
  private width = 1280;
  private height = 720;
  private targetOpacity = 0.22;
  private isCoverMode = true;
  private isDarkDots = false;
  private reducedMotion = false;
  private impulseVx = 0;

  public init(canvas: HTMLCanvasElement, reducedMotion: boolean): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.reducedMotion = reducedMotion;
    this.resize();
    this.seedParticles();

    window.addEventListener('resize', () => {
      this.resize();
      this.recomputeHomes();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else if (!this.reducedMotion) this.start();
    });

    if (!this.reducedMotion) {
      this.start();
    } else {
      this.drawFrame();
    }
  }

  private resize(): void {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = window.innerWidth || 1280;
    this.height = window.innerHeight || 720;
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private seedParticles(): void {
    const count = 64;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const isNode = i < 16;
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.24,
        r: isNode ? 2.4 + Math.random() * 1.1 : 1.3 + Math.random() * 1.1,
        alpha: isNode ? 0.62 : 0.35 + Math.random() * 0.28,
        homeX: 0,
        homeY: 0,
        isNode,
      });
    }
    this.recomputeHomes();
  }

  private recomputeHomes(): void {
    // Soft B-tree constellation perimeter anchors for Cover Slide 01
    const anchors: Array<[number, number]> = [
      [0.5, 0.11],
      [0.24, 0.26],
      [0.76, 0.26],
      [0.12, 0.52],
      [0.88, 0.52],
      [0.09, 0.78],
      [0.91, 0.78],
      [0.28, 0.91],
      [0.72, 0.91],
      [0.5, 0.92],
      [0.16, 0.16],
      [0.84, 0.16],
      [0.08, 0.36],
      [0.92, 0.36],
      [0.18, 0.87],
      [0.82, 0.87],
    ];
    this.particles.forEach((p, i) => {
      const a = anchors[i % anchors.length];
      p.homeX = a[0] * this.width + (Math.random() - 0.5) * 44;
      p.homeY = a[1] * this.height + (Math.random() - 0.5) * 30;
    });
  }

  public setSlideContext(slideNumber: number, slideTheme: string, reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    this.isCoverMode = slideNumber === 1;
    this.isDarkDots = slideTheme === 'white' || slideTheme === 'toc';
    this.targetOpacity = slideNumber === 1 ? 0.5 : slideNumber === 2 ? 0.26 : 0.18;
    if (this.canvas) {
      this.canvas.style.opacity = String(this.targetOpacity);
    }
    if (reducedMotion) {
      this.stop();
      this.drawFrame();
    } else if (this.rafId === null) {
      this.start();
    }
  }

  /** Trigger a smooth directional swirl burst in sync with slide transition */
  public impulse(direction: 1 | -1): void {
    if (this.reducedMotion) return;
    this.impulseVx = -direction * 7.2;
    for (const p of this.particles) {
      p.vy += (Math.random() - 0.5) * 1.4;
    }
  }

  private start(): void {
    if (this.rafId !== null) return;
    const step = () => {
      this.update();
      this.drawFrame();
      this.rafId = window.requestAnimationFrame(step);
    };
    this.rafId = window.requestAnimationFrame(step);
  }

  private stop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private update(): void {
    this.impulseVx *= 0.91;
    const w = this.width;
    const h = this.height;

    for (const p of this.particles) {
      if (this.isCoverMode && p.isNode) {
        p.vx += (p.homeX - p.x) * 0.0016;
        p.vy += (p.homeY - p.y) * 0.0016;
        p.vx *= 0.94;
        p.vy *= 0.94;
      } else {
        p.vy *= 0.985;
        if (Math.abs(p.vx) < 0.14) p.vx += (Math.random() - 0.5) * 0.04;
        if (Math.abs(p.vy) < 0.14) p.vy += (Math.random() - 0.5) * 0.04;
      }

      p.x += p.vx + this.impulseVx * (0.45 + p.r * 0.18);
      p.y += p.vy;

      if (p.x < -16) p.x = w + 16;
      if (p.x > w + 16) p.x = -16;
      if (p.y < -16) p.y = h + 16;
      if (p.y > h + 16) p.y = -16;
    }
  }

  private drawFrame(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);

    const dotRgb = this.isDarkDots ? '0, 74, 173' : '255, 255, 255';
    const lineRgb = this.isDarkDots ? '37, 99, 235' : '255, 255, 255';
    const linkDist = this.isCoverMode ? 145 : 110;
    const linkDistSq = linkDist * linkDist;

    // Hairline blueprint constellation links
    ctx.lineWidth = 0.9;
    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < linkDistSq) {
          const t = 1 - Math.sqrt(d2) / linkDist;
          ctx.strokeStyle = `rgba(${lineRgb}, ${(t * (this.isCoverMode ? 0.34 : 0.22)).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Crisp geometric particles (tiny rounded squares for blueprint nodes, circles for dust)
    for (const p of this.particles) {
      ctx.fillStyle = `rgba(${dotRgb}, ${p.alpha.toFixed(3)})`;
      if (p.isNode) {
        const s = p.r * 2.1;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export const ambientParticles = new AmbientParticlesController();
