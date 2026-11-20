import type { SlideDef, TreeSceneSpec } from '../types';
import { texInline, texBlock } from '../math';
import { renderTreeScene, cancelTreeAnimations } from '../svg/treeRenderer';

// ============================================================================
// SLIDE 17 — Chiều cao h đến từ đâu? (Bố cục Canva chuẩn: 2 cây tổng quát theo M, h)
// ============================================================================
function renderS17Block3D(cx: number, cy: number, w: number, h: number, label: string, active: boolean): string {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const b = 6;
  const stroke = active ? '#004AAD' : '#64748B';
  const topFill = active ? '#5284FF' : '#CBD5E1';
  const sideFill = active ? '#1D4ED8' : '#94A3B8';
  const faceFill = '#FFFFFF';
  const textFill = active ? '#0F1D3A' : '#64748B';
  return `
    <g>
      <polygon points="${x},${y} ${x + b},${y - b} ${x + w + b},${y - b} ${x + w},${y}" fill="${topFill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round" />
      <polygon points="${x + w},${y} ${x + w + b},${y - b} ${x + w + b},${y + h - b} ${x + w},${y + h}" fill="${sideFill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round" />
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${faceFill}" stroke="${stroke}" stroke-width="1.8" />
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="${textFill}" font-size="14" font-weight="700" font-family="'IBM Plex Mono', monospace">${label}</text>
    </g>
  `;
}

function buildS17CanvaSvg(side: 'max' | 'min', active: boolean, animate: boolean, isFocused: boolean): string {
  const ink = active ? '#0F1D3A' : '#64748B';
  const accent = active ? '#004AAD' : '#94A3B8';
  const op = active ? 1 : 0.36;
  const isMax = side === 'max';
  const tierCls = (i: number) => (animate ? `class="s17-tier is-anim" style="--tier:${i}"` : 'class="s17-tier"');
  const rulerCls = animate ? 'class="s17-draw-line is-anim" style="--dl:0.12s"' : '';
  const brClsL = animate ? 'class="s17-draw-line is-anim" style="--dl:0.18s"' : '';
  const brClsR = animate ? 'class="s17-draw-line is-anim" style="--dl:0.24s"' : '';
  const countCls = (i: number) => (animate ? `class="s17-count-pill is-anim" style="--tier:${i}"` : 'class="s17-count-pill"');

  const rootLabel = isMax ? 'M − 1 khóa' : '1 khóa';
  const nodeLabel = isMax ? 'M − 1' : '⌈M/2⌉ − 1';
  const nodeW = isMax ? 86 : 96;
  const rootW = isMax ? 116 : 94;
  const branchText = isMax ? 'M nhánh' : '2 nhánh';

  const count1 = isMax ? 'M' : '2';
  const countI = isMax ? 'Mⁱ' : '2⌈M/2⌉ⁱ⁻¹';
  const countH = isMax ? 'Mʰ' : '2⌈M/2⌉ʰ⁻¹';

  const leftX = 188;
  const rightX = 368;
  const midX = 278;
  const y0 = 56;
  const y1 = 128;
  const yi = 216;
  const yh = 304;
  const countX = 486;

  const leftPathId = `s17-pl-${side}`;
  const rightPathId = `s17-pr-${side}`;

  return `
  <svg class="s17-canva-svg${isFocused ? ' is-focused-svg' : ''}" viewBox="0 0 568 352" role="img" aria-label="${isMax ? 'Cây lấp đầy tối đa' : 'Cây lấp đầy tối thiểu'}">
    <defs>
      <marker id="s17-arr-${side}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${ink}" />
      </marker>
      <path id="${leftPathId}" d="M ${midX - 8} ${y0 + 15} L ${leftX + 4} ${y1 - 22}" />
      <path id="${rightPathId}" d="M ${midX + 8} ${y0 + 15} L ${rightX - 4} ${y1 - 22}" />
    </defs>

    <g opacity="${op}">
      <!-- Header -->
      <text x="${midX}" y="18" text-anchor="middle" fill="${ink}" font-size="16" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">${isMax ? 'LẤP ĐẦY TỐI ĐA' : 'LẤP ĐẦY TỐI THIỂU'}</text>
      <text x="${midX}" y="34" text-anchor="middle" fill="#1E3A8A" font-size="12" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">${isMax ? 'Mỗi node trong có M con.' : 'Gốc có 2 con; mỗi node trong khác có ⌈M/2⌉ con.'}</text>
      <text x="${countX}" y="32" text-anchor="middle" fill="${ink}" font-size="13" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">SỐ NODE</text>

      <!-- Left vertical height ruler h (draws downward) -->
      <g>
        <line ${rulerCls} pathLength="1" x1="22" y1="${y0 + 4}" x2="22" y2="${yh - 4}" stroke="${ink}" stroke-width="1.9" marker-start="url(#s17-arr-${side})" marker-end="url(#s17-arr-${side})" />
        <text x="34" y="185" fill="${ink}" font-size="16" font-weight="700" font-style="italic" font-family="Georgia, serif">h</text>
      </g>

      <!-- Tier 0: Root -->
      <g ${tierCls(0)}>
        <text x="82" y="${y0 - 4}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Gốc</text>
        <text x="82" y="${y0 + 11}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Tầng 0</text>
        ${renderS17Block3D(midX, y0, rootW, 28, rootLabel, active)}
        <g ${countCls(0)}>
          <rect x="${countX - 28}" y="${y0 - 15}" width="56" height="28" rx="14" fill="${active ? 'rgba(255,255,255,0.75)' : 'transparent'}" />
          <text x="${countX}" y="${y0 + 6}" text-anchor="middle" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-weight="700" font-size="19">1</text>
        </g>
      </g>

      <!-- Tier 1 -->
      <g ${tierCls(1)}>
        <line ${brClsL} pathLength="1" x1="${midX - 8}" y1="${y0 + 15}" x2="${leftX + 4}" y2="${y1 - 22}" stroke="${accent}" stroke-width="2" marker-end="url(#s17-arr-${side})" />
        <line ${brClsR} pathLength="1" x1="${midX + 8}" y1="${y0 + 15}" x2="${rightX - 4}" y2="${y1 - 22}" stroke="${accent}" stroke-width="2" marker-end="url(#s17-arr-${side})" />
        ${active ? `
          <circle r="3.4" fill="#5284FF" class="s17-pulse-dot">
            <animateMotion dur="2.1s" repeatCount="indefinite"><mpath href="#${leftPathId}"/></animateMotion>
          </circle>
          <circle r="3.4" fill="#5284FF" class="s17-pulse-dot">
            <animateMotion dur="2.1s" begin="0.35s" repeatCount="indefinite"><mpath href="#${rightPathId}"/></animateMotion>
          </circle>
        ` : ''}
        <text x="${midX}" y="${y0 + 44}" text-anchor="middle" fill="${accent}" font-size="12" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">${branchText}</text>
        <text x="82" y="${y1 + 5}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Tầng 1</text>
        ${renderS17Block3D(leftX, y1, nodeW, 28, nodeLabel, active)}
        ${renderS17Block3D(rightX, y1, nodeW, 28, nodeLabel, active)}
        ${isMax ? `<text x="${midX}" y="${y1 + 6}" fill="${ink}" font-size="22" font-weight="800" text-anchor="middle">⋯</text>` : ''}
        <g ${countCls(1)}>
          <rect x="${countX - 28}" y="${y1 - 15}" width="56" height="28" rx="14" fill="${active ? 'rgba(255,255,255,0.75)' : 'transparent'}" />
          <text x="${countX}" y="${y1 + 6}" text-anchor="middle" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-weight="700" font-size="19">${count1}</text>
        </g>
      </g>

      <!-- Tier i -->
      <g ${tierCls(2)}>
        <g fill="${ink}" font-size="22" font-weight="800" text-anchor="middle" class="${active ? 's17-dots-pulse' : ''}">
          <text x="${leftX}" y="179">⋮</text>
          <text x="${rightX}" y="179">⋮</text>
          <text x="${midX}" y="${yi + 6}">⋯</text>
        </g>
        <text x="82" y="${yi + 5}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Tầng i</text>
        ${renderS17Block3D(leftX, yi, nodeW, 28, nodeLabel, active)}
        ${renderS17Block3D(rightX, yi, nodeW, 28, nodeLabel, active)}
        <g ${countCls(2)}>
          <rect x="${countX - 56}" y="${yi - 16}" width="112" height="28" rx="14" fill="${active ? 'rgba(255,255,255,0.75)' : 'transparent'}" />
          <text x="${countX}" y="${yi + 4}" text-anchor="middle" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-weight="700" font-size="${isMax ? 19 : 16.5}">${countI}</text>
          <text x="${countX}" y="${yi + 20}" text-anchor="middle" fill="#1E3A8A" font-family="'IBM Plex Mono', monospace" font-weight="600" font-size="11">1 ≤ i ≤ h</text>
        </g>
      </g>

      <!-- Tier h (leaves) -->
      <g ${tierCls(3)}>
        <g fill="${ink}" font-size="22" font-weight="800" text-anchor="middle" class="${active ? 's17-dots-pulse' : ''}">
          <text x="${leftX}" y="267">⋮</text>
          <text x="${rightX}" y="267">⋮</text>
          <text x="${midX}" y="${yh + 6}">⋯</text>
        </g>
        <text x="82" y="${yh - 1}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Tầng h</text>
        <text x="82" y="${yh + 14}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="600" fill="${ink}">(lá)</text>
        ${renderS17Block3D(leftX, yh, nodeW, 28, nodeLabel, active)}
        ${renderS17Block3D(rightX, yh, nodeW, 28, nodeLabel, active)}
        <g ${countCls(3)}>
          <rect x="${countX - 56}" y="${yh - 15}" width="112" height="28" rx="14" fill="${active ? 'rgba(255,255,255,0.88)' : 'transparent'}" stroke="${active ? '#5284FF' : 'none'}" stroke-width="1.3" />
          <text x="${countX}" y="${yh + 6}" text-anchor="middle" fill="${active ? '#004AAD' : ink}" font-family="'IBM Plex Mono', monospace" font-weight="800" font-size="${isMax ? 19 : 16.5}">${countH}</text>
        </g>
        <text x="${midX}" y="338" text-anchor="middle" fill="#1E3A8A" font-size="12" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">Số trên mặt node = số khóa trong node</text>
      </g>
    </g>
  </svg>
  `;
}

const slide17: SlideDef = {
  number: 18,
  title: 'Chiều cao h đến từ đâu?',
  chapter: '4. Độ phức tạp thời gian và không gian',
  chapterStart: 18,
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Cả hai hình đều có ba tầng. Chỉ thay mức độ lấp đầy, số khóa mà cây có thể giữ đã khác nhau thế nào?”',
  fullScript:
    'Sau khi có cài đặt Python, mình muốn biết cây cao đến đâu. Gọi h là số cạnh từ gốc đến lá (gốc ở mức 0). Khi lấp đầy tối đa, tầng i có M^i nút, mỗi nút chứa M − 1 khóa; cộng từ tầng 0 đến h được N_max = (M − 1)(1 + M + … + M^h) = M^(h+1) − 1. Khi lấp đầy tối thiểu, đặt t = ⌈M/2⌉: gốc có 1 khóa và nếu h > 0 có 2 con; tầng i ≥ 1 có ít nhất 2t^(i−1) nút, mỗi nút ít nhất t − 1 khóa; cộng lại được N_min = 2t^h − 1. Do đó log_M(N + 1) − 1 ≤ h ≤ log_t((N + 1)/2), suy ra h = O(log_M N). Với bậc lớn, số tầng tăng rất chậm.',
  fullView: {
    summary: 'Chứng minh cận dưới và cận trên của chiều cao B-tree không rỗng bằng hai sơ đồ Lấp đầy tối đa / Lấp đầy tối thiểu: h = O(log_M N).',
    sections: [
      {
        heading: 'Ký hiệu chuẩn',
        bodyHtml:
          '<p>' + texInline('N') + ': số khóa trong cây (không rỗng); ' + texInline('M') + ': số con tối đa; ' + texInline('h') + ': số cạnh từ gốc (mức 0) đến lá; ' + texInline('t = \\lceil M/2 \\rceil') + '.</p>',
      },
      {
        heading: 'Ví dụ số học với M = 4, h = 2 (3 tầng)',
        bodyHtml:
          '<p>Với ' + texInline('M = 4, t = 2, h = 2') + ': cây chứa tối thiểu ' + texInline('N_{\\min} = 2 \\cdot 2^2 - 1 = 7') + ' khóa và tối đa ' + texInline('N_{\\max} = 4^3 - 1 = 63') + ' khóa!</p>',
      },
    ],
    formulas: [
      { label: 'Lấp đầy tối đa', tex: 'N_{\\max} = (M-1)\\sum_{i=0}^{h} M^i = M^{h+1} - 1' },
      { label: 'Lấp đầy tối thiểu', tex: 'N_{\\min} = 1 + 2(t-1)\\sum_{i=1}^{h} t^{i-1} = 2t^h - 1, \\quad t = \\lceil M/2 \\rceil' },
      { label: 'Cận chiều cao h', tex: '\\log_M(N+1) - 1 \\le h \\le \\log_t\\!\\left(\\frac{N+1}{2}\\right) \\implies h = O(\\log_M N)' },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame s17-frame">
        <header class="s17-header">
          <div>
            <h1 class="s17-title">4. Độ phức tạp của B-tree</h1>
            <div class="s17-subtitle"><span>Chiều cao</span> cây</div>
          </div>
          <div class="s17-header-right">
            <div class="s17-numeric-pop" data-role="numeric" hidden>
              <strong>M = 4, h = 2 (3 tầng):</strong> từ <strong>7</strong> đến <strong>63</strong> khóa
            </div>
            <button type="button" class="inline-action-btn" data-role="num-btn" aria-pressed="false">Ví dụ M = 4, h = 2</button>
          </div>
        </header>

        <div class="s17-canva-grid">
          <div class="s17-col" data-panel="max">
            <div class="s17-svg-wrap" data-role="tree-max"></div>
            <div class="s17-formula-pill" data-role="sum-max">
              ${texBlock('N_{\\max} = (M - 1)(1 + M + \\cdots + M^h) = M^{h+1} - 1')}
            </div>
          </div>

          <div class="s17-col" data-panel="min">
            <div class="s17-svg-wrap" data-role="tree-min"></div>
            <div class="s17-formula-pill" data-role="sum-min">
              ${texBlock('N \\ge 1 + 2(t - 1)\\big(1 + t + \\cdots + t^{h-1}\\big) = 2t^h - 1 \\;\\;(t = \\lceil M/2 \\rceil)')}
            </div>
          </div>
        </div>

        <div class="s17-footer-row" data-role="bound">
          <div class="s17-ineq">
            ${texBlock('\\log_M(N + 1) - 1 \\;\\le\\; h \\;\\le\\; \\log_t\\!\\left((N + 1)/2\\right)')}
          </div>
          <div class="s17-big-pill">h = O(log<sub>M</sub> N)</div>
        </div>
      </div>
    `;

    const numBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="num-btn"]')!;
    const numBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="numeric"]')!;

    numBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = numBox.hidden;
      numBox.hidden = !open;
      numBtn.setAttribute('aria-pressed', String(open));
      numBtn.classList.toggle('inline-action-btn--primary', open);
    });
  },
  renderStep(step, prev, ctx) {
    const pMax = ctx.slideEl.querySelector<HTMLElement>('[data-panel="max"]')!;
    const pMin = ctx.slideEl.querySelector<HTMLElement>('[data-panel="min"]')!;
    const tMax = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-max"]')!;
    const tMin = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-min"]')!;
    const sumMax = ctx.slideEl.querySelector<HTMLElement>('[data-role="sum-max"]')!;
    const sumMin = ctx.slideEl.querySelector<HTMLElement>('[data-role="sum-min"]')!;
    const bound = ctx.slideEl.querySelector<HTMLElement>('[data-role="bound"]')!;
    const rm = ctx.getReducedMotion();
    const prevStep = prev ?? -1;

    const animMax = !rm && step >= 1 && prevStep < 1;
    const animMin = !rm && step >= 2 && prevStep < 2;
    tMax.innerHTML = buildS17CanvaSvg('max', step >= 1, animMax, step === 1);
    tMin.innerHTML = buildS17CanvaSvg('min', step >= 2, animMin, step === 2);

    sumMax.classList.toggle('is-dim', step < 1);
    sumMax.classList.toggle('is-focus-pill', step === 1);
    sumMin.classList.toggle('is-dim', step < 2);
    sumMin.classList.toggle('is-focus-pill', step === 2);
    pMax.classList.toggle('is-lit-col', step === 1);
    pMin.classList.toggle('is-lit-col', step === 2);
    bound.classList.toggle('is-revealed', step >= 3);
  },
};

// ============================================================================
// SLIDE 18 — Chi phí thời gian của ba thao tác (+ Cây minh họa động từng phép)
// ============================================================================
function buildS18OpTree(mode: number): { title: string; caption: string; scene: TreeSceneSpec } {
  if (mode === 1) {
    // Search: single path down h + 1 nodes with bisect O(log M)
    return {
      title: 'Minh họa Search: đi 1 đường qua h + 1 nút',
      caption: 'Mỗi tầng dùng bisect O(log M) · Tổng O((h+1) log M) = O(log N)',
      scene: {
        viewBox: [0, 0, 420, 220],
        nodes: [
          { id: 'op-r', x: 210, y: 34, cellW: 40, cellH: 30, state: 'active', tag: 'bisect O(log M)', tagPos: 'right', tagTone: 'cobalt', keys: [{ id: 'o18-40', label: '40', tone: 'active' }] },
          { id: 'op-i0', x: 112, y: 108, cellW: 36, cellH: 28, state: 'active', tag: 'mức 1', tagPos: 'left', tagTone: 'cobalt', keys: [{ id: 'o18-20', label: '20', tone: 'active' }] },
          { id: 'op-i1', x: 315, y: 108, cellW: 36, cellH: 28, state: 'muted', keys: [{ id: 'o18-70', label: '70', tone: 'muted' }] },
          { id: 'op-l0', x: 64, y: 184, cellW: 34, cellH: 28, state: 'muted', keys: [{ id: 'o18-5', label: '5', tone: 'muted' }] },
          { id: 'op-l1', x: 168, y: 184, cellW: 36, cellH: 28, state: 'success', tag: 'Tìm thấy', tagPos: 'right', tagTone: 'success', keys: [{ id: 'o18-25', label: '25' }, { id: 'o18-30', label: '30', tone: 'success' }] },
          { id: 'op-l2', x: 315, y: 184, cellW: 34, cellH: 28, state: 'muted', keys: [{ id: 'o18-80', label: '80', tone: 'muted' }] },
        ],
        edges: [
          { id: 'oe-r0', fromNode: 'op-r', portIndex: 0, toNode: 'op-i0', state: 'active', arrow: true },
          { id: 'oe-r1', fromNode: 'op-r', portIndex: 1, toNode: 'op-i1', state: 'muted' },
          { id: 'oe-00', fromNode: 'op-i0', portIndex: 0, toNode: 'op-l0', state: 'muted' },
          { id: 'oe-01', fromNode: 'op-i0', portIndex: 1, toNode: 'op-l1', state: 'active', arrow: true },
          { id: 'oe-10', fromNode: 'op-i1', portIndex: 0, toNode: 'op-l2', state: 'muted' },
        ],
      },
    };
  }

  if (mode === 2) {
    // Insert: leaf overflow -> cascading split upward O(M) per level
    return {
      title: 'Minh họa Insert: dịch mảng & Split lan lên gốc',
      caption: 'Mỗi mức sửa tốn O(M) dịch/tách list · Xấu nhất lan h + 1 mức → O(M(h+1))',
      scene: {
        viewBox: [0, 0, 420, 220],
        nodes: [
          { id: 'op-r', x: 196, y: 34, cellW: 38, cellH: 28, state: 'overflow', tag: 'Split O(M) ↑', tagPos: 'right', tagTone: 'error', keys: [{ id: 'o18-30', label: '30' }, { id: 'o18-50', label: '50', tone: 'active' }, { id: 'o18-75', label: '75' }] },
          { id: 'op-i0', x: 112, y: 108, cellW: 34, cellH: 28, state: 'overflow', tag: 'Split O(M) ↑', tagPos: 'right', tagTone: 'error', keys: [{ id: 'o18-15', label: '15' }, { id: 'o18-25', label: '25', tone: 'active' }] },
          { id: 'op-i1', x: 345, y: 108, cellW: 34, cellH: 28, state: 'muted', keys: [{ id: 'o18-85', label: '85', tone: 'muted' }] },
          { id: 'op-l1', x: 112, y: 184, cellW: 34, cellH: 28, state: 'overflow', tag: 'Lá tràn (dịch O(M))', tagPos: 'right', tagTone: 'error', keys: [{ id: 'o18-18', label: '18' }, { id: 'o18-22', label: '22', tone: 'active' }, { id: 'o18-28', label: '28' }] },
        ],
        edges: [
          { id: 'oe-r0', fromNode: 'op-r', portIndex: 0, toNode: 'op-i0', state: 'error' },
          { id: 'oe-r1', fromNode: 'op-r', portIndex: 1, toNode: 'op-i1', state: 'muted' },
          { id: 'oe-01', fromNode: 'op-i0', portIndex: 1, toNode: 'op-l1', state: 'error' },
        ],
        transfers: [
          { id: 'tr-up1', fromX: 146, fromY: 168, toX: 148, toY: 122, ctrlX: 184, ctrlY: 146, label: '↑', tone: 'error' },
          { id: 'tr-up2', fromX: 148, fromY: 96, toX: 174, toY: 48, ctrlX: 136, ctrlY: 64, label: '↑', tone: 'error' },
        ],
      },
    };
  }

  if (mode === 3) {
    // Delete: predecessor path O(log N) + cascading merge upward O(M(h+1))
    return {
      title: 'Minh họa Delete: tìm tiền nhiệm + Merge lan lên',
      caption: 'Đi tiếp xuống tiền nhiệm vẫn O(log N) · Gộp lan tới gốc tốn O(M(h+1))',
      scene: {
        viewBox: [0, 0, 420, 220],
        nodes: [
          { id: 'op-r', x: 210, y: 34, cellW: 40, cellH: 30, state: 'active', tag: 'Xóa 40 → đổi 38', tagPos: 'right', tagTone: 'warn', keys: [{ id: 'o18-40', label: '40', tone: 'error' }] },
          { id: 'op-i0', x: 112, y: 108, cellW: 36, cellH: 28, state: 'underflow', tag: 'Gộp O(M) ↑', tagPos: 'left', tagTone: 'error', keys: [{ id: 'o18-20', label: '20', tone: 'active' }] },
          { id: 'op-i1', x: 315, y: 108, cellW: 36, cellH: 28, state: 'muted', keys: [{ id: 'o18-70', label: '70', tone: 'muted' }] },
          { id: 'op-l0', x: 60, y: 184, cellW: 34, cellH: 28, state: 'muted', keys: [{ id: 'o18-10', label: '10', tone: 'muted' }] },
          { id: 'op-l1', x: 172, y: 184, cellW: 38, cellH: 28, state: 'underflow', tag: 'Tiền nhiệm 38 (thiếu → gộp)', tagPos: 'right', tagTone: 'error', keys: [{ id: 'o18-38', label: '38', tone: 'active' }] },
        ],
        edges: [
          { id: 'oe-r0', fromNode: 'op-r', portIndex: 0, toNode: 'op-i0', state: 'active', arrow: true },
          { id: 'oe-r1', fromNode: 'op-r', portIndex: 1, toNode: 'op-i1', state: 'muted' },
          { id: 'oe-00', fromNode: 'op-i0', portIndex: 0, toNode: 'op-l0', state: 'muted' },
          { id: 'oe-01', fromNode: 'op-i0', portIndex: 1, toNode: 'op-l1', state: 'dashed', arrow: true },
        ],
        transfers: [
          { id: 'tr-pr', fromX: 182, fromY: 164, toX: 204, toY: 54, ctrlX: 242, ctrlY: 110, label: '38 ↑', tone: 'warn' },
        ],
      },
    };
  }

  // Step 0 or Step 4 (overview / worst-case spine across h + 1 levels)
  const isWorst = mode === 4;
  return {
    title: isWorst ? 'Xấu nhất: sửa lan đủ h + 1 mức → O(M(h + 1))' : 'Cấu trúc đường đi trên B-tree (h + 1 mức)',
    caption: isWorst ? 'Nếu split/merge chỉ hiếm khi lên cao, kỳ vọng trung bình giảm còn O(log N + M)!' : 'Nhấn vào hàng Search / Insert / Delete để xem minh họa cây tương ứng.',
    scene: {
      viewBox: [0, 0, 420, 232],
      nodes: [
        { id: 'op-r', x: 210, y: 34, cellW: 40, cellH: 30, state: isWorst ? 'overflow' : 'normal', tag: isWorst ? 'Mức 0: O(M)' : 'Mức 0 (Gốc)', tagPos: 'right', tagTone: isWorst ? 'error' : 'default', keys: [{ id: 'o18-r', label: '40', tone: isWorst ? 'active' : 'default' }] },
        { id: 'op-i0', x: 116, y: 106, cellW: 36, cellH: 28, state: isWorst ? 'overflow' : 'normal', tag: isWorst ? 'Mức 1: O(M)' : 'Mức 1', tagPos: 'right', tagTone: isWorst ? 'error' : 'default', keys: [{ id: 'o18-i0', label: '20', tone: isWorst ? 'active' : 'default' }] },
        { id: 'op-i1', x: 340, y: 106, cellW: 36, cellH: 28, state: isWorst ? 'muted' : 'normal', keys: [{ id: 'o18-i1', label: '70', tone: isWorst ? 'muted' : 'default' }] },
        { id: 'op-l0', x: 56, y: 176, cellW: 34, cellH: 28, state: isWorst ? 'muted' : 'normal', keys: [{ id: 'o18-l0', label: '10', tone: isWorst ? 'muted' : 'default' }] },
        { id: 'op-l1', x: 172, y: 176, cellW: 36, cellH: 28, state: isWorst ? 'overflow' : 'normal', tag: isWorst ? 'Mức h: O(M)' : 'Mức h (Lá)', tagPos: 'bottom', tagTone: isWorst ? 'error' : 'default', keys: [{ id: 'o18-l1', label: '25', tone: isWorst ? 'active' : 'default' }, { id: 'o18-l2', label: '30' }] },
        { id: 'op-l2', x: 340, y: 176, cellW: 34, cellH: 28, state: isWorst ? 'muted' : 'normal', keys: [{ id: 'o18-l3', label: '80', tone: isWorst ? 'muted' : 'default' }] },
      ],
      edges: [
        { id: 'oe-r0', fromNode: 'op-r', portIndex: 0, toNode: 'op-i0', state: isWorst ? 'error' : 'normal' },
        { id: 'oe-r1', fromNode: 'op-r', portIndex: 1, toNode: 'op-i1', state: isWorst ? 'muted' : 'normal' },
        { id: 'oe-00', fromNode: 'op-i0', portIndex: 0, toNode: 'op-l0', state: isWorst ? 'muted' : 'normal' },
        { id: 'oe-01', fromNode: 'op-i0', portIndex: 1, toNode: 'op-l1', state: isWorst ? 'error' : 'normal' },
        { id: 'oe-10', fromNode: 'op-i1', portIndex: 0, toNode: 'op-l2', state: isWorst ? 'muted' : 'normal' },
      ],
    },
  };
}

const slide18: SlideDef = {
  number: 19,
  title: 'Chi phí thời gian của ba thao tác',
  chapter: '4. Độ phức tạp thời gian và không gian',
  theme: 'white',
  stepCount: 4,
  leadIn: '“Tìm vị trí bằng bisect rất nhanh. Mở một ô trống ở giữa danh sách Python vẫn có thể phải dịch cả phần đuôi.”',
  fullScript:
    'Với search, mỗi mức ta chỉ đi một nhánh và dùng bisect tốn O(log M) trong nút; qua h + 1 mức, tổng chi phí là O(log N) với N đủ lớn theo cận chiều cao và sức chứa thực; gặp ở gốc có O(1) khóa thì tốt nhất O(1). Với insert và delete, tình huống thuận lợi tìm đường O(log N) rồi thêm/xóa cuối lá không phải dịch đuôi nên vẫn O(log N). Trong trường hợp xấu nhất, tách hoặc gộp có thể lan tới gốc; mỗi mức sửa tốn O(M) do dịch, cắt hay nối danh sách khóa và con, tổng O(M(h + 1)). Tìm tiền nhiệm đi tiếp xuống lá nên phần tìm đường vẫn O(log N).',
  fullView: {
    summary: 'Bảng chi phí thời gian của Search, Insert, Delete (kèm cây minh họa tương ứng cho từng thao tác) và tóm tắt trường hợp trung bình.',
    sections: [
      {
        heading: 'Bảng tổng hợp (giả sử so sánh khóa tốn O(1))',
        bodyHtml:
          '<ul>' +
          '<li><strong>Search:</strong> đi tối đa ' + texInline('h+1') + ' nút × bisect ' + texInline('O(\\log M)') + ' = ' + texInline('O(\\log N)') + '; tốt nhất ' + texInline('O(1)') + ' tại gốc có ' + texInline('O(1)') + ' khóa.</li>' +
          '<li><strong>Insert:</strong> tìm đường + kiểm tra trùng ' + texInline('O(\\log N)') + '; dịch/tách nút ' + texInline('O(M)') + ' mỗi mức sửa; thuận lợi cuối lá ' + texInline('O(\\log N)') + '; xấu nhất lan lên gốc ' + texInline('O(M(h+1))') + '.</li>' +
          '<li><strong>Delete:</strong> tìm khóa / tiền nhiệm ' + texInline('O(\\log N)') + '; dịch/mượn/gộp ' + texInline('O(M)') + ' mỗi mức sửa; thuận lợi cuối lá đủ khóa ' + texInline('O(\\log N)') + '; xấu nhất ' + texInline('O(M(h+1))') + '.</li>' +
          '</ul>',
      },
      {
        heading: 'Độ phức tạp trung bình (có điều kiện — xem chi tiết Trang 20)',
        bodyHtml:
          '<p>Tìm thành công (phân bố đều 1/N): ' + texInline('\\Theta(\\log N)') + '. Chèn/xóa (nếu xác suất sửa sâu giảm theo cấp số nhân): ' + texInline('O(\\log N + M)') + '.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Độ phức tạp thời gian</span> các thao tác</h1>
        </header>

        <div class="s18-grid">
          <div class="s18-table-col">
            <table class="complexity-table">
              <thead>
                <tr>
                  <th>Thao tác</th>
                  <th>Tìm đường</th>
                  <th>Xử lý 1 nút</th>
                  <th>Thuận lợi</th>
                  <th data-col="worst">Xấu nhất</th>
                </tr>
              </thead>
              <tbody>
                <tr data-row="1" class="s18-click-row">
                  <td><strong>Search</strong></td>
                  <td>tối đa ${texInline('h+1')} nút<br/><small>bisect ${texInline('O(\\log M)')}</small></td>
                  <td>${texInline('O(\\log M)')}</td>
                  <td>${texInline('O(1)')}<br/><small>gặp ở gốc có ${texInline('O(1)')} khóa</small></td>
                  <td data-col="worst"><strong>${texInline('O(\\log N)')}</strong></td>
                </tr>
                <tr data-row="2" class="s18-click-row">
                  <td><strong>Insert</strong></td>
                  <td>${texInline('O(\\log N)')}<br/><small>gồm kiểm tra trùng</small></td>
                  <td>${texInline('O(M)')}<br/><small>dịch / tách list</small></td>
                  <td>${texInline('O(\\log N)')}<br/><small>cuối lá còn chỗ</small></td>
                  <td data-col="worst"><strong>${texInline('O(M(h+1))')}</strong><br/><small>split lan tới gốc</small></td>
                </tr>
                <tr data-row="3" class="s18-click-row">
                  <td><strong>Delete</strong></td>
                  <td>${texInline('O(\\log N)')}<br/><small>kể cả tiền nhiệm</small></td>
                  <td>${texInline('O(M)')}<br/><small>dịch / mượn / gộp</small></td>
                  <td>${texInline('O(\\log N)')}<br/><small>cuối lá đủ khóa</small></td>
                  <td data-col="worst"><strong>${texInline('O(M(h+1))')}</strong><br/><small>merge lan tới gốc</small></td>
                </tr>
              </tbody>
            </table>
            <div class="table-footnote">Giả thiết nền: so sánh khóa ${texInline('O(1)')}; chiều cao ${texInline('h = O(\\log_M N)')} ⇒ ${texInline('(h+1)\\log M = O(\\log N)')}. (Nhấn từng hàng để đổi cây minh họa.)</div>
          </div>

          <aside class="s18-right-col">
            <div class="canva-card s18-op-vis">
              <div class="s18-op-vis__title" data-role="op-title"></div>
              <div class="s18-op-tree" data-role="op-tree"></div>
              <div class="s18-op-vis__cap" data-role="op-cap"></div>
            </div>

            <button type="button" class="s18-avg-link" data-role="goto-19">
              <span><em>Muốn nói về độ phức tạp trung bình, ta cần giả thiết gì?</em></span>
              <strong>Xem trang riêng · Trang 20 →</strong>
            </button>
          </aside>
        </div>
      </div>
    `;

    ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="goto-19"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      ctx.goToSlide(20);
    });

    ctx.slideEl.querySelectorAll<HTMLElement>('.s18-click-row').forEach((tr) => {
      tr.addEventListener('click', (e) => {
        e.stopPropagation();
        const r = Number(tr.dataset.row);
        renderS18Tree(ctx.slideEl, r, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const rows = ctx.slideEl.querySelectorAll<HTMLElement>('.complexity-table tbody tr');
    const worstCells = ctx.slideEl.querySelectorAll<HTMLElement>('[data-col="worst"]');
    const goto19 = ctx.slideEl.querySelector<HTMLElement>('[data-role="goto-19"]')!;

    rows.forEach((tr) => {
      const r = Number(tr.dataset.row);
      tr.classList.toggle('is-hidden-row', step < r);
      tr.classList.toggle('is-active-row', step === r);
    });
    worstCells.forEach((c) => c.classList.toggle('is-worst-hl', step >= 4));
    goto19.classList.toggle('is-lit', step >= 4);

    renderS18Tree(ctx.slideEl, step, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="op-tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderS18Tree(slideEl: HTMLElement, mode: number, reducedMotion: boolean): void {
  const titleEl = slideEl.querySelector<HTMLElement>('[data-role="op-title"]')!;
  const treeEl = slideEl.querySelector<HTMLElement>('[data-role="op-tree"]')!;
  const capEl = slideEl.querySelector<HTMLElement>('[data-role="op-cap"]')!;
  const data = buildS18OpTree(mode);
  titleEl.textContent = data.title;
  capEl.textContent = data.caption;
  renderTreeScene(treeEl, data.scene, { reducedMotion });
}

// ============================================================================
// SLIDE 19 — Chi phí trung bình và giả thiết (+ Cây quyết định 3 nhánh & Cây mức sửa R)
// ============================================================================
function buildS19DecisionTree(active: boolean): TreeSceneSpec {
  const tAct = active ? 'active' : 'muted';
  const tOk = active ? 'success' : 'muted';
  const tDef = active ? 'guide' : 'muted';
  const st = active ? 'normal' : 'muted';
  return {
    viewBox: [0, 0, 520, 204],
    nodes: [
      { id: 'dt-r', x: 260, y: 26, cellW: 78, cellH: 28, state: active ? 'active' : 'muted', keys: [{ id: 'dtr', label: 'k ? x₀', tone: tAct }] },
      { id: 'dt-l', x: 110, y: 90, cellW: 66, cellH: 26, state: st, keys: [{ id: 'dtl', label: 'k ? x₁', tone: tDef }] },
      { id: 'dt-m', x: 260, y: 90, cellW: 66, cellH: 26, state: active ? 'success' : 'muted', keys: [{ id: 'dtm', label: 'Thấy', tone: tOk }] },
      { id: 'dt-rg', x: 410, y: 90, cellW: 66, cellH: 26, state: st, keys: [{ id: 'dtrg', label: 'k ? x₂', tone: tDef }] },
      { id: 'dt-ll', x: 46, y: 150, cellW: 44, cellH: 22, state: st, keys: [{ id: 'dtll', label: '1/N', tone: tDef }] },
      { id: 'dt-lm', x: 110, y: 150, cellW: 44, cellH: 22, state: st, keys: [{ id: 'dtlm', label: '1/N', tone: tOk }] },
      { id: 'dt-lr', x: 174, y: 150, cellW: 44, cellH: 22, state: st, keys: [{ id: 'dtlr', label: '1/N', tone: tDef }] },
      { id: 'dt-rl', x: 346, y: 150, cellW: 44, cellH: 22, state: st, keys: [{ id: 'dtrl', label: '1/N', tone: tDef }] },
      { id: 'dt-rm', x: 410, y: 150, cellW: 44, cellH: 22, state: st, keys: [{ id: 'dtrm', label: '1/N', tone: tOk }] },
      { id: 'dt-rr', x: 474, y: 150, cellW: 44, cellH: 22, state: st, keys: [{ id: 'dtrr', label: '1/N', tone: tDef }] },
    ],
    edges: [
      { id: 'dte0', fromNode: 'dt-r', portIndex: 0, toNode: 'dt-l', state: active ? 'active' : 'muted', label: '<' },
      { id: 'dte1', fromNode: 'dt-r', portIndex: 1, toNode: 'dt-m', state: active ? 'active' : 'muted', label: '=' },
      { id: 'dte2', fromNode: 'dt-r', portIndex: 1, toNode: 'dt-rg', state: active ? 'active' : 'muted', label: '>' },
      { id: 'dte3', fromNode: 'dt-l', portIndex: 0, toNode: 'dt-ll', state: st },
      { id: 'dte4', fromNode: 'dt-l', portIndex: 0, toNode: 'dt-lm', state: st },
      { id: 'dte5', fromNode: 'dt-l', portIndex: 1, toNode: 'dt-lr', state: st },
      { id: 'dte6', fromNode: 'dt-rg', portIndex: 0, toNode: 'dt-rl', state: st },
      { id: 'dte7', fromNode: 'dt-rg', portIndex: 0, toNode: 'dt-rm', state: st },
      { id: 'dte8', fromNode: 'dt-rg', portIndex: 1, toNode: 'dt-rr', state: st },
    ],
    overlaySvg: `
      <text x="260" y="192" text-anchor="middle" fill="${active ? '#004AAD' : '#94A3B8'}" font-size="12" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Cây tam phân · độ sâu TB ≥ log₃ N</text>
    `,
  };
}

function buildS19ClimbTree(assumptionOn: boolean, revealed: boolean): TreeSceneSpec {
  const worst = revealed && !assumptionOn;
  return {
    viewBox: [0, 0, 290, 152],
    nodes: [
      {
        id: 'cl-r',
        x: 112,
        y: 26,
        cellW: 36,
        cellH: 24,
        state: worst ? 'overflow' : 'normal',
        tag: worst ? 'j=3: lan tới gốc!' : 'j=3: Pr ≤ p²',
        tagPos: 'right',
        tagTone: worst ? 'error' : 'default',
        keys: [{ id: 'clr0', label: 'Gốc', tone: worst ? 'error' : 'muted' }],
      },
      {
        id: 'cl-m',
        x: 78,
        y: 78,
        cellW: 36,
        cellH: 24,
        state: worst ? 'overflow' : revealed ? 'active' : 'normal',
        tag: worst ? 'j=2: sửa O(M)' : 'j=2: Pr ≤ p',
        tagPos: 'right',
        tagTone: worst ? 'error' : 'cobalt',
        keys: [{ id: 'clm0', label: 'Cha', tone: worst ? 'error' : revealed ? 'guide' : 'default' }],
      },
      {
        id: 'cl-b',
        x: 54,
        y: 128,
        cellW: 36,
        cellH: 24,
        state: worst ? 'overflow' : revealed ? 'active' : 'normal',
        tag: 'j=1: lá (Pr ≤ 1)',
        tagPos: 'right',
        tagTone: worst ? 'error' : 'warn',
        keys: [{ id: 'clb0', label: 'Lá', tone: worst ? 'error' : 'active' }],
      },
    ],
    edges: [
      { id: 'cle0', fromNode: 'cl-r', portIndex: 0, toNode: 'cl-m', state: worst ? 'error' : 'dashed' },
      { id: 'cle1', fromNode: 'cl-m', portIndex: 0, toNode: 'cl-b', state: worst ? 'error' : revealed ? 'active' : 'normal' },
    ],
    transfers: [
      { id: 'clt0', fromX: 30, fromY: 126, toX: 30, toY: 28, ctrlX: 10, ctrlY: 78, label: 'R ↑', tone: worst ? 'error' : 'cobalt' },
    ],
  };
}

const slide19: SlideDef = {
  number: 20,
  title: 'Chi phí trung bình và giả thiết',
  chapter: '4. Độ phức tạp thời gian và không gian',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Ai có thể chỉ ra dòng nào cho phép mình thay E[R] bằng một hằng số?”',
  fullScript:
    'Phân tích trung bình luôn phải nêu rõ phân bố truy vấn và giả thiết về số mức sửa cây. Với tìm kiếm thành công, giả sử N khóa có xác suất được tìm bằng nhau là 1/N; mỗi phép so sánh có tối đa 3 kết quả (<, =, >), nên cây quyết định tam phân cho số phép so sánh kỳ vọng E[C] ≥ log₃ N = Ω(log N). Ghép với cận trên O(log N), ta có E[T_tìm kiếm] = Θ(log N). Với chèn và xóa, gọi R là số mức phải tách, mượn hoặc gộp leo từ lá lên gốc (0 ≤ R ≤ h + 1). Ta có E[T] = O(log N + M(1 + E[R])). Chỉ khi có giả thiết Pr(R ≥ j) ≤ p^(j−1) với hằng số 0 ≤ p < 1 độc lập N, M thì tổng xác suất đuôi E[R] ≤ 1/(1 − p) = O(1), suy ra O(log N + M). Nếu chưa biết phân bố, dùng cận xấu nhất O(M(h + 1)).',
  fullView: {
    summary: 'Phân tích kỳ vọng cho Search (cây quyết định 3 nhánh → Θ(log N)) và Insert/Delete (số mức leo R trên B-tree → O(log N + M) có điều kiện).',
    sections: [
      {
        heading: '1. Tìm kiếm thành công',
        bodyHtml:
          '<p>Phân bố đều 1/N trên N khóa; mỗi phép so sánh có tối đa 3 kết quả (&lt;, =, &gt;). Cây quyết định tam phân cho ' +
          texInline('E[C] \\ge \\log_3 N = \\Omega(\\log N)') +
          ', kết hợp cận trên ' + texInline('O(\\log N)') + ' cho ' + texInline('E[T_{\\text{tìm kiếm}}] = \\Theta(\\log N)') + '.</p>',
      },
      {
        heading: '2. Chèn và xóa (kết luận có điều kiện)',
        bodyHtml:
          '<p>Với ' + texInline('R \\in [0, h+1]') + ' là số mức sửa cây: ' + texInline('E[T] = O(\\log N + M(1 + E[R]))') + '.</p>' +
          '<p>Nếu ' + texInline('\\Pr(R \\ge j) \\le p^{j-1}') + ' với ' + texInline('0 \\le p < 1') + ' độc lập ' + texInline('N, M') + ' thì ' +
          texInline('E[R] = \\sum_{j=1}^{h+1} \\Pr(R \\ge j) \\le \\frac{1}{1-p} = O(1)') + ' ⇒ ' + texInline('O(\\log N + M)') + '. Chưa biết phân bố thì dùng cận xấu nhất ' + texInline('O(M(h+1))') + '.</p>',
      },
    ],
    formulas: [
      { label: 'Tìm kiếm kỳ vọng', tex: 'E[C] \\ge \\log_3 N \\implies E[T_{\\text{search}}] = \\Theta(\\log N)' },
      { label: 'Chèn / Xóa kỳ vọng', tex: 'E[R] = \\sum_{j=1}^{h+1} \\Pr(R \\ge j) \\le \\frac{1}{1-p} = O(1) \\implies E[T] = O(\\log N + M)' },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><em class="hl-cobalt">B-tree:</em> <span>độ phức tạp</span> trung bình</h1>
            <p class="slide-lead">Phải nêu phân bố truy vấn và giả thiết về số mức sửa cây.</p>
          </div>
          <label class="toggle-pill" data-role="toggle-wrap">
            <input type="checkbox" data-role="assump-toggle" checked />
            <span>Giả thiết ${texInline('\\Pr(R \\ge j) \\le p^{j-1}')}</span>
          </label>
        </header>

        <div class="s19-cols">
          <article class="canva-card s19-card" data-card="search">
            <h3>1. Tìm kiếm thành công (Cây quyết định 3 nhánh)</h3>
            <p class="s19-hyp">${texInline('N')} khóa đồng xác suất ${texInline('1/N')}; mỗi phép so sánh rẽ tối đa 3 hướng (<code>&lt;</code>, <code>=</code>, <code>&gt;</code>).</p>
            <div class="s19-tree-box" data-role="tree-dec"></div>
            <div class="s19-math-block" data-role="s19-m1">
              ${texBlock('E[C] \\ge \\log_3 N = \\Omega(\\log N)')}
              <div class="s19-res-badge">Ghép cận trên ${texInline('O(\\log N)')} ⇒ <strong>${texInline('E[T_{\\text{tìm kiếm}}] = \\Theta(\\log N)')}</strong></div>
            </div>
          </article>

          <article class="canva-card s19-card" data-card="update">
            <h3>2. Chèn và xóa — Số mức leo sửa ${texInline('R')}</h3>
            <p class="s19-hyp">${texInline('R')} (${texInline('0 \\le R \\le h + 1')}): số mức tách/mượn/gộp; tìm đường ${texInline('O(\\log N)')} + sửa ${texInline('O(M)')}/mức.</p>
            <div class="s19-math-block" data-role="s19-m2">
              ${texBlock('E[T] = O\\big(\\log N + M(1 + E[R])\\big)')}
            </div>
            <div class="s19-tail" data-role="s19-tail">
              <div class="s19-climb-row">
                <div class="s19-climb-tree" data-role="tree-climb"></div>
                <div class="tail-bars" aria-label="Minh họa giả thiết đuôi xác suất giảm dần">
                  <div class="tail-bar" style="--h:88%;--bi:0"><span>j=1</span><b>1</b></div>
                  <div class="tail-bar" style="--h:56%;--bi:1"><span>j=2</span><b>p</b></div>
                  <div class="tail-bar" style="--h:36%;--bi:2"><span>j=3</span><b>p²</b></div>
                  <div class="tail-bar" style="--h:20%;--bi:3"><span>…</span><b>pʲ⁻¹</b></div>
                </div>
              </div>
              <div class="tail-formula" data-role="tail-formula"></div>
            </div>
          </article>
        </div>

        <div class="s19-bottom-strip" data-role="bottom">
          ${texInline('O(\\log N + M)')} là <strong>kết luận có điều kiện</strong>; khi chưa biết phân bố thì dùng cận xấu nhất <strong>${texInline('O(M(h + 1))')}</strong>.
        </div>
      </div>
    `;

    const toggleWrap = ctx.slideEl.querySelector<HTMLElement>('[data-role="toggle-wrap"]')!;
    const checkbox = ctx.slideEl.querySelector<HTMLInputElement>('[data-role="assump-toggle"]')!;
    toggleWrap.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', () => {
      updateS19Tail(ctx.slideEl, checkbox.checked, true, ctx.getReducedMotion());
    });
  },
  renderStep(step, _prev, ctx) {
    const cSearch = ctx.slideEl.querySelector<HTMLElement>('[data-card="search"]')!;
    const cUpdate = ctx.slideEl.querySelector<HTMLElement>('[data-card="update"]')!;
    const m1 = ctx.slideEl.querySelector<HTMLElement>('[data-role="s19-m1"]')!;
    const m2 = ctx.slideEl.querySelector<HTMLElement>('[data-role="s19-m2"]')!;
    const tail = ctx.slideEl.querySelector<HTMLElement>('[data-role="s19-tail"]')!;
    const tDec = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-dec"]')!;
    const checkbox = ctx.slideEl.querySelector<HTMLInputElement>('[data-role="assump-toggle"]')!;

    m1.classList.toggle('is-dim', step < 1);
    cSearch.classList.toggle('is-active-card', step === 1);
    m2.classList.toggle('is-dim', step < 2);
    cUpdate.classList.toggle('is-active-card', step >= 2);
    tail.classList.toggle('is-dim', step < 3);

    renderTreeScene(tDec, buildS19DecisionTree(step >= 1), { reducedMotion: ctx.getReducedMotion() });

    if (step >= 3) {
      checkbox.checked = true;
      updateS19Tail(ctx.slideEl, true, true, ctx.getReducedMotion());
    } else {
      updateS19Tail(ctx.slideEl, false, false, ctx.getReducedMotion());
    }
  },
  cancelAnimations(slideEl) {
    slideEl.querySelectorAll<HTMLElement>('[data-role^="tree-"]').forEach((el) => cancelTreeAnimations(el));
  },
};

function updateS19Tail(slideEl: HTMLElement, assumptionOn: boolean, revealed: boolean, reducedMotion: boolean): void {
  const bars = slideEl.querySelector<HTMLElement>('.tail-bars')!;
  const formula = slideEl.querySelector<HTMLElement>('[data-role="tail-formula"]')!;
  const tClimb = slideEl.querySelector<HTMLElement>('[data-role="tree-climb"]')!;
  bars.classList.toggle('is-off', !assumptionOn);
  bars.classList.remove('is-growing');
  if (assumptionOn && revealed && !reducedMotion) {
    void bars.offsetWidth;
    bars.classList.add('is-growing');
  }
  renderTreeScene(tClimb, buildS19ClimbTree(assumptionOn, revealed), { reducedMotion });

  if (assumptionOn) {
    formula.innerHTML = `
      <div class="s19-eq-sm">${texInline('E[R] = \\sum_{j=1}^{h+1} \\Pr(R \\ge j) \\le \\frac{1}{1-p} = O(1)')}</div>
      <div class="s19-res-badge is-ok">Suy ra <strong>${texInline('E[T_{\\text{chèn}}],\\; E[T_{\\text{xóa}}] = O(\\log N + M)')}</strong></div>
    `;
  } else {
    formula.innerHTML = `
      <div class="s19-eq-sm"><em>Đã tắt giả thiết phân bố đuôi (${texInline('p')}) — cây có thể leo tới gốc!</em></div>
      <div class="s19-res-badge is-warn">Quay về cận xấu nhất: <strong>${texInline('O(M(h + 1))')}</strong></div>
    `;
  }
}

// ============================================================================
// SLIDE 20 — Tìm 65: RAM và I/O đếm hai việc khác nhau
// ============================================================================
const slide20: SlideDef = {
  number: 21,
  title: 'Tìm 65: RAM và I/O đếm hai việc khác nhau',
  chapter: '4. Độ phức tạp thời gian và không gian',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Một lần đọc mang về cả nút. Các so sánh tiếp theo trong nút diễn ra ở RAM, vì thế hai đồng hồ không tăng cùng nhịp.”',
  fullScript:
    'Vì sao chi phí sửa một nút tăng theo M mà ta vẫn quan tâm đến bậc lớn? Trong RAM, tìm bằng bisect mất O(log M) mỗi nút, còn dịch mảng khi chèn/xóa tốn O(M) mỗi mức (xấu nhất O(M(h+1))). Trong mô hình bộ nhớ ngoài, mỗi nút vừa một trang đĩa. Tìm 65 ở cây h = 2 đi qua 3 nút [80] → [40|70] → [50|65]; khi chưa có trang trong cache, chỉ cần 3 lần đọc trang. Tổng quát, tìm/chèn/xóa có chi phí I/O là O(h + 1), vì mỗi mức chỉ động chạm số trang hằng số. Bậc M lớn giúp giảm số tầng h phải đọc đĩa.',
  fullView: {
    summary: 'Phân tách rõ hai thước đo chi phí: số lần đọc/ghi trang đĩa I/O (O(h + 1)) và xử lý mảng trong RAM (bisect O(log M), dịch mảng O(M)).',
    sections: [
      {
        heading: 'Chi phí I/O trên bộ nhớ ngoài',
        bodyHtml:
          '<p>Mỗi nút vừa 1 trang đĩa. Tìm khóa <code>65</code> trên cây <code>h = 2</code> đi qua <code>[80] → [40|70] → [50|65]</code> tốn <strong>3 trang đọc</strong> (chưa có cache). Tổng quát: ' + texInline('O(h + 1)') + ' I/O.</p>',
      },
      {
        heading: 'Chi phí xử lý trong RAM',
        bodyHtml:
          '<ul>' +
          '<li>Tìm trong nút bằng <code>bisect</code>: ' + texInline('O(\\log M)') + ' mỗi nút × ' + texInline('(h+1)') + ' mức = ' + texInline('O(\\log N)') + '.</li>' +
          '<li>Chèn/xóa trên mảng phải dịch phần tử phía sau (vd chèn 25 vào <code>[10, 20, 30, 40]</code> dịch 30, 40): ' + texInline('O(M)') + ' mỗi mức, lan đến gốc ' + texInline('O(M(h+1))') + '.</li>' +
          '</ul>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>B-tree:</span> chi phí phát sinh ở đâu?</h1>
            <p class="slide-lead">Một đường đi qua h + 1 node; chi phí xử lý bên trong node vẫn phụ thuộc M.</p>
          </div>
          <div class="dual-meters">
            <div class="meter-box meter-io" data-role="io-meter"><span>I/O (Trang đĩa)</span><strong>0 trang</strong></div>
            <div class="meter-box meter-ram" data-role="ram-meter"><span>RAM (Trong nút)</span><strong>Chờ xét</strong></div>
          </div>
        </header>

        <div class="s20-grid">
          <div class="s20-left">
            <div class="s20-subhead">Tìm kiếm <code>65</code> (chỉ đi 1 nhánh mỗi mức · ${texInline('h = 2')})</div>
            <div class="s20-tree" data-role="tree"></div>
          </div>

          <div class="s20-right">
            <div class="canva-card s20-box" data-box="bisect">
              <h3>RAM: Tìm trong nút bằng <code>bisect</code></h3>
              <div class="arr-row">
                <span>10</span><span>20</span><span>30</span><span class="is-mid">40</span><span>50</span><span>60</span><span>70</span>
              </div>
              <p>${texInline('O(\\log M)')} mỗi nút × ${texInline('(h+1)')} mức ⇒ <strong>${texInline('O((h+1)\\log M) = O(\\log N)')}</strong></p>
            </div>

            <div class="canva-card s20-box" data-box="shift">
              <h3>RAM: Chèn/xóa trên mảng phải dịch khóa</h3>
              <div class="arr-row" data-role="shift-arr">
                <span>10</span><span>20</span><span class="is-ins">25</span><span class="is-moved">30 →</span><span class="is-moved">40 →</span>
              </div>
              <p>${texInline('O(M)')} mỗi mức; sửa lan đến gốc: <strong>${texInline('O(M(h+1))')}</strong></p>
            </div>
          </div>
        </div>

        <div class="s20-conclusion">
          <strong>Mỗi nút vừa 1 trang đĩa ⇒ tìm kiếm / chèn / xóa tốn ${texInline('O(h + 1)')} I/O</strong>
          <span>${texInline('N')}: số khóa · ${texInline('M')}: số con tối đa · ${texInline('h')}: số cạnh gốc→lá (so sánh &amp; kích thước khóa ${texInline('O(1)')}).</span>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const ioMeter = ctx.slideEl.querySelector<HTMLElement>('[data-role="io-meter"] strong')!;
    const ramMeter = ctx.slideEl.querySelector<HTMLElement>('[data-role="ram-meter"] strong')!;
    const boxBisect = ctx.slideEl.querySelector<HTMLElement>('[data-box="bisect"]')!;
    const boxShift = ctx.slideEl.querySelector<HTMLElement>('[data-box="shift"]')!;

    boxBisect.classList.toggle('is-dim', step < 2);
    boxBisect.classList.toggle('is-active-card', step === 2);
    boxShift.classList.toggle('is-dim', step < 3);
    boxShift.classList.toggle('is-active-card', step === 3);

    ioMeter.textContent = step === 0 ? '0 trang' : '3 trang (h + 1)';
    ramMeter.textContent =
      step === 0 ? '0 phép' : step === 1 ? 'Đọc 3 trang xong' : step === 2 ? 'bisect O(log M)' : 'dịch mảng O(M)';
    if (!ctx.getReducedMotion()) {
      const mIo = ctx.slideEl.querySelector<HTMLElement>('[data-role="io-meter"]')!;
      const mRam = ctx.slideEl.querySelector<HTMLElement>('[data-role="ram-meter"]')!;
      if (step === 1) { mIo.classList.remove('step-flash'); void mIo.offsetWidth; mIo.classList.add('step-flash'); }
      if (step >= 2) { mRam.classList.remove('step-flash'); void mRam.offsetWidth; mRam.classList.add('step-flash'); }
    }

    const lit = step >= 1;
    const scene: TreeSceneSpec = {
      viewBox: [0, 0, 620, 310],
      nodes: [
        { id: 'r20', x: 310, y: 42, cellW: 52, cellH: 36, state: lit ? 'active' : 'normal', tag: lit ? 'Trang #1' : undefined, tagPos: 'right', tagTone: 'cobalt', keys: [{ id: 'v80', label: '80', tone: lit ? 'active' : 'default' }] },
        {
          id: 'i20-0',
          x: 168,
          y: 138,
          cellW: 48,
          cellH: 36,
          state: step === 2 ? 'highlight-box' : lit ? 'active' : 'normal',
          tag: step === 2 ? 'RAM: bisect O(log M) →' : lit ? 'Trang #2' : undefined,
          tagPos: step === 2 ? 'right' : 'left',
          tagTone: step === 2 ? 'warn' : 'cobalt',
          keys: [{ id: 'v40', label: '40' }, { id: 'v70', label: '70', tone: lit ? 'active' : 'default' }],
        },
        { id: 'i20-1', x: 468, y: 138, cellW: 52, cellH: 36, state: lit ? 'muted' : 'normal', keys: [{ id: 'v100', label: '100', tone: lit ? 'muted' : 'default' }, { id: 'v120', label: '120', tone: lit ? 'muted' : 'default' }] },
        { id: 'l20-0', x: 54, y: 248, cellW: 40, cellH: 34, state: lit ? 'muted' : 'normal', keys: [{ id: 'v10', label: '10', tone: lit ? 'muted' : 'default' }, { id: 'v20', label: '20', tone: lit ? 'muted' : 'default' }] },
        {
          id: 'l20-1',
          x: 164,
          y: 248,
          cellW: 42,
          cellH: 36,
          state: step === 3 ? 'highlight-box' : lit ? 'success' : 'normal',
          tag: step === 3 ? 'RAM: dịch mảng O(M) →' : lit ? 'Trang #3 · Thấy 65' : undefined,
          tagPos: 'bottom',
          tagTone: step === 3 ? 'warn' : 'success',
          keys: [{ id: 'v50', label: '50' }, { id: 'v65', label: '65', tone: lit ? 'success' : 'default' }],
        },
        { id: 'l20-2', x: 274, y: 248, cellW: 40, cellH: 34, state: lit ? 'muted' : 'normal', keys: [{ id: 'v75', label: '75', tone: lit ? 'muted' : 'default' }, { id: 'v78', label: '78', tone: lit ? 'muted' : 'default' }] },
        { id: 'l20-3', x: 376, y: 248, cellW: 40, cellH: 34, state: lit ? 'muted' : 'normal', keys: [{ id: 'v85', label: '85', tone: lit ? 'muted' : 'default' }, { id: 'v90', label: '90', tone: lit ? 'muted' : 'default' }] },
        { id: 'l20-4', x: 478, y: 248, cellW: 42, cellH: 34, state: lit ? 'muted' : 'normal', keys: [{ id: 'v110', label: '110', tone: lit ? 'muted' : 'default' }, { id: 'v115', label: '115', tone: lit ? 'muted' : 'default' }] },
        { id: 'l20-5', x: 576, y: 248, cellW: 42, cellH: 34, state: lit ? 'muted' : 'normal', keys: [{ id: 'v130', label: '130', tone: lit ? 'muted' : 'default' }, { id: 'v140', label: '140', tone: lit ? 'muted' : 'default' }] },
      ],
      edges: [
        { id: 'e20-r0', fromNode: 'r20', portIndex: 0, toNode: 'i20-0', state: lit ? 'active' : 'normal', arrow: lit },
        { id: 'e20-r1', fromNode: 'r20', portIndex: 1, toNode: 'i20-1', state: lit ? 'muted' : 'normal' },
        { id: 'e20-00', fromNode: 'i20-0', portIndex: 0, toNode: 'l20-0', state: lit ? 'muted' : 'normal' },
        { id: 'e20-01', fromNode: 'i20-0', portIndex: 1, toNode: 'l20-1', state: lit ? 'active' : 'normal', arrow: lit },
        { id: 'e20-02', fromNode: 'i20-0', portIndex: 2, toNode: 'l20-2', state: lit ? 'muted' : 'normal' },
        { id: 'e20-10', fromNode: 'i20-1', portIndex: 0, toNode: 'l20-3', state: lit ? 'muted' : 'normal' },
        { id: 'e20-11', fromNode: 'i20-1', portIndex: 1, toNode: 'l20-4', state: lit ? 'muted' : 'normal' },
        { id: 'e20-12', fromNode: 'i20-1', portIndex: 2, toNode: 'l20-5', state: lit ? 'muted' : 'normal' },
      ],
    };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion() });
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 21 — Độ phức tạp không gian (Bố cục Canva 2×2 chuẩn)
// ============================================================================
function buildS21StoreSvg(active: boolean, animate: boolean): string {
  const op = active ? 1 : 0.42;
  const stroke = active ? '#004AAD' : '#64748B';
  const topF = active ? '#5284FF' : '#CBD5E1';
  const sideF = active ? '#1D4ED8' : '#94A3B8';
  const stg = (i: number) => (animate ? `class="s21-stagger is-anim" style="--st:${i}"` : '');
  return `
  <svg class="s21-canva-svg" viewBox="0 0 460 175" role="img" aria-label="Bộ nhớ lưu cây B-tree">
    <defs>
      <marker id="s21-a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#0F1D3A"/>
      </marker>
    </defs>
    <g opacity="${op}">
      <!-- Labels keys / children -->
      <g ${stg(0)}>
        <text x="108" y="34" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">keys</text>
        <line x1="114" y1="30" x2="152" y2="30" stroke="#0F1D3A" stroke-width="1.5" marker-end="url(#s21-a1)"/>
        <text x="108" y="60" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">children</text>
        <line x1="114" y1="56" x2="152" y2="56" stroke="#0F1D3A" stroke-width="1.5" marker-end="url(#s21-a1)"/>

        <!-- Root 3D node with keys + children ports row -->
        <polygon points="158,14 166,7 288,7 280,14" fill="${topF}" stroke="${stroke}" stroke-width="1.4"/>
        <polygon points="280,14 288,7 288,61 280,68" fill="${sideF}" stroke="${stroke}" stroke-width="1.4"/>
        <rect x="158" y="14" width="122" height="27" fill="#FFFFFF" stroke="${stroke}" stroke-width="1.8"/>
        <line x1="219" y1="14" x2="219" y2="41" stroke="${stroke}" stroke-width="1.5"/>
        <text x="188" y="33" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
        <text x="250" y="33" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="800" font-family="'IBM Plex Mono', monospace">40</text>
        <!-- Children port strip -->
        <rect x="158" y="41" width="122" height="27" fill="#EEF7FF" stroke="${stroke}" stroke-width="1.8"/>
        <line x1="199" y1="41" x2="199" y2="68" stroke="${stroke}" stroke-width="1.4"/>
        <line x1="239" y1="41" x2="239" y2="68" stroke="${stroke}" stroke-width="1.4"/>
        <circle cx="178" cy="54" r="3.5" fill="#0F1D3A"/>
        <circle cx="219" cy="54" r="3.5" fill="#0F1D3A"/>
        <circle cx="260" cy="54" r="3.5" fill="#0F1D3A"/>
      </g>

      <!-- 3 Child arrows (draw smoothly downward) -->
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.1s" pathLength="1" x1="178" y1="58" x2="72" y2="112" stroke="#0F1D3A" stroke-width="1.7" marker-end="url(#s21-a1)"/>
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.22s" pathLength="1" x1="219" y1="58" x2="219" y2="112" stroke="#0F1D3A" stroke-width="1.7" marker-end="url(#s21-a1)"/>
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.34s" pathLength="1" x1="260" y1="58" x2="366" y2="112" stroke="#0F1D3A" stroke-width="1.7" marker-end="url(#s21-a1)"/>

      <!-- 3 Leaves -->
      ${[
        { cx: 72, a: '5', b: '10' },
        { cx: 219, a: '25', b: '30' },
        { cx: 366, a: '50', b: '60' },
      ]
        .map(
          (lf, i) => `
          <g ${stg(i + 1)}>
            <polygon points="${lf.cx - 52},118 ${lf.cx - 46},112 ${lf.cx + 58},112 ${lf.cx + 52},118" fill="${topF}" stroke="${stroke}" stroke-width="1.3"/>
            <polygon points="${lf.cx + 52},118 ${lf.cx + 58},112 ${lf.cx + 58},142 ${lf.cx + 52},148" fill="${sideF}" stroke="${stroke}" stroke-width="1.3"/>
            <rect x="${lf.cx - 52}" y="118" width="104" height="30" fill="#FFFFFF" stroke="${stroke}" stroke-width="1.7"/>
            <line x1="${lf.cx}" y1="118" x2="${lf.cx}" y2="148" stroke="${stroke}" stroke-width="1.4"/>
            <text x="${lf.cx - 26}" y="138" text-anchor="middle" fill="#0F1D3A" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${lf.a}</text>
            <text x="${lf.cx + 26}" y="138" text-anchor="middle" fill="#0F1D3A" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${lf.b}</text>
            <text x="${lf.cx}" y="165" text-anchor="middle" fill="#1E3A8A" font-size="11.5" font-weight="600" font-family="'IBM Plex Mono', monospace">children = []</text>
          </g>`,
        )
        .join('')}
    </g>
  </svg>`;
}

function buildS21SearchStackSvg(active: boolean, animate: boolean): string {
  const op = active ? 1 : 0.35;
  const hi = '#004AAD';
  const cobalt = '#5284FF';
  const dimStroke = '#60A5FA';
  const stg = (i: number) => (animate ? `class="s21-stagger is-anim" style="--st:${i}"` : '');
  const flowCls = active ? 'class="s21-ref-flow"' : '';
  return `
  <svg class="s21-canva-svg" viewBox="0 0 650 206" role="img" aria-label="Bộ nhớ phụ khi tìm kiếm đệ quy">
    <defs>
      <marker id="s21-ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#004AAD"/>
      </marker>
      <marker id="s21-ad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#60A5FA"/>
      </marker>
      <path id="s21-search-route" d="M 191 40 L 285 114 L 245 178" />
    </defs>
    <g opacity="${op}">
      <!-- Edges -->
      <line x1="168" y1="54" x2="108" y2="96" stroke="${dimStroke}" stroke-width="1.8" marker-end="url(#s21-ad)"/>
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.08s" pathLength="1" x1="214" y1="54" x2="278" y2="94" stroke="${hi}" stroke-width="3.2" marker-end="url(#s21-ab)"/>
      <line x1="86" y1="128" x2="54" y2="162" stroke="${dimStroke}" stroke-width="1.6" marker-end="url(#s21-ad)"/>
      <line x1="118" y1="128" x2="148" y2="162" stroke="${dimStroke}" stroke-width="1.6" marker-end="url(#s21-ad)"/>
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.24s" pathLength="1" x1="274" y1="128" x2="250" y2="160" stroke="${hi}" stroke-width="3.2" marker-end="url(#s21-ab)"/>
      <line x1="312" y1="128" x2="344" y2="162" stroke="${dimStroke}" stroke-width="1.6" marker-end="url(#s21-ad)"/>

      <!-- Root [40] -->
      <polygon points="154,24 162,17 236,17 228,24" fill="${cobalt}" stroke="${hi}" stroke-width="1.4"/>
      <polygon points="228,24 236,17 236,49 228,56" fill="#2563EB" stroke="${hi}" stroke-width="1.4"/>
      <rect x="154" y="24" width="74" height="32" fill="#FFFFFF" stroke="${hi}" stroke-width="1.8"/>
      <text x="191" y="45" text-anchor="middle" fill="#0F1D3A" font-size="16" font-weight="800" font-family="'IBM Plex Mono', monospace">40</text>

      <!-- Internal [20] (dim) -->
      <polygon points="62,98 68,92 140,92 134,98" fill="#BFDBFE" stroke="${dimStroke}" stroke-width="1.3"/>
      <polygon points="134,98 140,92 140,122 134,128" fill="#93C5FD" stroke="${dimStroke}" stroke-width="1.3"/>
      <rect x="62" y="98" width="72" height="30" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.6"/>
      <text x="98" y="118" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="700" font-family="'IBM Plex Mono', monospace">20</text>

      <!-- Internal [60] (active) -->
      <polygon points="248,98 256,91 330,91 322,98" fill="${cobalt}" stroke="${hi}" stroke-width="1.5"/>
      <polygon points="322,98 330,91 330,123 322,130" fill="#1D4ED8" stroke="${hi}" stroke-width="1.5"/>
      <rect x="248" y="98" width="74" height="32" fill="#FFFFFF" stroke="${hi}" stroke-width="2.2"/>
      <text x="285" y="119" text-anchor="middle" fill="#0F1D3A" font-size="16" font-weight="800" font-family="'IBM Plex Mono', monospace">60</text>

      <!-- 4 Leaves -->
      <rect x="14" y="164" width="74" height="28" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.5"/>
      <text x="51" y="183" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'IBM Plex Mono', monospace">5 | 10</text>

      <rect x="106" y="164" width="78" height="28" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.5"/>
      <text x="145" y="183" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'IBM Plex Mono', monospace">25 | 30</text>

      <polygon points="204,164 211,158 293,158 286,164" fill="${cobalt}" stroke="${hi}" stroke-width="1.5"/>
      <polygon points="286,164 293,158 293,186 286,192" fill="#1D4ED8" stroke="${hi}" stroke-width="1.5"/>
      <rect x="204" y="164" width="82" height="28" fill="#FFFFFF" stroke="${hi}" stroke-width="2.4"/>
      <text x="245" y="183" text-anchor="middle" fill="#0F1D3A" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">45 | <tspan fill="#004AAD">50</tspan></text>

      <rect x="308" y="164" width="78" height="28" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.5"/>
      <text x="347" y="183" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'IBM Plex Mono', monospace">65 | 70</text>

      <!-- Call Stack Container Box -->
      <text x="536" y="16" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">h = 2, có 3 khung gọi</text>
      <rect x="434" y="24" width="204" height="158" rx="10" fill="rgba(255,255,255,0.42)" stroke="#3B82F6" stroke-width="1.8"/>
      <text x="536" y="200" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="700" font-style="italic" font-family="'Be Vietnam Pro', sans-serif">O(1) mỗi khung</text>

      <!-- 3 Stacked Call Frames (staggered bottom-up push: root -> [60] -> [45,50]) -->
      ${[
        { y: 38, txt: 'search(node [45, 50])', ord: 2 },
        { y: 88, txt: 'search(node [60])', ord: 1 },
        { y: 138, txt: 'search(root)', ord: 0 },
      ]
        .map(
          (f) => `
          <g ${stg(f.ord)}>
            <polygon points="448,${f.y} 454,${f.y - 5} 628,${f.y - 5} 622,${f.y}" fill="${cobalt}" stroke="${hi}" stroke-width="1.2"/>
            <polygon points="622,${f.y} 628,${f.y - 5} 628,${f.y + 27} 622,${f.y + 32}" fill="#2563EB" stroke="${hi}" stroke-width="1.2"/>
            <rect x="448" y="${f.y}" width="174" height="32" fill="#FFFFFF" stroke="${hi}" stroke-width="1.6"/>
            <text x="535" y="${f.y + 21}" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'IBM Plex Mono', monospace">${f.txt}</text>
          </g>`,
        )
        .join('')}

      <!-- Reference connector arrows from levels to stack box -->
      <path ${flowCls} d="M 236 36 L 404 36 L 404 54 L 444 54" fill="none" stroke="${hi}" stroke-width="1.7" marker-end="url(#s21-ab)"/>
      <path ${flowCls} d="M 330 108 L 404 108 L 404 104 L 444 104" fill="none" stroke="${hi}" stroke-width="1.7" marker-end="url(#s21-ab)"/>
      <path ${flowCls} d="M 386 178 L 412 178 L 412 154 L 444 154" fill="none" stroke="${hi}" stroke-width="1.7" marker-end="url(#s21-ab)"/>
      ${active ? `
      <circle r="4.5" fill="#FEF08A" stroke="#004AAD" stroke-width="1.8" class="s21-search-bead">
        <animateMotion dur="2.4s" repeatCount="indefinite"><mpath href="#s21-search-route"/></animateMotion>
      </circle>` : ''}
    </g>
  </svg>`;
}

function buildS21TempBufSvg(active: boolean, animate: boolean): string {
  const op = active ? 1 : 0.35;
  const hi = '#004AAD';
  const cobalt = '#5284FF';
  const stg = (i: number) => (animate ? `class="s21-stagger is-anim" style="--st:${i}"` : '');
  return `
  <svg class="s21-canva-svg" viewBox="0 0 470 218" role="img" aria-label="Bộ nhớ phụ khi chèn và xóa">
    <defs>
      <marker id="s21-ac" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#004AAD"/>
      </marker>
    </defs>
    <g opacity="${op}">
      <!-- Left: Ngăn xếp đệ quy O(h+1) -->
      <g ${stg(0)}>
        <text x="80" y="18" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Ngăn xếp đệ quy</text>
        ${[30, 56, 102]
          .map(
            (y) => `
            <g>
              <polygon points="18,${y} 23,${y - 4} 145,${y - 4} 140,${y}" fill="${cobalt}" stroke="${hi}" stroke-width="1.1"/>
              <polygon points="140,${y} 145,${y - 4} 145,${y + 18} 140,${y + 22}" fill="#2563EB" stroke="${hi}" stroke-width="1.1"/>
              <rect x="18" y="${y}" width="122" height="22" fill="#FFFFFF" stroke="${hi}" stroke-width="1.5"/>
              <text x="79" y="${y + 15}" text-anchor="middle" fill="#0F1D3A" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">node, key, i</text>
            </g>`,
          )
          .join('')}
        <text x="79" y="95" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800">⋮</text>
        <text x="79" y="144" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="800" font-style="italic" font-family="Georgia, serif">O(h + 1)</text>
      </g>

      <!-- Plus sign -->
      <text ${stg(1)} x="176" y="88" text-anchor="middle" fill="#0F1D3A" font-size="30" font-weight="800">+</text>

      <!-- Right: Vùng tạm tại node đang xử lý O(M) -->
      <g ${stg(1)}>
        <text x="348" y="26" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Vùng tạm tại node đang xử lý</text>
        <text x="242" y="64" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">keys</text>
        <text x="242" y="106" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">children</text>

        ${[
          { y: 46, vals: ['k₀', 'k₁', '⋯', 'kₜ'] },
          { y: 88, vals: ['c₀', 'c₁', '⋯', 'cₜ'] },
        ]
          .map(
            (row) => `
            <g>
              <polygon points="250,${row.y} 256,${row.y - 5} 454,${row.y - 5} 448,${row.y}" fill="${cobalt}" stroke="${hi}" stroke-width="1.2"/>
              <polygon points="448,${row.y} 454,${row.y - 5} 454,${row.y + 21} 448,${row.y + 26}" fill="#2563EB" stroke="${hi}" stroke-width="1.2"/>
              <rect x="250" y="${row.y}" width="198" height="26" fill="#FFFFFF" stroke="${hi}" stroke-width="1.6"/>
              <line x1="299" y1="${row.y}" x2="299" y2="${row.y + 26}" stroke="${hi}" stroke-width="1.3"/>
              <line x1="348" y1="${row.y}" x2="348" y2="${row.y + 26}" stroke="${hi}" stroke-width="1.3"/>
              <line x1="399" y1="${row.y}" x2="399" y2="${row.y + 26}" stroke="${hi}" stroke-width="1.3"/>
              <text x="275" y="${row.y + 18}" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">${row.vals[0]}</text>
              <text x="324" y="${row.y + 18}" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">${row.vals[1]}</text>
              <text x="374" y="${row.y + 18}" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="700">${row.vals[2]}</text>
              <text x="424" y="${row.y + 18}" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">${row.vals[3]}</text>
            </g>`,
          )
          .join('')}
        <text x="348" y="144" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="800" font-style="italic" font-family="Georgia, serif">O(M)</text>
      </g>

      <!-- Bottom unwind flow: Mức h -> Mức h-1 -> ... -> Mức 0 -->
      <g ${stg(2)}>
        <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:0" x="52" y="164" width="76" height="26" rx="4" fill="#FFFFFF" stroke="${hi}" stroke-width="1.8"/>
        <text x="90" y="182" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Mức h</text>
        <line x1="128" y1="177" x2="154" y2="177" stroke="${hi}" stroke-width="1.8" marker-end="url(#s21-ac)"/>
      </g>

      <g ${stg(3)}>
        <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:1" x="160" y="164" width="90" height="26" rx="4" fill="#EEF7FF" stroke="${cobalt}" stroke-width="1.6"/>
        <text x="205" y="182" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Mức h − 1</text>
        <line x1="250" y1="177" x2="274" y2="177" stroke="${hi}" stroke-width="1.8" marker-end="url(#s21-ac)"/>
      </g>

      <g ${stg(4)}>
        <text x="292" y="182" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800">⋯</text>
        <line x1="308" y1="177" x2="332" y2="177" stroke="${hi}" stroke-width="1.8" marker-end="url(#s21-ac)"/>
        <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:2" x="338" y="164" width="76" height="26" rx="4" fill="#EEF7FF" stroke="${cobalt}" stroke-width="1.6"/>
        <text x="376" y="182" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Mức 0</text>
      </g>

      <text x="235" y="212" text-anchor="middle" fill="#0F1D3A" font-size="14" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Tách/gộp lần lượt khi đệ quy trả về.</text>
    </g>
  </svg>`;
}

const slide21: SlideDef = {
  number: 22,
  title: 'Bộ nhớ lưu cây và bộ nhớ phụ',
  chapter: '4. Độ phức tạp thời gian và không gian',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Một khung gọi trỏ đến cây con đã có sẵn. Nó không chứa bản sao của toàn bộ cây con đó.”',
  fullScript:
    'Ta tách riêng phần bộ nhớ lưu cây và bộ nhớ phụ khi chạy thao tác. Lưu cây gồm N khóa trong K nút; mỗi nút có ít nhất 1 khóa (cây không rỗng) nên K ≤ N, cùng K − 1 tham chiếu con và O(K) bộ nhớ quản lý — tổng Θ(N). Với tìm kiếm đệ quy, mỗi mức chỉ đi xuống một nút con, xếp tối đa h + 1 khung gọi, mỗi khung chỉ giữ tham chiếu và vài biến cục bộ O(1), tổng phụ O(h + 1). Với chèn và xóa, ngoài ngăn xếp O(h + 1), khi quay lui tách hoặc gộp từng mức cần thêm vùng danh sách tạm O(M) được giải phóng sau mỗi mức — tổng bộ nhớ phụ là O(h + M + 1).',
  fullView: {
    summary: 'Phân tách bộ nhớ lưu cây Θ(N) và bộ nhớ phụ: Search O(h + 1), Insert/Delete O(h + M + 1) — bám sát bố cục 4 khối trực quan trên Canva.',
    sections: [
      {
        heading: 'Bốn kết luận không gian',
        bodyHtml:
          '<ul>' +
          '<li><strong>Lưu cây — ' + texInline('\\Theta(N)') + ':</strong> ' + texInline('N') + ' khóa lưu 1 lần; ' + texInline('K') + ' nút cần ' + texInline('K-1') + ' tham chiếu con và ' + texInline('O(K)') + ' quản lý; vì ' + texInline('K \\le N') + ' nên tổng ' + texInline('\\Theta(N)') + '.</li>' +
          '<li><strong>Tìm kiếm đệ quy — ' + texInline('O(h + 1)') + ':</strong> tối đa ' + texInline('h+1') + ' khung gọi ' + texInline('O(1)') + ' (chỉ giữ tham chiếu, không sao chép cây con).</li>' +
          '<li><strong>Chèn — ' + texInline('O(h + M + 1)') + ':</strong> ngăn xếp ' + texInline('O(h+1)') + ' + vùng tạm ' + texInline('O(M)') + ' khi tách nút.</li>' +
          '<li><strong>Xóa — ' + texInline('O(h + M + 1)') + ':</strong> ngăn xếp ' + texInline('O(h+1)') + ' + vùng tạm ' + texInline('O(M)') + ' khi ghép danh sách.</li>' +
          '</ul>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame s21-canva-frame">
        <header class="s21-canva-head">
          <h1 class="s21-canva-title">Độ phức tạp <span>không gian</span></h1>
        </header>

        <div class="s21-canva-grid">
          <!-- Left Column: Bộ nhớ lưu cây (top) + Bộ nhớ phụ khi chèn và xóa (bottom) -->
          <div class="s21-left-col">
            <div class="s21-block" data-zone="tree">
              <h2 class="s21-block-title">Bộ nhớ lưu cây</h2>
              <div class="s21-svg-box" data-role="tree-store"></div>
              <div class="s21-block-cap">N khóa, K − 1 tham chiếu con. K ≤ N.</div>
            </div>

            <div class="s21-block" data-zone="temp">
              <h2 class="s21-block-title">Bộ nhớ phụ khi chèn và xóa</h2>
              <div class="s21-svg-box" data-role="tree-temp"></div>
            </div>
          </div>

          <!-- Right Column: Bộ nhớ phụ tìm kiếm đệ quy (top) + Summary Card (bottom) -->
          <div class="s21-right-col">
            <div class="s21-block" data-zone="stack">
              <h2 class="s21-block-title">Bộ nhớ phụ khi tìm kiếm đệ quy</h2>
              <div class="s21-svg-box s21-svg-box--tall" data-role="tree-stack"></div>
              <div class="s21-block-cap">
                Tối đa h + 1 khung gọi, mỗi khung O(1).<br/>
                Mỗi khung giữ tham chiếu, không sao chép cây con.
              </div>
            </div>

            <div class="s21-summary-card" data-role="summary-card">
              <p data-sum="1"><strong>Lưu cây — Θ(N):</strong> N khóa được lưu một lần. K node cần K − 1 tham chiếu con và O(K) bộ nhớ quản lý. Vì K ≤ N nên tổng là Θ(N).</p>
              <p data-sum="2"><strong>Tìm kiếm đệ quy — O(h + 1):</strong> Mỗi mức chỉ đi xuống một node con, tạo tối đa h + 1 khung gọi. Mỗi khung giữ vài biến và tham chiếu, tốn O(1).</p>
              <p data-sum="3"><strong>Chèn — O(h + M + 1):</strong> Ngăn xếp chiếm O(h + 1), cộng O(M) cho các danh sách tạm khi tách node.</p>
              <p data-sum="3"><strong>Xóa — O(h + M + 1):</strong> Ngăn xếp chiếm O(h + 1), cộng O(M) khi ghép danh sách. Các mức sửa cây xử lý lần lượt khi quay lui.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, prev, ctx) {
    const tStore = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-store"]')!;
    const tStack = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-stack"]')!;
    const tTemp = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-temp"]')!;
    const zTree = ctx.slideEl.querySelector<HTMLElement>('[data-zone="tree"]')!;
    const zStack = ctx.slideEl.querySelector<HTMLElement>('[data-zone="stack"]')!;
    const zTemp = ctx.slideEl.querySelector<HTMLElement>('[data-zone="temp"]')!;
    const lines = ctx.slideEl.querySelectorAll<HTMLElement>('[data-sum]');
    const rm = ctx.getReducedMotion();
    const prevStep = prev ?? -1;

    tStore.innerHTML = buildS21StoreSvg(step >= 1, !rm && step >= 1 && prevStep < 1);
    tStack.innerHTML = buildS21SearchStackSvg(step >= 2, !rm && step >= 2 && prevStep < 2);
    tTemp.innerHTML = buildS21TempBufSvg(step >= 3, !rm && step >= 3 && prevStep < 3);

    zTree.classList.toggle('is-dim-block', step === 0);
    zStack.classList.toggle('is-dim-block', step < 2);
    zTemp.classList.toggle('is-dim-block', step < 3);

    lines.forEach((p) => {
      const n = Number(p.dataset.sum);
      p.classList.toggle('is-dim-line', step < n);
      p.classList.toggle('is-hl-line', step === n);
    });
  },
};

export const PART4_SLIDES: SlideDef[] = [slide17, slide18, slide19, slide20, slide21];
