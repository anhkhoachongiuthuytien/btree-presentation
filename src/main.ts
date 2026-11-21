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
import { initChapterStageSkins } from './stageThemes';
import {
  soundFx,
  getChapterThemeForSlide,
  CHAPTER_THEME_LABELS,
  type ChapterSoundTheme,
} from './soundEffects';
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
const fxRippleLayer = document.getElementById('fx-ripple-layer')!;
const ghostAudioBtn = document.getElementById('ghost-audio-btn') as HTMLButtonElement | null;

type RippleTone = 'cobalt' | 'emerald' | 'amber' | 'red' | 'laser';

function spawnRipple(clientX: number, clientY: number, tone: RippleTone = 'cobalt'): void {
  if (getReducedMotion()) return;
  const ring = document.createElement('span');
  ring.className = `fx-ripple fx-ripple--${tone}`;
  ring.style.left = `${clientX}px`;
  ring.style.top = `${clientY}px`;
  fxRippleLayer.appendChild(ring);
  ring.addEventListener('animationend', () => ring.remove(), { once: true });
}

let audioPulseTimer: number | null = null;
soundFx.setOnPulse(() => {
  if (!ghostAudioBtn || !soundFx.isEnabled()) return;
  ghostAudioBtn.classList.add('is-sounding');
  if (audioPulseTimer !== null) window.clearTimeout(audioPulseTimer);
  audioPulseTimer = window.setTimeout(() => {
    ghostAudioBtn.classList.remove('is-sounding');
    audioPulseTimer = null;
  }, 190);
});

function updateAudioButtonTitle(theme: ChapterSoundTheme): void {
  if (!ghostAudioBtn) return;
  const label = CHAPTER_THEME_LABELS[theme];
  ghostAudioBtn.title = soundFx.isEnabled()
    ? `Âm thanh BẬT · ${label} (A)`
    : `Âm thanh TẮT · ${label} (A)`;
}

function toggleAudio(): void {
  const on = soundFx.toggle();
  const theme = soundFx.getChapterTheme();
  if (ghostAudioBtn) {
    ghostAudioBtn.setAttribute('aria-pressed', String(on));
    ghostAudioBtn.classList.toggle('is-muted', !on);
    if (!on) ghostAudioBtn.classList.remove('is-sounding');
  }
  updateAudioButtonTitle(theme);
  showShortcutToast(
    on ? `Âm thanh: BẬT · ${CHAPTER_THEME_LABELS[theme]}` : 'Âm thanh: TẮT (nhấn A để bật)',
  );
}

function playSemanticStepSound(
  slideNumber: number,
  step: number,
  maxStep: number,
  theme: ChapterSoundTheme,
): void {
  switch (slideNumber) {
    case 6: // Search(17)
      if (step === 1 || step === 2) {
        soundFx.playSearchHop(step - 1);
        return;
      }
      if (step === 3) {
        soundFx.playSuccess();
        return;
      }
      break;
    case 7: // Insert & Split
      if (step === 1) {
        soundFx.playInsertSlide();
        return;
      }
      if (step === 2) {
        soundFx.playOverflow();
        return;
      }
      if (step === 3) {
        soundFx.playSplit();
        return;
      }
      break;
    case 8: // Cascading Split
      if (step === 1 || step === 2) {
        soundFx.playOverflow();
        return;
      }
      if (step === 3) {
        soundFx.playSplit();
        return;
      }
      break;
    case 9: // Delete Leaf / Internal
      if (step === 1) {
        soundFx.playDeletePop();
        return;
      }
      if (step === 2) {
        soundFx.playSearchHop(1);
        return;
      }
      if (step === 3) {
        soundFx.playBorrowRotate();
        return;
      }
      break;
    case 10: // Borrow & Merge
      if (step === 1) {
        soundFx.playDeletePop();
        return;
      }
      if (step === 2) {
        soundFx.playBorrowRotate();
        return;
      }
      if (step === 3) {
        soundFx.playOverflow();
        return;
      }
      if (step === 4) {
        soundFx.playMergeFold();
        return;
      }
      break;
    case 11: // Trace Delete(5)
      if (step === 1) {
        soundFx.playDeletePop();
        return;
      }
      if (step === 2 || step === 4) {
        soundFx.playMergeFold();
        return;
      }
      if (step === 3) {
        soundFx.playOverflow();
        return;
      }
      if (step === 5) {
        soundFx.playSuccess();
        return;
      }
      break;
    case 17: // Live Python typing handles its own mechanical keyboard & stdout sounds
      return;
    case 21: // RAM vs Disk I/O
      if (step === 2) {
        soundFx.playDiskSeek();
        return;
      }
      break;
    case 23: // B+ Tree Range Scan
      if (step === 1) {
        soundFx.playSearchHop(1);
        return;
      }
      if (step === 2) {
        soundFx.playRangeScan(5);
        return;
      }
      if (step === 3) {
        soundFx.playSuccess();
        return;
      }
      break;
    case 24: // B+ Tree Copy-up
      if (step === 1) {
        soundFx.playInsertSlide();
        return;
      }
      if (step === 2) {
        soundFx.playCopyUp();
        return;
      }
      if (step === 3) {
        soundFx.playSuccess();
        return;
      }
      break;
    case 25: // B* Tree Redistribute
      if (step === 1) {
        soundFx.playInsertSlide();
        return;
      }
      if (step === 2) {
        soundFx.playBorrowRotate();
        return;
      }
      if (step === 3) {
        soundFx.playSuccess();
        return;
      }
      break;
    case 26: // B* Tree Split 2->3
      if (step === 1) {
        soundFx.playOverflow();
        return;
      }
      if (step === 2) {
        soundFx.playSplit();
        return;
      }
      if (step === 3) {
        soundFx.playSuccess();
        return;
      }
      break;
    case 28: // XFS Free-space problem
      if (step === 1) {
        soundFx.playAlert();
        return;
      }
      if (step === 2) {
        soundFx.playDiskAlloc();
        return;
      }
      break;
    case 29: // XFS bnobt & cntbt
      if (step === 1 || step === 3) {
        soundFx.playDiskSeek();
        return;
      }
      if (step === 2) {
        soundFx.playDiskAlloc();
        return;
      }
      if (step === 4) {
        soundFx.playDiskCoalesce();
        return;
      }
      break;
    case 30: // XFS Alloc & Reclaim
      if (step === 2) {
        soundFx.playDiskAlloc();
        return;
      }
      if (step === 3) {
        soundFx.playDiskCoalesce();
        return;
      }
      if (step === 4) {
        soundFx.playSuccess();
        return;
      }
      break;
    default:
      break;
  }
  soundFx.playStepTick(step, maxStep, theme);
}

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

const shortcutsModal = document.getElementById('shortcuts-modal')!;
const shortcutsClose = document.getElementById('shortcuts-close') as HTMLButtonElement;
const shortcutToast = document.getElementById('shortcut-toast')!;
let toastTimer: number | null = null;

let savedFocusBeforeModal: HTMLElement | null = null;
let deck: Reveal.Api | null = null;
const slideSections: HTMLElement[] = [];
const slideContexts: SlideContext[] = [];
const lastRenderedStep = new Map<number, number>();
let currentSlideNumber = 1;
let laserEnabled = false;

function showShortcutToast(msg: string): void {
  shortcutToast.textContent = msg;
  shortcutToast.hidden = false;
  shortcutToast.classList.remove('is-show');
  void shortcutToast.offsetWidth;
  shortcutToast.classList.add('is-show');
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    shortcutToast.classList.remove('is-show');
    shortcutToast.hidden = true;
    toastTimer = null;
  }, 1500);
}

function isAnyModalOpen(): boolean {
  return !fullViewModal.hidden || !codeZoomModal.hidden || !shortcutsModal.hidden;
}

function closeShortcutsModal(): void {
  shortcutsModal.hidden = true;
  soundFx.playModal(false);
  if (!isAnyModalOpen() && savedFocusBeforeModal) {
    savedFocusBeforeModal.focus();
    savedFocusBeforeModal = null;
  }
}

function toggleShortcutsModal(): void {
  if (!shortcutsModal.hidden) {
    closeShortcutsModal();
    return;
  }
  if (!savedFocusBeforeModal) {
    savedFocusBeforeModal = document.activeElement as HTMLElement | null;
  }
  shortcutsModal.hidden = false;
  soundFx.playModal(true);
  shortcutsClose.focus();
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
  soundFx.playModal(true);
  codeZoomBody.focus();
}

function closeCodeZoom(): void {
  codeZoomModal.hidden = true;
  soundFx.playModal(false);
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
  soundFx.playModal(true);
  fullViewBody.focus();
}

function closeFullView(): void {
  fullViewModal.hidden = true;
  soundFx.playModal(false);
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

  // Sync body canvas backdrop & chapter acoustic theme seamlessly
  document.body.dataset.slideTheme = slide.theme;
  const chapterSoundTheme = getChapterThemeForSlide(slide.number);
  soundFx.setChapterTheme(chapterSoundTheme);
  updateAudioButtonTitle(chapterSoundTheme);

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
  margin: 0,
  minScale: 0.2,
  maxScale: 3.0,
  center: true,
  hash: true,
  fragmentInURL: true,
  autoSlide: 0,
  transition: 'none',
  backgroundTransition: 'none',
  controls: false,
  progress: false,
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
  initChapterStageSkins();
  syncCurrentSlide(undefined, true);
});

deck.on('slidechanged', (event: unknown) => {
  const ev = event as { indexh?: number };
  const prevNum = currentSlideNumber;
  const nextNum = (ev.indexh ?? 0) + 1;
  if (prevNum !== nextNum) {
    const prevTheme = getChapterThemeForSlide(prevNum);
    const nextTheme = getChapterThemeForSlide(nextNum);
    soundFx.setChapterTheme(nextTheme);
    if (prevTheme !== nextTheme) {
      soundFx.playChapterIdent(nextTheme);
    } else {
      soundFx.playSlideWhoosh(nextNum > prevNum ? 'next' : 'prev', nextTheme);
    }
  }
  syncCurrentSlide(prevNum !== nextNum ? prevNum : undefined);
});

deck.on('fragmentshown', () => {
  syncCurrentSlide();
  const h = deck?.getIndices().h ?? 0;
  const slide = ALL_SLIDES[h];
  if (slide) {
    const step = getCurrentStepForSection(slideSections[h]);
    const theme = getChapterThemeForSlide(slide.number);
    playSemanticStepSound(slide.number, step, slide.stepCount, theme);
  }
});

deck.on('fragmenthidden', () => {
  syncCurrentSlide();
  const h = deck?.getIndices().h ?? 0;
  const slide = ALL_SLIDES[h];
  if (slide) {
    const step = getCurrentStepForSection(slideSections[h]);
    const theme = getChapterThemeForSlide(slide.number);
    soundFx.playStepTick(step, slide.stepCount, theme);
  }
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

function resetCurrentSlide(): void {
  if (!deck) return;
  const h = deck.getIndices().h ?? 0;
  const slide = ALL_SLIDES[h];
  slide.cancelAnimations?.(slideContexts[h].slideEl);
  cancelSlideTransition(transitionOverlay);
  deck.slide(h, 0, -1);
  lastRenderedStep.set(slide.number, -1);
  syncCurrentSlide();
  showShortcutToast(`Đặt lại nhịp 0 · Trang ${pad2(slide.number)}`);
}

btnReset.addEventListener('click', (e) => {
  e.stopPropagation();
  resetCurrentSlide();
});

btnToc.addEventListener('click', (e) => {
  e.stopPropagation();
  goToSlide(2);
});

function toggleFullView(): void {
  if (!fullViewModal.hidden) {
    closeFullView();
  } else {
    const slide = ALL_SLIDES[currentSlideNumber - 1];
    openFullView(slide);
  }
}

btnFullView.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFullView();
});

btnOverview.addEventListener('click', (e) => {
  e.stopPropagation();
  deck?.toggleOverview();
});

function openSpeakerNotes(): void {
  const notesPlugin = deck?.getPlugin('notes') as { open?: () => void } | undefined;
  if (notesPlugin?.open) {
    notesPlugin.open();
  }
}

btnNotes.addEventListener('click', (e) => {
  e.stopPropagation();
  openSpeakerNotes();
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

document.getElementById('ghost-fs-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleFullscreen();
});

ghostAudioBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleAudio();
});

// Unlock Web Audio cleanly on first user gesture & spawn semantic interactive feedback
window.addEventListener(
  'pointerdown',
  (ev) => {
    soundFx.unlock();
    const target = ev.target as HTMLElement | null;
    if (!target) return;

    if (laserEnabled) {
      spawnRipple(ev.clientX, ev.clientY, 'laser');
    }

    const extCard = target.closest<HTMLElement>('.ext-card');
    if (extCard) {
      const ok = Number(extCard.dataset.extLen ?? 0) >= 10;
      spawnRipple(ev.clientX, ev.clientY, ok ? 'emerald' : 'red');
      if (ok) soundFx.playSuccess();
      else soundFx.playAlert();
      return;
    }

    const s03Probe = target.closest<HTMLElement>('[data-s03-probe]');
    if (s03Probe) {
      const mode = s03Probe.dataset.s03Probe;
      const ok = mode === 'search';
      spawnRipple(ev.clientX, ev.clientY, ok ? 'emerald' : 'amber');
      if (ok) soundFx.playSuccess();
      else soundFx.playAlert();
      return;
    }

    const s26Btn = target.closest<HTMLElement>('.s26-qbtn');
    if (s26Btn) {
      spawnRipple(ev.clientX, ev.clientY, 'emerald');
      const app = s26Btn.dataset.qapp;
      if (app === '1') soundFx.playRangeScan(3);
      else if (app === '2') soundFx.playDiskSeek();
      else soundFx.playRangeScan(4);
      return;
    }

    const s29Sim = target.closest<HTMLElement>('[data-s29-sim]');
    if (s29Sim) {
      const sim = s29Sim.dataset.s29Sim;
      if (sim === '2') {
        spawnRipple(ev.clientX, ev.clientY, 'amber');
        soundFx.playDiskAlloc();
      } else if (sim === '3') {
        spawnRipple(ev.clientX, ev.clientY, 'emerald');
        soundFx.playDiskCoalesce();
      } else {
        spawnRipple(ev.clientX, ev.clientY, 'cobalt');
        soundFx.playClick();
      }
      return;
    }

    if (target.closest('.s11-card-borrow')) {
      spawnRipple(ev.clientX, ev.clientY, 'emerald');
      soundFx.playBorrowRotate();
      return;
    }

    if (target.closest('.s11-card-merge')) {
      spawnRipple(ev.clientX, ev.clientY, 'amber');
      soundFx.playMergeFold();
      return;
    }

    if (target.closest('[data-mval]')) {
      spawnRipple(ev.clientX, ev.clientY, 'cobalt');
      soundFx.playInsertSlide();
      return;
    }

    if (target.closest('[data-s04-probe]')) {
      spawnRipple(ev.clientX, ev.clientY, 'emerald');
      soundFx.playSearchHop(1);
      return;
    }

    if (target.closest('.xfs-cell')) {
      spawnRipple(ev.clientX, ev.clientY, 'cobalt');
      soundFx.playDiskSeek();
      return;
    }

    if (target.closest('[data-role="reveal-ans"], .rec-pill')) {
      spawnRipple(ev.clientX, ev.clientY, 'emerald');
      soundFx.playSuccess();
      return;
    }

    const interactive = target.closest(
      'button:not(#ghost-audio-btn), .toc-bar, .tr-key--clickable, .s05-card, .s18-click-row, [data-zoom-code]',
    );
    if (interactive) {
      spawnRipple(ev.clientX, ev.clientY, 'cobalt');
      soundFx.playClick();
    }
  },
  true,
);

function togglePodiumBar(): void {
  const hidden = document.body.classList.toggle('podium-hidden');
  deck?.layout();
  showShortcutToast(hidden ? 'Thanh điều khiển: ẨN (nhấn B để hiện)' : 'Thanh điều khiển: HIỆN (nhấn B để ẩn)');
}

function toggleLaser(): void {
  laserEnabled = !laserEnabled;
  laserLayer.classList.toggle('is-on', laserEnabled);
  btnLaser.setAttribute('aria-pressed', String(laserEnabled));
  btnLaser.classList.toggle('podium-btn--laser-on', laserEnabled);
  showShortcutToast(laserEnabled ? 'Laser: BẬT' : 'Laser: TẮT');
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

shortcutsClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeShortcutsModal();
});
shortcutsModal.addEventListener('click', (e) => {
  if (e.target === shortcutsModal) closeShortcutsModal();
});

// Layered keyboard handler (all podium bar actions available via single-key shortcuts)
window.addEventListener(
  'keydown',
  (ev) => {
    soundFx.unlock();
    const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

    if (ev.key === 'Escape') {
      if (!shortcutsModal.hidden) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        closeShortcutsModal();
        return;
      }
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

    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;

    const key = ev.key.toLowerCase();

    if (ev.key === '?' || key === 'h') {
      ev.preventDefault();
      ev.stopPropagation();
      toggleShortcutsModal();
      return;
    }

    if (key === 'v') {
      ev.preventDefault();
      ev.stopPropagation();
      toggleFullView();
      return;
    }

    if (isAnyModalOpen()) {
      if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(ev.key) && ev.target === document.body) {
        ev.stopPropagation();
      }
      return;
    }

    if (key === 'l') {
      ev.preventDefault();
      ev.stopPropagation();
      toggleLaser();
    } else if (key === 'f') {
      ev.preventDefault();
      ev.stopPropagation();
      toggleFullscreen();
    } else if (key === 'r') {
      ev.preventDefault();
      ev.stopPropagation();
      resetCurrentSlide();
    } else if (key === 'm' || key === 't') {
      ev.preventDefault();
      ev.stopPropagation();
      goToSlide(2);
      showShortcutToast('Mục lục (Trang 02)');
    } else if (key === 'b') {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      togglePodiumBar();
    } else if (key === 'a') {
      ev.preventDefault();
      ev.stopPropagation();
      toggleAudio();
    }
  },
  true,
);
