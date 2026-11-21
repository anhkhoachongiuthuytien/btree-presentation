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
      <path id="s17-ruler-p-${side}" d="M 22 ${y0 + 8} L 22 ${yh - 8}" />
    </defs>

    <g opacity="${op}">
      <!-- Header -->
      <text x="${midX}" y="18" text-anchor="middle" fill="${ink}" font-size="16" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">${isMax ? 'LẤP ĐẦY TỐI ĐA' : 'LẤP ĐẦY TỐI THIỂU'}</text>
      <text x="${midX}" y="34" text-anchor="middle" fill="#1E3A8A" font-size="12" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">${isMax ? 'Mỗi node trong có M con.' : 'Gốc có 2 con; mỗi node trong khác có ⌈M/2⌉ con.'}</text>
      <text x="${countX}" y="32" text-anchor="middle" fill="${ink}" font-size="13" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">SỐ NODE</text>

      <!-- Left vertical height ruler h (with live descending depth pulse) -->
      <g>
        <line ${rulerCls} pathLength="1" x1="22" y1="${y0 + 4}" x2="22" y2="${yh - 4}" stroke="${ink}" stroke-width="1.9" marker-start="url(#s17-arr-${side})" marker-end="url(#s17-arr-${side})" />
        ${active ? `
          <circle r="3.4" fill="#FEF08A" stroke="#004AAD" stroke-width="1.4" class="s17-pulse-dot">
            <animateMotion dur="2.8s" repeatCount="indefinite"><mpath href="#s17-ruler-p-${side}"/></animateMotion>
          </circle>
        ` : ''}
        <text x="34" y="185" fill="${ink}" font-size="16" font-weight="700" font-style="italic" font-family="Georgia, serif">h</text>
      </g>

      <!-- Tier 0: Root -->
      <g ${tierCls(0)}>
        <text x="82" y="${y0 - 4}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Gốc</text>
        <text x="82" y="${y0 + 11}" text-anchor="middle" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="700" fill="${ink}">Tầng 0</text>
        ${renderS17Block3D(midX, y0, rootW, 28, rootLabel, active)}
        <g ${countCls(0)}>
          <rect class="${active ? 's17-cnt-glow' : ''}" style="--ci:0" x="${countX - 28}" y="${y0 - 15}" width="56" height="28" rx="4" fill="${active ? 'rgba(255,255,255,0.88)' : 'transparent'}" stroke="${active ? '#93C5FD' : 'none'}" stroke-width="1.2" />
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
          <rect class="${active ? 's17-cnt-glow' : ''}" style="--ci:1" x="${countX - 28}" y="${y1 - 15}" width="56" height="28" rx="4" fill="${active ? 'rgba(255,255,255,0.88)' : 'transparent'}" stroke="${active ? '#93C5FD' : 'none'}" stroke-width="1.2" />
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
          <rect class="${active ? 's17-cnt-glow' : ''}" style="--ci:2" x="${countX - 56}" y="${yi - 16}" width="112" height="28" rx="4" fill="${active ? 'rgba(255,255,255,0.88)' : 'transparent'}" stroke="${active ? '#93C5FD' : 'none'}" stroke-width="1.2" />
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
          <rect class="${active ? 's17-cnt-glow' : ''}" style="--ci:3" x="${countX - 56}" y="${yh - 15}" width="112" height="28" rx="4" fill="${active ? 'rgba(255,255,255,0.95)' : 'transparent'}" stroke="${active ? '#004AAD' : 'none'}" stroke-width="1.5" />
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
// SLIDE 19 — Chi phí thời gian của ba thao tác (Bảng gọn + Mô phỏng chạy thật Thuận lợi vs Xấu nhất)
// ============================================================================
interface S18PhaseFrame {
  bestPhase: string;
  bestScene: TreeSceneSpec;
  worstPhase: string;
  worstScene: TreeSceneSpec;
}

interface S18CompareSpec {
  opName: string;
  bestTitle: string;
  bestCost: string;
  worstTitle: string;
  worstCost: string;
  phases: S18PhaseFrame[];
}

function buildS18Compare(opIdx: number): S18CompareSpec {
  if (opIdx === 2) {
    // INSERT: Real 3-phase animated loop — Best (append at leaf) vs Worst (cascading split climb!)
    return {
      opName: 'Insert',
      bestTitle: 'Thuận lợi · Chèn cuối lá còn chỗ',
      bestCost: 'O(log N)',
      worstTitle: 'Xấu nhất · Split dây chuyền lên gốc',
      worstCost: 'O(M(h + 1))',
      phases: [
        {
          bestPhase: '1/3 · Tìm xuống lá [25 | 30 | _]',
          bestScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'ib-r', x: 260, y: 30, cellW: 44, cellH: 28, state: 'active', keys: [{ id: 'ib-40', label: '40', tone: 'active' }] },
              { id: 'ib-i0', x: 148, y: 88, cellW: 40, cellH: 26, state: 'active', keys: [{ id: 'ib-20', label: '20', tone: 'active' }] },
              { id: 'ib-i1', x: 388, y: 88, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'ib-70', label: '70', tone: 'muted' }] },
              { id: 'ib-l0', x: 66, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'ib-5', label: '5', tone: 'muted' }] },
              { id: 'ib-l1', x: 230, y: 146, capacity: 3, cellW: 40, cellH: 26, tag: 'Còn 1 ô trống cuối lá', tagPos: 'bottom', tagTone: 'cobalt', keys: [{ id: 'ib-25', label: '25' }, { id: 'ib-30', label: '30' }] },
              { id: 'ib-l2', x: 432, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'ib-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'ibe0', fromNode: 'ib-r', portIndex: 0, toNode: 'ib-i0', state: 'active', arrow: true },
              { id: 'ibe1', fromNode: 'ib-r', portIndex: 1, toNode: 'ib-i1', state: 'muted' },
              { id: 'ibe2', fromNode: 'ib-i0', portIndex: 0, toNode: 'ib-l0', state: 'muted' },
              { id: 'ibe3', fromNode: 'ib-i0', portIndex: 1, toNode: 'ib-l1', state: 'active', arrow: true },
              { id: 'ibe4', fromNode: 'ib-i1', portIndex: 0, toNode: 'ib-l2', state: 'muted' },
            ],
            chips: [{ id: 'ib-ch', x: 345, y: 32, text: 'Chèn 35', tone: 'active' }],
          },
          worstPhase: '1/3 · Chèn 22 → Lá tràn (> M−1)',
          worstScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'iw-r', x: 250, y: 30, cellW: 40, cellH: 28, keys: [{ id: 'iw-30', label: '30' }, { id: 'iw-50', label: '50' }, { id: 'iw-75', label: '75' }] },
              { id: 'iw-i0', x: 148, y: 88, cellW: 38, cellH: 26, keys: [{ id: 'iw-15', label: '15' }, { id: 'iw-25', label: '25' }] },
              { id: 'iw-i1', x: 425, y: 88, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'iw-85', label: '85', tone: 'muted' }] },
              { id: 'iw-l1', x: 170, y: 148, cellW: 38, cellH: 26, state: 'overflow', tag: 'Lá tràn · dịch O(M)', tagPos: 'right', tagTone: 'error', keys: [{ id: 'iw-18', label: '18' }, { id: 'iw-22', label: '22', tone: 'active' }, { id: 'iw-28', label: '28' }] },
            ],
            edges: [
              { id: 'iwe0', fromNode: 'iw-r', portIndex: 0, toNode: 'iw-i0', state: 'active', arrow: true },
              { id: 'iwe1', fromNode: 'iw-r', portIndex: 1, toNode: 'iw-i1', state: 'muted' },
              { id: 'iwe2', fromNode: 'iw-i0', portIndex: 1, toNode: 'iw-l1', state: 'error', arrow: true },
            ],
          },
        },
        {
          bestPhase: '2/3 · Đặt 35 vào ô cuối (0 dịch mảng)',
          bestScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'ib-r', x: 260, y: 30, cellW: 44, cellH: 28, keys: [{ id: 'ib-40', label: '40' }] },
              { id: 'ib-i0', x: 148, y: 88, cellW: 40, cellH: 26, keys: [{ id: 'ib-20', label: '20' }] },
              { id: 'ib-i1', x: 388, y: 88, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'ib-70', label: '70', tone: 'muted' }] },
              { id: 'ib-l0', x: 66, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'ib-5', label: '5', tone: 'muted' }] },
              { id: 'ib-l1', x: 230, y: 146, capacity: 3, cellW: 40, cellH: 26, state: 'active', tag: 'Gắn 35 ngay cuối lá', tagPos: 'bottom', tagTone: 'cobalt', keys: [{ id: 'ib-25', label: '25' }, { id: 'ib-30', label: '30' }, { id: 'ib-35', label: '35', tone: 'active' }] },
              { id: 'ib-l2', x: 432, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'ib-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'ibe0', fromNode: 'ib-r', portIndex: 0, toNode: 'ib-i0' },
              { id: 'ibe1', fromNode: 'ib-r', portIndex: 1, toNode: 'ib-i1', state: 'muted' },
              { id: 'ibe2', fromNode: 'ib-i0', portIndex: 0, toNode: 'ib-l0', state: 'muted' },
              { id: 'ibe3', fromNode: 'ib-i0', portIndex: 1, toNode: 'ib-l1', state: 'active' },
              { id: 'ibe4', fromNode: 'ib-i1', portIndex: 0, toNode: 'ib-l2', state: 'muted' },
            ],
          },
          worstPhase: '2/3 · Split lá ↑ làm Cha [15|22|25] tràn!',
          worstScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'iw-r', x: 250, y: 30, cellW: 40, cellH: 28, keys: [{ id: 'iw-30', label: '30' }, { id: 'iw-50', label: '50' }, { id: 'iw-75', label: '75' }] },
              { id: 'iw-i0', x: 165, y: 88, cellW: 38, cellH: 26, state: 'overflow', tag: 'Mức 1 tràn · Split O(M)', tagPos: 'right', tagTone: 'error', keys: [{ id: 'iw-15', label: '15' }, { id: 'iw-22', label: '22', tone: 'active' }, { id: 'iw-25', label: '25' }] },
              { id: 'iw-i1', x: 448, y: 88, cellW: 34, cellH: 24, state: 'muted', keys: [{ id: 'iw-85', label: '85', tone: 'muted' }] },
              { id: 'iw-l1a', x: 112, y: 152, cellW: 36, cellH: 26, state: 'success', keys: [{ id: 'iw-18', label: '18' }] },
              { id: 'iw-l1b', x: 222, y: 152, cellW: 36, cellH: 26, state: 'success', keys: [{ id: 'iw-28', label: '28' }] },
            ],
            edges: [
              { id: 'iwe0', fromNode: 'iw-r', portIndex: 0, toNode: 'iw-i0', state: 'error' },
              { id: 'iwe1', fromNode: 'iw-r', portIndex: 1, toNode: 'iw-i1', state: 'muted' },
              { id: 'iwe2a', fromNode: 'iw-i0', portIndex: 1, toNode: 'iw-l1a', state: 'active' },
              { id: 'iwe2b', fromNode: 'iw-i0', portIndex: 2, toNode: 'iw-l1b', state: 'active' },
            ],
            transfers: [
              { id: 'iw-u1', fromX: 168, fromY: 142, toX: 165, toY: 102, ctrlX: 115, ctrlY: 122, label: '22 ↑', tone: 'error' },
            ],
          },
        },
        {
          bestPhase: '3/3 · Hợp lệ ngay · Tổng O(log N)',
          bestScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'ib-r', x: 260, y: 30, cellW: 44, cellH: 28, keys: [{ id: 'ib-40', label: '40' }] },
              { id: 'ib-i0', x: 148, y: 88, cellW: 40, cellH: 26, keys: [{ id: 'ib-20', label: '20' }] },
              { id: 'ib-i1', x: 388, y: 88, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'ib-70', label: '70', tone: 'muted' }] },
              { id: 'ib-l0', x: 66, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'ib-5', label: '5', tone: 'muted' }] },
              { id: 'ib-l1', x: 230, y: 146, capacity: 3, cellW: 40, cellH: 26, state: 'success', tag: '0 split · giữ nguyên chiều cao', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'ib-25', label: '25' }, { id: 'ib-30', label: '30' }, { id: 'ib-35', label: '35', tone: 'success' }] },
              { id: 'ib-l2', x: 432, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'ib-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'ibe0', fromNode: 'ib-r', portIndex: 0, toNode: 'ib-i0' },
              { id: 'ibe1', fromNode: 'ib-r', portIndex: 1, toNode: 'ib-i1', state: 'muted' },
              { id: 'ibe2', fromNode: 'ib-i0', portIndex: 0, toNode: 'ib-l0', state: 'muted' },
              { id: 'ibe3', fromNode: 'ib-i0', portIndex: 1, toNode: 'ib-l1', state: 'active' },
              { id: 'ibe4', fromNode: 'ib-i1', portIndex: 0, toNode: 'ib-l2', state: 'muted' },
            ],
          },
          worstPhase: '3/3 · Split lan tới Gốc · O(M(h + 1))',
          worstScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'iw-r', x: 225, y: 30, cellW: 38, cellH: 26, state: 'overflow', tag: 'Gốc tràn · Split O(M)!', tagPos: 'right', tagTone: 'error', keys: [{ id: 'iw-22', label: '22', tone: 'active' }, { id: 'iw-30', label: '30' }, { id: 'iw-50', label: '50' }, { id: 'iw-75', label: '75' }] },
              { id: 'iw-i0a', x: 105, y: 92, cellW: 36, cellH: 26, state: 'success', keys: [{ id: 'iw-15', label: '15' }] },
              { id: 'iw-i0b', x: 220, y: 92, cellW: 36, cellH: 26, state: 'success', keys: [{ id: 'iw-25', label: '25' }] },
              { id: 'iw-i1', x: 432, y: 92, cellW: 34, cellH: 24, state: 'muted', keys: [{ id: 'iw-85', label: '85', tone: 'muted' }] },
              { id: 'iw-l1a', x: 105, y: 154, cellW: 36, cellH: 24, keys: [{ id: 'iw-18', label: '18' }] },
              { id: 'iw-l1b', x: 220, y: 154, cellW: 36, cellH: 24, keys: [{ id: 'iw-28', label: '28' }] },
            ],
            edges: [
              { id: 'iwe0a', fromNode: 'iw-r', portIndex: 0, toNode: 'iw-i0a', state: 'error' },
              { id: 'iwe0b', fromNode: 'iw-r', portIndex: 1, toNode: 'iw-i0b', state: 'error' },
              { id: 'iwe1', fromNode: 'iw-r', portIndex: 3, toNode: 'iw-i1', state: 'muted' },
              { id: 'iwe2a', fromNode: 'iw-i0a', portIndex: 1, toNode: 'iw-l1a' },
              { id: 'iwe2b', fromNode: 'iw-i0b', portIndex: 1, toNode: 'iw-l1b' },
            ],
            transfers: [
              { id: 'iw-u2', fromX: 162, fromY: 84, toX: 185, toY: 42, ctrlX: 120, ctrlY: 54, label: '22 ↑ gốc', tone: 'error' },
            ],
          },
        },
      ],
    };
  }

  if (opIdx === 3) {
    // DELETE: Real 3-phase animated loop — Best (pop leaf end) vs Worst (predecessor + cascading merge!)
    return {
      opName: 'Delete',
      bestTitle: 'Thuận lợi · Xóa cuối lá còn đủ khóa',
      bestCost: 'O(log N)',
      worstTitle: 'Xấu nhất · Tiền nhiệm + Merge lan lên gốc',
      worstCost: 'O(M(h + 1))',
      phases: [
        {
          bestPhase: '1/3 · Tìm xuống lá [25 | 30]',
          bestScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'db-r', x: 260, y: 30, cellW: 44, cellH: 28, state: 'active', keys: [{ id: 'db-40', label: '40', tone: 'active' }] },
              { id: 'db-i0', x: 148, y: 88, cellW: 40, cellH: 26, state: 'active', keys: [{ id: 'db-20', label: '20', tone: 'active' }] },
              { id: 'db-i1', x: 388, y: 88, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'db-70', label: '70', tone: 'muted' }] },
              { id: 'db-l0', x: 66, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'db-5', label: '5', tone: 'muted' }] },
              { id: 'db-l1', x: 230, y: 146, cellW: 42, cellH: 26, tag: 'Chuẩn bị xóa 30', tagPos: 'bottom', tagTone: 'cobalt', keys: [{ id: 'db-25', label: '25' }, { id: 'db-30', label: '30', tone: 'error' }] },
              { id: 'db-l2', x: 432, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'db-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'dbe0', fromNode: 'db-r', portIndex: 0, toNode: 'db-i0', state: 'active', arrow: true },
              { id: 'dbe1', fromNode: 'db-r', portIndex: 1, toNode: 'db-i1', state: 'muted' },
              { id: 'dbe2', fromNode: 'db-i0', portIndex: 0, toNode: 'db-l0', state: 'muted' },
              { id: 'dbe3', fromNode: 'db-i0', portIndex: 1, toNode: 'db-l1', state: 'active', arrow: true },
              { id: 'dbe4', fromNode: 'db-i1', portIndex: 0, toNode: 'db-l2', state: 'muted' },
            ],
          },
          worstPhase: '1/3 · Xóa 40 ở gốc → đi tìm tiền nhiệm 38',
          worstScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'dw-r', x: 245, y: 30, cellW: 44, cellH: 28, state: 'active', tag: 'Xóa 40 ở nút trong', tagPos: 'right', tagTone: 'warn', keys: [{ id: 'dw-40', label: '40', tone: 'error' }] },
              { id: 'dw-i0', x: 145, y: 88, cellW: 40, cellH: 26, state: 'active', keys: [{ id: 'dw-20', label: '20' }] },
              { id: 'dw-i1', x: 430, y: 88, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'dw-70', label: '70', tone: 'muted' }] },
              { id: 'dw-l0', x: 64, y: 148, cellW: 34, cellH: 26, state: 'muted', keys: [{ id: 'dw-10', label: '10', tone: 'muted' }] },
              { id: 'dw-l1', x: 185, y: 148, cellW: 40, cellH: 26, state: 'active', tag: 'Predecessor = 38', tagPos: 'right', tagTone: 'warn', keys: [{ id: 'dw-38', label: '38', tone: 'active' }] },
            ],
            edges: [
              { id: 'dwe0', fromNode: 'dw-r', portIndex: 0, toNode: 'dw-i0', state: 'active', arrow: true },
              { id: 'dwe1', fromNode: 'dw-r', portIndex: 1, toNode: 'dw-i1', state: 'muted' },
              { id: 'dwe2', fromNode: 'dw-i0', portIndex: 0, toNode: 'dw-l0', state: 'muted' },
              { id: 'dwe3', fromNode: 'dw-i0', portIndex: 1, toNode: 'dw-l1', state: 'active', arrow: true },
            ],
          },
        },
        {
          bestPhase: '2/3 · Pop 30 cuối lá (0 dịch đuôi)',
          bestScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'db-r', x: 260, y: 30, cellW: 44, cellH: 28, keys: [{ id: 'db-40', label: '40' }] },
              { id: 'db-i0', x: 148, y: 88, cellW: 40, cellH: 26, keys: [{ id: 'db-20', label: '20' }] },
              { id: 'db-i1', x: 388, y: 88, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'db-70', label: '70', tone: 'muted' }] },
              { id: 'db-l0', x: 66, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'db-5', label: '5', tone: 'muted' }] },
              { id: 'db-l1', x: 230, y: 146, cellW: 44, cellH: 26, state: 'success', tag: 'Còn [25] ≥ min_keys', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'db-25', label: '25', tone: 'success' }] },
              { id: 'db-l2', x: 432, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'db-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'dbe0', fromNode: 'db-r', portIndex: 0, toNode: 'db-i0' },
              { id: 'dbe1', fromNode: 'db-r', portIndex: 1, toNode: 'db-i1', state: 'muted' },
              { id: 'dbe2', fromNode: 'db-i0', portIndex: 0, toNode: 'db-l0', state: 'muted' },
              { id: 'dbe3', fromNode: 'db-i0', portIndex: 1, toNode: 'db-l1', state: 'active' },
              { id: 'dbe4', fromNode: 'db-i1', portIndex: 0, toNode: 'db-l2', state: 'muted' },
            ],
          },
          worstPhase: '2/3 · Đổi 38 ↑ gốc → Lá rỗng, Gộp O(M)',
          worstScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'dw-r', x: 245, y: 30, cellW: 44, cellH: 28, state: 'active', tag: 'Gốc nhận 38', tagPos: 'right', tagTone: 'warn', keys: [{ id: 'dw-38', label: '38', tone: 'active' }] },
              { id: 'dw-i0', x: 145, y: 88, cellW: 40, cellH: 26, state: 'underflow', tag: 'Cha mất 20 → thiếu!', tagPos: 'right', tagTone: 'error', keys: [{ id: 'dw-20', label: '20', tone: 'active' }] },
              { id: 'dw-i1', x: 430, y: 88, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'dw-70', label: '70', tone: 'muted' }] },
              { id: 'dw-l0', x: 118, y: 150, cellW: 42, cellH: 26, state: 'underflow', tag: 'Gộp [10|20] O(M)', tagPos: 'right', tagTone: 'error', keys: [{ id: 'dw-10', label: '10' }, { id: 'dw-20b', label: '20', tone: 'active' }] },
            ],
            edges: [
              { id: 'dwe0', fromNode: 'dw-r', portIndex: 0, toNode: 'dw-i0', state: 'error' },
              { id: 'dwe1', fromNode: 'dw-r', portIndex: 1, toNode: 'dw-i1', state: 'muted' },
              { id: 'dwe2', fromNode: 'dw-i0', portIndex: 0, toNode: 'dw-l0', state: 'error' },
            ],
            transfers: [
              { id: 'dw-pr', fromX: 162, fromY: 142, toX: 220, toY: 32, ctrlX: 36, ctrlY: 56, label: '38 ↑', tone: 'warn' },
            ],
          },
        },
        {
          bestPhase: '3/3 · 0 mượn/gộp · Tổng O(log N)',
          bestScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'db-r', x: 260, y: 30, cellW: 44, cellH: 28, keys: [{ id: 'db-40', label: '40' }] },
              { id: 'db-i0', x: 148, y: 88, cellW: 40, cellH: 26, keys: [{ id: 'db-20', label: '20' }] },
              { id: 'db-i1', x: 388, y: 88, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'db-70', label: '70', tone: 'muted' }] },
              { id: 'db-l0', x: 66, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'db-5', label: '5', tone: 'muted' }] },
              { id: 'db-l1', x: 230, y: 146, cellW: 44, cellH: 26, state: 'success', tag: 'Xong · 0 borrow, 0 merge', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'db-25', label: '25', tone: 'success' }] },
              { id: 'db-l2', x: 432, y: 146, cellW: 36, cellH: 26, state: 'muted', keys: [{ id: 'db-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'dbe0', fromNode: 'db-r', portIndex: 0, toNode: 'db-i0' },
              { id: 'dbe1', fromNode: 'db-r', portIndex: 1, toNode: 'db-i1', state: 'muted' },
              { id: 'dbe2', fromNode: 'db-i0', portIndex: 0, toNode: 'db-l0', state: 'muted' },
              { id: 'dbe3', fromNode: 'db-i0', portIndex: 1, toNode: 'db-l1', state: 'active' },
              { id: 'dbe4', fromNode: 'db-i1', portIndex: 0, toNode: 'db-l2', state: 'muted' },
            ],
          },
          worstPhase: '3/3 · Gộp lan tới Gốc · O(M(h + 1))',
          worstScene: {
            viewBox: [0, 0, 520, 194],
            nodes: [
              { id: 'dw-r', x: 245, y: 30, cellW: 44, cellH: 28, state: 'overflow', tag: 'Mức 0 · Gốc rỗng → hạ tầng!', tagPos: 'right', tagTone: 'error', keys: [] },
              { id: 'dw-i0', x: 245, y: 92, cellW: 44, cellH: 26, state: 'overflow', tag: 'Gộp [38|70] O(M)', tagPos: 'right', tagTone: 'error', keys: [{ id: 'dw-38', label: '38', tone: 'active' }, { id: 'dw-70', label: '70', tone: 'active' }] },
              { id: 'dw-l0', x: 140, y: 152, cellW: 40, cellH: 26, keys: [{ id: 'dw-10', label: '10' }, { id: 'dw-20b', label: '20' }] },
              { id: 'dw-l2', x: 350, y: 152, cellW: 40, cellH: 26, state: 'muted', keys: [{ id: 'dw-80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'dwe0', fromNode: 'dw-r', portIndex: 0, toNode: 'dw-i0', state: 'error' },
              { id: 'dwe2', fromNode: 'dw-i0', portIndex: 0, toNode: 'dw-l0', state: 'active' },
              { id: 'dwe3', fromNode: 'dw-i0', portIndex: 2, toNode: 'dw-l2', state: 'muted' },
            ],
          },
        },
      ],
    };
  }

  // SEARCH: Real 3-phase animated loop — Best O(1) at root vs Worst O(log N) down h + 1 levels
  return {
    opName: 'Search',
    bestTitle: 'Thuận lợi · Gặp ngay tại gốc',
    bestCost: 'O(1)',
    worstTitle: 'Xấu nhất · Đi trọn h + 1 mức xuống lá',
    worstCost: 'O(log N)',
    phases: [
      {
        bestPhase: '1/3 · So sánh k = 40 tại gốc',
        bestScene: {
          viewBox: [0, 0, 520, 194],
          nodes: [
            { id: 'sb-r', x: 260, y: 36, cellW: 48, cellH: 30, state: 'active', tag: 'Đang xét k = 40', tagPos: 'right', tagTone: 'cobalt', keys: [{ id: 'sb-40', label: '40', tone: 'active' }] },
            { id: 'sb-i0', x: 150, y: 98, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sb-20', label: '20', tone: 'muted' }] },
            { id: 'sb-i1', x: 370, y: 98, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sb-70', label: '70', tone: 'muted' }] },
            { id: 'sb-l0', x: 85, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-5', label: '5', tone: 'muted' }] },
            { id: 'sb-l1', x: 215, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-25', label: '25', tone: 'muted' }, { id: 'sb-30', label: '30', tone: 'muted' }] },
            { id: 'sb-l2', x: 370, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-80', label: '80', tone: 'muted' }] },
          ],
          edges: [
            { id: 'sbe0', fromNode: 'sb-r', portIndex: 0, toNode: 'sb-i0', state: 'muted' },
            { id: 'sbe1', fromNode: 'sb-r', portIndex: 1, toNode: 'sb-i1', state: 'muted' },
            { id: 'sbe2', fromNode: 'sb-i0', portIndex: 0, toNode: 'sb-l0', state: 'muted' },
            { id: 'sbe3', fromNode: 'sb-i0', portIndex: 1, toNode: 'sb-l1', state: 'muted' },
            { id: 'sbe4', fromNode: 'sb-i1', portIndex: 0, toNode: 'sb-l2', state: 'muted' },
          ],
        },
        worstPhase: '1/3 · Mức 0: 30 < 40 → rẽ trái',
        worstScene: {
          viewBox: [0, 0, 520, 194],
          nodes: [
            { id: 'sw-r', x: 250, y: 34, cellW: 44, cellH: 28, state: 'active', tag: 'bisect O(log M)', tagPos: 'right', tagTone: 'cobalt', keys: [{ id: 'sw-40', label: '40', tone: 'active' }] },
            { id: 'sw-i0', x: 148, y: 94, cellW: 40, cellH: 26, keys: [{ id: 'sw-20', label: '20' }] },
            { id: 'sw-i1', x: 380, y: 94, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sw-70', label: '70', tone: 'muted' }] },
            { id: 'sw-l0', x: 64, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sw-5', label: '5', tone: 'muted' }] },
            { id: 'sw-l1', x: 215, y: 154, cellW: 40, cellH: 26, keys: [{ id: 'sw-25', label: '25' }, { id: 'sw-30', label: '30' }] },
            { id: 'sw-l2', x: 425, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sw-80', label: '80', tone: 'muted' }] },
          ],
          edges: [
            { id: 'swe0', fromNode: 'sw-r', portIndex: 0, toNode: 'sw-i0', state: 'active', arrow: true },
            { id: 'swe1', fromNode: 'sw-r', portIndex: 1, toNode: 'sw-i1', state: 'muted' },
            { id: 'swe2', fromNode: 'sw-i0', portIndex: 0, toNode: 'sw-l0', state: 'muted' },
            { id: 'swe3', fromNode: 'sw-i0', portIndex: 1, toNode: 'sw-l1' },
            { id: 'swe4', fromNode: 'sw-i1', portIndex: 0, toNode: 'sw-l2', state: 'muted' },
          ],
        },
      },
      {
        bestPhase: '2/3 · Khớp ngay 40 ở mức 0!',
        bestScene: {
          viewBox: [0, 0, 520, 194],
          nodes: [
            { id: 'sb-r', x: 260, y: 36, cellW: 48, cellH: 30, state: 'success', tag: 'Khớp ngay! Không đi xuống', tagPos: 'right', tagTone: 'success', keys: [{ id: 'sb-40', label: '40', tone: 'success' }] },
            { id: 'sb-i0', x: 150, y: 98, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sb-20', label: '20', tone: 'muted' }] },
            { id: 'sb-i1', x: 370, y: 98, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sb-70', label: '70', tone: 'muted' }] },
            { id: 'sb-l0', x: 85, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-5', label: '5', tone: 'muted' }] },
            { id: 'sb-l1', x: 215, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-25', label: '25', tone: 'muted' }, { id: 'sb-30', label: '30', tone: 'muted' }] },
            { id: 'sb-l2', x: 370, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-80', label: '80', tone: 'muted' }] },
          ],
          edges: [
            { id: 'sbe0', fromNode: 'sb-r', portIndex: 0, toNode: 'sb-i0', state: 'muted' },
            { id: 'sbe1', fromNode: 'sb-r', portIndex: 1, toNode: 'sb-i1', state: 'muted' },
            { id: 'sbe2', fromNode: 'sb-i0', portIndex: 0, toNode: 'sb-l0', state: 'muted' },
            { id: 'sbe3', fromNode: 'sb-i0', portIndex: 1, toNode: 'sb-l1', state: 'muted' },
            { id: 'sbe4', fromNode: 'sb-i1', portIndex: 0, toNode: 'sb-l2', state: 'muted' },
          ],
        },
        worstPhase: '2/3 · Mức 1: 30 > 20 → rẽ phải xuống lá',
        worstScene: {
          viewBox: [0, 0, 520, 194],
          nodes: [
            { id: 'sw-r', x: 250, y: 34, cellW: 44, cellH: 28, state: 'active', keys: [{ id: 'sw-40', label: '40' }] },
            { id: 'sw-i0', x: 148, y: 94, cellW: 40, cellH: 26, state: 'active', tag: 'Mức 1 · bisect', tagPos: 'left', tagTone: 'cobalt', keys: [{ id: 'sw-20', label: '20', tone: 'active' }] },
            { id: 'sw-i1', x: 380, y: 94, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sw-70', label: '70', tone: 'muted' }] },
            { id: 'sw-l0', x: 64, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sw-5', label: '5', tone: 'muted' }] },
            { id: 'sw-l1', x: 215, y: 154, cellW: 40, cellH: 26, state: 'active', keys: [{ id: 'sw-25', label: '25' }, { id: 'sw-30', label: '30', tone: 'active' }] },
            { id: 'sw-l2', x: 425, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sw-80', label: '80', tone: 'muted' }] },
          ],
          edges: [
            { id: 'swe0', fromNode: 'sw-r', portIndex: 0, toNode: 'sw-i0', state: 'active', arrow: true },
            { id: 'swe1', fromNode: 'sw-r', portIndex: 1, toNode: 'sw-i1', state: 'muted' },
            { id: 'swe2', fromNode: 'sw-i0', portIndex: 0, toNode: 'sw-l0', state: 'muted' },
            { id: 'swe3', fromNode: 'sw-i0', portIndex: 1, toNode: 'sw-l1', state: 'active', arrow: true },
            { id: 'swe4', fromNode: 'sw-i1', portIndex: 0, toNode: 'sw-l2', state: 'muted' },
          ],
        },
      },
      {
        bestPhase: '3/3 · Dừng ngay · O(1)',
        bestScene: {
          viewBox: [0, 0, 520, 194],
          nodes: [
            { id: 'sb-r', x: 260, y: 36, cellW: 48, cellH: 30, state: 'success', tag: 'Trả (root, 0) · O(1)', tagPos: 'right', tagTone: 'success', keys: [{ id: 'sb-40', label: '40', tone: 'success' }] },
            { id: 'sb-i0', x: 150, y: 98, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sb-20', label: '20', tone: 'muted' }] },
            { id: 'sb-i1', x: 370, y: 98, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sb-70', label: '70', tone: 'muted' }] },
            { id: 'sb-l0', x: 85, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-5', label: '5', tone: 'muted' }] },
            { id: 'sb-l1', x: 215, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-25', label: '25', tone: 'muted' }, { id: 'sb-30', label: '30', tone: 'muted' }] },
            { id: 'sb-l2', x: 370, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sb-80', label: '80', tone: 'muted' }] },
          ],
          edges: [
            { id: 'sbe0', fromNode: 'sb-r', portIndex: 0, toNode: 'sb-i0', state: 'muted' },
            { id: 'sbe1', fromNode: 'sb-r', portIndex: 1, toNode: 'sb-i1', state: 'muted' },
            { id: 'sbe2', fromNode: 'sb-i0', portIndex: 0, toNode: 'sb-l0', state: 'muted' },
            { id: 'sbe3', fromNode: 'sb-i0', portIndex: 1, toNode: 'sb-l1', state: 'muted' },
            { id: 'sbe4', fromNode: 'sb-i1', portIndex: 0, toNode: 'sb-l2', state: 'muted' },
          ],
        },
        worstPhase: '3/3 · Mức h: Thấy 30 · O(log N)',
        worstScene: {
          viewBox: [0, 0, 520, 194],
          nodes: [
            { id: 'sw-r', x: 250, y: 34, cellW: 44, cellH: 28, state: 'active', keys: [{ id: 'sw-40', label: '40' }] },
            { id: 'sw-i0', x: 148, y: 94, cellW: 40, cellH: 26, state: 'active', keys: [{ id: 'sw-20', label: '20' }] },
            { id: 'sw-i1', x: 380, y: 94, cellW: 38, cellH: 26, state: 'muted', keys: [{ id: 'sw-70', label: '70', tone: 'muted' }] },
            { id: 'sw-l0', x: 64, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sw-5', label: '5', tone: 'muted' }] },
            { id: 'sw-l1', x: 215, y: 154, cellW: 40, cellH: 26, state: 'success', tag: 'Mức h · (h+1) log M', tagPos: 'right', tagTone: 'success', keys: [{ id: 'sw-25', label: '25' }, { id: 'sw-30', label: '30', tone: 'success' }] },
            { id: 'sw-l2', x: 425, y: 154, cellW: 36, cellH: 24, state: 'muted', keys: [{ id: 'sw-80', label: '80', tone: 'muted' }] },
          ],
          edges: [
            { id: 'swe0', fromNode: 'sw-r', portIndex: 0, toNode: 'sw-i0', state: 'active', arrow: true },
            { id: 'swe1', fromNode: 'sw-r', portIndex: 1, toNode: 'sw-i1', state: 'muted' },
            { id: 'swe2', fromNode: 'sw-i0', portIndex: 0, toNode: 'sw-l0', state: 'muted' },
            { id: 'swe3', fromNode: 'sw-i0', portIndex: 1, toNode: 'sw-l1', state: 'active', arrow: true },
            { id: 'swe4', fromNode: 'sw-i1', portIndex: 0, toNode: 'sw-l2', state: 'muted' },
          ],
        },
      },
    ],
  };
}

const s18LoopTimers = new WeakMap<HTMLElement, number>();

function stopS18Loop(slideEl: HTMLElement): void {
  const tid = s18LoopTimers.get(slideEl);
  if (tid !== undefined) {
    window.clearTimeout(tid);
    s18LoopTimers.delete(slideEl);
  }
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
    summary: 'Bảng chi phí thời gian của Search, Insert, Delete kèm mô phỏng chạy từng pha cho trường hợp Thuận lợi và Xấu nhất.',
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
      <div class="slide-frame s18-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Độ phức tạp thời gian</span> các thao tác</h1>
          </div>
          <div class="s18-op-tabs" data-role="op-tabs">
            <button type="button" class="s18-tab is-on" data-op="1">Search</button>
            <button type="button" class="s18-tab" data-op="2">Insert</button>
            <button type="button" class="s18-tab" data-op="3">Delete</button>
          </div>
        </header>

        <table class="complexity-table">
          <thead>
            <tr>
              <th>Thao tác</th>
              <th>Tìm đường</th>
              <th>Xử lý 1 nút</th>
              <th data-col="best">Thuận lợi</th>
              <th data-col="worst">Xấu nhất</th>
            </tr>
          </thead>
          <tbody>
            <tr data-row="1" class="s18-click-row">
              <td><strong>Search</strong></td>
              <td>tối đa ${texInline('h+1')} nút · bisect ${texInline('O(\\log M)')}</td>
              <td>${texInline('O(\\log M)')}</td>
              <td data-col="best"><strong>${texInline('O(1)')}</strong> <small>gặp ở gốc</small></td>
              <td data-col="worst"><strong>${texInline('O(\\log N)')}</strong></td>
            </tr>
            <tr data-row="2" class="s18-click-row">
              <td><strong>Insert</strong></td>
              <td>${texInline('O(\\log N)')} <small>gồm kiểm tra trùng</small></td>
              <td>${texInline('O(M)')} <small>dịch / tách list</small></td>
              <td data-col="best"><strong>${texInline('O(\\log N)')}</strong> <small>cuối lá còn chỗ</small></td>
              <td data-col="worst"><strong>${texInline('O(M(h+1))')}</strong> <small>split lan tới gốc</small></td>
            </tr>
            <tr data-row="3" class="s18-click-row">
              <td><strong>Delete</strong></td>
              <td>${texInline('O(\\log N)')} <small>kể cả tiền nhiệm</small></td>
              <td>${texInline('O(M)')} <small>dịch / mượn / gộp</small></td>
              <td data-col="best"><strong>${texInline('O(\\log N)')}</strong> <small>cuối lá đủ khóa</small></td>
              <td data-col="worst"><strong>${texInline('O(M(h+1))')}</strong> <small>merge lan tới gốc</small></td>
            </tr>
          </tbody>
        </table>

        <div class="s18-compare-grid">
          <div class="canva-card s18-case-card s18-case-card--best">
            <div class="s18-case-head">
              <div class="s18-case-meta">
                <span class="s18-case-title" data-role="best-title"></span>
                <span class="s18-phase-pill" data-role="best-phase"></span>
              </div>
              <span class="s18-cost-pill s18-cost-pill--best" data-role="best-cost"></span>
            </div>
            <div class="s18-op-tree" data-role="best-tree"></div>
          </div>

          <div class="canva-card s18-case-card s18-case-card--worst">
            <div class="s18-case-head">
              <div class="s18-case-meta">
                <span class="s18-case-title" data-role="worst-title"></span>
                <span class="s18-phase-pill s18-phase-pill--err" data-role="worst-phase"></span>
              </div>
              <span class="s18-cost-pill s18-cost-pill--worst" data-role="worst-cost"></span>
            </div>
            <div class="s18-op-tree" data-role="worst-tree"></div>
          </div>
        </div>

        <div class="s18-foot-bar">
          <span class="s18-foot-note">Giả thiết nền: so sánh khóa ${texInline('O(1)')}, ${texInline('h = O(\\log_M N)')} ⇒ ${texInline('(h+1)\\log M = O(\\log N)')}.</span>
          <button type="button" class="s18-avg-btn" data-role="goto-19">Xem chứng minh trung bình · Trang 20 →</button>
        </div>
      </div>
    `;

    ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="goto-19"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      ctx.goToSlide(20);
    });

    const selectOp = (opIdx: number) => {
      startS18CompareLoop(ctx.slideEl, opIdx, ctx.getReducedMotion());
    };

    ctx.slideEl.querySelectorAll<HTMLElement>('.s18-click-row').forEach((tr) => {
      tr.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOp(Number(tr.dataset.row));
      });
    });

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.s18-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOp(Number(btn.dataset.op));
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const rows = ctx.slideEl.querySelectorAll<HTMLElement>('.complexity-table tbody tr');
    const worstCells = ctx.slideEl.querySelectorAll<HTMLElement>('[data-col="worst"]');
    const bestCells = ctx.slideEl.querySelectorAll<HTMLElement>('[data-col="best"]');
    const goto19 = ctx.slideEl.querySelector<HTMLElement>('[data-role="goto-19"]')!;

    rows.forEach((tr) => {
      const r = Number(tr.dataset.row);
      tr.classList.toggle('is-hidden-row', step > 0 && step < r);
      tr.classList.toggle('is-active-row', step === r);
    });
    worstCells.forEach((c) => c.classList.toggle('is-worst-hl', step >= 4));
    bestCells.forEach((c) => c.classList.toggle('is-best-hl', step >= 4));
    goto19.classList.toggle('is-lit', step >= 4);

    const activeOp = step === 2 ? 2 : step === 3 ? 3 : step === 4 ? 2 : 1;
    startS18CompareLoop(ctx.slideEl, activeOp, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    stopS18Loop(slideEl);
    slideEl.querySelectorAll<HTMLElement>('.s18-op-tree').forEach((t) => cancelTreeAnimations(t));
  },
};

function startS18CompareLoop(slideEl: HTMLElement, opIdx: number, reducedMotion: boolean): void {
  stopS18Loop(slideEl);
  const spec = buildS18Compare(opIdx);
  slideEl.querySelector<HTMLElement>('[data-role="best-title"]')!.textContent = spec.bestTitle;
  slideEl.querySelector<HTMLElement>('[data-role="best-cost"]')!.textContent = spec.bestCost;
  slideEl.querySelector<HTMLElement>('[data-role="worst-title"]')!.textContent = spec.worstTitle;
  slideEl.querySelector<HTMLElement>('[data-role="worst-cost"]')!.textContent = spec.worstCost;

  slideEl.querySelectorAll<HTMLElement>('.s18-tab').forEach((btn) => {
    btn.classList.toggle('is-on', Number(btn.dataset.op) === opIdx);
  });
  slideEl.querySelectorAll<HTMLElement>('.complexity-table tbody tr').forEach((tr) => {
    tr.classList.toggle('is-active-row', Number(tr.dataset.row) === opIdx);
  });

  const bestPhaseEl = slideEl.querySelector<HTMLElement>('[data-role="best-phase"]')!;
  const worstPhaseEl = slideEl.querySelector<HTMLElement>('[data-role="worst-phase"]')!;
  const bestTree = slideEl.querySelector<HTMLElement>('[data-role="best-tree"]')!;
  const worstTree = slideEl.querySelector<HTMLElement>('[data-role="worst-tree"]')!;

  const renderPhase = (pIdx: number) => {
    const frame = spec.phases[pIdx];
    bestPhaseEl.textContent = frame.bestPhase;
    worstPhaseEl.textContent = frame.worstPhase;
    renderTreeScene(bestTree, frame.bestScene, { reducedMotion, durationMs: 420 });
    renderTreeScene(worstTree, frame.worstScene, { reducedMotion, durationMs: 420 });
  };

  if (reducedMotion) {
    renderPhase(spec.phases.length - 1);
    return;
  }

  let phase = 0;
  renderPhase(0);
  const scheduleNext = () => {
    const sec = slideEl.closest('section.slide-section');
    if (sec && !sec.classList.contains('present') && !sec.classList.contains('is-entering-slide')) {
      stopS18Loop(slideEl);
      return;
    }
    const delay = phase === spec.phases.length - 1 ? 2150 : 1450;
    s18LoopTimers.set(
      slideEl,
      window.setTimeout(() => {
        const s = slideEl.closest('section.slide-section');
        if (s && !s.classList.contains('present') && !s.classList.contains('is-entering-slide')) {
          stopS18Loop(slideEl);
          return;
        }
        phase = (phase + 1) % spec.phases.length;
        renderPhase(phase);
        scheduleNext();
      }, delay),
    );
  };
  scheduleNext();
}

// ============================================================================
// SLIDE 20 — Chi phí trung bình và chứng minh chi tiết từng bước
// ============================================================================
function buildS19DecisionSvg(active: boolean): string {
  const stroke = active ? '#1d4ed8' : '#94a3b8';
  const okStroke = active ? '#16a34a' : '#94a3b8';
  const hiFill = active ? '#fef08a' : '#f1f5f9';
  const okFill = active ? '#dcfce7' : '#f1f5f9';
  const leafFill = active ? '#eff6ff' : '#f8fafc';
  const ink = active ? '#0f1d3a' : '#64748b';
  const lblFill = active ? '#004aad' : '#94a3b8';

  return `
  <svg class="s19-proof-svg" viewBox="0 0 540 166" role="img" aria-label="Cây quyết định tam phân chứng minh độ sâu trung bình">
    <defs>
      <marker id="s19-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${stroke}"/>
      </marker>
      <path id="s19-dec-route" d="M 222 26 L 104 84 L 104 142"/>
      <path id="s19-dec-route2" d="M 222 26 L 340 84 L 340 142"/>
    </defs>

    <line x1="12" y1="26" x2="432" y2="26" stroke="rgba(59,130,246,0.14)" stroke-dasharray="4 4"/>
    <line x1="12" y1="84" x2="432" y2="84" stroke="rgba(59,130,246,0.14)" stroke-dasharray="4 4"/>
    <line x1="12" y1="142" x2="432" y2="142" stroke="rgba(59,130,246,0.14)" stroke-dasharray="4 4"/>

    <g font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="700" fill="${lblFill}">
      <text class="${active ? 's19-tier-pulse' : ''}" style="--ti:0" x="434" y="30">Mức 0: 1 nút</text>
      <text class="${active ? 's19-tier-pulse' : ''}" style="--ti:1" x="434" y="88">Mức 1: ≤ 3 nút</text>
      <text class="${active ? 's19-tier-pulse' : ''}" style="--ti:2" x="434" y="146">Mức d: ≤ 3ᵈ nút</text>
    </g>

    <line x1="194" y1="40" x2="108" y2="68" stroke="${stroke}" stroke-width="2" marker-end="url(#s19-arr)"/>
    <line x1="222" y1="40" x2="222" y2="68" stroke="${okStroke}" stroke-width="2" marker-end="url(#s19-arr)"/>
    <line x1="250" y1="40" x2="336" y2="68" stroke="${stroke}" stroke-width="2" marker-end="url(#s19-arr)"/>

    <g font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="800" text-anchor="middle">
      <rect x="130" y="42" width="22" height="17" rx="4" fill="#dbeafe" stroke="${stroke}" stroke-width="1"/>
      <text x="141" y="54" fill="${lblFill}">&lt;</text>
      <rect x="211" y="45" width="22" height="17" rx="4" fill="#dcfce7" stroke="${okStroke}" stroke-width="1"/>
      <text x="222" y="57" fill="#15803d">=</text>
      <rect x="292" y="42" width="22" height="17" rx="4" fill="#dbeafe" stroke="${stroke}" stroke-width="1"/>
      <text x="303" y="54" fill="${lblFill}">&gt;</text>
    </g>

    <g stroke="${stroke}" stroke-width="1.5" opacity="0.72">
      <line x1="90" y1="98" x2="44" y2="128"/>
      <line x1="104" y1="98" x2="104" y2="128"/>
      <line x1="118" y1="98" x2="164" y2="128"/>
      <line x1="326" y1="98" x2="280" y2="128"/>
      <line x1="340" y1="98" x2="340" y2="128"/>
      <line x1="354" y1="98" x2="400" y2="128"/>
    </g>

    <rect x="178" y="12" width="88" height="28" rx="3" fill="${hiFill}" stroke="${active ? '#ca8a04' : stroke}" stroke-width="2"/>
    <text x="222" y="30" text-anchor="middle" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-size="13.5" font-weight="800">k ? x₀</text>

    <rect x="66" y="70" width="76" height="28" rx="3" fill="#ffffff" stroke="${stroke}" stroke-width="1.8"/>
    <text x="104" y="88" text-anchor="middle" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-size="13" font-weight="700">k ? x₁</text>

    <rect class="${active ? 's19-ok-pulse' : ''}" x="186" y="70" width="72" height="28" rx="3" fill="${okFill}" stroke="${okStroke}" stroke-width="1.8"/>
    <text x="222" y="88" text-anchor="middle" fill="#14532d" font-family="'Be Vietnam Pro', sans-serif" font-size="12.5" font-weight="800">Tìm thấy</text>

    <rect x="302" y="70" width="76" height="28" rx="3" fill="#ffffff" stroke="${stroke}" stroke-width="1.8"/>
    <text x="340" y="88" text-anchor="middle" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-size="13" font-weight="700">k ? x₂</text>

    ${[
      { x: 44, ok: false },
      { x: 104, ok: true },
      { x: 164, ok: false },
      { x: 280, ok: false },
      { x: 340, ok: true },
      { x: 400, ok: false },
    ]
      .map(
        (lf) => `
      <rect x="${lf.x - 24}" y="130" width="48" height="24" rx="3" fill="${lf.ok ? okFill : leafFill}" stroke="${lf.ok ? okStroke : stroke}" stroke-width="1.4"/>
      <text x="${lf.x}" y="146" text-anchor="middle" fill="${lf.ok ? '#14532d' : ink}" font-family="'IBM Plex Mono', monospace" font-size="11.5" font-weight="700">1/N</text>
    `,
      )
      .join('')}

    ${active ? `
      <circle r="4.6" fill="#FEF08A" stroke="#004AAD" stroke-width="1.6" class="s17-pulse-dot">
        <animateMotion dur="2.5s" repeatCount="indefinite"><mpath href="#s19-dec-route"/></animateMotion>
      </circle>
      <circle r="4.2" fill="#38BDF8" stroke="#004AAD" stroke-width="1.4" class="s17-pulse-dot">
        <animateMotion dur="2.5s" begin="1.25s" repeatCount="indefinite"><mpath href="#s19-dec-route2"/></animateMotion>
      </circle>
    ` : ''}
  </svg>`;
}

function buildS19AlignedClimbSvg(assumptionOn: boolean, revealed: boolean): string {
  const worst = revealed && !assumptionOn;
  const stroke = worst ? '#dc2626' : '#1d4ed8';
  const fillTop = worst ? '#fee2e2' : '#eef5ff';
  const fillMid = worst ? '#fee2e2' : '#dbeafe';
  const fillBot = worst ? '#fee2e2' : '#fef08a';
  const ink = worst ? '#991b1b' : '#0f1d3a';

  const rows = [
    { y: 26, name: 'Gốc', j: 'j = 3', w: worst ? 186 : 48, fill: worst ? '#ef4444' : '#60a5fa', bi: 2 },
    { y: 82, name: 'Cha', j: 'j = 2', w: worst ? 186 : 104, fill: worst ? '#ef4444' : '#3b82f6', bi: 1 },
    { y: 138, name: 'Lá', j: 'j = 1', w: 186, fill: worst ? '#dc2626' : '#004aad', bi: 0 },
  ];

  return `
  <svg class="s19-proof-svg" viewBox="0 0 540 166" role="img" aria-label="Sơ đồ số mức sửa R đối chiếu xác suất giảm dần">
    <defs>
      <marker id="s19-up" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${stroke}"/>
      </marker>
      <path id="s19-climb-path" d="M 32 142 L 32 24"/>
    </defs>

    <path class="${revealed ? 's21-ref-flow' : ''}" d="M 32 142 L 32 24" stroke="${stroke}" stroke-width="2.4" stroke-dasharray="${worst ? '6 4' : '5 3'}" marker-end="url(#s19-up)"/>
    ${revealed ? `
      <circle r="4.5" fill="${worst ? '#FCA5A5' : '#FEF08A'}" stroke="${stroke}" stroke-width="1.6" class="s17-pulse-dot">
        <animateMotion dur="${worst ? '1.3s' : '2.4s'}" repeatCount="indefinite"><mpath href="#s19-climb-path"/></animateMotion>
      </circle>
    ` : ''}
    <rect x="8" y="70" width="28" height="22" rx="3" fill="${worst ? '#dc2626' : '#004aad'}"/>
    <text x="22" y="85" text-anchor="middle" fill="#ffffff" font-family="'IBM Plex Mono', monospace" font-size="11.5" font-weight="800">R↑</text>

    <line x1="118" y1="40" x2="118" y2="68" stroke="${stroke}" stroke-width="2" stroke-dasharray="${worst ? 'none' : '4 3'}"/>
    <line x1="118" y1="96" x2="118" y2="124" stroke="${stroke}" stroke-width="2"/>

    ${rows
      .map((r, idx) => {
        const boxFill = idx === 0 ? fillTop : idx === 1 ? fillMid : fillBot;
        return `
        <line x1="162" y1="${r.y}" x2="210" y2="${r.y}" stroke="rgba(59,130,246,0.28)" stroke-dasharray="3 3"/>
        <rect class="${revealed ? (worst ? 's19-alarm-node' : 's19-node-step') : ''}" style="--ni:${r.bi}" x="74" y="${r.y - 14}" width="88" height="28" rx="3" fill="${boxFill}" stroke="${stroke}" stroke-width="1.8"/>
        <text x="118" y="${r.y + 5}" text-anchor="middle" fill="${ink}" font-family="'Be Vietnam Pro', sans-serif" font-size="13" font-weight="800">${r.name}</text>

        <text x="218" y="${r.y + 4}" fill="${ink}" font-family="'IBM Plex Mono', monospace" font-size="12" font-weight="800">${r.j}</text>
        <rect x="266" y="${r.y - 12}" width="186" height="24" rx="3" fill="#edf4ff" stroke="rgba(59,130,246,0.25)" stroke-width="1"/>
        <rect class="s19-hbar${revealed ? ' is-grow' : ''}" style="--bi:${r.bi}" x="266" y="${r.y - 12}" width="${r.w}" height="24" rx="3" fill="${r.fill}"/>
        <text x="460" y="${r.y + 4}" fill="${worst ? '#991b1b' : '#004aad'}" font-family="'IBM Plex Mono', monospace" font-size="11.5" font-weight="800">${worst ? 'O(M)' : idx === 0 ? '≤ p²' : idx === 1 ? '≤ p' : '≤ 1'}</text>
      `;
      })
      .join('')}
  </svg>`;
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
    summary: 'Chứng minh chi tiết từng bước cho kỳ vọng Search (cây quyết định tam phân → Θ(log N)) và Insert/Delete (tổng xác suất đuôi E[R] → O(log N + M) có điều kiện).',
    sections: [
      {
        heading: '1. Tìm kiếm thành công',
        bodyHtml:
          '<p>Phân bố đều 1/N trên N khóa; mỗi phép so sánh có tối đa 3 kết quả (&lt;, =, &gt;). Cây quyết định tam phân có tối đa ' + texInline('3^d') + ' nút ở độ sâu ' + texInline('d') + ' ⇒ ' +
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
            <p class="slide-lead">Phải nêu rõ phân bố truy vấn và giả thiết về số mức sửa cây khi chứng minh kỳ vọng.</p>
          </div>
          <label class="toggle-pill" data-role="toggle-wrap">
            <input type="checkbox" data-role="assump-toggle" checked />
            <span>Giả thiết ${texInline('\\Pr(R \\ge j) \\le p^{j-1}')}</span>
          </label>
        </header>

        <div class="s19-cols">
          <article class="canva-card s19-card" data-card="search">
            <h3>1. Tìm kiếm thành công (Cây quyết định tam phân)</h3>
            <div class="s19-svg-stage" data-role="tree-dec"></div>
            <div class="s19-proof-steps" data-role="s19-m1">
              <div class="proof-row"><span class="proof-tag">B1</span><div>Mỗi phép so sánh rẽ tối đa <strong>3 hướng</strong> (<code>&lt;</code>, <code>=</code>, <code>&gt;</code>) ⇒ mức ${texInline('d')} có tối đa ${texInline('3^d')} kết quả.</div></div>
              <div class="proof-row"><span class="proof-tag">B2</span><div>Với ${texInline('N')} khóa đồng xác suất ${texInline('1/N')}: số phép so sánh trung bình ${texInline('E[C] \\ge \\log_3 N = \\Omega(\\log N)')}.</div></div>
              <div class="s19-res-badge"><strong>B3 · Kết luận:</strong> Ghép cận trên ${texInline('O(\\log N)')} ⇒ <strong>${texInline('E[T_{\\text{tìm kiếm}}] = \\Theta(\\log N)')}</strong></div>
            </div>
          </article>

          <article class="canva-card s19-card" data-card="update">
            <h3>2. Chèn và xóa — Chứng minh kỳ vọng số mức sửa ${texInline('R')}</h3>
            <div class="s19-svg-stage" data-role="tree-climb"></div>
            <div class="s19-proof-steps" data-role="s19-m2">
              <div class="proof-row"><span class="proof-tag">B1</span><div>Gọi ${texInline('R \\in [0, h+1]')} là số mức sửa (${texInline('O(M)')}/mức) ⇒ ${texInline('E[T] = O(\\log N + M(1 + E[R]))')}.</div></div>
              <div class="s19-tail" data-role="s19-tail">
                <div class="proof-row" data-role="tail-b2"></div>
                <div data-role="tail-formula"></div>
              </div>
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
      updateS19Tail(ctx.slideEl, checkbox.checked, true);
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

    tDec.innerHTML = buildS19DecisionSvg(step >= 1);

    if (step >= 3) {
      checkbox.checked = true;
      updateS19Tail(ctx.slideEl, true, true);
    } else {
      updateS19Tail(ctx.slideEl, false, false);
    }
  },
};

function updateS19Tail(slideEl: HTMLElement, assumptionOn: boolean, revealed: boolean): void {
  const b2 = slideEl.querySelector<HTMLElement>('[data-role="tail-b2"]')!;
  const formula = slideEl.querySelector<HTMLElement>('[data-role="tail-formula"]')!;
  const tClimb = slideEl.querySelector<HTMLElement>('[data-role="tree-climb"]')!;
  tClimb.innerHTML = buildS19AlignedClimbSvg(assumptionOn, revealed);

  if (assumptionOn) {
    b2.innerHTML = `<span class="proof-tag">B2</span><div>Từ ${texInline('\\Pr(R \\ge j) \\le p^{j-1}')} (${texInline('0 \\le p < 1')}): ${texInline('E[R] = \\sum_{j=1}^{h+1} \\Pr(R \\ge j) \\le \\frac{1}{1-p} = O(1)')}.</div>`;
    formula.innerHTML = `<div class="s19-res-badge is-ok"><strong>B3 · Kết luận:</strong> Thay ${texInline('E[R] = O(1)')} ⇒ <strong>${texInline('E[T_{\\text{chèn}}],\\; E[T_{\\text{xóa}}] = O(\\log N + M)')}</strong></div>`;
  } else {
    b2.innerHTML = `<span class="proof-tag proof-tag--warn">B2</span><div><em>Tắt giả thiết đuôi (${texInline('p')}):</em> không có cận hằng cho ${texInline('E[R]')}, phép sửa có thể leo trọn ${texInline('h + 1')} tầng!</div>`;
    formula.innerHTML = `<div class="s19-res-badge is-warn"><strong>B3 · Cận an toàn:</strong> Quay về cận xấu nhất <strong>${texInline('O(M(h + 1))')}</strong></div>`;
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
            <div class="canva-card s20-box s20-box--bisect" data-box="bisect">
              <h3>RAM · Tìm trong nút bằng <code>bisect</code></h3>
              <div class="arr-meta"><span>Tìm <strong>65</strong> trong mảng đã sắp xếp</span><span class="arr-tag">O(log M)</span></div>
              <div class="arr-row arr-row--bisect">
                <span class="bs-cell" style="--bsi:0">10</span>
                <span class="bs-cell" style="--bsi:1">20</span>
                <span class="bs-cell" style="--bsi:2">30</span>
                <span class="bs-cell is-mid" style="--bsi:3">40</span>
                <span class="bs-cell is-hi" style="--bsi:4">50</span>
                <span class="bs-cell is-target" style="--bsi:5">65</span>
                <span class="bs-cell is-hi" style="--bsi:6">70</span>
              </div>
              <p>${texInline('O(\\log M)')} mỗi nút × ${texInline('(h+1)')} mức ⇒ <strong>${texInline('O((h+1)\\log M) = O(\\log N)')}</strong></p>
            </div>

            <div class="canva-card s20-box s20-box--shift" data-box="shift">
              <h3>RAM · Chèn / xóa phải dịch đuôi mảng</h3>
              <div class="arr-meta"><span>Chèn <strong>25</strong> giữa nút → đẩy <code>30, 40</code> sang phải</span><span class="arr-tag arr-tag--dark">O(M)</span></div>
              <div class="arr-row arr-row--shift" data-role="shift-arr">
                <span>10</span><span>20</span><span class="is-ins">25 ↓</span><span class="is-moved">30 →</span><span class="is-moved">40 →</span>
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
// SLIDE 22 — Độ phức tạp không gian (Mô phỏng bộ nhớ sống động 3 vùng)
// ============================================================================
function buildS21StoreSvg(active: boolean, animate: boolean): string {
  const op = active ? 1 : 0.42;
  const stroke = active ? '#004AAD' : '#64748B';
  const topF = active ? '#5284FF' : '#CBD5E1';
  const sideF = active ? '#1D4ED8' : '#94A3B8';
  const stg = (i: number) => (animate ? `class="s21-stagger is-anim" style="--st:${i}"` : '');
  return `
  <svg class="s21-canva-svg" viewBox="0 0 460 178" role="img" aria-label="Bộ nhớ lưu cây B-tree">
    <defs>
      <marker id="s21-a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#0F1D3A"/>
      </marker>
      <path id="s21-ptr0" d="M 178 58 L 72 112"/>
      <path id="s21-ptr1" d="M 219 58 L 219 112"/>
      <path id="s21-ptr2" d="M 260 58 L 366 112"/>
    </defs>
    <g opacity="${op}">
      <!-- Live count chips -->
      ${active ? `
      <g>
        <rect x="308" y="14" width="136" height="22" rx="3" fill="#0F1D3A"/>
        <text x="376" y="29" text-anchor="middle" fill="#FEF08A" font-size="11" font-weight="800" font-family="'IBM Plex Mono', monospace">N=8 khóa · K=4 nút</text>
        <rect x="308" y="42" width="136" height="20" rx="3" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1"/>
        <text x="376" y="56" text-anchor="middle" fill="#004AAD" font-size="10.5" font-weight="800" font-family="'IBM Plex Mono', monospace">K−1 = 3 tham chiếu</text>
      </g>` : ''}

      <g ${stg(0)}>
        <text x="108" y="34" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">keys</text>
        <line x1="114" y1="30" x2="152" y2="30" stroke="#0F1D3A" stroke-width="1.5" marker-end="url(#s21-a1)"/>
        <text x="108" y="60" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">children</text>
        <line x1="114" y1="56" x2="152" y2="56" stroke="#0F1D3A" stroke-width="1.5" marker-end="url(#s21-a1)"/>

        <!-- Root 3D node with keys + children ports -->
        <polygon points="158,14 166,7 288,7 280,14" fill="${topF}" stroke="${stroke}" stroke-width="1.4"/>
        <polygon points="280,14 288,7 288,61 280,68" fill="${sideF}" stroke="${stroke}" stroke-width="1.4"/>
        <rect class="${active ? 's21-mem-cell' : ''}" style="--mc:0" x="158" y="14" width="61" height="27" fill="#FFFFFF" stroke="${stroke}" stroke-width="1.8"/>
        <rect class="${active ? 's21-mem-cell' : ''}" style="--mc:1" x="219" y="14" width="61" height="27" fill="#FFFFFF" stroke="${stroke}" stroke-width="1.8"/>
        <text x="188" y="33" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
        <text x="250" y="33" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="800" font-family="'IBM Plex Mono', monospace">40</text>

        <rect x="158" y="41" width="122" height="27" fill="#EEF7FF" stroke="${stroke}" stroke-width="1.8"/>
        <line x1="199" y1="41" x2="199" y2="68" stroke="${stroke}" stroke-width="1.4"/>
        <line x1="239" y1="41" x2="239" y2="68" stroke="${stroke}" stroke-width="1.4"/>
        <circle cx="178" cy="54" r="3.5" fill="#0F1D3A"/>
        <circle cx="219" cy="54" r="3.5" fill="#0F1D3A"/>
        <circle cx="260" cy="54" r="3.5" fill="#0F1D3A"/>
      </g>

      <!-- 3 Child pointer edges + living pointer signal beads -->
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.1s" pathLength="1" x1="178" y1="58" x2="72" y2="112" stroke="#0F1D3A" stroke-width="1.8" marker-end="url(#s21-a1)"/>
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.22s" pathLength="1" x1="219" y1="58" x2="219" y2="112" stroke="#0F1D3A" stroke-width="1.8" marker-end="url(#s21-a1)"/>
      <line class="${animate ? 's21-edge-draw is-anim' : ''}" style="--ed:0.34s" pathLength="1" x1="260" y1="58" x2="366" y2="112" stroke="#0F1D3A" stroke-width="1.8" marker-end="url(#s21-a1)"/>
      ${active ? `
        <circle r="3.6" fill="#38BDF8" stroke="#004AAD" stroke-width="1.2" class="s21-search-bead"><animateMotion dur="2.2s" repeatCount="indefinite"><mpath href="#s21-ptr0"/></animateMotion></circle>
        <circle r="3.6" fill="#38BDF8" stroke="#004AAD" stroke-width="1.2" class="s21-search-bead"><animateMotion dur="2.2s" begin="0.45s" repeatCount="indefinite"><mpath href="#s21-ptr1"/></animateMotion></circle>
        <circle r="3.6" fill="#38BDF8" stroke="#004AAD" stroke-width="1.2" class="s21-search-bead"><animateMotion dur="2.2s" begin="0.9s" repeatCount="indefinite"><mpath href="#s21-ptr2"/></animateMotion></circle>
      ` : ''}

      <!-- 3 Leaves with sequential memory pulse -->
      ${[
        { cx: 72, a: '5', b: '10', c0: 2, c1: 3 },
        { cx: 219, a: '25', b: '30', c0: 4, c1: 5 },
        { cx: 366, a: '50', b: '60', c0: 6, c1: 7 },
      ]
        .map(
          (lf, i) => `
          <g ${stg(i + 1)}>
            <polygon points="${lf.cx - 52},118 ${lf.cx - 46},112 ${lf.cx + 58},112 ${lf.cx + 52},118" fill="${topF}" stroke="${stroke}" stroke-width="1.3"/>
            <polygon points="${lf.cx + 52},118 ${lf.cx + 58},112 ${lf.cx + 58},142 ${lf.cx + 52},148" fill="${sideF}" stroke="${stroke}" stroke-width="1.3"/>
            <rect class="${active ? 's21-mem-cell' : ''}" style="--mc:${lf.c0}" x="${lf.cx - 52}" y="118" width="52" height="30" fill="#FFFFFF" stroke="${stroke}" stroke-width="1.7"/>
            <rect class="${active ? 's21-mem-cell' : ''}" style="--mc:${lf.c1}" x="${lf.cx}" y="118" width="52" height="30" fill="#FFFFFF" stroke="${stroke}" stroke-width="1.7"/>
            <text x="${lf.cx - 26}" y="138" text-anchor="middle" fill="#0F1D3A" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${lf.a}</text>
            <text x="${lf.cx + 26}" y="138" text-anchor="middle" fill="#0F1D3A" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${lf.b}</text>
            <text x="${lf.cx}" y="166" text-anchor="middle" fill="#1E3A8A" font-size="11.5" font-weight="600" font-family="'IBM Plex Mono', monospace">children = []</text>
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

      <!-- Internal [20] -->
      <polygon points="62,98 68,92 140,92 134,98" fill="#BFDBFE" stroke="${dimStroke}" stroke-width="1.3"/>
      <polygon points="134,98 140,92 140,122 134,128" fill="#93C5FD" stroke="${dimStroke}" stroke-width="1.3"/>
      <rect x="62" y="98" width="72" height="30" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.6"/>
      <text x="98" y="118" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="700" font-family="'IBM Plex Mono', monospace">20</text>

      <!-- Internal [60] -->
      <polygon points="248,98 256,91 330,91 322,98" fill="${cobalt}" stroke="${hi}" stroke-width="1.5"/>
      <polygon points="322,98 330,91 330,123 322,130" fill="#1D4ED8" stroke="${hi}" stroke-width="1.5"/>
      <rect x="248" y="98" width="74" height="32" fill="#FFFFFF" stroke="${hi}" stroke-width="2.2"/>
      <text x="285" y="119" text-anchor="middle" fill="#0F1D3A" font-size="16" font-weight="800" font-family="'IBM Plex Mono', monospace">60</text>

      <!-- 4 Leaves -->
      <rect x="14" y="164" width="74" height="28" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.5"/>
      <text x="51" y="183" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'IBM Plex Mono', monospace">5 | 10</text>

      <rect x="106" y="164" width="78" height="28" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.5"/>
      <text x="145" y="183" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'IBM Plex Mono', monospace">25 | 30</text>

      <polygon points="204,164 211,158 293,158 286,164" fill="#4ADE80" stroke="#16A34A" stroke-width="1.5"/>
      <polygon points="286,164 293,158 293,186 286,192" fill="#16A34A" stroke="#16A34A" stroke-width="1.5"/>
      <rect x="204" y="164" width="82" height="28" fill="#FFFFFF" stroke="#16A34A" stroke-width="2.4"/>
      <text x="245" y="183" text-anchor="middle" fill="#0F1D3A" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">45 | <tspan fill="#15803D">50</tspan></text>

      <rect x="308" y="164" width="78" height="28" fill="#EEF7FF" stroke="${dimStroke}" stroke-width="1.5"/>
      <text x="347" y="183" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'IBM Plex Mono', monospace">65 | 70</text>

      <!-- Call Stack Container -->
      <text x="536" y="16" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Call Stack · h + 1 = 3 khung</text>
      <rect x="434" y="24" width="204" height="158" rx="4" fill="rgba(255,255,255,0.68)" stroke="#004AAD" stroke-width="1.8"/>
      <text x="534" y="200" text-anchor="middle" fill="#0F1D3A" font-size="11" font-weight="700" font-family="'IBM Plex Mono', monospace">3 × O(1) con trỏ · không copy cây</text>

      <!-- 3 Stacked Call Frames with synchronized live push pulse -->
      ${[
        { y: 38, txt: '3. search([45, 50])', ord: 2 },
        { y: 88, txt: '2. search([60])', ord: 1 },
        { y: 138, txt: '1. search(root)', ord: 0 },
      ]
        .map(
          (f) => `
          <g ${stg(f.ord)}>
            <polygon points="448,${f.y} 454,${f.y - 5} 628,${f.y - 5} 622,${f.y}" fill="${cobalt}" stroke="${hi}" stroke-width="1.2"/>
            <polygon points="622,${f.y} 628,${f.y - 5} 628,${f.y + 27} 622,${f.y + 32}" fill="#2563EB" stroke="${hi}" stroke-width="1.2"/>
            <rect class="${active ? 's21-stack-pulse' : ''}" style="--sp:${f.ord}" x="448" y="${f.y}" width="174" height="32" fill="#FFFFFF" stroke="${hi}" stroke-width="1.6"/>
            <text x="535" y="${f.y + 21}" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${f.txt}</text>
          </g>`,
        )
        .join('')}

      <!-- Animated pointer links: stack frame -> node in tree -->
      <path ${flowCls} d="M 444 154 L 404 154 L 404 38 L 238 38" fill="none" stroke="${hi}" stroke-width="1.7" marker-end="url(#s21-ab)"/>
      <path ${flowCls} d="M 444 104 L 332 104" fill="none" stroke="${hi}" stroke-width="1.7" marker-end="url(#s21-ab)"/>
      <path ${flowCls} d="M 444 54 L 408 54 L 408 146 L 296 146 L 288 156" fill="none" stroke="#16A34A" stroke-width="1.8" marker-end="url(#s21-ab)"/>
      ${active ? `
      <circle r="5" fill="#FEF08A" stroke="#004AAD" stroke-width="1.8" class="s21-search-bead">
        <animateMotion dur="2.7s" repeatCount="indefinite"><mpath href="#s21-search-route"/></animateMotion>
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
      <!-- Left: Recursion Stack O(h+1) -->
      <g ${stg(0)}>
        <text x="80" y="18" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Ngăn xếp đệ quy</text>
        ${[30, 56, 102]
          .map(
            (y, idx) => `
            <g>
              <polygon points="18,${y} 23,${y - 4} 145,${y - 4} 140,${y}" fill="${cobalt}" stroke="${hi}" stroke-width="1.1"/>
              <polygon points="140,${y} 145,${y - 4} 145,${y + 18} 140,${y + 22}" fill="#2563EB" stroke="${hi}" stroke-width="1.1"/>
              <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:${2 - idx}" x="18" y="${y}" width="122" height="22" fill="#FFFFFF" stroke="${hi}" stroke-width="1.5"/>
              <text x="79" y="${y + 15}" text-anchor="middle" fill="#0F1D3A" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">node, key, i</text>
            </g>`,
          )
          .join('')}
        <text x="79" y="95" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800">⋮</text>
        <text x="79" y="144" text-anchor="middle" fill="#004AAD" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">O(h + 1)</text>
      </g>

      <text ${stg(1)} x="176" y="88" text-anchor="middle" fill="#0F1D3A" font-size="28" font-weight="800">+</text>

      <!-- Right: Reusable O(M) temp buffer -->
      <g ${stg(1)}>
        <text x="348" y="18" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Vùng tạm tái sử dụng từng mức</text>
        ${active ? `
          <rect x="262" y="24" width="174" height="16" rx="2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1"/>
          <text x="349" y="35.5" text-anchor="middle" fill="#854D0E" font-size="9.5" font-weight="800" font-family="'IBM Plex Mono', monospace">TÁI SỬ DỤNG · KHÔNG NHÂN h</text>
        ` : ''}
        <text x="242" y="68" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">keys</text>
        <text x="242" y="108" text-anchor="end" fill="#0F1D3A" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">children</text>

        ${[
          { y: 50, vals: ['k₀', 'k₁', '⋯', 'kₜ'] },
          { y: 90, vals: ['c₀', 'c₁', '⋯', 'cₜ'] },
        ]
          .map(
            (row, rIdx) => `
            <g>
              <polygon points="250,${row.y} 256,${row.y - 5} 454,${row.y - 5} 448,${row.y}" fill="${cobalt}" stroke="${hi}" stroke-width="1.2"/>
              <polygon points="448,${row.y} 454,${row.y - 5} 454,${row.y + 21} 448,${row.y + 26}" fill="#2563EB" stroke="${hi}" stroke-width="1.2"/>
              ${[0, 1, 2, 3]
                .map(
                  (ci) => `
                <rect class="${active ? 's21-buf-cell' : ''}" style="--bc:${ci + rIdx}" x="${250 + ci * 49.5}" y="${row.y}" width="49.5" height="26" fill="#FFFFFF" stroke="${hi}" stroke-width="1.4"/>
                <text x="${275 + ci * 49.5}" y="${row.y + 18}" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">${row.vals[ci]}</text>
              `,
                )
                .join('')}
            </g>`,
          )
          .join('')}
        <text x="348" y="144" text-anchor="middle" fill="#004AAD" font-size="14.5" font-weight="800" font-family="'IBM Plex Mono', monospace">O(M) (giải phóng sau mỗi mức)</text>
      </g>

      <!-- Bottom live unwind flow -->
      <g ${stg(2)}>
        <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:0" x="42" y="164" width="84" height="26" rx="3" fill="#FFFFFF" stroke="${hi}" stroke-width="1.8"/>
        <text x="84" y="182" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Mức h (lá)</text>
        <line x1="126" y1="177" x2="152" y2="177" stroke="${hi}" stroke-width="1.8" marker-end="url(#s21-ac)"/>
      </g>

      <g ${stg(3)}>
        <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:1" x="158" y="164" width="96" height="26" rx="3" fill="#EEF7FF" stroke="${cobalt}" stroke-width="1.6"/>
        <text x="206" y="182" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Mức h − 1</text>
        <line x1="254" y1="177" x2="278" y2="177" stroke="${hi}" stroke-width="1.8" marker-end="url(#s21-ac)"/>
      </g>

      <g ${stg(4)}>
        <text x="296" y="182" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800">⋯</text>
        <line x1="312" y1="177" x2="336" y2="177" stroke="${hi}" stroke-width="1.8" marker-end="url(#s21-ac)"/>
        <rect class="${active ? 's21-unwind-box' : ''}" style="--uw:2" x="342" y="164" width="86" height="26" rx="3" fill="#EEF7FF" stroke="${cobalt}" stroke-width="1.6"/>
        <text x="385" y="182" text-anchor="middle" fill="#0F1D3A" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Mức 0 (gốc)</text>
      </g>

      <text x="235" y="212" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Mỗi mức quay lui dùng xong giải phóng ngay → chỉ cần O(M).</text>
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
    summary: 'Phân tách bộ nhớ lưu cây Θ(N) và bộ nhớ phụ: Search O(h + 1), Insert/Delete O(h + M + 1) kèm mô phỏng chuyển động con trỏ, ngăn xếp và vùng tạm tái sử dụng.',
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
        <header class="s21-canva-head s21-head-split">
          <h1 class="s21-canva-title">Độ phức tạp <span>không gian</span></h1>
          <div class="s21-mem-meter" data-role="mem-meter">
            <span class="mm-seg mm-tree" data-seg="1">Lưu cây · Θ(N)</span>
            <span class="mm-seg mm-stack" data-seg="2">Stack · O(h+1)</span>
            <span class="mm-seg mm-buf" data-seg="3">Vùng tạm · O(M)</span>
          </div>
        </header>

        <div class="s21-canva-grid">
          <div class="s21-panel" data-zone="tree">
            <div class="s21-panel__head"><span>1. Bộ nhớ lưu cây</span><strong>Θ(N)</strong></div>
            <div class="s21-svg-box" data-role="tree-store"></div>
            <div class="s21-block-cap">N khóa, K − 1 tham chiếu con, K ≤ N ⇒ <strong>Θ(N)</strong></div>
          </div>

          <div class="s21-panel" data-zone="stack">
            <div class="s21-panel__head"><span>2. Bộ nhớ phụ khi tìm kiếm đệ quy</span><strong>O(h + 1)</strong></div>
            <div class="s21-svg-box s21-svg-box--tall" data-role="tree-stack"></div>
            <div class="s21-block-cap">Tối đa h + 1 khung gọi, mỗi khung chỉ giữ tham chiếu O(1), không sao chép cây con.</div>
          </div>

          <div class="s21-panel" data-zone="temp">
            <div class="s21-panel__head"><span>3. Bộ nhớ phụ khi chèn và xóa</span><strong>O(h + M + 1)</strong></div>
            <div class="s21-svg-box" data-role="tree-temp"></div>
          </div>

          <div class="s21-summary-card" data-role="summary-card">
            <div class="s21-sum-head">TỔNG KẾT ĐỘ PHỨC TẠP KHÔNG GIAN</div>
            <div class="s21-sum-rows">
              <div class="s21-sum-row" data-sum="1">
                <span class="s21-sum-badge">Θ(N)</span>
                <div><strong>Lưu cây:</strong> N khóa lưu 1 lần; K node cần K − 1 tham chiếu con và O(K) quản lý (vì K ≤ N).</div>
              </div>
              <div class="s21-sum-row" data-sum="2">
                <span class="s21-sum-badge">O(h + 1)</span>
                <div><strong>Tìm kiếm đệ quy:</strong> Mỗi mức đi xuống 1 nút con → tối đa h + 1 khung gọi O(1) trên Call Stack.</div>
              </div>
              <div class="s21-sum-row" data-sum="3">
                <span class="s21-sum-badge s21-sum-badge--gold">O(h + M + 1)</span>
                <div><strong>Chèn &amp; Xóa:</strong> Ngăn xếp O(h + 1) cộng vùng tạm O(M) khi tách/ghép, giải phóng và tái sử dụng sau từng mức.</div>
              </div>
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
    const segs = ctx.slideEl.querySelectorAll<HTMLElement>('[data-seg]');
    const rm = ctx.getReducedMotion();
    const canAnim = !rm && prev !== null;
    const prevStep = prev ?? 99;

    tStore.innerHTML = buildS21StoreSvg(step >= 1, canAnim && step >= 1 && prevStep < 1);
    tStack.innerHTML = buildS21SearchStackSvg(step >= 2, canAnim && step >= 2 && prevStep < 2);
    tTemp.innerHTML = buildS21TempBufSvg(step >= 3, canAnim && step >= 3 && prevStep < 3);

    zTree.classList.toggle('is-dim-block', step === 0);
    zStack.classList.toggle('is-dim-block', step < 2);
    zTemp.classList.toggle('is-dim-block', step < 3);

    lines.forEach((p) => {
      const n = Number(p.dataset.sum);
      p.classList.toggle('is-dim-line', step < n);
      p.classList.toggle('is-hl-line', step === n);
    });

    segs.forEach((s) => {
      const n = Number(s.dataset.seg);
      s.classList.toggle('is-on', step >= n);
      s.classList.toggle('is-cur', step === n);
    });
  },
};

export const PART4_SLIDES: SlideDef[] = [slide17, slide18, slide19, slide20, slide21];
