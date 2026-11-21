import type { SlideDef, TreeSceneSpec } from '../types';
import { renderTreeScene, cancelTreeAnimations } from '../svg/treeRenderer';
import { xfsBlockRowHtml } from '../svg/illustrations';

const XFS_REFS = [
  { label: 'Linux Kernel · XFS Filesystem Structure (PDF)', url: 'https://www.kernel.org/pub/linux/utils/fs/xfs/docs/xfs_filesystem_structure.pdf' },
  { label: 'Oracle Linux Blog · Extent Allocation in XFS', url: 'https://blogs.oracle.com/linux/extent-allocation-in-xfs' },
];

// ============================================================================
// SLIDE 22 — B+ tree và truy vấn khoảng [22, 66]
// ============================================================================
const BPLUS_RECORDS: Record<number, { name: string; leafId: string }> = {
  11: { name: 'Bảo', leafId: 'bp-l0' },
  22: { name: 'An', leafId: 'bp-l1' },
  33: { name: 'Chi', leafId: 'bp-l2' },
  44: { name: 'Lan', leafId: 'bp-l2' },
  55: { name: 'Duy', leafId: 'bp-l3' },
  66: { name: 'Hà', leafId: 'bp-l4' },
  77: { name: 'Mai', leafId: 'bp-l5' },
};

const slide22: SlideDef = {
  number: 23,
  title: 'B+ tree và truy vấn khoảng [22, 66]',
  chapter: '5. Các biến thể và ứng dụng',
  chapterStart: 23,
  theme: 'white',
  stepCount: 3,
  leadIn: '“Đường dọc đưa mình đến điểm bắt đầu. Từ đó, mình còn cần gốc bao nhiêu lần để đọc hết khoảng này?”',
  fullScript:
    'Trong thực tế, B-tree thường được nâng cấp thành hai biến thể mạnh mẽ hơn, đầu tiên là B+ Tree. B+ Tree đẩy toàn bộ dữ liệu bản ghi xuống nằm ở các nút lá và nối các lá thành danh sách liên kết tuần tự; còn các nút trong chỉ lưu khóa phân cách để dẫn đường. Với truy vấn khoảng đóng [22, 66]: ta đi từ gốc [55] qua nút trong [22 | 33] xuống lá chứa 22 đúng một lần (gặp 22 ở nút trong vẫn phải đi tiếp xuống lá để lấy bản ghi), rồi trượt ngang theo liên kết lá lấy 22–An, 33–Chi, 44–Lan, 55–Duy, 66–Hà và dừng trước 77–Mai mà không cần quay ngược lên gốc. Rất lý tưởng cho lọc khoảng giá và tra cứu theo thời gian.',
  fullView: {
    summary: 'Cấu trúc B+ Tree (nút trong dẫn đường, lá giữ bản ghi và nối liên kết ngang) và minh họa truy vấn khoảng [22, 66].',
    sections: [
      {
        heading: 'Hai đặc điểm cốt lõi của B+ Tree',
        bodyHtml:
          '<ul>' +
          '<li><strong>Truy xuất bản ghi:</strong> Đi từ gốc xuống lá theo khóa phân cách; khóa ở nút trong chỉ dẫn đường, chưa phải bản ghi cần lấy.</li>' +
          '<li><strong>Duyệt theo khoảng:</strong> Tìm lá chứa khóa đầu tiên (22), rồi đi theo liên kết ngang giữa các lá qua biên cây con đến hết khoảng (66) mà không phải quay lại gốc.</li>' +
          '</ul>',
      },
      {
        heading: 'Dữ liệu mẫu tại lá',
        bodyHtml: '<p><code>11–Bảo · 22–An · 33–Chi · 44–Lan · 55–Duy · 66–Hà · 77–Mai</code>. Một số khóa (22, 33, 55, 66, 77) xuất hiện ở cả nút trong và lá.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <div class="slide-chapter-head">5. Các biến thể và ứng dụng</div>
          <h1 class="slide-title slide-title--sub"><span>B+</span> Tree</h1>
          <p class="slide-lead">Dữ liệu ở lá. Node trong giữ khóa phân cách để dẫn đường.</p>
        </header>

        <div class="s22-grid">
          <div class="s22-left">
            <div class="s22-tree" data-role="tree"></div>
            <div class="s22-result-strip" data-role="results">
              <span class="res-label">Kết quả khoảng [22, 66]:</span>
              ${[22, 33, 44, 55, 66]
                .map(
                  (k) =>
                    `<button type="button" class="rec-pill" data-rec-key="${k}"><strong>${k}</strong> – ${BPLUS_RECORDS[k].name}</button>`,
                )
                .join('')}
            </div>
          </div>

          <aside class="s22-right">
            <div class="canva-card">
              <h3>Truy xuất bản ghi</h3>
              <p>Đi từ gốc xuống lá theo khóa phân cách. Khóa ở nút trong <strong>chỉ dẫn đường</strong>, chưa phải bản ghi.</p>
            </div>
            <div class="canva-card">
              <h3>Duyệt theo khoảng</h3>
              <p>Tìm lá đầu tiên rồi đi theo <strong>liên kết ngang giữa các lá</strong>; đi qua biên hai cây con mà không quay về gốc.</p>
            </div>
            <div class="s22-compare-box" data-role="s22-cmp">
              <div class="s22-cmp-row"><span>B-tree gốc</span><strong class="cmp-bad">Quay lên cha 5 lần</strong></div>
              <div class="s22-cmp-row"><span>B+ Tree</span><strong class="cmp-ok">1 xuống + 3 ngang</strong></div>
            </div>
            <div class="s22-legend">
              <span class="lg-chip lg-guide">■ Khóa dẫn đường</span>
              <span class="lg-chip lg-rec">■ Bản ghi ở lá</span>
            </div>
          </aside>
        </div>

        <div class="s22-footer">
          Phù hợp với <strong>lọc khoảng giá</strong> và <strong>tra cứu theo thời gian</strong>. Một số khóa xuất hiện ở cả nút trong và lá (nhấn vào bản ghi kết quả để rọi lá tương ứng).
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-rec-key]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = Number(btn.dataset.recKey);
        ctx.slideEl.querySelectorAll('.rec-pill').forEach((p) => p.classList.toggle('is-selected', p === btn));
        renderSlide22Tree(ctx.slideEl, 3, key, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const resStrip = ctx.slideEl.querySelector<HTMLElement>('[data-role="results"]')!;
    const cmpBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="s22-cmp"]')!;
    resStrip.classList.toggle('is-revealed', step >= 2);
    cmpBox.classList.toggle('is-lit', step >= 2);
    ctx.slideEl.querySelectorAll<HTMLElement>('.rec-pill').forEach((p) => p.classList.remove('is-selected'));
    renderSlide22Tree(ctx.slideEl, step, null, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderSlide22Tree(slideEl: HTMLElement, step: number, focusKey: number | null, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const inRange = (k: number) => step >= 2 && k >= 22 && k <= 66;
  const leafTone = (k: number) => {
    if (focusKey === k) return 'active';
    if (inRange(k)) return 'success';
    if (step === 1 && k === 22) return 'active';
    if (step === 3 && k === 77) return 'error';
    return 'record';
  };

  const scene: TreeSceneSpec = {
    viewBox: [0, 0, 820, 325],
    nodes: [
      {
        id: 'bp-r',
        x: 410,
        y: 44,
        cellW: 58,
        cellH: 38,
        state: step === 1 ? 'active' : 'normal',
        keys: [{ id: 'g55', label: '55', tone: 'guide' }],
      },
      {
        id: 'bp-i0',
        x: 225,
        y: 136,
        cellW: 54,
        cellH: 38,
        state: step === 1 ? 'active' : 'normal',
        tag: step === 1 ? 'Gặp 22 ở nút trong → đi tiếp tới bản ghi!' : undefined,
        tagPos: 'left',
        tagTone: 'cobalt',
        keys: [
          { id: 'g22', label: '22', tone: step === 1 ? 'active' : 'guide' },
          { id: 'g33', label: '33', tone: 'guide' },
        ],
      },
      {
        id: 'bp-i1',
        x: 615,
        y: 136,
        cellW: 54,
        cellH: 38,
        keys: [
          { id: 'g66', label: '66', tone: 'guide' },
          { id: 'g77', label: '77', tone: 'guide' },
        ],
      },
      {
        id: 'bp-l0',
        x: 66,
        y: 248,
        cellW: 66,
        cellH: 48,
        state: step >= 2 ? 'muted' : 'normal',
        keys: [{ id: 'r11', label: '11', sublabel: 'Bảo', tone: step >= 2 ? 'muted' : 'record' }],
      },
      {
        id: 'bp-l1',
        x: 184,
        y: 248,
        cellW: 66,
        cellH: 48,
        state: focusKey === 22 ? 'active' : step >= 1 ? 'success' : 'normal',
        keys: [{ id: 'r22', label: '22', sublabel: 'An', tone: leafTone(22) }],
      },
      {
        id: 'bp-l2',
        x: 344,
        y: 248,
        cellW: 66,
        cellH: 48,
        state: focusKey === 33 || focusKey === 44 ? 'active' : step >= 2 ? 'success' : 'normal',
        tag: step === 2 ? '33 → 44 cùng lá' : undefined,
        tagPos: 'bottom',
        tagTone: 'success',
        keys: [
          { id: 'r33', label: '33', sublabel: 'Chi', tone: leafTone(33) },
          { id: 'r44', label: '44', sublabel: 'Lan', tone: leafTone(44) },
        ],
      },
      {
        id: 'bp-l3',
        x: 500,
        y: 248,
        cellW: 66,
        cellH: 48,
        state: focusKey === 55 ? 'active' : step >= 2 ? 'success' : 'normal',
        tag: step >= 2 ? 'Qua biên cây con!' : undefined,
        tagPos: 'bottom',
        tagTone: 'cobalt',
        keys: [{ id: 'r55', label: '55', sublabel: 'Duy', tone: leafTone(55) }],
      },
      {
        id: 'bp-l4',
        x: 622,
        y: 248,
        cellW: 66,
        cellH: 48,
        state: focusKey === 66 ? 'active' : step >= 2 ? 'success' : 'normal',
        keys: [{ id: 'r66', label: '66', sublabel: 'Hà', tone: leafTone(66) }],
      },
      {
        id: 'bp-l5',
        x: 744,
        y: 248,
        cellW: 66,
        cellH: 48,
        state: step === 3 ? 'underflow' : 'normal',
        tag: step === 3 ? 'Dừng (< 77)' : undefined,
        tagPos: 'bottom',
        tagTone: 'error',
        keys: [{ id: 'r77', label: '77', sublabel: 'Mai', tone: leafTone(77) }],
      },
    ],
    edges: [
      { id: 'bpe0', fromNode: 'bp-r', portIndex: 0, toNode: 'bp-i0', state: step >= 1 ? 'active' : 'normal', arrow: step >= 1 },
      { id: 'bpe1', fromNode: 'bp-r', portIndex: 1, toNode: 'bp-i1', state: step >= 1 ? 'muted' : 'normal' },
      { id: 'bpe2', fromNode: 'bp-i0', portIndex: 0, toNode: 'bp-l0', state: step >= 1 ? 'muted' : 'normal' },
      { id: 'bpe3', fromNode: 'bp-i0', portIndex: 1, toNode: 'bp-l1', state: step >= 1 ? 'active' : 'normal', arrow: step >= 1 },
      { id: 'bpe4', fromNode: 'bp-i0', portIndex: 2, toNode: 'bp-l2' },
      { id: 'bpe5', fromNode: 'bp-i1', portIndex: 0, toNode: 'bp-l3' },
      { id: 'bpe6', fromNode: 'bp-i1', portIndex: 1, toNode: 'bp-l4' },
      { id: 'bpe7', fromNode: 'bp-i1', portIndex: 2, toNode: 'bp-l5' },
    ],
    leafLinks: [
      { id: 'll0', fromNode: 'bp-l0', toNode: 'bp-l1', active: false },
      { id: 'll1', fromNode: 'bp-l1', toNode: 'bp-l2', active: step >= 2 },
      { id: 'll2', fromNode: 'bp-l2', toNode: 'bp-l3', active: step >= 2 },
      { id: 'll3', fromNode: 'bp-l3', toNode: 'bp-l4', active: step >= 2 },
      { id: 'll4', fromNode: 'bp-l4', toNode: 'bp-l5', active: false },
    ],
  };

  renderTreeScene(treeBox, scene, { reducedMotion });
}

// ============================================================================
// SLIDE 23 — Vì sao 25 xuất hiện hai lần? (B+ Copy-up)
// ============================================================================
const slide23: SlideDef = {
  number: 24,
  title: 'Vì sao 25 xuất hiện hai lần?',
  chapter: '5. Các biến thể và ứng dụng',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Hãy theo dõi thẻ dữ liệu trong lúc tách. Khóa xuất hiện hai lần, nhưng có bao nhiêu bản ghi 25?”',
  fullScript:
    'Slide này giải thích cơ chế copy-up khi tách lá của B+ Tree. Với ví dụ M = 4 (tối đa 4 con/nút trong, sức chứa 3 mục/lá): gốc [40], hai lá [10 | 20 | 30] → [40 | 50 | 60]. Khi chèn thêm 25 kèm thẻ bản ghi vào lá trái, lá tràn thành [10 | 20 | 25 | 30]. Ta tách lá thành [10 | 20] và [25 | 30], nối lại liên kết ngang ba lá — thẻ bản ghi 25 đi cùng 25 sang lá mới. Khác với B-tree đẩy hẳn khóa lên cha, ở B+ Tree ta chỉ sao chép (copy-up) giá trị khóa 25 lên nút cha [25 | 40] để dẫn đường, còn bản ghi 25 duy nhất vẫn giữ nguyên ở lá.',
  fullView: {
    summary: 'Giải thích cơ chế Copy-up khi tách lá trên B+ Tree (chèn 25 vào cây M = 4, sức chứa lá = 3).',
    sections: [
      {
        heading: 'Phân biệt hai lần xuất hiện của khóa 25',
        bodyHtml:
          '<ul>' +
          '<li><strong>25 ở nút cha <code>[25 | 40]</code>:</strong> chỉ là bản sao giá trị khóa để dẫn đường sang nhánh giữa.</li>' +
          '<li><strong>25 ở nút lá <code>[25 | 30]</code>:</strong> gắn với <strong>bản ghi 25 duy nhất</strong>.</li>' +
          '</ul>' +
          '<p><em>Lưu ý:</em> Tách lá dùng <strong>copy-up</strong>; đừng nhầm với đẩy hẳn khóa giữa (push-up) khi tách nút trong.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><em class="hl-cobalt">B+ Tree:</em> <span>vì sao khóa 25</span> xuất hiện hai lần?</h1>
          <p class="slide-lead">Tách lá: sao chép khóa phân cách lên cha, bản ghi vẫn được giữ ở lá.</p>
        </header>

        <div class="s23-grid">
          <div class="s23-stage" data-role="tree"></div>
          <aside class="s23-side">
            <div class="canva-card s23-role-box" data-role="role-box">
              <h3>Kiểm tra hai ô <code>25</code></h3>
              <p>Ở nhịp cuối, <strong>nhấn trực tiếp vào ô 25 ở cha hoặc 25 ở lá</strong> để xem chức năng riêng của từng ô.</p>
              <div class="role-badge-out" data-role="role-out">Số bản ghi 25 trong toàn cây: <strong>đúng 1 bản ghi</strong></div>
            </div>
            <div class="canva-card">
              <h3>Tóm tắt TRƯỚC → SAU</h3>
              <ul class="compact-list">
                <li><strong>TRƯỚC:</strong> lá trái đầy <code>[10, 20, 30]</code> (3/3).</li>
                <li>Thêm <code>25</code> → tràn <code>[10, 20, 25, 30]</code>.</li>
                <li><strong>SAU:</strong> tách <code>[10, 20] → [25, 30] → [40, 50, 60]</code>; sao chép khóa <code>25</code> lên cha <code>[25 | 40]</code>.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    `;

    ctx.slideEl.addEventListener('click', (ev) => {
      const target = (ev.target as HTMLElement).closest<HTMLElement>('[data-role25]');
      if (!target) return;
      ev.stopPropagation();
      const out = ctx.slideEl.querySelector<HTMLElement>('[data-role="role-out"]')!;
      if (target.dataset.role25 === 'guide') {
        out.innerHTML = '<strong>25 ở nút cha:</strong> Khóa dẫn đường (chỉ điều hướng sang nhánh <code>≥ 25</code>). Không chứa bản ghi!';
      } else {
        out.innerHTML = '<strong>25 ở nút lá:</strong> Gắn trực tiếp với <strong>bản ghi 25 duy nhất</strong> trong toàn cây!';
      }
    });
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 740, 315],
            nodes: [
              {
                id: 'cu-in25',
                x: 234,
                y: 80,
                cellW: 62,
                cellH: 46,
                state: 'active',
                tag: 'Chèn 25 + bản ghi',
                tagPos: 'left',
                tagTone: 'warn',
                keys: [{ id: 'cu-25-leaf', label: '25', sublabel: 'bản ghi', tone: 'active' }],
              },
              { id: 'cu-r', x: 430, y: 58, cellW: 62, cellH: 42, keys: [{ id: 'cu-40g', label: '40', tone: 'guide' }] },
              {
                id: 'cu-l0',
                x: 205,
                y: 214,
                cellW: 58,
                cellH: 46,
                tag: 'TRƯỚC: lá trái đã đầy (3/3)',
                tagPos: 'bottom',
                tagTone: 'warn',
                keys: [
                  { id: 'cu-10', label: '10', tone: 'record' },
                  { id: 'cu-20', label: '20', tone: 'record' },
                  { id: 'cu-30', label: '30', tone: 'record' },
                ],
              },
              {
                id: 'cu-l2',
                x: 545,
                y: 214,
                cellW: 58,
                cellH: 46,
                recordNote: 'bản ghi 40, 50, 60',
                keys: [
                  { id: 'cu-40l', label: '40', tone: 'record' },
                  { id: 'cu-50', label: '50', tone: 'record' },
                  { id: 'cu-60', label: '60', tone: 'record' },
                ],
              },
            ],
            edges: [
              { id: 'cue0', fromNode: 'cu-r', portIndex: 0, toNode: 'cu-l0' },
              { id: 'cue1', fromNode: 'cu-r', portIndex: 1, toNode: 'cu-l2' },
            ],
            leafLinks: [{ id: 'cull0', fromNode: 'cu-l0', toNode: 'cu-l2', active: false }],
            transfers: [
              { id: 'tr-cu-in25', fromX: 234, fromY: 106, toX: 234, toY: 182, ctrlX: 234, ctrlY: 144, label: 'vào 20 | 30', tone: 'warn' },
            ],
            overlaySvg: `
              <line x1="234" y1="191" x2="234" y2="237" stroke="#D97706" stroke-width="3.2" stroke-dasharray="5 3" />
              <circle cx="234" cy="191" r="4" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.4" />
            `,
          }
        : step === 1
          ? {
              viewBox: [0, 0, 740, 315],
              nodes: [
                { id: 'cu-r', x: 370, y: 58, cellW: 62, cellH: 42, keys: [{ id: 'cu-40g', label: '40', tone: 'guide' }] },
                {
                  id: 'cu-l0',
                  x: 215,
                  y: 204,
                  cellW: 58,
                  cellH: 48,
                  state: 'overflow',
                  tag: 'Lá tràn: 4 > 3 mục!',
                  tagTone: 'error',
                  recordNote: 'bản ghi 10, 20, 25, 30',
                  keys: [
                    { id: 'cu-10', label: '10', tone: 'record' },
                    { id: 'cu-20', label: '20', tone: 'record' },
                    { id: 'cu-25-leaf', label: '25', sublabel: 'bản ghi', tone: 'active' },
                    { id: 'cu-30', label: '30', tone: 'record' },
                  ],
                },
                {
                  id: 'cu-l2',
                  x: 565,
                  y: 204,
                  cellW: 56,
                  cellH: 46,
                  recordNote: 'bản ghi 40, 50, 60',
                  keys: [
                    { id: 'cu-40l', label: '40', tone: 'record' },
                    { id: 'cu-50', label: '50', tone: 'record' },
                    { id: 'cu-60', label: '60', tone: 'record' },
                  ],
                },
              ],
              edges: [
                { id: 'cue0', fromNode: 'cu-r', portIndex: 0, toNode: 'cu-l0', state: 'error' },
                { id: 'cue1', fromNode: 'cu-r', portIndex: 1, toNode: 'cu-l2' },
              ],
              leafLinks: [{ id: 'cull0', fromNode: 'cu-l0', toNode: 'cu-l2', active: false }],
            }
          : step === 2
            ? {
                viewBox: [0, 0, 740, 315],
                nodes: [
                  { id: 'cu-r', x: 370, y: 58, cellW: 62, cellH: 42, keys: [{ id: 'cu-40g', label: '40', tone: 'guide' }] },
                  {
                    id: 'cu-l0',
                    x: 130,
                    y: 208,
                    cellW: 56,
                    cellH: 48,
                    recordNote: 'bản ghi 10, 20',
                    keys: [
                      { id: 'cu-10', label: '10', tone: 'record' },
                      { id: 'cu-20', label: '20', tone: 'record' },
                    ],
                  },
                  {
                    id: 'cu-l1',
                    x: 345,
                    y: 208,
                    cellW: 62,
                    cellH: 48,
                    state: 'active',
                    tag: 'Bản ghi 25 ở nguyên lá mới',
                    tagTone: 'success',
                    recordNote: 'bản ghi 25, 30',
                    keys: [
                      { id: 'cu-25-leaf', label: '25', sublabel: 'bản ghi', tone: 'success' },
                      { id: 'cu-30', label: '30', tone: 'record' },
                    ],
                  },
                  {
                    id: 'cu-l2',
                    x: 585,
                    y: 208,
                    cellW: 56,
                    cellH: 46,
                    recordNote: 'bản ghi 40, 50, 60',
                    keys: [
                      { id: 'cu-40l', label: '40', tone: 'record' },
                      { id: 'cu-50', label: '50', tone: 'record' },
                      { id: 'cu-60', label: '60', tone: 'record' },
                    ],
                  },
                ],
                edges: [
                  { id: 'cue0', fromNode: 'cu-r', portIndex: 0, toNode: 'cu-l0' },
                  { id: 'cue1', fromNode: 'cu-r', portIndex: 1, toNode: 'cu-l2' },
                ],
                leafLinks: [
                  { id: 'cull0', fromNode: 'cu-l0', toNode: 'cu-l1', active: true },
                  { id: 'cull1', fromNode: 'cu-l1', toNode: 'cu-l2', active: true },
                ],
                transfers: [
                  { id: 'tr-cu', fromX: 315, fromY: 178, toX: 340, toY: 82, ctrlX: 290, ctrlY: 122, label: 'Copy-up 25 ↑', tone: 'cobalt' },
                ],
              }
            : {
                viewBox: [0, 0, 740, 315],
                nodes: [
                  {
                    id: 'cu-r',
                    x: 370,
                    y: 58,
                    cellW: 68,
                    cellH: 46,
                    state: 'success',
                    tag: 'SAU: 25 ở cha chỉ dẫn đường (nhấn để kiểm tra)',
                    tagTone: 'cobalt',
                    keys: [
                      { id: 'cu-25-guide', label: '25', sublabel: 'dẫn đường', tone: 'guide', clickable: true, dataAttr: 'data-role25="guide"' },
                      { id: 'cu-40g', label: '40', sublabel: 'dẫn đường', tone: 'guide' },
                    ],
                  },
                  {
                    id: 'cu-l0',
                    x: 128,
                    y: 210,
                    cellW: 56,
                    cellH: 48,
                    recordNote: 'bản ghi 10, 20',
                    keys: [
                      { id: 'cu-10', label: '10', tone: 'record' },
                      { id: 'cu-20', label: '20', tone: 'record' },
                    ],
                  },
                  {
                    id: 'cu-l1',
                    x: 345,
                    y: 210,
                    cellW: 64,
                    cellH: 48,
                    state: 'success',
                    recordNote: 'bản ghi 25, 30',
                    keys: [
                      { id: 'cu-25-leaf', label: '25', sublabel: 'bản ghi', tone: 'success', clickable: true, dataAttr: 'data-role25="leaf"' },
                      { id: 'cu-30', label: '30', tone: 'record' },
                    ],
                  },
                  {
                    id: 'cu-l2',
                    x: 585,
                    y: 210,
                    cellW: 56,
                    cellH: 48,
                    recordNote: 'bản ghi 40, 50, 60',
                    keys: [
                      { id: 'cu-40l', label: '40', tone: 'record' },
                      { id: 'cu-50', label: '50', tone: 'record' },
                      { id: 'cu-60', label: '60', tone: 'record' },
                    ],
                  },
                ],
                edges: [
                  { id: 'cue0', fromNode: 'cu-r', portIndex: 0, toNode: 'cu-l0' },
                  { id: 'cue-mid', fromNode: 'cu-r', portIndex: 1, toNode: 'cu-l1', state: 'active', arrow: true },
                  { id: 'cue1', fromNode: 'cu-r', portIndex: 2, toNode: 'cu-l2' },
                ],
                leafLinks: [
                  { id: 'cull0', fromNode: 'cu-l0', toNode: 'cu-l1', active: true },
                  { id: 'cull1', fromNode: 'cu-l1', toNode: 'cu-l2', active: true },
                ],
                baselineY: { y: 274, x1: 50, x2: 690, label: 'Các lá vẫn cùng độ sâu · Chỉ có 1 bản ghi 25' },
              };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion(), durationMs: 520 });
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 24 — B* tree phân phối lại trước khi tách
// ============================================================================
const slide24: SlideDef = {
  number: 25,
  title: 'B* tree phân phối lại trước khi tách',
  chapter: '5. Các biến thể và ứng dụng',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Trước khi xin thêm một trang, hãy nhìn hai ô bên phải. Ta dùng được chỗ đó nếu đổi khóa nào ở cha?”',
  fullScript:
    'Biến thể cải tiến thứ hai là B* Tree, tập trung nâng mức lấp đầy tối thiểu từ khoảng 1/2 lên khoảng 2/3 (tùy quy ước làm tròn và ngoại lệ ở gốc) để tiết kiệm trang đĩa. Khi một nút bị tràn, thay vì tách ngay, B* Tree kiểm tra anh em liền kề cùng cha: với M = 7 (6 ô/nút), nút trái [10|20|30|40|50|60] đầy 6 khóa, nút phải [80|90|100|110] còn 2 ô trống. Chèn 35 làm trái tràn → ta phân phối lại qua cha [70]: đẩy 60 lên cha, kéo 70 xuống đầu nút phải. Kết quả [10|20|30|35|40|50] ← [60] → [70|80|90|100|110] mà chưa cần tạo thêm nút mới.',
  fullView: {
    summary: 'Cơ chế phân phối lại qua nút cha của B* Tree (M = 7, 6 khóa/nút) khi chèn 35 mà anh em phải còn 2 ô trống.',
    sections: [
      {
        heading: 'Nguyên tắc phân phối lại',
        bodyHtml:
          '<ul>' +
          '<li>Khi nút tràn mà anh em liền kề cùng cha còn chỗ → chuyển khóa biên lên cha và hạ khóa phân cách xuống anh em.</li>' +
          '<li>Mức lấp đầy tối thiểu khoảng <strong>2/3</strong> (có làm tròn và ngoại lệ ở gốc).</li>' +
          '<li>Ví dụ chèn <code>35</code>: đưa <code>60 ↑</code> cha, <code>70 ↓</code> nút phải → số nút giữ nguyên là 3 (không phải cấp thêm trang mới).</li>' +
          '</ul>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>B* Tree:</span> phân phối lại trước khi tách</h1>
          <p class="slide-lead">B* Tree tăng mức lấp đầy node bằng cách tận dụng chỗ trống ở anh em.</p>
        </header>

        <div class="s24-grid">
          <aside class="s24-left">
            <div class="canva-card">
              <h3>Khi nút bị tràn</h3>
              <ul class="compact-list">
                <li>Nếu <strong>anh em liền kề cùng cha còn chỗ</strong>, phân phối lại khóa qua nút cha.</li>
                <li>Khóa phân cách ở cha thay đổi để giữ đúng các khoảng tìm kiếm.</li>
                <li>Mức lấp đầy tối thiểu khoảng <strong>2/3</strong> (tùy làm tròn &amp; ngoại lệ ở gốc).</li>
              </ul>
            </div>
            <div class="canva-card s24-stat" data-role="stat">
              <strong>Ví dụ chèn 35:</strong> Nút trái 6/6 khóa, nút phải 4/6 (còn 2 ô trống).
            </div>
            <div class="s24-meters" data-role="s24-meters">
              <div class="s24-meter">
                <div class="s24-meter__head"><span>Nút trái</span><strong data-role="m-left">6 / 6 (100%)</strong></div>
                <div class="s24-meter__track"><div class="s24-meter__fill" data-role="f-left" style="width:100%"></div></div>
              </div>
              <div class="s24-meter">
                <div class="s24-meter__head"><span>Nút phải</span><strong data-role="m-right">4 / 6 (66.7%)</strong></div>
                <div class="s24-meter__track"><div class="s24-meter__fill is-ok" data-role="f-right" style="width:66.7%"></div></div>
              </div>
              <div class="s24-page-pill" data-role="m-pages">Số trang đĩa: <strong>3 trang (không cấp thêm)</strong></div>
            </div>
          </aside>

          <div class="s24-right">
            <div class="s24-tree" data-role="tree"></div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const stat = ctx.slideEl.querySelector<HTMLElement>('[data-role="stat"]')!;

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 780, 340],
            nodes: [
              {
                id: 'bs-in35',
                x: 190,
                y: 74,
                cellW: 58,
                cellH: 42,
                state: 'active',
                tag: 'Chèn 35 (30 < 35 < 40)',
                tagPos: 'top',
                tagTone: 'warn',
                keys: [{ id: 'bs-35', label: '35', tone: 'active' }],
              },
              { id: 'bs-p', x: 390, y: 66, cellW: 64, cellH: 44, tag: 'Cha [70]', keys: [{ id: 'bs-70', label: '70' }] },
              {
                id: 'bs-l',
                x: 190,
                y: 222,
                capacity: 6,
                cellW: 52,
                cellH: 44,
                tag: 'Trái: 6 / 6 (Đầy)',
                tagPos: 'bottom',
                tagTone: 'warn',
                keys: [10, 20, 30, 40, 50, 60].map((v) => ({ id: `bs-${v}`, label: String(v) })),
              },
              {
                id: 'bs-r',
                x: 590,
                y: 222,
                capacity: 6,
                cellW: 52,
                cellH: 44,
                tag: 'Phải: 4 / 6 (Còn 2 ô trống!)',
                tagPos: 'bottom',
                tagTone: 'success',
                keys: [80, 90, 100, 110].map((v) => ({ id: `bs-${v}`, label: String(v) })),
              },
            ],
            edges: [
              { id: 'bse0', fromNode: 'bs-p', portIndex: 0, toNode: 'bs-l' },
              { id: 'bse1', fromNode: 'bs-p', portIndex: 1, toNode: 'bs-r' },
            ],
            transfers: [
              { id: 'tr-bs-in35', fromX: 190, fromY: 98, toX: 190, toY: 190, ctrlX: 190, ctrlY: 144, label: 'vào 30 | 40', tone: 'warn' },
            ],
            overlaySvg: `
              <line x1="190" y1="200" x2="190" y2="244" stroke="#D97706" stroke-width="3.2" stroke-dasharray="5 3" />
              <circle cx="190" cy="200" r="4" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.4" />
            `,
          }
        : step === 1
          ? {
              viewBox: [0, 0, 780, 340],
              nodes: [
                { id: 'bs-p', x: 390, y: 66, cellW: 64, cellH: 44, keys: [{ id: 'bs-70', label: '70', tone: 'active' }] },
                {
                  id: 'bs-l',
                  x: 196,
                  y: 222,
                  cellW: 48,
                  cellH: 44,
                  state: 'overflow',
                  tag: 'Tràn tạm: 7 > 6 khóa',
                  tagPos: 'bottom',
                  tagTone: 'error',
                  keys: [
                    { id: 'bs-10', label: '10' },
                    { id: 'bs-20', label: '20' },
                    { id: 'bs-30', label: '30' },
                    { id: 'bs-35', label: '35', tone: 'active' },
                    { id: 'bs-40', label: '40' },
                    { id: 'bs-50', label: '50' },
                    { id: 'bs-60', label: '60', tone: 'error', badge: '↑' },
                  ],
                },
                {
                  id: 'bs-r',
                  x: 590,
                  y: 222,
                  capacity: 6,
                  cellW: 52,
                  cellH: 44,
                  state: 'highlight-box',
                  tag: 'Anh em phải còn 2 ô trống',
                  tagPos: 'bottom',
                  tagTone: 'success',
                  keys: [80, 90, 100, 110].map((v) => ({ id: `bs-${v}`, label: String(v) })),
                },
              ],
              edges: [
                { id: 'bse0', fromNode: 'bs-p', portIndex: 0, toNode: 'bs-l', state: 'error' },
                { id: 'bse1', fromNode: 'bs-p', portIndex: 1, toNode: 'bs-r', state: 'active' },
              ],
            }
          : step === 2
            ? {
                viewBox: [0, 0, 780, 340],
                nodes: [
                  { id: 'bs-p', x: 390, y: 66, cellW: 64, cellH: 44, state: 'active', tag: 'Đổi phân cách 70 → 60', tagTone: 'cobalt', keys: [{ id: 'bs-70', label: '70', tone: 'active' }] },
                  {
                    id: 'bs-l',
                    x: 196,
                    y: 222,
                    cellW: 48,
                    cellH: 44,
                    state: 'overflow',
                    keys: [
                      { id: 'bs-10', label: '10' },
                      { id: 'bs-20', label: '20' },
                      { id: 'bs-30', label: '30' },
                      { id: 'bs-35', label: '35', tone: 'active' },
                      { id: 'bs-40', label: '40' },
                      { id: 'bs-50', label: '50' },
                      { id: 'bs-60', label: '60', tone: 'active' },
                    ],
                  },
                  {
                    id: 'bs-r',
                    x: 590,
                    y: 222,
                    capacity: 6,
                    cellW: 52,
                    cellH: 44,
                    state: 'active',
                    keys: [80, 90, 100, 110].map((v) => ({ id: `bs-${v}`, label: String(v) })),
                  },
                ],
                edges: [
                  { id: 'bse0', fromNode: 'bs-p', portIndex: 0, toNode: 'bs-l' },
                  { id: 'bse1', fromNode: 'bs-p', portIndex: 1, toNode: 'bs-r' },
                ],
                transfers: [
                  { id: 'tr-60up', fromX: 344, fromY: 194, toX: 368, toY: 94, ctrlX: 320, ctrlY: 132, label: '60 ↑ cha', tone: 'success' },
                  { id: 'tr-70dn', fromX: 416, fromY: 88, toX: 454, toY: 194, ctrlX: 486, ctrlY: 122, label: '70 ↓ phải', tone: 'warn' },
                ],
              }
            : {
                viewBox: [0, 0, 780, 340],
                nodes: [
                  { id: 'bs-p', x: 390, y: 66, cellW: 64, cellH: 44, state: 'success', tag: 'Phân cách mới: 60', tagTone: 'success', keys: [{ id: 'bs-60', label: '60', tone: 'success' }] },
                  {
                    id: 'bs-l',
                    x: 190,
                    y: 222,
                    capacity: 6,
                    cellW: 52,
                    cellH: 44,
                    state: 'success',
                    tag: 'Trái: 6 / 6 khóa',
                    tagPos: 'bottom',
                    tagTone: 'success',
                    keys: [
                      { id: 'bs-10', label: '10' },
                      { id: 'bs-20', label: '20' },
                      { id: 'bs-30', label: '30' },
                      { id: 'bs-35', label: '35', tone: 'success' },
                      { id: 'bs-40', label: '40' },
                      { id: 'bs-50', label: '50' },
                    ],
                  },
                  {
                    id: 'bs-r',
                    x: 590,
                    y: 222,
                    capacity: 6,
                    cellW: 52,
                    cellH: 44,
                    state: 'success',
                    tag: 'Phải: 5 / 6 khóa (vẫn 2 nút con!)',
                    tagPos: 'bottom',
                    tagTone: 'success',
                    keys: [
                      { id: 'bs-70', label: '70', tone: 'success' },
                      { id: 'bs-80', label: '80' },
                      { id: 'bs-90', label: '90' },
                      { id: 'bs-100', label: '100' },
                      { id: 'bs-110', label: '110' },
                    ],
                  },
                ],
                edges: [
                  { id: 'bse0', fromNode: 'bs-p', portIndex: 0, toNode: 'bs-l', state: 'active', arrow: true },
                  { id: 'bse1', fromNode: 'bs-p', portIndex: 1, toNode: 'bs-r', state: 'active', arrow: true },
                ],
              };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion(), durationMs: 520 });

    const stats = [
      '<strong>M = 7 (6 ô/nút):</strong> Trái 6/6, Phải 4/6 (còn 2 ô trống). Chuẩn bị chèn <code>35</code>.',
      'Chèn <code>35</code> làm trái tràn (7 &gt; 6). Kiểm tra anh em phải thấy còn <strong>2 ô trống</strong>!',
      'Phân phối đồng bộ qua cha: đưa <strong>60 ↑</strong> thay cho 70 ở cha, kéo <strong>70 ↓</strong> sang đầu nút phải.',
      '<strong>Kết quả:</strong> Số nút giữ nguyên (không cấp trang mới). Trái 6/6, Phải 5/6, mọi khoảng tìm kiếm đều đúng.',
    ];
    stat.innerHTML = stats[step];

    const mLeft = ctx.slideEl.querySelector<HTMLElement>('[data-role="m-left"]');
    const mRight = ctx.slideEl.querySelector<HTMLElement>('[data-role="m-right"]');
    const fLeft = ctx.slideEl.querySelector<HTMLElement>('[data-role="f-left"]');
    const fRight = ctx.slideEl.querySelector<HTMLElement>('[data-role="f-right"]');
    if (mLeft && mRight && fLeft && fRight) {
      const isOver = step === 1 || step === 2;
      const isDone = step === 3;
      mLeft.textContent = isOver ? '7 / 6 (TRÀN!)' : '6 / 6 (100%)';
      fLeft.style.width = '100%';
      fLeft.classList.toggle('is-err', isOver);
      mRight.textContent = isDone ? '5 / 6 (83.3%)' : '4 / 6 (66.7%)';
      fRight.style.width = isDone ? '83.3%' : '66.7%';
    }
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 25 — B* tree tách hai nút thành ba
// ============================================================================
const ALL_14_KEYS = [10, 20, 30, 35, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

const slide25: SlideDef = {
  number: 26,
  title: 'B* tree tách hai nút thành ba',
  chapter: '5. Các biến thể và ứng dụng',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“14 khóa đi đâu hết? Hai khóa ở cha, ba nhóm bốn khóa ở dưới. Cây dùng trang đầy hơn nhưng một lần cập nhật phải xét cả anh em.”',
  fullScript:
    'Nếu cả nút bị tràn lẫn anh em bên cạnh đều đã đầy 6/6 khóa thì B* Tree mới thực hiện tách 2 nút thành 3 nút. Với tình huống thay thế: vẫn chèn 35 và cha [70], nhưng anh em phải nay đã đầy [80, 90, 100, 110, 120, 130]. Cây gom toàn bộ 6 + 6 + 1 (khóa cha 70) + 1 (khóa mới 35) = 14 khóa theo thứ tự tăng dần; đưa hai khóa phân cách 40 và 90 lên nút cha [40 | 90], rồi chia đều 12 khóa còn lại vào 3 nút con: [10|20|30|35], [50|60|70|80], [100|110|120|130]. Mỗi nút mới đạt 4/6 = 2/3 dung lượng — giảm số trang đĩa nhưng tăng chi phí chạm nút anh em khi cập nhật.',
  fullView: {
    summary: 'Phép tách 2 nút thành 3 nút trên B* Tree (M = 7, 14 khóa → 2 khóa cha + 3 × 4 khóa con = 2/3 dung lượng).',
    sections: [
      {
        heading: 'Kiểm đếm đủ 14 khóa',
        bodyHtml:
          '<p><code>10, 20, 30, 35, [40], 50, 60, 70, 80, [90], 100, 110, 120, 130</code></p>' +
          '<ul>' +
          '<li>2 khóa phân cách lên cha: <code>[40 | 90]</code> (nếu cha tràn thì tiếp tục xử lý tầng trên).</li>' +
          '<li>3 nút con mới: <code>[10|20|30|35]</code>, <code>[50|60|70|80]</code>, <code>[100|110|120|130]</code> → mỗi nút <strong>4/6 = 2/3 dung lượng</strong>.</li>' +
          '</ul>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><em class="hl-cobalt">B* Tree:</em> <span>tách 2 node</span> thành 3</h1>
          <p class="slide-lead">Khi cả node tràn và anh em đều hết chỗ, cây phân chia khóa cho 3 node.</p>
        </header>

        <div class="s25-top">
          <div class="s25-tree" data-role="tree"></div>
          <aside class="s25-side">
            <div class="canva-card">
              <h3>Gom 14 khóa → Chia 3 nút</h3>
              <ol class="compact-list">
                <li>Cả hai nút con đều đầy 6/6 → không còn ô trống.</li>
                <li>Gom <strong>6 + 6 + khóa cha 70 + khóa mới 35 = 14 khóa</strong> tăng dần.</li>
                <li>Đưa <strong>40</strong> và <strong>90</strong> lên cha; chia 12 khóa còn lại thành 3 nhóm 4 khóa.</li>
                <li>Nếu cha tràn, tiếp tục xử lý ở tầng trên.</li>
              </ol>
            </div>
            <div class="canva-card s25-ratio" data-role="ratio">
              <div class="ratio-big">4 / 6 = 66.7% <small>(so với 50% ở B-tree)</small></div>
              <p>Nút đầy hơn giúp giảm số trang lưu trữ; đổi lại mỗi lần cập nhật có thể phải chỉnh cả nút anh em.</p>
            </div>
          </aside>
        </div>

        <div class="s25-strip-box" data-role="strip14" hidden>
          <span class="strip14-label">Dải 14 khóa (cắt tại 40 &amp; 90):</span>
          <div class="strip14-cells">
            ${ALL_14_KEYS.map(
              (k, i) => `<span class="s14-cell${k === 40 || k === 90 ? ' is-cut' : k === 35 || k === 70 ? ' is-in' : ''}" style="--ci:${i}">${k}</span>`,
            ).join('')}
          </div>
        </div>

        <div class="s25-bridge" data-role="s25-bridge">
          <span><strong>B-tree:</strong> lấp đầy ≥50%</span>
          <span><strong>B+ Tree:</strong> dữ liệu ở lá + liên kết ngang (mạnh truy vấn khoảng)</span>
          <span><strong>B* Tree:</strong> lấp đầy ≥66.7% (giảm trang đĩa)</span>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const strip14 = ctx.slideEl.querySelector<HTMLElement>('[data-role="strip14"]')!;
    const ratio = ctx.slideEl.querySelector<HTMLElement>('[data-role="ratio"]')!;
    const bridge = ctx.slideEl.querySelector<HTMLElement>('[data-role="s25-bridge"]')!;

    strip14.hidden = step === 0 || step === 3;
    bridge.hidden = !strip14.hidden;
    ratio.classList.toggle('is-active-card', step === 3);

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 820, 310],
            nodes: [
              {
                id: 'x35-in',
                x: 205,
                y: 66,
                cellW: 54,
                cellH: 40,
                state: 'active',
                tag: 'Chèn 35',
                tagPos: 'top',
                tagTone: 'warn',
                keys: [{ id: 'x35', label: '35', tone: 'active' }],
              },
              { id: 'b25p', x: 410, y: 58, cellW: 60, cellH: 42, keys: [{ id: 'x70', label: '70' }] },
              {
                id: 'b25l',
                x: 205,
                y: 205,
                capacity: 6,
                cellW: 52,
                cellH: 42,
                tag: 'Trái đầy: 6 / 6',
                tagPos: 'bottom',
                tagTone: 'error',
                keys: [10, 20, 30, 40, 50, 60].map((v) => ({ id: `x${v}`, label: String(v) })),
              },
              {
                id: 'b25r',
                x: 615,
                y: 205,
                capacity: 6,
                cellW: 52,
                cellH: 42,
                tag: 'Phải cũng đầy: 6 / 6 (thêm 120, 130)',
                tagPos: 'bottom',
                tagTone: 'error',
                keys: [80, 90, 100, 110, 120, 130].map((v) => ({ id: `x${v}`, label: String(v), tone: v >= 120 ? 'active' : 'default' })),
              },
            ],
            edges: [
              { id: 'e25-0', fromNode: 'b25p', portIndex: 0, toNode: 'b25l' },
              { id: 'e25-1', fromNode: 'b25p', portIndex: 1, toNode: 'b25r' },
            ],
            transfers: [
              { id: 'tr-x35', fromX: 205, fromY: 88, toX: 205, toY: 176, ctrlX: 205, ctrlY: 132, label: 'vào 30 | 40', tone: 'warn' },
            ],
            overlaySvg: `
              <line x1="205" y1="184" x2="205" y2="226" stroke="#D97706" stroke-width="3.2" stroke-dasharray="5 3" />
              <circle cx="205" cy="184" r="4" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.4" />
            `,
          }
        : step === 1
          ? {
              viewBox: [0, 0, 820, 310],
              nodes: [
                { id: 'b25p', x: 410, y: 56, cellW: 60, cellH: 42, state: 'highlight-box', keys: [{ id: 'x70', label: '70', tone: 'active' }] },
                {
                  id: 'b25l',
                  x: 205,
                  y: 200,
                  cellW: 46,
                  cellH: 40,
                  state: 'overflow',
                  tag: 'Tràn (7 > 6)',
                  tagPos: 'bottom',
                  tagTone: 'error',
                  keys: [10, 20, 30, 35, 40, 50, 60].map((v) => ({ id: `x${v}`, label: String(v), tone: v === 35 || v === 40 ? 'active' : 'default' })),
                },
                {
                  id: 'b25r',
                  x: 615,
                  y: 200,
                  capacity: 6,
                  cellW: 50,
                  cellH: 40,
                  state: 'overflow',
                  tag: 'Hết chỗ (0 ô trống)!',
                  tagPos: 'bottom',
                  tagTone: 'error',
                  keys: [80, 90, 100, 110, 120, 130].map((v) => ({ id: `x${v}`, label: String(v), tone: v === 90 ? 'active' : 'default' })),
                },
              ],
              edges: [
                { id: 'e25-0', fromNode: 'b25p', portIndex: 0, toNode: 'b25l', state: 'error' },
                { id: 'e25-1', fromNode: 'b25p', portIndex: 1, toNode: 'b25r', state: 'error' },
              ],
            }
          : {
              viewBox: [0, 0, 820, 310],
              nodes: [
                {
                  id: 'b25p',
                  x: 410,
                  y: 58,
                  cellW: 62,
                  cellH: 44,
                  state: 'success',
                  tag: '2 khóa phân cách lên cha: [40 | 90]',
                  tagTone: 'success',
                  keys: [
                    { id: 'x40', label: '40', tone: 'success' },
                    { id: 'x90', label: '90', tone: 'success' },
                  ],
                },
                {
                  id: 'b25c0',
                  x: 138,
                  y: 214,
                  capacity: 6,
                  cellW: 40,
                  cellH: 40,
                  state: 'success',
                  tag: '4 / 6 = 2/3',
                  tagPos: 'bottom',
                  tagTone: 'cobalt',
                  keys: [10, 20, 30, 35].map((v) => ({ id: `x${v}`, label: String(v), tone: v === 35 ? 'success' : 'default' })),
                },
                {
                  id: 'b25c1',
                  x: 410,
                  y: 214,
                  capacity: 6,
                  cellW: 40,
                  cellH: 40,
                  state: 'success',
                  tag: '4 / 6 = 2/3',
                  tagPos: 'bottom',
                  tagTone: 'cobalt',
                  keys: [50, 60, 70, 80].map((v) => ({ id: `x${v}`, label: String(v), tone: v === 70 ? 'success' : 'default' })),
                },
                {
                  id: 'b25c2',
                  x: 682,
                  y: 214,
                  capacity: 6,
                  cellW: 40,
                  cellH: 40,
                  state: 'success',
                  tag: '4 / 6 = 2/3',
                  tagPos: 'bottom',
                  tagTone: 'cobalt',
                  keys: [100, 110, 120, 130].map((v) => ({ id: `x${v}`, label: String(v) })),
                },
              ],
              edges:
                step === 3
                  ? [
                      { id: 'e25-n0', fromNode: 'b25p', portIndex: 0, toNode: 'b25c0', state: 'active', arrow: true },
                      { id: 'e25-n1', fromNode: 'b25p', portIndex: 1, toNode: 'b25c1', state: 'active', arrow: true },
                      { id: 'e25-n2', fromNode: 'b25p', portIndex: 2, toNode: 'b25c2', state: 'active', arrow: true },
                    ]
                  : [],
            };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion(), durationMs: 560 });
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 26 — Ba ứng dụng của các khóa có thứ tự (Bố cục Canva 3 thẻ chuẩn)
// ============================================================================
function s26InnoDbSvg(active: boolean): string {
  const hi = active ? '#2563EB' : '#64748B';
  const fillHi = active ? '#93C5FD' : '#E2E8F0';
  return `
  <svg class="s26-illus" viewBox="0 0 320 140" role="img" aria-label="MySQL InnoDB B+ Tree index">
    <defs>
      <marker id="a26-db" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${hi}"/>
      </marker>
      <path id="s26-db-route" d="M 100 44 L 100 104 L 214 104" />
    </defs>
    <!-- Root [20 | 40] -->
    <polygon points="62,24 68,18 144,18 138,24" fill="#CBD5E1" stroke="#0F1D3A" stroke-width="1.3"/>
    <polygon points="138,24 144,18 144,44 138,50" fill="#94A3B8" stroke="#0F1D3A" stroke-width="1.3"/>
    <rect x="62" y="24" width="76" height="26" fill="#EEF7FF" stroke="#0F1D3A" stroke-width="1.8"/>
    <line x1="100" y1="24" x2="100" y2="50" stroke="#0F1D3A" stroke-width="1.4"/>
    <text x="81" y="42" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
    <text x="119" y="42" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="800" font-family="'IBM Plex Mono', monospace">40</text>

    <!-- Arrows -->
    <line x1="74" y1="50" x2="40" y2="82" stroke="#0F1D3A" stroke-width="1.6" marker-end="url(#a26-db)"/>
    <line x1="100" y1="50" x2="100" y2="82" stroke="${hi}" stroke-width="2.4" marker-end="url(#a26-db)"/>
    <line x1="126" y1="50" x2="160" y2="82" stroke="#0F1D3A" stroke-width="1.6" marker-end="url(#a26-db)"/>

    <!-- 3 Leaf Page Blocks -->
    ${[18, 78, 138]
      .map(
        (x, i) => `
      <g>
        <rect x="${x}" y="86" width="44" height="34" rx="2" fill="${i === 1 ? fillHi : '#EEF7FF'}" stroke="${i === 1 ? hi : '#0F1D3A'}" stroke-width="${i === 1 ? 2.2 : 1.5}"/>
        <line x1="${x + 5}" y1="96" x2="${x + 39}" y2="96" stroke="${i === 1 ? hi : '#64748B'}" stroke-width="3"/>
        <line x1="${x + 5}" y1="104" x2="${x + 39}" y2="104" stroke="${i === 1 ? '#1D4ED8' : '#94A3B8'}" stroke-width="4"/>
        <line x1="${x + 5}" y1="112" x2="${x + 39}" y2="112" stroke="${i === 1 ? hi : '#94A3B8'}" stroke-width="3"/>
      </g>`,
      )
      .join('')}

    <!-- Horizontal scan arrow into Data Table Page -->
    <line class="${active ? 's26-flow' : ''}" x1="122" y1="104" x2="210" y2="104" stroke="${hi}" stroke-width="2.4" marker-end="url(#a26-db)"/>
    <rect x="216" y="74" width="88" height="50" rx="5" fill="#EEF7FF" stroke="#0F1D3A" stroke-width="1.8"/>
    <line x1="216" y1="88" x2="304" y2="88" stroke="#0F1D3A" stroke-width="1.4"/>
    <line x1="260" y1="74" x2="260" y2="124" stroke="#0F1D3A" stroke-width="1.4"/>
    <rect class="${active ? 's26-cell-pulse' : ''}" x="220" y="96" width="36" height="12" rx="2" fill="${active ? '#3B82F6' : '#94A3B8'}"/>
    <rect class="${active ? 's26-cell-pulse' : ''}" style="animation-delay:0.25s" x="264" y="96" width="36" height="12" rx="2" fill="${active ? '#3B82F6' : '#94A3B8'}"/>
    ${active ? `
    <circle r="4.2" fill="#FEF08A" stroke="#1D4ED8" stroke-width="1.8" class="s26-bead">
      <animateMotion dur="2.1s" repeatCount="indefinite"><mpath href="#s26-db-route"/></animateMotion>
    </circle>` : ''}
  </svg>`;
}

function s26HfsSvg(active: boolean): string {
  const hi = active ? '#2563EB' : '#64748B';
  return `
  <svg class="s26-illus" viewBox="0 0 320 140" role="img" aria-label="HFS+ Catalog B-tree">
    <defs>
      <marker id="a26-fs" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${hi}"/>
      </marker>
      <path id="s26-fs-arc" d="M 155 78 Q 186 64 218 76" />
    </defs>
    <!-- Finder Window -->
    <rect x="14" y="20" width="166" height="98" rx="6" fill="#FFFFFF" stroke="#0F1D3A" stroke-width="1.8"/>
    <rect x="14" y="20" width="166" height="18" rx="5" fill="#DCEBFF" stroke="#0F1D3A" stroke-width="1.5"/>
    <circle cx="26" cy="29" r="3" fill="#64748B"/><circle cx="36" cy="29" r="3" fill="#64748B"/><circle cx="46" cy="29" r="3" fill="#64748B"/>
    <line x1="72" y1="38" x2="72" y2="118" stroke="#0F1D3A" stroke-width="1.3"/>
    <!-- Left directory tree -->
    <rect x="24" y="48" width="16" height="11" rx="2" fill="#93C5FD" stroke="#0F1D3A" stroke-width="1.2"/>
    <path d="M 32 59 L 32 100 M 32 72 L 42 72 M 32 94 L 42 94" stroke="#0F1D3A" stroke-width="1.2" fill="none"/>
    <rect x="42" y="66" width="16" height="11" rx="2" fill="#CBD5E1" stroke="#0F1D3A" stroke-width="1.2"/>
    <rect x="42" y="88" width="16" height="11" rx="2" fill="#CBD5E1" stroke="#0F1D3A" stroke-width="1.2"/>
    <!-- Right file entries -->
    <rect x="82" y="48" width="12" height="14" rx="1" fill="#EEF7FF" stroke="#0F1D3A" stroke-width="1.2"/>
    <line x1="100" y1="55" x2="152" y2="55" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <rect class="${active ? 's26-row-glow' : ''}" x="78" y="69" width="94" height="22" rx="4" fill="${active ? '#DBEAFE' : '#F1F5F9'}" stroke="${hi}" stroke-width="1.5"/>
    <rect x="82" y="73" width="12" height="14" rx="1" fill="#FFFFFF" stroke="${hi}" stroke-width="1.3"/>
    <line x1="100" y1="80" x2="136" y2="80" stroke="${hi}" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="82" y="96" width="12" height="14" rx="1" fill="#EEF7FF" stroke="#0F1D3A" stroke-width="1.2"/>
    <line x1="100" y1="103" x2="146" y2="103" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>

    <!-- Magnifier + Arrow to Disk Catalog Grid -->
    <g class="${active ? 's26-mag-bob' : ''}">
      <circle cx="144" cy="80" r="9" fill="#FFFFFF" stroke="${hi}" stroke-width="2.2"/>
      <line x1="150" y1="86" x2="158" y2="94" stroke="${hi}" stroke-width="2.8" stroke-linecap="round"/>
    </g>
    <path class="${active ? 's26-flow' : ''}" d="M 155 78 Q 186 64 218 76" fill="none" stroke="${hi}" stroke-width="2.2" marker-end="url(#a26-fs)"/>
    ${active ? `
    <circle r="3.8" fill="#FEF08A" stroke="#1D4ED8" stroke-width="1.6" class="s26-bead">
      <animateMotion dur="1.9s" repeatCount="indefinite"><mpath href="#s26-fs-arc"/></animateMotion>
    </circle>` : ''}

    <!-- Disk / Catalog Block -->
    <g transform="translate(216, 22)">
      <path d="M 18 4 L 78 4 L 88 86 Q 88 96 76 96 L 12 96 Q 2 96 4 84 Z" fill="#EEF7FF" stroke="#0F1D3A" stroke-width="1.8"/>
      <rect x="20" y="18" width="54" height="54" rx="4" fill="#DCEBFF" stroke="#0F1D3A" stroke-width="1.4"/>
      <rect class="${active ? 's26-cell-pulse' : ''}" x="38" y="36" width="18" height="16" rx="2" fill="${active ? '#3B82F6' : '#94A3B8'}"/>
      <line x1="20" y1="36" x2="74" y2="36" stroke="#0F1D3A" stroke-width="1.1"/>
      <line x1="20" y1="52" x2="74" y2="52" stroke="#0F1D3A" stroke-width="1.1"/>
      <line x1="38" y1="18" x2="38" y2="72" stroke="#0F1D3A" stroke-width="1.1"/>
      <line x1="56" y1="18" x2="56" y2="72" stroke="#0F1D3A" stroke-width="1.1"/>
      <rect x="14" y="80" width="62" height="8" rx="3" fill="#93C5FD" stroke="#0F1D3A" stroke-width="1.2"/>
    </g>
  </svg>`;
}

function s26BdbSvg(active: boolean): string {
  const hi = active ? '#2563EB' : '#64748B';
  return `
  <svg class="s26-illus" viewBox="0 0 320 140" role="img" aria-label="Berkeley DB Key-Value Btree">
    <defs>
      <marker id="a26-kv" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="${hi}"/>
      </marker>
    </defs>
    <!-- Magnifier on left (glides gently across ordered keys when active) -->
    <g class="${active ? 's26-kv-scan' : ''}">
      <circle cx="52" cy="64" r="16" fill="#DCEBFF" stroke="#0F1D3A" stroke-width="2.4"/>
      <circle cx="52" cy="64" r="10" fill="#FFFFFF" stroke="${hi}" stroke-width="1.4"/>
      <line x1="40" y1="76" x2="26" y2="92" stroke="#0F1D3A" stroke-width="5" stroke-linecap="round"/>
      <line x1="68" y1="66" x2="92" y2="68" stroke="${hi}" stroke-width="2" marker-end="url(#a26-kv)"/>
    </g>

    <!-- Ordered Keys 101, 102, 103 -> Value Bars (sequential sweep) -->
    ${[
      { y: 26, k: '101', lit: false, i: 0 },
      { y: 60, k: '102', lit: true, i: 1 },
      { y: 94, k: '103', lit: false, i: 2 },
    ]
      .map(
        (r) => `
      <g class="${active ? 's26-kv-row' : ''}" style="--kvi:${r.i}">
        <rect x="96" y="${r.y}" width="44" height="24" rx="3" fill="${r.lit && active ? '#DBEAFE' : '#FFFFFF'}" stroke="${r.lit && active ? hi : '#0F1D3A'}" stroke-width="${r.lit && active ? 2.2 : 1.6}"/>
        <text x="118" y="${r.y + 16}" text-anchor="middle" fill="#0F1D3A" font-size="13" font-weight="800" font-family="'IBM Plex Mono', monospace">${r.k}</text>
        <line class="${active ? 's26-flow' : ''}" x1="140" y1="${r.y + 12}" x2="178" y2="${r.y + 12}" stroke="${r.lit ? hi : '#0F1D3A'}" stroke-width="2" marker-end="url(#a26-kv)"/>
        <rect x="184" y="${r.y - 2}" width="108" height="28" rx="4" fill="${r.lit && active ? '#DCEBFF' : '#EEF7FF'}" stroke="${r.lit && active ? hi : '#0F1D3A'}" stroke-width="1.7"/>
        <line x1="194" y1="${r.y + 8}" x2="280" y2="${r.y + 8}" stroke="${r.lit && active ? hi : '#0F1D3A'}" stroke-width="3.2" stroke-linecap="round"/>
        <line x1="194" y1="${r.y + 17}" x2="262" y2="${r.y + 17}" stroke="#64748B" stroke-width="2.5" stroke-linecap="round"/>
      </g>`,
      )
      .join('')}
  </svg>`;
}

const slide26: SlideDef = {
  number: 27,
  title: 'Ba ứng dụng của các khóa có thứ tự',
  chapter: '5. Các biến thể và ứng dụng',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Ở cả ba ví dụ, dữ liệu được sắp thứ tự. Ứng dụng quyết định khóa nào giúp trả lời câu hỏi thường gặp.”',
  fullScript:
    'Với ưu thế về I/O và duyệt khoảng, B-tree cùng các biến thể trở thành xương sống của ba nhóm hệ thống lớn: Thứ nhất, Cơ sở dữ liệu như MySQL InnoDB dùng chỉ mục có thứ tự để tìm bản ghi và lọc khoảng thay vì quét toàn bảng. Thứ hai, Hệ thống tệp như HFS+ (Catalog B-tree) hay XFS quản lý thông tin tệp, thư mục và vùng nhớ trống trên đĩa. Thứ ba, Kho khóa–giá trị như Berkeley DB (Btree) duy trì các cặp khóa–giá trị có thứ tự để tìm một khóa và dịch con trỏ đọc tuần tự. Câu hỏi dẫn sang phần XFS: nếu dữ liệu là các vùng trống trên đĩa, ta sẽ sắp xếp khóa theo tiêu chí gì?',
  fullView: {
    summary: 'Ba nhóm ứng dụng thực tế tiêu biểu của B-tree và biến thể: MySQL InnoDB, HFS+ Catalog B-tree, Berkeley DB Btree.',
    sections: [
      {
        heading: 'Ba hệ thống thực tế',
        bodyHtml:
          '<ol>' +
          '<li><strong>01 · Cơ sở dữ liệu (MySQL · InnoDB):</strong> Lập chỉ mục B+ Tree để tìm bản ghi theo khóa và lọc theo khoảng, thay vì quét toàn bộ bảng.</li>' +
          '<li><strong>02 · Hệ thống tệp (HFS+ · Catalog B-tree):</strong> Quản lý thông tin tệp và thư mục; tra cứu tên tệp mà không cần duyệt lần lượt mọi mục.</li>' +
          '<li><strong>03 · Kho khóa–giá trị (Berkeley DB · Btree):</strong> Lưu các cặp khóa–giá trị theo thứ tự; hỗ trợ tìm một khóa và duyệt các khóa liên tiếp.</li>' +
          '</ol>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame s26-canva-frame">
        <header class="s26-canva-head">
          <h1 class="s26-canva-title">Ứng dụng cơ bản của <span>B-tree</span></h1>
          <p class="s26-canva-sub">B-tree và các biến thể giúp tra cứu dữ liệu có thứ tự trên bộ nhớ ngoài.</p>
        </header>

        <div class="s26-canva-cards">
          <article class="s26-card" data-app="1">
            <div class="s26-card__band"><span class="s26-num">01</span><h3>Cơ sở dữ liệu</h3><span class="s26-var-tag">B+ Tree</span></div>
            <div class="s26-card__body">
              <div class="s26-impl">MySQL • InnoDB</div>
              <div class="s26-illus-box" data-role="illus-1"></div>
              <p>Lập chỉ mục để tìm bản ghi theo khóa và lọc theo khoảng, thay vì quét toàn bộ bảng.</p>
              <button type="button" class="s26-qbtn" data-qapp="1">▶ <code>WHERE id BETWEEN 20 AND 40</code></button>
              <div class="s26-qout" data-qout="1">Nhấn để chạy thử truy vấn khoảng</div>
            </div>
          </article>

          <article class="s26-card" data-app="2">
            <div class="s26-card__band"><span class="s26-num">02</span><h3>Hệ thống tệp</h3><span class="s26-var-tag">Catalog B-tree</span></div>
            <div class="s26-card__body">
              <div class="s26-impl">HFS+ • Catalog B-tree</div>
              <div class="s26-illus-box" data-role="illus-2"></div>
              <p>Quản lý thông tin tệp và thư mục. Tra cứu tên tệp mà không cần duyệt lần lượt mọi mục.</p>
              <button type="button" class="s26-qbtn" data-qapp="2">▶ <code>lookup("/docs/report.pdf")</code></button>
              <div class="s26-qout" data-qout="2">Nhấn để tra cứu tệp trong Catalog</div>
            </div>
          </article>

          <article class="s26-card" data-app="3">
            <div class="s26-card__band"><span class="s26-num">03</span><h3>Kho khóa–giá trị</h3><span class="s26-var-tag">B-tree / B+</span></div>
            <div class="s26-card__body">
              <div class="s26-impl">Berkeley DB • Btree</div>
              <div class="s26-illus-box" data-role="illus-3"></div>
              <p>Lưu các cặp khóa–giá trị theo thứ tự. Hỗ trợ tìm một khóa và duyệt các khóa liên tiếp.</p>
              <button type="button" class="s26-qbtn" data-qapp="3">▶ <code>cursor.scan(101..103)</code></button>
              <div class="s26-qout" data-qout="3">Nhấn để quét con trỏ tuần tự</div>
            </div>
          </article>
        </div>

        <div class="s26-canva-footer">
          <strong>Giữ khóa có thứ tự để tra cứu nhanh và đọc dữ liệu theo khoảng.</strong>
          <span class="s26-q" data-role="q-xfs">Câu hỏi mở: Nếu dữ liệu là <em>vùng trống trên đĩa</em>, sắp xếp theo gì?</span>
        </div>
      </div>
    `;

    const qMsgs: Record<number, string> = {
      1: 'Đọc 1 trang gốc + quét ngang 2 trang lá → khớp 2 bản ghi (không full scan).',
      2: 'Đi 2 mức theo (parentID, filename) → trỏ thẳng extent của report.pdf.',
      3: 'Tìm khóa 101 trong O(log N) rồi dịch con trỏ đọc liền 101 → 102 → 103.',
    };
    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-qapp]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.qapp);
        const out = ctx.slideEl.querySelector<HTMLElement>(`[data-qout="${id}"]`)!;
        out.textContent = qMsgs[id];
        out.classList.add('is-hit');
        const box = ctx.slideEl.querySelector<HTMLElement>(`[data-role="illus-${id}"]`)!;
        box.innerHTML = id === 1 ? s26InnoDbSvg(true) : id === 2 ? s26HfsSvg(true) : s26BdbSvg(true);
        ctx.slideEl.querySelectorAll<HTMLElement>('.s26-card').forEach((c) => {
          const cid = Number(c.dataset.app);
          if (cid === id) {
            c.classList.remove('is-dim');
            c.classList.add('is-lit-card');
          }
        });
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const cards = ctx.slideEl.querySelectorAll<HTMLElement>('.s26-card');
    const q = ctx.slideEl.querySelector<HTMLElement>('[data-role="q-xfs"]')!;
    ctx.slideEl.querySelector<HTMLElement>('[data-role="illus-1"]')!.innerHTML = s26InnoDbSvg(step >= 1);
    ctx.slideEl.querySelector<HTMLElement>('[data-role="illus-2"]')!.innerHTML = s26HfsSvg(step >= 2);
    ctx.slideEl.querySelector<HTMLElement>('[data-role="illus-3"]')!.innerHTML = s26BdbSvg(step >= 3);

    cards.forEach((c) => {
      const idx = Number(c.dataset.app);
      c.classList.toggle('is-dim', step < idx);
      c.classList.toggle('is-lit-card', step === idx);
    });
    q.classList.toggle('is-visible', step >= 3);
  },
};

// ============================================================================
// SLIDE 27 — XFS cần 10 block liền nhau
// ============================================================================
const XFS_EXTENTS: [number, number][] = [
  [100, 8],
  [200, 20],
  [300, 6],
  [400, 12],
  [500, 4],
  [600, 16],
];

const slide27: SlideDef = {
  number: 28,
  title: 'XFS cần 10 block liền nhau',
  chapter: '5. Các biến thể và ứng dụng · XFS',
  theme: 'xfs-blue',
  stepCount: 3,
  leadIn: '“Ta biết tổng là 66. Con số nào trong sáu bản ghi mới cho biết một yêu cầu dài 10 có được đáp ứng?”',
  fullScript:
    'Xét bài toán thực tế trong hệ thống tệp XFS trên Linux: một tệp cần xin cấp phát thêm 10 block trống liền nhau trong một nhóm cấp phát (Allocation Group — AG). Nếu trên đĩa có 10 block trống nhưng chia cắt thành 6 block và 4 block rời rạc thì dải dài nhất chỉ là 6 — không đủ; hệ thống bắt buộc cần một dải liên tục dài ít nhất 10 block. Ví dụ thực tế đang xét có 66 block trống chia thành 6 vùng (block đầu, độ dài): (100, 8), (200, 20), (300, 6), (400, 12), (500, 4), (600, 16). Ba vùng có độ dài 12, 16, 20 đều đủ chỗ. Làm sao XFS tìm ngay vùng dài ít nhất 10 block mà không phải duyệt tuần tự?',
  fullView: {
    summary: 'Bài toán cấp phát 10 block liên tục trong một Allocation Group (AG) của hệ thống tệp XFS.',
    sections: [
      {
        heading: 'Tổng số block trống ≠ Độ dài liên tục',
        bodyHtml:
          '<p>Hàng A có <code>6 + 4 = 10</code> block trống nhưng bị ngắt bởi 2 block đã dùng → dải liên tục dài nhất chỉ là <strong>6</strong> (không đủ).</p>' +
          '<p>Hàng B có <strong>10 block trống liền nhau</strong> → khung đo 10 ô vừa khít (đủ chỗ).</p>',
      },
      {
        heading: 'Bộ dữ liệu 6 vùng trống (tổng 66 block)',
        bodyHtml:
          '<p>Các cặp <code>(block đầu, độ dài)</code>: <code>(100, 8)</code>, <code>(200, 20)</code>, <code>(300, 6)</code>, <code>(400, 12)</code>, <code>(500, 4)</code>, <code>(600, 16)</code>. Các vùng đáp ứng yêu cầu ≥ 10 là độ dài <strong>12, 16, 20</strong>.</p>',
      },
    ],
    references: XFS_REFS,
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Bài toán XFS:</span> Tìm 10 block liền nhau</h1>
            <p class="slide-lead">Tệp cần thêm chỗ. XFS phải tìm một vùng trống đủ dài trong một nhóm cấp phát (AG).</p>
          </div>
          <div class="xfs-legend">
            <span><i class="lg-dot lg-free">○</i> Trống</span>
            <span><i class="lg-dot lg-used">■</i> Đã dùng</span>
            <small>Mỗi ô = 1 block</small>
          </div>
        </header>

        <div class="s27-rows">
          <div class="canva-card s27-row" data-row="a">
            <div class="s27-row__head">
              <strong>Hàng A · 6 + 4 block trống rời rạc</strong>
              <span class="badge-err">Dải dài nhất: 6 · Không đủ!</span>
            </div>
            ${xfsBlockRowHtml(['free', 'free', 'free', 'free', 'free', 'free', 'used', 'used', 'free', 'free', 'free', 'free'], { windowStart: 0, windowLen: 10, windowFit: false })}
          </div>

          <div class="canva-card s27-row" data-row="b">
            <div class="s27-row__head">
              <strong>Hàng B · 10 block trống liền nhau</strong>
              <span class="badge-ok">Dải dài nhất: 10 · Đủ chỗ</span>
            </div>
            ${xfsBlockRowHtml(['used', 'free', 'free', 'free', 'free', 'free', 'free', 'free', 'free', 'free', 'free', 'used'], { windowStart: 1, windowLen: 10, windowFit: true })}
          </div>
        </div>

        <div class="canva-card s27-extents" data-role="extents">
          <div class="s27-ext-head">
            <strong>Ví dụ đang xét: 66 block trống chia thành 6 vùng <code>(block đầu, độ dài)</code></strong>
            <span class="ext-hint">Nhấn vào từng vùng để kiểm tra đủ ≥ 10 block!</span>
          </div>
          <div class="ext-grid">
            ${XFS_EXTENTS.map(
              ([start, len], idx) => `
              <button type="button" class="ext-card" style="--ei:${idx}" data-ext-len="${len}">
                <span class="ext-tuple">(${start}, <strong>${len}</strong>)</span>
                <span class="ext-bar-track" aria-hidden="true">
                  <span class="ext-bar-fill${len >= 10 ? ' is-pass' : ''}" style="width:${Math.round((len / 20) * 100)}%"></span>
                  <span class="ext-bar-thresh" title="Ngưỡng 10 block"></span>
                </span>
                <span class="ext-badge" data-role="eb">${len >= 10 ? '≥ 10 · Nhấn kiểm tra' : '< 10 · Nhấn kiểm tra'}</span>
              </button>
            `,
            ).join('')}
          </div>
        </div>

        <div class="xfs-conclusion-strip">
          <strong>Câu hỏi:</strong> Làm sao tìm ngay một vùng dài ít nhất 10 block mà không duyệt tuần tự?
          <span>Nguồn: Tài liệu XFS · Allocation Groups</span>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.ext-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const len = Number(card.dataset.extLen);
        const ok = len >= 10;
        card.classList.toggle('is-ok', ok);
        card.classList.toggle('is-no', !ok);
        card.querySelector<HTMLElement>('[data-role="eb"]')!.textContent = ok ? `Đủ chỗ (≥ 10)` : `Chưa đủ (< 10)`;
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const rowA = ctx.slideEl.querySelector<HTMLElement>('[data-row="a"]')!;
    const rowB = ctx.slideEl.querySelector<HTMLElement>('[data-row="b"]')!;
    const ext = ctx.slideEl.querySelector<HTMLElement>('[data-role="extents"]')!;

    rowA.classList.toggle('is-dim', step < 1);
    rowA.classList.toggle('is-active-card', step === 1);
    rowB.classList.toggle('is-dim', step < 2);
    rowB.classList.toggle('is-active-card', step === 2);
    ext.classList.toggle('is-dim', step < 3);
    ext.classList.toggle('is-active-card', step === 3);
  },
};

// ============================================================================
// SLIDE 28 — XFS dùng cntbt và bnobt
// ============================================================================
const slide28: SlideDef = {
  number: 29,
  title: 'XFS dùng cntbt và bnobt',
  chapter: '5. Các biến thể và ứng dụng · XFS',
  theme: 'white',
  stepCount: 4,
  leadIn: '“Vẫn là thông tin về các vùng trống trong cùng AG. Khi xin chỗ mình biết độ dài; khi trả chỗ mình biết địa chỉ. Mỗi câu hỏi cần một thứ tự khóa.”',
  fullScript:
    'XFS duy trì song song hai cây B+ trên cùng tập vùng trống của một Allocation Group: Cây trái cntbt sắp xếp theo (độ dài, block đầu), gốc rút gọn [4 | 8 | 16] là mốc độ dài nhỏ nhất mỗi nhánh. Khi cần 10 block liền nhau (trước khi cấp), vì 8 ≤ 10 < 16 nên đi vào lá giữa [(8, ở 100), (12, ở 400)], bỏ qua 8 và chọn vùng dài 12 ở block 400. (Lưu ý: đây là minh họa tra theo kích thước; bộ cấp phát thực tế còn xét vị trí và căn chỉnh.) Cây phải bnobt sắp xếp theo (block đầu, độ dài), gốc [100 | 300 | 500]. Sau khi đã cấp 400–409 (còn lại (410, dài 2)), khi tệp trả lại 400–409, XFS tra theo địa chỉ 410 (300 ≤ 410 < 500) xuống lá [(300, 6), (410, 2)], phát hiện 410–411 nằm ngay sau 409 để gộp thành vùng lớn duy nhất.',
  fullView: {
    summary: 'Hai cây B+ song song trong mỗi XFS Allocation Group: cntbt (tra theo độ dài) và bnobt (tra theo địa chỉ block đầu).',
    sections: [
      {
        heading: 'cntbt · Tìm vùng đủ dài (Trước khi cấp)',
        bodyHtml:
          '<p>Sắp xếp theo <code>(độ dài, block đầu)</code>. Gốc <code>[4 | 8 | 16]</code> → <code>8 ≤ 10 &lt; 16</code> → lá <code>[(8, 100), (12, 400)]</code> → bỏ qua 8, chọn <strong>(400, 12)</strong>.</p>' +
          '<p><em>Ghi chú kỹ thuật:</em> Đây là minh họa tra theo kích thước; bộ cấp phát XFS thực tế còn xét vị trí gần và căn chỉnh (alignment).</p>',
      },
      {
        heading: 'bnobt · Tìm vùng liền kề (Sau khi cấp, trước khi thu hồi)',
        bodyHtml:
          '<p>Sắp xếp theo <code>(block đầu, độ dài)</code>; vùng (400, 12) đã đổi thành <code>(410, 2)</code>. Khi trả <code>400–409</code>, tra địa chỉ <code>410</code> (<code>300 ≤ 410 &lt; 500</code>) → gặp <code>(410, dài 2)</code> nằm sát sau 409 → gộp!</p>',
      },
    ],
    references: XFS_REFS,
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Giải pháp XFS:</span> Đi từ gốc đến lá</h1>
          <p class="slide-lead">Mỗi AG có hai cây B+. Chọn cây theo thông tin mình biết: độ dài hoặc địa chỉ.</p>
        </header>

        <div class="s28-grid">
          <article class="canva-card s28-panel" data-panel="cntbt">
            <div class="s28-panel__head">
              <button type="button" class="tree-title-btn" data-replay="cntbt"><strong>cntbt</strong> · Tìm vùng đủ dài (theo độ dài)</button>
              <span class="time-stamp">Trước khi cấp</span>
            </div>
            <div class="s28-sub">Cần <strong>10 block</strong> liền nhau → gốc lưu mốc độ dài nhỏ nhất mỗi nhánh</div>
            <div class="s28-tree" data-role="tree-cntbt"></div>
            <div class="s28-foot" data-role="foot-cntbt">Sắp theo <code>(độ dài, block đầu)</code></div>
          </article>

          <article class="canva-card s28-panel" data-panel="bnobt">
            <div class="s28-panel__head">
              <button type="button" class="tree-title-btn" data-replay="bnobt"><strong>bnobt</strong> · Tìm vùng liền kề (theo địa chỉ)</button>
              <span class="time-stamp time-stamp--after">Sau khi cấp, trước thu hồi</span>
            </div>
            <div class="s28-sub">Trả <strong>400–409</strong> → tìm hàng xóm bắt đầu ở <strong>block 410</strong></div>
            <div class="s28-tree" data-role="tree-bnobt"></div>
            <div class="s28-foot" data-role="foot-bnobt">Sắp theo <code>(block đầu, độ dài)</code></div>
          </article>
        </div>

        <div class="s28-disk-bar" data-role="disk-map">
          <div class="s28-disk-label">Đĩa thật (AG) · 6 vùng trống:</div>
          <div class="s28-disk-segs">
            <span class="s28-seg" data-seg="100"><code>100</code><small>8 blk</small></span>
            <span class="s28-seg" data-seg="200"><code>200</code><small>20 blk</small></span>
            <span class="s28-seg" data-seg="300"><code>300</code><small>6 blk</small></span>
            <span class="s28-seg s28-seg--400" data-seg="400"><code>400–411</code><small data-role="seg400-lbl">12 blk</small></span>
            <span class="s28-seg" data-seg="500"><code>500</code><small>4 blk</small></span>
            <span class="s28-seg" data-seg="600"><code>600</code><small>16 blk</small></span>
          </div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-replay]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.dataset.replay === 'cntbt') {
          renderCntbt(ctx.slideEl, 2, ctx.getReducedMotion());
          updateS28DiskMap(ctx.slideEl, 2);
        } else {
          renderBnobt(ctx.slideEl, 4, ctx.getReducedMotion());
          updateS28DiskMap(ctx.slideEl, 4);
        }
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderCntbt(ctx.slideEl, step, ctx.getReducedMotion());
    renderBnobt(ctx.slideEl, step, ctx.getReducedMotion());
    updateS28DiskMap(ctx.slideEl, step);
  },
  cancelAnimations(slideEl) {
    slideEl.querySelectorAll<HTMLElement>('[data-role^="tree-"]').forEach((el) => cancelTreeAnimations(el));
  },
};

function updateS28DiskMap(slideEl: HTMLElement, step: number): void {
  const seg400 = slideEl.querySelector<HTMLElement>('[data-seg="400"]');
  const seg400Lbl = slideEl.querySelector<HTMLElement>('[data-role="seg400-lbl"]');
  if (!seg400 || !seg400Lbl) return;
  seg400.classList.remove('is-picked', 'is-merge');
  if (step === 1 || step === 2) {
    seg400.classList.add('is-picked');
    seg400.querySelector('code')!.textContent = '400–411';
    seg400Lbl.textContent = step === 2 ? 'cntbt chọn (12 ≥ 10)' : 'đang kiểm tra (12)';
  } else if (step >= 3) {
    seg400.classList.add('is-merge');
    seg400.querySelector('code')!.textContent = '400–409 | 410–411';
    seg400Lbl.textContent = step === 4 ? 'khớp 409|410 → gộp!' : 'tìm hàng xóm 410';
  } else {
    seg400.querySelector('code')!.textContent = '400–411';
    seg400Lbl.textContent = '12 blk';
  }
}

function renderCntbt(slideEl: HTMLElement, step: number, reducedMotion: boolean): void {
  const box = slideEl.querySelector<HTMLElement>('[data-role="tree-cntbt"]')!;
  const foot = slideEl.querySelector<HTMLElement>('[data-role="foot-cntbt"]')!;
  const panel = slideEl.querySelector<HTMLElement>('[data-panel="cntbt"]')!;
  panel.classList.toggle('is-active-card', step === 1 || step === 2);

  const scene: TreeSceneSpec = {
    viewBox: [0, 0, 560, 240],
    nodes: [
      {
        id: 'cnt-r',
        x: 280,
        y: 44,
        cellW: 56,
        cellH: 38,
        state: step >= 1 ? 'active' : 'normal',
        keys: [
          { id: 'cr4', label: '4', tone: 'guide' },
          { id: 'cr8', label: '8', tone: step >= 1 ? 'active' : 'guide' },
          { id: 'cr16', label: '16', tone: 'guide' },
        ],
      },
      {
        id: 'cnt-0',
        x: 92,
        y: 168,
        cellW: 72,
        cellH: 46,
        state: step >= 1 ? 'muted' : 'normal',
        keys: [
          { id: 'cl4', label: '4', sublabel: 'ở 500', tone: step >= 1 ? 'muted' : 'record' },
          { id: 'cl6', label: '6', sublabel: 'ở 300', tone: step >= 1 ? 'muted' : 'record' },
        ],
      },
      {
        id: 'cnt-1',
        x: 280,
        y: 168,
        cellW: 74,
        cellH: 46,
        state: step >= 2 ? 'success' : step === 1 ? 'active' : 'normal',
        tag: step >= 2 ? 'Đủ dài: (400, 12)' : undefined,
        tagPos: 'bottom',
        tagTone: 'success',
        keys: [
          { id: 'cl8', label: '8', sublabel: 'ở 100', tone: step >= 2 ? 'error' : 'record' },
          { id: 'cl12', label: '12', sublabel: 'ở 400', tone: step >= 2 ? 'success' : step === 1 ? 'active' : 'record' },
        ],
      },
      {
        id: 'cnt-2',
        x: 468,
        y: 168,
        cellW: 72,
        cellH: 46,
        state: step >= 1 ? 'muted' : 'normal',
        keys: [
          { id: 'cl16', label: '16', sublabel: 'ở 600', tone: step >= 1 ? 'muted' : 'record' },
          { id: 'cl20', label: '20', sublabel: 'ở 200', tone: step >= 1 ? 'muted' : 'record' },
        ],
      },
    ],
    edges: [
      { id: 'ce0', fromNode: 'cnt-r', portIndex: 0, toNode: 'cnt-0', state: step >= 1 ? 'muted' : 'normal' },
      { id: 'ce1', fromNode: 'cnt-r', portIndex: 1, toNode: 'cnt-1', state: step >= 1 ? 'active' : 'normal', arrow: step >= 1, label: step >= 1 ? '8 ≤ 10 < 16' : undefined },
      { id: 'ce2', fromNode: 'cnt-r', portIndex: 2, toNode: 'cnt-2', state: step >= 1 ? 'muted' : 'normal' },
    ],
    leafLinks: [
      { id: 'cll0', fromNode: 'cnt-0', toNode: 'cnt-1' },
      { id: 'cll1', fromNode: 'cnt-1', toNode: 'cnt-2' },
    ],
  };

  renderTreeScene(box, scene, { reducedMotion });
  foot.innerHTML =
    step === 0
      ? 'Sắp theo <code>(độ dài, block đầu)</code> · chờ yêu cầu 10 block.'
      : step === 1
        ? '<code>8 ≤ 10 &lt; 16</code> → mở lá giữa chứa <code>(8, ở 100)</code> và <code>(12, ở 400)</code>.'
        : 'Bỏ qua <code>8</code> (chưa đủ), chọn mục đầu đủ dài: <strong>vùng dài 12 ở block 400</strong>';
}

function renderBnobt(slideEl: HTMLElement, step: number, reducedMotion: boolean): void {
  const box = slideEl.querySelector<HTMLElement>('[data-role="tree-bnobt"]')!;
  const foot = slideEl.querySelector<HTMLElement>('[data-role="foot-bnobt"]')!;
  const panel = slideEl.querySelector<HTMLElement>('[data-panel="bnobt"]')!;
  panel.classList.toggle('is-active-card', step >= 3);

  const active = step >= 3;
  const scene: TreeSceneSpec = {
    viewBox: [0, 0, 560, 240],
    nodes: [
      {
        id: 'bno-r',
        x: 280,
        y: 44,
        cellW: 58,
        cellH: 38,
        state: active ? 'active' : 'normal',
        keys: [
          { id: 'br100', label: '100', tone: 'guide' },
          { id: 'br300', label: '300', tone: active ? 'active' : 'guide' },
          { id: 'br500', label: '500', tone: 'guide' },
        ],
      },
      {
        id: 'bno-0',
        x: 92,
        y: 168,
        cellW: 72,
        cellH: 46,
        state: active ? 'muted' : 'normal',
        keys: [
          { id: 'bl100', label: '100', sublabel: 'dài 8', tone: active ? 'muted' : 'record' },
          { id: 'bl200', label: '200', sublabel: 'dài 20', tone: active ? 'muted' : 'record' },
        ],
      },
      {
        id: 'bno-1',
        x: 280,
        y: 168,
        cellW: 74,
        cellH: 46,
        state: step >= 4 ? 'success' : active ? 'active' : 'normal',
        tag: step >= 4 ? '409 | 410 liền kề → Gộp' : undefined,
        tagPos: 'bottom',
        tagTone: 'success',
        keys: [
          { id: 'bl300', label: '300', sublabel: 'dài 6', tone: 'record' },
          { id: 'bl410', label: '410', sublabel: 'dài 2', tone: step >= 4 ? 'success' : active ? 'active' : 'record' },
        ],
      },
      {
        id: 'bno-2',
        x: 468,
        y: 168,
        cellW: 72,
        cellH: 46,
        state: active ? 'muted' : 'normal',
        keys: [
          { id: 'bl500', label: '500', sublabel: 'dài 4', tone: active ? 'muted' : 'record' },
          { id: 'bl600', label: '600', sublabel: 'dài 16', tone: active ? 'muted' : 'record' },
        ],
      },
    ],
    edges: [
      { id: 'be0', fromNode: 'bno-r', portIndex: 0, toNode: 'bno-0', state: active ? 'muted' : 'normal' },
      { id: 'be1', fromNode: 'bno-r', portIndex: 1, toNode: 'bno-1', state: active ? 'active' : 'normal', arrow: active, label: active ? '300 ≤ 410 < 500' : undefined },
      { id: 'be2', fromNode: 'bno-r', portIndex: 2, toNode: 'bno-2', state: active ? 'muted' : 'normal' },
    ],
    leafLinks: [
      { id: 'bll0', fromNode: 'bno-0', toNode: 'bno-1' },
      { id: 'bll1', fromNode: 'bno-1', toNode: 'bno-2' },
    ],
  };

  renderTreeScene(box, scene, { reducedMotion });
  foot.innerHTML =
    step < 3
      ? 'Sắp theo <code>(block đầu, độ dài)</code> · vùng 400 đã cập nhật thành <code>(410, dài 2)</code>.'
      : step === 3
        ? 'Trả 400–409 → tra <code>300 ≤ 410 &lt; 500</code> xuống lá chứa <code>(410, dài 2)</code>.'
        : 'Vùng <strong>410–411</strong> nằm sát ngay sau <strong>409</strong> → nối liền kề để chống phân mảnh';
}

// ============================================================================
// SLIDE 29 — Cấp phát, thu hồi và hỏi đáp
// ============================================================================
const ADDR_400_411 = Array.from({ length: 12 }, (_, i) => 400 + i);

const slide29: SlideDef = {
  number: 30,
  title: 'Cấp phát, thu hồi và hỏi đáp',
  chapter: '5. Các biến thể và ứng dụng · XFS',
  theme: 'xfs-blue',
  stepCount: 4,
  leadIn: '“Từ một khóa 17 đến một vùng trống dài 12 block, ta đều dùng thứ tự để chọn đúng nhánh. Nhóm 10 cảm ơn thầy cô và các bạn. Mọi người muốn xem lại bước nào?”',
  fullScript:
    'Slide cuối cùng minh họa trọn vẹn vòng đời cấp phát và thu hồi trên vùng (400, 12): Bước 1, trước khi cấp phát, toàn bộ 12 block từ 400 đến 411 đang trống; bnobt lưu (400, 12) và cntbt lưu (12, 400). Bước 2, XFS cấp 10 block đầu (400–409) cho tệp, còn dư 410–411; cả hai cây cùng cập nhật thành (410, 2) và (2, 410). Bước 3, khi tệp trả lại 400–409, kiểm tra 400 + 10 = 410 khớp ngay đầu vùng trống kế bên nên gộp thành 400–411 và khôi phục (400, 12) / (12, 400) trên cả hai chỉ mục. Lưu ý: gộp vùng trống là nối các block liền nhau trên đĩa, khác với gộp nút cân bằng cây. Nhóm 10 xin cảm ơn thầy cô và các bạn đã lắng nghe!',
  fullView: {
    summary: 'Vòng đời đầy đủ cấp phát 10 block và thu hồi 400–409 trên cặp vùng trống (400, 12) cùng đồng bộ bnobt & cntbt.',
    sections: [
      {
        heading: 'Ba mốc địa chỉ 400…411 và hai bảng chỉ mục',
        bodyHtml:
          '<ol>' +
          '<li><strong>Trước khi cấp:</strong> 400–411 trống 12 block · <code>bnobt: (400, 12)</code> · <code>cntbt: (12, 400)</code>.</li>' +
          '<li><strong>Sau khi cấp 10 block:</strong> 400–409 đã cấp, 410–411 còn trống · <code>bnobt: (410, 2)</code> · <code>cntbt: (2, 410)</code>.</li>' +
          '<li><strong>Sau khi thu hồi 400–409:</strong> <code>400 + 10 = 410</code> chạm 410–411 → gộp thành 400–411 · khôi phục <code>bnobt: (400, 12)</code>, <code>cntbt: (12, 400)</code>.</li>' +
          '</ol>',
      },
      {
        heading: 'Phân biệt quan trọng',
        bodyHtml: '<p><strong>Gộp vùng trống</strong> là nối các block liền nhau trên đĩa. <strong>Gộp nút (Merge)</strong> là thao tác cân bằng nút trong B-tree.</p>',
      },
    ],
    references: XFS_REFS,
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Ví dụ cụ thể:</span> Cấp phát rồi thu hồi</h1>
            <p class="slide-lead">XFS lấy 10 block đầu của vùng (400, 12). Hai cây phải cùng phản ánh vùng trống mới.</p>
          </div>
          <div class="btn-row">
            <button type="button" class="inline-action-btn" data-s29-sim="0">1. Ban đầu</button>
            <button type="button" class="inline-action-btn" data-s29-sim="2">2. Cấp 10 block</button>
            <button type="button" class="inline-action-btn" data-s29-sim="3">3. Thu hồi</button>
            <button type="button" class="inline-action-btn" data-role="goto-toc">Mục lục</button>
          </div>
        </header>

        <div class="s29-layout">
          <div class="s29-strips">
            <div class="canva-card s29-stage-row" data-s29-row="1">
              <div class="s29-row-head"><strong>1. Trước khi cấp: trống 12 block</strong><span data-role="req-tag">Toàn bộ 400–411 đang trống</span></div>
              ${xfsBlockRowHtml(Array(12).fill('free'), { labels: ADDR_400_411 })}
            </div>

            <div class="canva-card s29-stage-row" data-s29-row="2">
              <div class="s29-row-head"><strong>2. Cấp cho tệp 10 block (400–409)</strong><span>Xanh: đã cấp 400–409 · Vàng: 410–411 còn trống (nhấn 409 hoặc 410 để kiểm tra)</span></div>
              ${xfsBlockRowHtml(
                ADDR_400_411.map((a) => (a <= 409 ? 'used' : 'free')),
                { labels: ADDR_400_411, highlightRange: [400, 409], cutAfterAddr: 409 },
              )}
              <div class="s29-probe-out" data-role="probe-out"></div>
            </div>

            <div class="canva-card s29-stage-row" data-s29-row="3">
              <div class="s29-row-head"><strong>3. Khi tệp trả lại 400–409</strong><span class="badge-ok">400 + 10 = 410 → Gộp thành 400–411</span></div>
              ${xfsBlockRowHtml(Array(12).fill('free'), { labels: ADDR_400_411 })}
            </div>
          </div>

          <aside class="s29-right">
            <div class="canva-card s29-index-box">
              <h3>Bản ghi đổi ra sao?</h3>
              <div class="idx-row" data-idx="bnobt">
                <div class="idx-name"><strong>bnobt</strong> <small>(block đầu, độ dài)</small></div>
                <div class="idx-val" data-role="bnobt-val">(400, 12)</div>
              </div>
              <div class="idx-row" data-idx="cntbt">
                <div class="idx-name"><strong>cntbt</strong> <small>(độ dài, block đầu)</small></div>
                <div class="idx-val" data-role="cntbt-val">(12, 400)</div>
              </div>
              <p class="idx-note">Cả <code>bnobt</code> và <code>cntbt</code> đều cập nhật đồng bộ theo đúng thứ tự trường.</p>
            </div>

            <div class="canva-card s29-qa" data-role="qa-box">
              <div class="qa-kicker">Hỏi đáp · Nhóm 10</div>
              <p class="qa-q"><strong>Câu hỏi chốt:</strong> Vừa rồi, thứ được gộp là <em>vùng block</em> hay <em>nút cây</em>?</p>
              <button type="button" class="inline-action-btn inline-action-btn--primary" data-role="reveal-ans">Hiện đáp án</button>
              <div class="qa-ans" data-role="qa-ans" hidden>
                <strong>Hai vùng trống liền kề trên đĩa (400–409 + 410–411 → 400–411)!</strong><br/>
                <small>Gộp vùng trống là nối các block liền nhau. Gộp nút là thao tác cân bằng cây.</small>
              </div>
            </div>
          </aside>
        </div>

        <div class="xfs-conclusion-strip s29-closing-strip">
          <strong>Gộp vùng trống = nối block liền nhau · Gộp nút = cân bằng cây</strong>
          <div class="s29-pillars">
            <span>01 Cân bằng O(log N)</span>
            <span>02 Tối ưu I/O trang đĩa</span>
            <span>03 B+ / B* / XFS</span>
          </div>
          <span>Cảm ơn thầy cô &amp; các bạn!</span>
        </div>
      </div>
    `;

    ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="goto-toc"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      ctx.goToSlide(2);
    });

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-s29-sim]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderSlide29State(Number(btn.dataset.s29Sim), ctx.slideEl, ctx.getReducedMotion());
      });
    });

    const ansBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="reveal-ans"]')!;
    const ansBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="qa-ans"]')!;
    ansBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ansBox.hidden = !ansBox.hidden;
      ansBtn.textContent = ansBox.hidden ? 'Hiện đáp án' : 'Ẩn đáp án';
    });

    // Click block 409 or 410 (or any block in row 2) to inspect status without advancing slide
    const row2 = ctx.slideEl.querySelector<HTMLElement>('[data-s29-row="2"]')!;
    const probeOut = ctx.slideEl.querySelector<HTMLElement>('[data-role="probe-out"]')!;
    row2.querySelectorAll<HTMLButtonElement>('.xfs-cell').forEach((cell) => {
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        const addr = Number(cell.dataset.blockAddr);
        const isAlloc = addr <= 409;
        probeOut.innerHTML = isAlloc
          ? `Block <strong>${addr}</strong>: <span class="badge-cobalt">Đã cấp cho tệp</span> (nằm trong đoạn 400–409).`
          : `Block <strong>${addr}</strong>: <span class="badge-warn">Còn trống</span> (nằm trong phần dư 410–411, ranh giới 409 | 410).`;
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderSlide29State(step, ctx.slideEl, ctx.getReducedMotion());
  },
};

function renderSlide29State(step: number, slideEl: HTMLElement, reducedMotion: boolean): void {
  const r1 = slideEl.querySelector<HTMLElement>('[data-s29-row="1"]')!;
  const r2 = slideEl.querySelector<HTMLElement>('[data-s29-row="2"]')!;
  const r3 = slideEl.querySelector<HTMLElement>('[data-s29-row="3"]')!;
  const reqTag = slideEl.querySelector<HTMLElement>('[data-role="req-tag"]')!;
  const bnoVal = slideEl.querySelector<HTMLElement>('[data-role="bnobt-val"]')!;
  const cntVal = slideEl.querySelector<HTMLElement>('[data-role="cntbt-val"]')!;
  const qaBox = slideEl.querySelector<HTMLElement>('[data-role="qa-box"]')!;
  const ansBox = slideEl.querySelector<HTMLElement>('[data-role="qa-ans"]')!;
  const ansBtn = slideEl.querySelector<HTMLButtonElement>('[data-role="reveal-ans"]')!;

  slideEl.querySelectorAll<HTMLButtonElement>('[data-s29-sim]').forEach((btn) => {
    const s = Number(btn.dataset.s29Sim);
    const active = (s === 0 && step <= 1) || (s === 2 && step === 2) || (s === 3 && step >= 3);
    btn.classList.toggle('inline-action-btn--primary', active);
  });

  r1.classList.toggle('is-active-card', step <= 1);
  r2.classList.toggle('is-dim', step < 2);
  r2.classList.toggle('is-active-card', step === 2);
  r3.classList.toggle('is-dim', step < 3);
  r3.classList.toggle('is-active-card', step === 3);
  qaBox.classList.toggle('is-dim', step < 4);
  qaBox.classList.toggle('is-active-card', step === 4);

  if (step === 0) {
    reqTag.textContent = 'Toàn bộ đoạn 400–411 đang trống (12 block)';
    bnoVal.innerHTML = '(400, 12)';
    cntVal.innerHTML = '(12, 400)';
    ansBox.hidden = true;
    ansBtn.textContent = 'Hiện đáp án';
  } else if (step === 1) {
    reqTag.innerHTML = 'Yêu cầu <strong>10 block</strong> → block cuối được cấp sẽ là?';
    bnoVal.innerHTML = '(400, 12)';
    cntVal.innerHTML = '(12, 400)';
  } else if (step === 2) {
    reqTag.textContent = 'Đã cắt 10 block đầu (400–409)';
    bnoVal.innerHTML = '<del>(400, 12)</del> → <strong>(410, 2)</strong>';
    cntVal.innerHTML = '<del>(12, 400)</del> → <strong>(2, 410)</strong>';
  } else {
    reqTag.textContent = 'Đối chiếu đủ 3 mốc thời gian';
    bnoVal.innerHTML = '<del>(410, 2)</del> → <strong class="val-ok">(400, 12)</strong>';
    cntVal.innerHTML = '<del>(2, 410)</del> → <strong class="val-ok">(12, 400)</strong>';
  }

  if (!reducedMotion && (step === 2 || step === 3)) {
    slideEl.querySelectorAll<HTMLElement>('.idx-row').forEach((row) => {
      row.classList.remove('step-flash');
      void row.offsetWidth;
      row.classList.add('step-flash');
    });
  }
}

export const PART5_SLIDES: SlideDef[] = [slide22, slide23, slide24, slide25, slide26, slide27, slide28, slide29];
