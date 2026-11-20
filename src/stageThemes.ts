// Chapter-tailored architectural stage skins for all tree & flowchart containers.
// Pure crisp CSS + lightweight non-interactive corner decor (zero canvas overhead,
// preserves 100% foreground contrast on B-tree nodes, edges, and labels).

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

type ChapterSkin = 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5';

function getSkinForSlide(slideNum: number): ChapterSkin {
  if (slideNum <= 5) return 'ch1';
  if (slideNum <= 12) return 'ch2';
  if (slideNum <= 17) return 'ch3';
  if (slideNum <= 22) return 'ch4';
  return 'ch5';
}

function buildDecorHtml(skin: ChapterSkin, slideNum: number, compact: boolean): string {
  switch (skin) {
    case 'ch1':
      return `
        <span class="sd-cross sd-tl"></span>
        <span class="sd-cross sd-tr"></span>
        <span class="sd-cross sd-bl"></span>
        <span class="sd-cross sd-br"></span>
        ${compact ? '' : '<span class="sd-tag sd-tag--tl">BLUEPRINT · CH.01</span>'}
      `;
    case 'ch2': {
      const opTone =
        slideNum === 6 ? 'cobalt'
        : slideNum === 7 || slideNum === 8 ? 'amber'
        : 'emerald';
      const opLabel =
        slideNum === 6 ? 'OP · SEARCH'
        : slideNum === 7 || slideNum === 8 ? 'OP · INSERT / SPLIT'
        : 'OP · DELETE';
      return `
        <span class="sd-brk sd-brk--${opTone} sd-tl"></span>
        <span class="sd-brk sd-brk--${opTone} sd-tr"></span>
        <span class="sd-brk sd-brk--${opTone} sd-bl"></span>
        <span class="sd-brk sd-brk--${opTone} sd-br"></span>
        ${compact ? '' : `<span class="sd-tag sd-tag--tr sd-tag--${opTone}">${opLabel}</span>`}
      `;
    }
    case 'ch3':
      return `
        <span class="sd-ram-dots"></span>
        <span class="sd-top-signal"></span>
        ${compact ? '' : '<span class="sd-tag sd-tag--tl sd-tag--live"><i class="sd-live-dot"></i>RAM SYNC</span>'}
      `;
    case 'ch4':
      return compact ? '' : '<span class="sd-tag sd-tag--br">COORDINATE · CH.04</span>';
    case 'ch5':
      return `
        <span class="sd-track-pulse sd-tp-1"></span>
        <span class="sd-track-pulse sd-tp-2"></span>
        ${compact ? '' : '<span class="sd-tag sd-tag--bl">SEQUENTIAL TRACKS</span>'}
      `;
  }
}

export function initChapterStageSkins(): void {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>(STAGE_SELECTOR));

  for (const host of hosts) {
    const sec = host.closest<HTMLElement>('section.slide-section');
    const slideNum = Number(sec?.dataset.slideNumber ?? 0);
    if (slideNum < 3) continue;

    const skin = getSkinForSlide(slideNum);
    const compact =
      host.classList.contains('s10-row__tree') ||
      host.classList.contains('s14-tree') ||
      host.classList.contains('s15-tree') ||
      host.classList.contains('s18-op-tree') ||
      host.classList.contains('s19-tree-box');

    host.classList.add('stage-skinned', `stage-skin--${skin}`);

    if (!host.querySelector('.stage-decor')) {
      const decor = document.createElement('div');
      decor.className = `stage-decor stage-decor--${skin}`;
      decor.setAttribute('aria-hidden', 'true');
      decor.innerHTML = buildDecorHtml(skin, slideNum, compact);
      host.prepend(decor);
    }
  }
}
