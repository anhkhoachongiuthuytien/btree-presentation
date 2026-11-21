// Interactive Slide-out Timeline Rail (T key / left-edge trigger / corner icon)
// Inspired by keynote timeline scrubbers, styled in Nhóm 10 Blueprint geometry.

import type { SlideDef } from './types';
import { soundFx } from './soundEffects';

export interface TimelineController {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
  markActive: (slideNumber: number) => void;
}

export function initTimelineDrawer(
  slides: SlideDef[],
  onSelectSlide: (slideNumber: number) => void,
): TimelineController {
  const backdrop = document.getElementById('timeline-backdrop')!;
  const drawer = document.getElementById('timeline-drawer')!;
  const listEl = document.getElementById('tl-list')!;
  const railEl = document.getElementById('tl-rail')!;
  const fillEl = document.getElementById('tl-fill')!;
  const thumbEl = document.getElementById('tl-thumb')!;
  const closeBtn = document.getElementById('tl-close') as HTMLButtonElement;
  const edgeTrigger = document.getElementById('tl-edge')!;

  let openState = false;
  let currentNum = 1;
  let dragging = false;

  // Render chapter-grouped 30-slide list
  const html: string[] = [];
  let lastChapter = '';
  for (const s of slides) {
    if (s.chapter !== lastChapter) {
      lastChapter = s.chapter;
      html.push(`<div class="tl-chapter-head">${s.chapter}</div>`);
    }
    html.push(
      `<button type="button" class="tl-item" data-tl-slide="${s.number}">` +
        `<span class="tl-num">${String(s.number).padStart(2, '0')}</span>` +
        `<span class="tl-meta"><b>${s.title}</b><small>${s.stepCount} nhịp</small></span>` +
      `</button>`,
    );
  }
  listEl.innerHTML = html.join('');

  const items = Array.from(listEl.querySelectorAll<HTMLButtonElement>('.tl-item'));

  const updateRail = (slideNum: number) => {
    const ratio = slides.length > 1 ? (slideNum - 1) / (slides.length - 1) : 0;
    const pct = `${(ratio * 100).toFixed(2)}%`;
    fillEl.style.height = pct;
    thumbEl.style.top = pct;
    thumbEl.textContent = String(slideNum).padStart(2, '0');
  };

  const markActive = (slideNumber: number) => {
    currentNum = slideNumber;
    items.forEach((btn) => {
      const isCur = Number(btn.dataset.tlSlide) === slideNumber;
      btn.classList.toggle('is-cur', isCur);
      if (isCur && openState) {
        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
    updateRail(slideNumber);
  };

  const open = () => {
    if (openState) return;
    openState = true;
    backdrop.hidden = false;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    soundFx.playModal(true);
    markActive(currentNum);
    const activeBtn = listEl.querySelector<HTMLButtonElement>('.tl-item.is-cur');
    activeBtn?.scrollIntoView({ block: 'center' });
  };

  const close = () => {
    if (!openState) return;
    openState = false;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    soundFx.playModal(false);
  };

  const toggle = () => {
    if (openState) close();
    else open();
  };

  items.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = Number(btn.dataset.tlSlide);
      close();
      onSelectSlide(target);
      soundFx.playSparkleChime();
    });
  });

  // Draggable vertical scrubber rail
  const scrubFromClientY = (clientY: number) => {
    const rect = railEl.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientY - rect.top) / Math.max(1, rect.height), 0), 1);
    const target = Math.min(slides.length, Math.max(1, Math.round(ratio * (slides.length - 1)) + 1));
    if (target !== currentNum) {
      markActive(target);
      onSelectSlide(target);
    }
  };

  railEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    dragging = true;
    railEl.classList.add('is-drag');
    railEl.setPointerCapture(e.pointerId);
    scrubFromClientY(e.clientY);
  });

  railEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    scrubFromClientY(e.clientY);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    railEl.classList.remove('is-drag');
    soundFx.playSparkleChime();
  };
  railEl.addEventListener('pointerup', endDrag);
  railEl.addEventListener('pointercancel', endDrag);

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  backdrop.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  edgeTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    open();
  });

  markActive(1);

  return {
    open,
    close,
    toggle,
    isOpen: () => openState,
    markActive,
  };
}
