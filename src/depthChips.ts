// 3D Perspective Depth-Fly Blueprint Chips (inspired by optical Z-depth transitions)
// Chips sit strictly in safe outer viewport margins with low resting opacity so they
// NEVER obscure slide headings, B-tree SVGs, Python code blocks, or controls.

import { getChapterThemeForSlide, type ChapterSoundTheme } from './soundEffects';

interface ChipSpec {
  leftPct?: number;
  rightPct?: number;
  topPct?: number;
  bottomPct?: number;
  rot: number;
  scale: number;
  html: string;
}

function miniNodeSvg(keys: string[]): string {
  const cw = 26;
  const w = keys.length * cw;
  const cells = keys
    .map((k, i) => {
      const sep = i > 0 ? `<line x1="${i * cw}" x2="${i * cw}" y1="5" y2="21" stroke="#2563EB" stroke-opacity=".32" stroke-width="1.4"/>` : '';
      return `${sep}<text x="${i * cw + cw / 2}" y="13.5" text-anchor="middle" dominant-baseline="central" font-family="'IBM Plex Mono', monospace" font-weight="700" font-size="11.5" fill="#0F1D3A">${k}</text>`;
    })
    .join('');
  const ports = Array.from({ length: keys.length + 1 }, (_, i) => {
    const cx = i === 0 ? 5 : i === keys.length ? w - 5 : i * cw;
    return `<circle cx="${cx}" cy="25" r="2.6" fill="#004AAD"/>`;
  }).join('');
  return `<svg width="${w + 4}" height="32" viewBox="-2 -2 ${w + 4} 32" aria-hidden="true"><rect x="0" y="0" width="${w}" height="25" rx="4" fill="rgba(255,255,255,0.92)" stroke="#004AAD" stroke-width="1.8"/>${cells}${ports}</svg>`;
}

function miniDiskSvg(): string {
  return `<svg width="56" height="42" viewBox="0 0 56 42" aria-hidden="true"><rect x="2" y="2" width="52" height="38" rx="5" fill="rgba(255,255,255,0.92)" stroke="#004AAD" stroke-width="1.8"/><circle cx="21" cy="21" r="13" fill="#EEF7FF" stroke="#2563EB" stroke-width="1.6"/><circle cx="21" cy="21" r="3.6" fill="#004AAD"/><path d="M38 11l6 11-7 7" fill="none" stroke="#1D4ED8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function miniBadgeHtml(tag: string, accent = false): string {
  return `<span class="dc-pill${accent ? ' dc-pill--accent' : ''}">${tag}</span>`;
}

// Safe outer perimeter corner pockets using explicit left/right & top/bottom anchoring
// so no chip ever clips at the right edge or overlaps slide cards/diagrams.
const THEME_CHIPS: Record<ChapterSoundTheme, ChipSpec[]> = {
  intro: [
    { leftPct: 2.2, topPct: 8.5, rot: -5, scale: 0.94, html: miniNodeSvg(['10', '20']) },
    { rightPct: 2.2, topPct: 8.5, rot: 4, scale: 0.92, html: miniBadgeHtml('h = O(log_M N)', true) },
    { leftPct: 2.2, bottomPct: 3.2, rot: 3, scale: 0.9, html: miniBadgeHtml('M-way · Cân bằng') },
    { rightPct: 10.8, bottomPct: 2.4, rot: -4, scale: 0.88, html: miniDiskSvg() },
  ],
  ch1: [
    { leftPct: 1.8, bottomPct: 2.6, rot: -4, scale: 0.86, html: miniNodeSvg(['20', '50', '80']) },
    { rightPct: 1.8, topPct: 2.6, rot: 3, scale: 0.86, html: miniBadgeHtml('⌈M/2⌉ − 1 ≤ k ≤ M − 1') },
    { rightPct: 10.8, bottomPct: 2.6, rot: -3, scale: 0.84, html: miniNodeSvg(['5', '12']) },
  ],
  ch2: [
    { leftPct: 1.8, bottomPct: 2.6, rot: -4, scale: 0.85, html: miniBadgeHtml('Split ↑ · Borrow ⇄', true) },
    { rightPct: 1.8, topPct: 2.6, rot: 3, scale: 0.85, html: miniNodeSvg(['17', '25']) },
    { rightPct: 10.8, bottomPct: 2.6, rot: -3, scale: 0.84, html: miniBadgeHtml('bisect(keys, k)') },
  ],
  ch3: [
    { leftPct: 1.8, bottomPct: 2.4, rot: -3, scale: 0.84, html: miniBadgeHtml('def search(self, k):') },
    { rightPct: 1.8, topPct: 2.6, rot: 3, scale: 0.84, html: miniBadgeHtml('bisect_left()', true) },
    { rightPct: 10.8, bottomPct: 2.4, rot: -2, scale: 0.84, html: miniBadgeHtml('_fix_underflow()') },
  ],
  ch4: [
    { leftPct: 1.8, bottomPct: 2.6, rot: -4, scale: 0.85, html: miniBadgeHtml('O(log_M N)', true) },
    { rightPct: 1.8, topPct: 2.4, rot: 3, scale: 0.84, html: miniDiskSvg() },
    { rightPct: 10.8, bottomPct: 2.6, rot: -3, scale: 0.84, html: miniBadgeHtml('RAM vs 4KB Page') },
  ],
  ch5: [
    { leftPct: 1.8, bottomPct: 2.4, rot: -3, scale: 0.84, html: miniNodeSvg(['B+', '→']) },
    { rightPct: 1.8, topPct: 2.6, rot: 3, scale: 0.84, html: miniBadgeHtml('bnobt · cntbt', true) },
    { rightPct: 10.8, bottomPct: 2.4, rot: -3, scale: 0.82, html: miniDiskSvg() },
  ],
};

// Slides with very dense corners use dimmer resting opacity
const DENSE_SLIDES = new Set([10, 12, 13, 14, 15, 16, 17, 19, 27, 29, 30]);

class DepthChipsController {
  private layer: HTMLElement | null = null;
  private sets = new Map<ChapterSoundTheme, HTMLElement>();
  private activeTheme: ChapterSoundTheme | null = null;
  private anims: Array<{ cancel: () => void }> = [];

  public init(layer: HTMLElement): void {
    this.layer = layer;
    layer.innerHTML = '';
    this.sets.clear();

    (Object.keys(THEME_CHIPS) as ChapterSoundTheme[]).forEach((theme, tIdx) => {
      const set = document.createElement('div');
      set.className = `dc-set dc-set--${theme}`;
      THEME_CHIPS[theme].forEach((spec, j) => {
        const el = document.createElement('div');
        el.className = 'dc-chip';
        if (spec.leftPct !== undefined) el.style.left = `${spec.leftPct}%`;
        if (spec.rightPct !== undefined) el.style.right = `${spec.rightPct}%`;
        if (spec.topPct !== undefined) el.style.top = `${spec.topPct}%`;
        if (spec.bottomPct !== undefined) el.style.bottom = `${spec.bottomPct}%`;
        const approxX = spec.leftPct !== undefined ? spec.leftPct : 100 - (spec.rightPct ?? 5);
        const approxY = spec.topPct !== undefined ? spec.topPct : 100 - (spec.bottomPct ?? 5);
        el.dataset.vx = String(approxX - 50);
        el.dataset.vy = String(approxY - 50);
        const bobDelay = -((tIdx * 1.4 + j * 2.2) % 7).toFixed(2);
        el.innerHTML =
          `<div class="dc-rot" style="transform:rotate(${spec.rot}deg) scale(${spec.scale})">` +
            `<div class="dc-bob" style="animation-delay:${bobDelay}s">` +
              `<div class="dc-sharp">${spec.html}</div>` +
              `<div class="dc-blur">${spec.html}</div>` +
            `</div>` +
          `</div>`;
        set.appendChild(el);
      });
      layer.appendChild(set);
      this.sets.set(theme, set);
    });
  }

  public setVisible(visible: boolean): void {
    if (!this.layer) return;
    this.layer.classList.toggle('is-hidden', !visible);
  }

  private cancelAnims(): void {
    for (const a of this.anims) {
      try {
        a.cancel();
      } catch {
        // ignore
      }
    }
    this.anims = [];
  }

  /** Fly outgoing chips past the camera and pull incoming chips from deep Z-space */
  public transition(toSlide: number, fromSlide: number | null, reducedMotion: boolean): void {
    if (!this.layer) return;
    const toTheme = getChapterThemeForSlide(toSlide);
    const fromTheme = fromSlide ? getChapterThemeForSlide(fromSlide) : null;
    const dir = fromSlide === null ? 1 : toSlide >= fromSlide ? 1 : -1;

    this.layer.classList.toggle('is-dense', DENSE_SLIDES.has(toSlide));
    this.layer.classList.toggle('is-cover', toSlide === 1);

    const inSet = this.sets.get(toTheme);
    if (!inSet) return;
    const outSet = fromTheme && fromTheme !== toTheme ? this.sets.get(fromTheme) ?? null : null;

    this.cancelAnims();
    this.sets.forEach((s, key) => {
      if (key !== toTheme && key !== fromTheme) s.classList.remove('is-on');
    });

    if (reducedMotion) {
      if (outSet) outSet.classList.remove('is-on');
      inSet.classList.add('is-on');
      this.activeTheme = toTheme;
      return;
    }

    // Same chapter slide change: subtle Z-pulse ripple so chips feel alive without distracting
    if (!outSet && this.activeTheme === toTheme) {
      inSet.classList.add('is-on');
      inSet.querySelectorAll<HTMLElement>('.dc-chip').forEach((el, j) => {
        const vx = Number(el.dataset.vx || 0);
        const vy = Number(el.dataset.vy || 0);
        const len = Math.hypot(vx, vy) || 1;
        const ox = (vx / len) * 28 * dir;
        const oy = (vy / len) * 18 * dir;
        const a = el.animate(
          [
            { transform: `translate3d(${-ox}px, ${-oy}px, ${-180 * dir}px) scale(${dir > 0 ? 0.92 : 1.08})`, opacity: 0.5 },
            { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 },
          ],
          { duration: 540, delay: j * 55, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' },
        );
        this.anims.push(a);
      });
      return;
    }

    // Cross-chapter (or initial settle): full optical depth-of-field camera fly-through!
    if (outSet) {
      outSet.querySelectorAll<HTMLElement>('.dc-chip').forEach((el) => {
        const vx = Number(el.dataset.vx || 0);
        const vy = Number(el.dataset.vy || 0);
        const len = Math.hypot(vx, vy) || 1;
        const ox = (vx / len) * 170;
        const oy = (vy / len) * 110;
        const endTransform =
          dir > 0
            ? `translate3d(${ox}px, ${oy}px, 560px)`
            : `translate3d(${-ox * 0.35}px, ${-oy * 0.35}px, -1350px) scale(0.72)`;
        const opts: KeyframeAnimationOptions = {
          duration: 560,
          easing: 'cubic-bezier(0.5, 0, 0.9, 0.45)',
          fill: 'forwards',
        };
        this.anims.push(el.animate([{ transform: 'none', opacity: 1 }, { transform: endTransform, opacity: 0 }], opts));
        const blurEl = el.querySelector<HTMLElement>('.dc-blur');
        const sharpEl = el.querySelector<HTMLElement>('.dc-sharp');
        if (blurEl) this.anims.push(blurEl.animate([{ opacity: 0 }, { opacity: 1 }], opts));
        if (sharpEl) this.anims.push(sharpEl.animate([{ opacity: 1 }, { opacity: 0 }], opts));
      });
      const tid = window.setTimeout(() => {
        if (this.activeTheme !== fromTheme) outSet.classList.remove('is-on');
      }, 580);
      this.anims.push({
        cancel: () => {
          window.clearTimeout(tid);
          if (this.activeTheme !== fromTheme) outSet.classList.remove('is-on');
        },
      });
    }

    inSet.classList.add('is-on');
    this.activeTheme = toTheme;
    inSet.querySelectorAll<HTMLElement>('.dc-chip').forEach((el, j) => {
      const vx = Number(el.dataset.vx || 0);
      const vy = Number(el.dataset.vy || 0);
      const len = Math.hypot(vx, vy) || 1;
      const ox = (vx / len) * 160;
      const oy = (vy / len) * 100;
      const startTransform =
        dir > 0
          ? `translate3d(${-ox * 0.35}px, ${-oy * 0.35}px, -1350px) scale(0.72)`
          : `translate3d(${ox}px, ${oy}px, 540px)`;
      const opts: KeyframeAnimationOptions = {
        duration: 880,
        delay: 90 + j * 85,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'backwards',
      };
      this.anims.push(
        el.animate(
          [
            { transform: startTransform, opacity: 0 },
            { opacity: 1, offset: 0.38 },
            { transform: 'none', opacity: 1 },
          ],
          opts,
        ),
      );
      const blurEl = el.querySelector<HTMLElement>('.dc-blur');
      const sharpEl = el.querySelector<HTMLElement>('.dc-sharp');
      if (blurEl) this.anims.push(blurEl.animate([{ opacity: 1 }, { opacity: 0 }], opts));
      if (sharpEl) this.anims.push(sharpEl.animate([{ opacity: 0 }, { opacity: 1 }], opts));
    });
  }
}

export const depthChips = new DepthChipsController();
