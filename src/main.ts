import 'reveal.js/dist/reveal.css';
import 'katex/dist/katex.min.css';

import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/be-vietnam-pro/800.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/ibm-plex-mono/700.css';

import './deck.css';

import Reveal from 'reveal.js';
import RevealNotes from 'reveal.js/plugin/notes/notes.esm.js';

import { ALL_SLIDES } from './slides';
import { texBlock } from './math';
import { renderPythonWindow } from './pythonCode';
import { playSlideTransition, cancelSlideTransition, triggerSlideEntrance } from './transitions';
import { initStageParticles } from './stageParticles';
import type { SlideContext, SlideDef } from './types';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const getReducedMotion = () => reducedMotionQuery.matches;

const slidesContainer = document.getElementById('slides-container')!;
const transitionOverlay = document.getElementById('transition-overlay')!;
const topProgressFill = document.getElementById('top-progress-fill')!;
const laserLayer = document.getElementById('laser-layer')!;
const laserDot = document.getElementById('laser-dot')!;

// Podium controls
const btnPrev = document.getElementById('btn-prev') as HTMLButtonElement;
const btnNext = document.getElementById('btn-next') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
const btnToc = document.getElementById('btn-toc') as HTMLButtonElement;
const btnFullView = document.getElementById('btn-fullview') as HTMLButtonElement;
const btnLaser = document.getElementById('btn-laser') as HTMLButtonElement;
const btnOverview = document.getElementById('btn-overview') as HTMLButtonElement;
const btnNotes = document.getElementById('btn-notes') as HTMLButtonElement;
const btnFullscreen = document.getElementById('btn-fullscreen') as HTMLButtonElement;
const statusChapter = document.getElementById('status-chapter')!;
const statusPage = document.getElementById('status-page')!;
const statusStep = document.getElementById('status-step')!;

// Modals
const fullViewModal = document.getElementById('fullview-modal')!;
const fullViewBadge = document.getElementById('fullview-badge')!;
const fullViewTitle = document.getElementById('fullview-title')!;
const fullViewBody = document.getElementById('fullview-body')!;
const fullViewClose = document.getElementById('fullview-close') as HTMLButtonElement;

const codeZoomModal = document.getElementById('codezoom-modal')!;
const codeZoomTitle = document.getElementById('codezoom-title')!;
const codeZoomBody = document.getElementById('codezoom-body')!;
const codeZoomClose = document.getElementById('codezoom-close') as HTMLButtonElement;

let savedFocusBeforeModal: HTMLElement | null = null;
let deck: Reveal.Api | null = null;
const slideSections: HTMLElement[] = [];
const slideContexts: SlideContext[] = [];
const lastRenderedStep = new Map<number, number>();
let currentSlideNumber = 1;
let laserEnabled = false;

function isAnyModalOpen(): boolean {
  return !fullViewModal.hidden || !codeZoomModal.hidden;
}

function openCodeZoom(title: string, startLine: number, endLine: number, highlightLines?: number[]): void {
  if (!savedFocusBeforeModal) {
    savedFocusBeforeModal = document.activeElement as HTMLElement | null;
  }
  codeZoomTitle.textContent = title;
  codeZoomBody.innerHTML = renderPythonWindow({
    title,
    startLine,
    endLine,
    highlightLines,
    zoomable: false,
  });
  codeZoomModal.hidden = false;
  codeZoomBody.focus();
}

function closeCodeZoom(): void {
  codeZoomModal.hidden = true;
  if (!isAnyModalOpen() && savedFocusBeforeModal) {
    savedFocusBeforeModal.focus();
    savedFocusBeforeModal = null;
  }
}

function openFullView(slide: SlideDef): void {
  savedFocusBeforeModal = document.activeElement as HTMLElement | null;
  fullViewBadge.textContent = `Trang ${pad2(slide.number)}/${ALL_SLIDES.length} · ${slide.chapter}`;
  fullViewTitle.textContent = slide.title;

  const fv = slide.fullView;
  const parts: string[] = [];
  parts.push(`<div class="fv-summary">${fv.summary}</div>`);

  for (const sec of fv.sections) {
    parts.push(`<section class="fv-sec"><h3>${escapeHtml(sec.heading)}</h3>${sec.bodyHtml}</section>`);
  }

  if (fv.formulas && fv.formulas.length > 0) {
    parts.push('<section class="fv-sec"><h3>Công thức chính</h3>');
    for (const f of fv.formulas) {
      parts.push(`<div class="fv-formula"><div class="fv-formula__lbl">${escapeHtml(f.label)}</div>${texBlock(f.tex)}</div>`);
    }
    parts.push('</section>');
  }

  if (fv.codeSlice) {
    parts.push('<section class="fv-sec"><h3>Mã Python tham chiếu</h3>');
    parts.push(
      renderPythonWindow({
        title: fv.codeSlice.title,
        startLine: fv.codeSlice.startLine,
        endLine: fv.codeSlice.endLine,
        zoomable: false,
      }),
    );
    parts.push('</section>');
  }

  if (fv.references && fv.references.length > 0) {
    parts.push('<section class="fv-sec"><h3>Tài liệu tham khảo</h3><ul class="fv-refs">');
    for (const r of fv.references) {
      parts.push(`<li><a href="${r.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.label)}</a></li>`);
    }
    parts.push('</ul></section>');
  }

  fullViewBody.innerHTML = parts.join('');
  fullViewModal.hidden = false;
  fullViewBody.focus();
}

function closeFullView(): void {
  fullViewModal.hidden = true;
  if (!isAnyModalOpen() && savedFocusBeforeModal) {
    savedFocusBeforeModal.focus();
    savedFocusBeforeModal = null;
  }
}

function goToSlide(slideNumber: number): void {
  if (!deck) return;
  const idx = Math.min(Math.max(slideNumber - 1, 0), ALL_SLIDES.length - 1);
  deck.slide(idx, 0, -1);
}

// Mount all slides into the Reveal container
for (const slide of ALL_SLIDES) {
  const sec = document.createElement('section');
  sec.className = `slide-section theme-${slide.theme}`;
  sec.dataset.slideNumber = String(slide.number);
  sec.dataset.slideTitle = slide.title;
  sec.setAttribute('aria-label', `Trang ${pad2(slide.number)}: ${slide.title}`);

  const stage = document.createElement('div');
  stage.className = 'slide-stage';
  sec.appendChild(stage);

  // Invisible Reveal.js fragments so every click step is tracked by Reveal & URL hash
  const fragHost = document.createElement('div');
  fragHost.className = 'step-fragments';
  fragHost.setAttribute('aria-hidden', 'true');
  for (let k = 1; k <= slide.stepCount; k++) {
    const marker = document.createElement('span');
    marker.className = 'fragment step-marker';
    marker.dataset.stepIndex = String(k);
    fragHost.appendChild(marker);
  }
  sec.appendChild(fragHost);

  // Speaker Notes (<aside class="notes">)
  const notes = document.createElement('aside');
  notes.className = 'notes';
  notes.innerHTML = `
    <p><strong>[${pad2(slide.number)}/${ALL_SLIDES.length} · ${escapeHtml(slide.title)}]</strong></p>
    <p><strong>Lời dẫn:</strong> ${escapeHtml(slide.leadIn)}</p>
    <hr />
    <p>${escapeHtml(slide.fullScript)}</p>
  `;
  sec.appendChild(notes);

  slidesContainer.appendChild(sec);
  slideSections.push(sec);

  const ctx: SlideContext = {
    slideEl: stage,
    goToSlide,
    openCodeZoom,
    getReducedMotion,
  };
  slideContexts.push(ctx);
  slide.mount(ctx);

  // Wire zoomable code windows on this slide
  stage.querySelectorAll<HTMLElement>('[data-zoom-code="true"]').forEach((win) => {
    const triggerZoom = (ev: Event) => {
      ev.stopPropagation();
      const title = win.dataset.zoomTitle ?? 'Python';
      const start = Number(win.dataset.zoomStart ?? 1);
      const end = Number(win.dataset.zoomEnd ?? 113);
      const hl: number[] = [];
      win.querySelectorAll<HTMLElement>('.code-line.is-hl').forEach((r) => hl.push(Number(r.dataset.line)));
      openCodeZoom(title, start, end, hl);
    };
    win.addEventListener('click', triggerZoom);
    win.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        triggerZoom(ev);
      }
    });
  });
}

function getCurrentStepForSection(sec: HTMLElement): number {
  return sec.querySelectorAll('.step-marker.visible').length;
}

function syncCurrentSlide(playTransitionFrom?: number, forceEntrance = false): void {
  if (!deck) return;
  const indices = deck.getIndices();
  const h = Math.min(Math.max(indices.h ?? 0, 0), ALL_SLIDES.length - 1);
  const slide = ALL_SLIDES[h];
  const sec = slideSections[h];
  const ctx = slideContexts[h];
  const step = getCurrentStepForSection(sec);

  cancelSlideTransition(transitionOverlay);
  slide.cancelAnimations?.(ctx.slideEl);

  const isSlideChange = playTransitionFrom !== undefined && playTransitionFrom !== slide.number;
  if (isSlideChange) {
    const prevIdx = playTransitionFrom - 1;
    if (prevIdx >= 0 && prevIdx < ALL_SLIDES.length) {
      ALL_SLIDES[prevIdx].cancelAnimations?.(slideContexts[prevIdx].slideEl);
    }
  }
  if (isSlideChange && !deck.isOverview()) {
    const prevSec = slideSections[playTransitionFrom - 1] ?? null;
    playSlideTransition(transitionOverlay, prevSec, sec, playTransitionFrom, slide.number, getReducedMotion());
    triggerSlideEntrance(sec, getReducedMotion());
  } else if (forceEntrance && !deck.isOverview()) {
    triggerSlideEntrance(sec, getReducedMotion());
  } else {
    sec.classList.remove('slide-entering');
  }

  const prevStep = lastRenderedStep.get(slide.number) ?? null;
  slide.renderStep(step, prevStep, ctx);
  lastRenderedStep.set(slide.number, step);
  currentSlideNumber = slide.number;

  // Update top kinetic progress ribbon & podium bar
  topProgressFill.style.transform = `scaleX(${slide.number / ALL_SLIDES.length})`;
  statusChapter.textContent = slide.chapter;
  statusPage.textContent = `${pad2(slide.number)}/${ALL_SLIDES.length}`;
  statusStep.textContent = `Nhịp ${step}/${slide.stepCount}`;

  btnPrev.disabled = slide.number === 1 && step === 0;
  btnNext.disabled = slide.number === ALL_SLIDES.length && step === slide.stepCount;
}

// Initialize Reveal.js 5 with RevealNotes
deck = new Reveal(document.getElementById('deck-root')!, {
  plugins: [RevealNotes],
  width: 1280,
  height: 720,
  margin: 0.04,
  minScale: 0.2,
  maxScale: 2.0,
  center: false,
  hash: true,
  fragmentInURL: true,
  autoSlide: 0,
  transition: 'none',
  backgroundTransition: 'none',
  controls: false,
  progress: true,
  slideNumber: false,
  keyboard: true,
  overview: true,
  help: false,
});

deck.initialize().then(() => {
  ALL_SLIDES.forEach((s, idx) => {
    s.renderStep(0, null, slideContexts[idx]);
    lastRenderedStep.set(s.number, 0);
  });
  initStageParticles(getReducedMotion);
  syncCurrentSlide(undefined, true);
});

deck.on('slidechanged', (event: unknown) => {
  const ev = event as { indexh?: number };
  const prevNum = currentSlideNumber;
  const nextNum = (ev.indexh ?? 0) + 1;
  syncCurrentSlide(prevNum !== nextNum ? prevNum : undefined);
});

deck.on('fragmentshown', () => {
  syncCurrentSlide();
});

deck.on('fragmenthidden', () => {
  syncCurrentSlide();
});

deck.on('overviewshown', () => {
  cancelSlideTransition(transitionOverlay);
});

deck.on('overviewhidden', () => {
  syncCurrentSlide();
});

// Single background-click handler: one click advances strictly one step
document.getElementById('deck-root')!.addEventListener('click', (ev) => {
  if (!deck || deck.isOverview() || isAnyModalOpen()) return;
  const target = ev.target as HTMLElement | null;
  if (!target) return;

  const sel = window.getSelection();
  if (sel && sel.toString().trim().length > 0) return;

  if (
    target.closest(
      'button, a, input, label, [data-zoom-code], .tr-key--clickable, .mini-drawer, .podium-bar, .modal-backdrop, .toc-bar, .ext-card, .rec-pill, .step-chip, .s18-click-row',
    )
  ) {
    return;
  }

  const h = deck.getIndices().h ?? 0;
  const slide = ALL_SLIDES[h];
  const step = getCurrentStepForSection(slideSections[h]);
  if (slide.number === ALL_SLIDES.length && step >= slide.stepCount) return;

  deck.next();
});

// Podium button actions
btnPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  deck?.prev();
});

btnNext.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!deck) return;
  const h = deck.getIndices().h ?? 0;
  const slide = ALL_SLIDES[h];
  const step = getCurrentStepForSection(slideSections[h]);
  if (slide.number === ALL_SLIDES.length && step >= slide.stepCount) return;
  deck.next();
});

btnReset.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!deck) return;
  const h = deck.getIndices().h ?? 0;
  const slide = ALL_SLIDES[h];
  slide.cancelAnimations?.(slideContexts[h].slideEl);
  cancelSlideTransition(transitionOverlay);
  deck.slide(h, 0, -1);
  lastRenderedStep.set(slide.number, -1);
  syncCurrentSlide();
});

btnToc.addEventListener('click', (e) => {
  e.stopPropagation();
  goToSlide(2);
});

btnFullView.addEventListener('click', (e) => {
  e.stopPropagation();
  const slide = ALL_SLIDES[currentSlideNumber - 1];
  openFullView(slide);
});

btnOverview.addEventListener('click', (e) => {
  e.stopPropagation();
  deck?.toggleOverview();
});

btnNotes.addEventListener('click', (e) => {
  e.stopPropagation();
  const notesPlugin = deck?.getPlugin('notes') as { open?: () => void } | undefined;
  if (notesPlugin?.open) {
    notesPlugin.open();
  }
});

function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

btnFullscreen.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

function toggleLaser(): void {
  laserEnabled = !laserEnabled;
  laserLayer.classList.toggle('is-on', laserEnabled);
  btnLaser.setAttribute('aria-pressed', String(laserEnabled));
  btnLaser.classList.toggle('podium-btn--laser-on', laserEnabled);
}

btnLaser.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleLaser();
});

window.addEventListener('pointermove', (ev) => {
  if (!laserEnabled) return;
  laserDot.style.transform = `translate3d(${ev.clientX}px, ${ev.clientY}px, 0)`;
});

// Modal close listeners
fullViewClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeFullView();
});
fullViewModal.addEventListener('click', (e) => {
  if (e.target === fullViewModal) closeFullView();
});

codeZoomClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeCodeZoom();
});
codeZoomModal.addEventListener('click', (e) => {
  if (e.target === codeZoomModal) closeCodeZoom();
});

// Layered keyboard handler (Esc closes topmost dialog first; L toggles laser; F fullscreen)
window.addEventListener(
  'keydown',
  (ev) => {
    if (ev.key === 'Escape') {
      if (!codeZoomModal.hidden) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        closeCodeZoom();
        return;
      }
      if (!fullViewModal.hidden) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        closeFullView();
        return;
      }
      const try16Drawer = document.querySelector<HTMLElement>('[data-role="try16-drawer"]:not([hidden])');
      if (try16Drawer) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        try16Drawer.hidden = true;
        return;
      }
      return;
    }

    if (isAnyModalOpen()) {
      if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(ev.key) && ev.target === document.body) {
        ev.stopPropagation();
      }
      return;
    }

    if (ev.key === 'l' || ev.key === 'L') {
      ev.preventDefault();
      toggleLaser();
    } else if (ev.key === 'f' || ev.key === 'F') {
      ev.preventDefault();
      toggleFullscreen();
    }
  },
  true,
);
