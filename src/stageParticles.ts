// Organic random-drifting soft bokeh particles behind every tree & flowchart stage.
// Particles wander smoothly without fixed paths and automatically soften behind the
// center ellipse so foreground B-tree nodes, edges, and labels stay 100% prominent.

interface SoftParticle {
  x: number;
  y: number;
  angle: number;
  turnRate: number;
  speed: number;
  r: number;
  col: readonly [number, number, number];
  baseAlpha: number;
  phase: number;
  pulseSpeed: number;
}

interface StageCanvasEntry {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  section: HTMLElement | null;
  width: number;
  height: number;
  particles: SoftParticle[];
  staticDrawn: boolean;
}

const STAGE_SELECTOR = [
  '.s03-visual',
  '.s04-stage',
  '.s05-tree-box',
  '.s06-tree-wrap',
  '.s07-stage',
  '.s08-tree',
  '.s09-flow',
  '.s10-row__tree',
  '.s11-tree',
  '.s12-tree',
  '.s14-tree',
  '.s15-tree',
  '.s16-tree',
  '.s17py-tree',
  '.s18-op-tree',
  '.s19-tree-box',
  '.s20-tree',
  '.s22-tree',
  '.s23-stage',
  '.s24-tree',
  '.s25-tree',
  '.mini-drawer__tree',
].join(', ');

const PARTICLE_PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [82, 132, 255],  // cobalt
  [56, 189, 248],  // sky cyan
  [96, 165, 250],  // soft blue
  [129, 140, 248], // periwinkle
];

function createParticles(w: number, h: number): SoftParticle[] {
  const area = Math.max(1, w * h);
  const count = Math.max(14, Math.min(30, Math.round(area / 6800)));
  return Array.from({ length: count }, () => {
    const isLarge = Math.random() < 0.36;
    const r = isLarge ? 12 + Math.random() * 14 : 4 + Math.random() * 6.5;
    const col = PARTICLE_PALETTE[Math.floor(Math.random() * PARTICLE_PALETTE.length)];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      angle: Math.random() * Math.PI * 2,
      turnRate: (Math.random() - 0.5) * 0.026,
      speed: isLarge ? 0.15 + Math.random() * 0.24 : 0.22 + Math.random() * 0.34,
      r,
      col,
      baseAlpha: isLarge ? 0.15 + Math.random() * 0.11 : 0.22 + Math.random() * 0.16,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.011 + Math.random() * 0.016,
    };
  });
}

function isStageVisible(entry: StageCanvasEntry): boolean {
  const drawer = entry.host.closest<HTMLElement>('.mini-drawer');
  if (drawer && drawer.hidden) return false;
  if (!entry.section) return true;
  return (
    entry.section.classList.contains('present') ||
    entry.section.classList.contains('is-entering-slide') ||
    entry.section.classList.contains('is-leaving-slide')
  );
}

function syncEntrySize(entry: StageCanvasEntry): boolean {
  const w = entry.host.clientWidth;
  const h = entry.host.clientHeight;
  if (w < 40 || h < 40) return false;
  if (Math.abs(w - entry.width) > 2 || Math.abs(h - entry.height) > 2) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    entry.width = w;
    entry.height = h;
    entry.canvas.width = Math.round(w * dpr);
    entry.canvas.height = Math.round(h * dpr);
    entry.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    entry.particles = createParticles(w, h);
    entry.staticDrawn = false;
  }
  return true;
}

function drawEntryFrame(entry: StageCanvasEntry, advance: boolean): void {
  const { ctx, width: w, height: h, particles } = entry;
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    if (advance) {
      // Smooth non-periodic random wandering (Brownian steering)
      p.turnRate += (Math.random() - 0.5) * 0.0075;
      p.turnRate = Math.max(-0.042, Math.min(0.042, p.turnRate));
      p.angle += p.turnRate;
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;
      p.phase += p.pulseSpeed;

      const pad = p.r + 14;
      if (p.x < -pad) p.x = w + pad;
      if (p.x > w + pad) p.x = -pad;
      if (p.y < -pad) p.y = h + pad;
      if (p.y > h + pad) p.y = -pad;
    }

    // Center-clearing halo: soften particles behind the middle tree area
    const dx = (p.x - w * 0.5) / (w * 0.42);
    const dy = (p.y - h * 0.52) / (h * 0.44);
    const dist = Math.min(1, Math.hypot(dx, dy));
    const haloFactor = 0.2 + 0.85 * dist;
    const alpha = p.baseAlpha * (0.66 + 0.34 * Math.sin(p.phase)) * haloFactor;

    const [cr, cg, cb] = p.col;
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`);
    grad.addColorStop(0.55, `rgba(${cr},${cg},${cb},${(alpha * 0.45).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function initStageParticles(getReducedMotion: () => boolean): void {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>(STAGE_SELECTOR));
  const entries: StageCanvasEntry[] = [];

  for (const host of hosts) {
    host.classList.add('has-stage-particles');
    const canvas = document.createElement('canvas');
    canvas.className = 'stage-particles-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    entries.push({
      host,
      canvas,
      ctx,
      section: host.closest<HTMLElement>('section.slide-section'),
      width: 0,
      height: 0,
      particles: [],
      staticDrawn: false,
    });
  }

  const loop = () => {
    const reduced = getReducedMotion();
    for (const entry of entries) {
      // Re-attach seamlessly if a slide ever cleared its host
      if (entry.canvas.parentElement !== entry.host) {
        entry.host.prepend(entry.canvas);
      }
      if (!isStageVisible(entry)) continue;
      if (!syncEntrySize(entry)) continue;

      if (reduced) {
        if (!entry.staticDrawn) {
          drawEntryFrame(entry, false);
          entry.staticDrawn = true;
        }
      } else {
        entry.staticDrawn = false;
        drawEntryFrame(entry, true);
      }
    }
    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
}
