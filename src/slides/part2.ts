import type { SlideDef, TreeSceneSpec } from '../types';
import { texInline } from '../math';
import { renderTreeScene, cancelTreeAnimations } from '../svg/treeRenderer';

// ============================================================================
// SLIDE 06 — Tìm kiếm khóa 17 (+ nút "Thử 16")
// ============================================================================
const slide06: SlideDef = {
  number: 6,
  title: 'Tìm kiếm khóa 17',
  chapter: '2. Các phép toán trong B-tree',
  chapterStart: 6,
  theme: 'white',
  stepCount: 3,
  leadIn: '“Đến đúng lá đã đủ để kết luận tìm thấy chưa?” (Thử 16: cùng xuống lá [12|17], vị trí ứng viên chứa 17 ≠ 16 nên trả None.)',
  fullScript:
    'Bây giờ chúng ta đi sâu vào cách hoạt động của các phép toán trong B-tree, bắt đầu với phép toán đơn giản nhất: Tìm kiếm. Quy tắc: xuất phát từ gốc, tìm vị trí i đầu tiên có keys[i] >= k (nếu không có, đặt i bằng số khóa). Nếu i < số khóa và keys[i] = k thì trả về vị trí tìm thấy; ngược lại, nếu là nút lá thì trả None, còn nút trong đi xuống children[i]. Ví dụ tìm khóa 17: ở gốc 10, vì 17 > 10 nên i = 1, rẽ phải xuống [20]; tại đây 17 < 20 nên i = 0, rẽ trái xuống lá [12 | 17] và tìm thấy 17 ở vị trí chỉ số 1 (ô thứ hai). Thử tìm 16: cùng xuống lá [12 | 17], vị trí ứng viên chứa 17 ≠ 16 nên trả về None.',
  fullView: {
    summary: 'Quy tắc tìm kiếm Search(k) và minh họa từng bước cho Search(17) (tìm thấy) cùng Search(16) (tìm hụt).',
    sections: [
      {
        heading: 'Ba quy tắc của Search(k)',
        bodyHtml:
          '<ol>' +
          '<li>Tìm vị trí <code>i</code> đầu tiên có <code>keys[i] >= k</code>. Nếu không có, đặt <code>i = len(keys)</code>.</li>' +
          '<li>Nếu <code>i < len(keys)</code> và <code>keys[i] == k</code> → trả về <code>(node, i)</code>.</li>' +
          '<li>Nếu chưa thấy: nút lá trả <code>None</code>; nút trong đi xuống <code>children[i]</code>.</li>' +
          '</ol>',
      },
      {
        heading: 'So sánh Search(17) và Search(16)',
        bodyHtml:
          '<p><strong>Search(17):</strong> <code>[10] (i=1)</code> → <code>[20] (i=0)</code> → <code>[12|17] (i=1, keys[1]=17)</code> → trả <code>(lá [12|17], 1)</code> (ô thứ hai theo chỉ số từ 0).</p>' +
          '<p><strong>Search(16):</strong> đi đúng cùng đường xuống <code>[12|17]</code>, tìm được <code>i=1</code> vì <code>17 ≥ 16</code>, nhưng <code>17 ≠ 16</code> và đang ở lá → trả <code>None</code>.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <div class="slide-chapter-head">2. Các phép toán trong B-tree</div>
            <h1 class="slide-title slide-title--sub"><span>Tìm kiếm:</span> Search(k)</h1>
          </div>
          <button type="button" class="inline-action-btn" data-role="try16-btn">Thử 16 (tìm hụt)</button>
        </header>

        <div class="s06-grid">
          <div class="s06-left">
            <div class="canva-card s06-rules">
              <h3>Quy tắc tìm kiếm</h3>
              <ol class="rule-list">
                <li data-rule="1"><span class="rule-num">1</span><span>Tìm vị trí <code>i</code> đầu tiên có <code>keys[i] ≥ k</code> (nếu không có đặt <code>i = len(keys)</code>).</span></li>
                <li data-rule="2"><span class="rule-num">2</span><span>Nếu <code>i &lt; len(keys)</code> và <code>keys[i] == k</code> → trả <code>(node, i)</code>.</span></li>
                <li data-rule="3"><span class="rule-num">3</span><span>Chưa thấy: nút lá trả <code>None</code>; nút trong đi xuống <code>children[i]</code>.</span></li>
              </ol>
            </div>

            <div class="s06-crumbs" data-role="crumbs">
              <div class="crumb-card" data-crumb="1"><strong>Mốc 1 · Gốc [10]</strong><span>17 &gt; 10 → <code>i = 1</code>, rẽ phải</span></div>
              <div class="crumb-card" data-crumb="2"><strong>Mốc 2 · Nút [20]</strong><span>17 &lt; 20 → <code>i = 0</code>, rẽ trái</span></div>
              <div class="crumb-card" data-crumb="3"><strong>Mốc 3 · Lá [12|17]</strong><span><code>i = 1</code>, <code>keys[1] = 17</code></span></div>
            </div>
          </div>

          <div class="s06-right">
            <div class="s06-tree-wrap" data-role="tree"></div>
            <div class="s06-result-bar" data-role="result">Xuất phát tại gốc <code>[10]</code> với <code>k = 17</code>.</div>
          </div>
        </div>

        <!-- Try 16 interactive sandbox overlay (does not advance main slide) -->
        <div class="mini-drawer" data-role="try16-drawer" hidden>
          <div class="mini-drawer__card">
            <div class="mini-drawer__head">
              <strong>Thử nghiệm tương tác: <code>Search(16)</code></strong>
              <button type="button" class="mini-btn" data-role="try16-close">✕ Đóng &amp; về Search(17)</button>
            </div>
            <div class="mini-drawer__tree" data-role="try16-tree"></div>
            <div class="mini-drawer__foot">
              <span data-role="try16-msg">Bước 0: Bắt đầu tìm <code>16</code> tại gốc <code>[10]</code>.</span>
              <div class="mini-drawer__btns">
                <button type="button" class="mini-btn" data-role="try16-prev">← Lùi</button>
                <button type="button" class="mini-btn mini-btn--primary" data-role="try16-next">Bước tiếp →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire "Thử 16" interactive mini-stepper
    const drawer = ctx.slideEl.querySelector<HTMLElement>('[data-role="try16-drawer"]')!;
    const openBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="try16-btn"]')!;
    const closeBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="try16-close"]')!;
    const prevBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="try16-prev"]')!;
    const nextBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="try16-next"]')!;
    const tTree = ctx.slideEl.querySelector<HTMLElement>('[data-role="try16-tree"]')!;
    const tMsg = ctx.slideEl.querySelector<HTMLElement>('[data-role="try16-msg"]')!;

    let t16Step = 0;

    const render16 = () => {
      const scene16 = buildSearchScene(t16Step, 16);
      renderTreeScene(tTree, scene16, { reducedMotion: ctx.getReducedMotion() });
      const msgs = [
        'Bước 0/3: Tìm <code>16</code> từ gốc <code>[10]</code>.',
        'Bước 1/3: Tại <code>[10]</code>, <code>16 &gt; 10</code> → <code>i = 1</code>, rẽ phải tới <code>[20]</code>.',
        'Bước 2/3: Tại <code>[20]</code>, <code>16 &lt; 20</code> → <code>i = 0</code>, rẽ trái xuống lá <code>[12 | 17]</code>.',
        'Bước 3/3: Tại lá <code>[12 | 17]</code>, <code>i = 1</code> (vì <code>17 ≥ 16</code>) nhưng <strong><code>17 ≠ 16</code></strong> → trả về <code>None</code>!',
      ];
      tMsg.innerHTML = msgs[t16Step];
      prevBtn.disabled = t16Step === 0;
      nextBtn.disabled = t16Step === 3;
    };

    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      t16Step = 0;
      drawer.hidden = false;
      render16();
    });
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawer.hidden = true;
    });
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (t16Step > 0) { t16Step--; render16(); }
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (t16Step < 3) { t16Step++; render16(); }
    });
    drawer.addEventListener('click', (e) => e.stopPropagation());
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const res = ctx.slideEl.querySelector<HTMLElement>('[data-role="result"]')!;
    const crumbs = ctx.slideEl.querySelectorAll<HTMLElement>('.crumb-card');

    crumbs.forEach((c) => {
      const n = Number(c.dataset.crumb);
      c.classList.toggle('is-shown', step >= n);
      c.classList.toggle('is-current', step === n);
    });

    renderTreeScene(treeBox, buildSearchScene(step, 17), { reducedMotion: ctx.getReducedMotion() });

    const messages = [
      'Khung mở: Cây tìm kiếm bậc M = 3, xuất phát tại gốc <code>[10]</code> với khóa <code>k = 17</code>.',
      'Tại <code>[10]</code>: vị trí chèn trái của 17 là <code>i = 1</code> → đi xuống <code>children[1] = [20]</code>.',
      'Tại <code>[20]</code>: <code>17 &lt; 20</code> nên <code>i = 0</code> → đi xuống <code>children[0] = [12 | 17]</code>.',
      '<strong>Tìm thấy:</strong> trả về <code>(lá [12 | 17], 1)</code> — ô thứ hai khi chỉ số bắt đầu từ 0.',
    ];
    res.innerHTML = messages[step];
    res.classList.toggle('is-success', step === 3);
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function buildSearchScene(step: number, targetKey: number): TreeSceneSpec {
  const isMiss = targetKey === 16;
  const muteOthers = step >= 2;
  return {
    viewBox: [0, 0, 660, 340],
    nodes: [
      {
        id: 's-root',
        x: 330,
        y: 52,
        cellW: 58,
        cellH: 42,
        state: step >= 1 ? 'active' : 'normal',
        tag: step >= 1 ? `k=${targetKey} > 10 → i=1` : `Tìm k = ${targetKey}`,
        tagTone: step >= 1 ? 'cobalt' : 'default',
        keys: [{ id: 'sk-10', label: '10', tone: step === 1 ? 'active' : 'default' }],
      },
      {
        id: 's-i0',
        x: 170,
        y: 156,
        cellW: 56,
        cellH: 40,
        state: muteOthers ? 'muted' : 'normal',
        keys: [{ id: 'sk-5', label: '5', tone: muteOthers ? 'muted' : 'default' }],
      },
      {
        id: 's-i1',
        x: 490,
        y: 156,
        cellW: 56,
        cellH: 40,
        state: step >= 1 ? 'active' : 'normal',
        tag: step >= 2 ? `k=${targetKey} < 20 → i=0` : undefined,
        tagPos: 'right',
        tagTone: 'cobalt',
        keys: [{ id: 'sk-20', label: '20', tone: step === 2 ? 'active' : 'default' }],
      },
      {
        id: 's-l0',
        x: 84,
        y: 266,
        cellW: 48,
        cellH: 38,
        state: muteOthers ? 'muted' : 'normal',
        keys: [
          { id: 'sk-1', label: '1', tone: muteOthers ? 'muted' : 'default' },
          { id: 'sk-3', label: '3', tone: muteOthers ? 'muted' : 'default' },
        ],
      },
      {
        id: 's-l1',
        x: 244,
        y: 266,
        cellW: 48,
        cellH: 38,
        state: muteOthers ? 'muted' : 'normal',
        keys: [
          { id: 'sk-6', label: '6', tone: muteOthers ? 'muted' : 'default' },
          { id: 'sk-8', label: '8', tone: muteOthers ? 'muted' : 'default' },
        ],
      },
      {
        id: 's-l2',
        x: 410,
        y: 266,
        cellW: 52,
        cellH: 40,
        state: step === 3 ? (isMiss ? 'underflow' : 'success') : step === 2 ? 'active' : 'normal',
        tag:
          step === 3
            ? isMiss
              ? '17 ≥ 16 nhưng 17 ≠ 16 → None'
              : 'i = 1 (ô thứ hai) → Tìm thấy'
            : undefined,
        tagPos: 'bottom',
        tagTone: isMiss ? 'error' : 'success',
        keys: [
          { id: 'sk-12', label: '12', sublabel: step === 3 ? 'i=0' : undefined },
          {
            id: 'sk-17',
            label: '17',
            sublabel: step === 3 ? 'i=1' : undefined,
            tone: step === 3 ? (isMiss ? 'error' : 'success') : 'default',
          },
        ],
      },
      {
        id: 's-l3',
        x: 572,
        y: 266,
        cellW: 48,
        cellH: 38,
        state: muteOthers ? 'muted' : 'normal',
        keys: [
          { id: 'sk-25', label: '25', tone: muteOthers ? 'muted' : 'default' },
          { id: 'sk-30', label: '30', tone: muteOthers ? 'muted' : 'default' },
        ],
      },
    ],
    edges: [
      { id: 'se-r0', fromNode: 's-root', portIndex: 0, toNode: 's-i0', state: muteOthers ? 'muted' : 'normal' },
      { id: 'se-r1', fromNode: 's-root', portIndex: 1, toNode: 's-i1', state: step >= 1 ? 'active' : 'normal', arrow: step >= 1, label: step >= 1 ? 'i = 1' : undefined },
      { id: 'se-00', fromNode: 's-i0', portIndex: 0, toNode: 's-l0', state: muteOthers ? 'muted' : 'normal' },
      { id: 'se-01', fromNode: 's-i0', portIndex: 1, toNode: 's-l1', state: muteOthers ? 'muted' : 'normal' },
      { id: 'se-10', fromNode: 's-i1', portIndex: 0, toNode: 's-l2', state: step >= 2 ? 'active' : 'normal', arrow: step >= 2, label: step >= 2 ? 'i = 0' : undefined },
      { id: 'se-11', fromNode: 's-i1', portIndex: 1, toNode: 's-l3', state: muteOthers ? 'muted' : 'normal' },
    ],
  };
}

// ============================================================================
// SLIDE 07 — Chèn khi còn chỗ và khi tràn
// ============================================================================
const slide07: SlideDef = {
  number: 7,
  title: 'Chèn khi còn chỗ và khi tràn',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Nhóm chọn khóa giữa bên phải khi có bốn khóa. Chính quy ước này cho kết quả 25. Nếu một lá nằm sâu hơn bị tràn, khóa giữa sẽ đi đâu?”',
  fullScript:
    'Thao tác chèn khóa là nơi B-tree thể hiện sự khác biệt hoàn toàn so với cây nhị phân. Thay vì mọc dài xuống dưới, B-tree mọc từ dưới lên (bottom-up) để giữ mọi lá cùng mức. Với M = 4 (tối đa 3 khóa/nút, nút khác gốc tối thiểu 1 khóa): Trường hợp 1, lá đang có [10 | 30], chèn 20 còn chỗ trống nên dịch 30 sang phải và đặt 20 vào giữa thành [10 | 20 | 30]. Trường hợp 2, chèn tiếp 25 khiến lá tràn 4 > 3 khóa: [10 | 20 | 25 | 30]. Ta tách đôi theo quy ước mid = len(keys)//2 = 2 (khóa 25), đẩy 25 lên tạo gốc mới, hai lá còn [10 | 20] và [30] nằm trên cùng một mức.',
  fullView: {
    summary: 'Quy trình chèn Insert(k) theo cơ chế Bottom-up và tách nút (Split) khi tràn với M = 4.',
    sections: [
      {
        heading: 'Tham số ví dụ (M = 4)',
        bodyHtml:
          '<ul><li>Tối đa 4 nhánh con, tối đa <strong>3 khóa/nút</strong>.</li><li>Nút khác gốc tối thiểu <code>⌈4/2⌉ − 1 = 1</code> khóa.</li><li>Quy ước chọn khóa giữa: <code>mid = len(keys) // 2</code> (với 4 khóa chọn chỉ số 2 là khóa giữa bên phải).</li></ul>',
      },
      {
        heading: 'Hai trường hợp minh họa',
        bodyHtml:
          '<p><strong>Còn chỗ:</strong> <code>[10|30]</code> + chèn <code>20</code> → dịch 30 sang phải → <code>[10|20|30]</code>.</p>' +
          '<p><strong>Tràn khóa (Overflow):</strong> <code>[10|20|30]</code> + chèn <code>25</code> → tạm <code>[10|20|25|30]</code> (4 &gt; 3) → đẩy <strong>25</strong> lên gốc mới, hai lá <code>[10|20]</code> và <code>[30]</code>.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Chèn khóa:</span> Insert(k)</h1>
          <p class="slide-lead">Khác với cây nhị phân thông thường, B-tree có thể tăng chiều cao bằng cách tạo một root mới.</p>
        </header>

        <div class="s07-grid">
          <div class="s07-left">
            <div class="s07-stage" data-role="tree"></div>
            <div class="canva-card s07-bottomup">
              <strong>Bottom-up — Cây mọc từ dưới lên:</strong>
              <span>Khác với BST gắn nút dưới đáy, B-tree chỉ tăng chiều cao bằng cách <strong>tách gốc</strong> và tạo gốc mới ở trên.</span>
            </div>
          </div>

          <aside class="s07-right">
            <div class="canva-card">
              <h3>Quy trình chèn khóa</h3>
              <ol class="compact-list">
                <li>Đi từ gốc xuống nút lá thích hợp và chèn <code>k</code> theo thứ tự.</li>
                <li>Không tràn (<code>≤ M−1</code>) → <strong>kết thúc</strong>.</li>
                <li>Tràn (<code>&gt; M−1</code>) → <strong>Split</strong>, đẩy khóa <code>mid = len // 2</code> lên nút cha.</li>
                <li>Lặp kiểm tra lên cha; nếu gốc tràn thì tách và tạo gốc mới.</li>
              </ol>
            </div>
            <div class="canva-card s07-status" data-role="status">
              <strong>Tham số M = 4:</strong> tối đa 4 nhánh, tối đa 3 khóa, nút khác gốc tối thiểu ${texInline('\\lceil 4/2 \\rceil - 1 = 1')} khóa.
            </div>
          </aside>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const status = ctx.slideEl.querySelector<HTMLElement>('[data-role="status"]')!;

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 680, 310],
            nodes: [
              {
                id: 'n7-leaf',
                x: 340,
                y: 175,
                capacity: 3,
                cellW: 72,
                cellH: 52,
                tag: 'Lá còn 1 ô trống (2 / 3 khóa)',
                tagTone: 'cobalt',
                keys: [
                  { id: 'i7-10', label: '10' },
                  { id: 'i7-30', label: '30' },
                ],
              },
            ],
            edges: [],
            chips: [{ id: 'ch-20', x: 140, y: 74, text: 'Chèn 20', tone: 'active' }],
          }
        : step === 1
          ? {
              viewBox: [0, 0, 680, 310],
              nodes: [
                {
                  id: 'n7-leaf',
                  x: 340,
                  y: 175,
                  capacity: 3,
                  cellW: 72,
                  cellH: 52,
                  state: 'success',
                  tag: '3 / 3 khóa · Không tràn (chiều cao giữ nguyên)',
                  tagTone: 'success',
                  keys: [
                    { id: 'i7-10', label: '10' },
                    { id: 'i7-20', label: '20', tone: 'success' },
                    { id: 'i7-30', label: '30' },
                  ],
                },
              ],
              edges: [],
              chips: [{ id: 'ch-25', x: 540, y: 74, text: 'Tiếp: chèn 25?', tone: 'warn' as 'active' }],
            }
          : step === 2
            ? {
                viewBox: [0, 0, 680, 310],
                nodes: [
                  {
                    id: 'n7-leaf',
                    x: 340,
                    y: 175,
                    cellW: 72,
                    cellH: 52,
                    state: 'overflow',
                    tag: 'TRÀN KHÓA: 4 > 3 · Chọn mid = 4//2 = 2 (khóa 25)',
                    tagTone: 'error',
                    keys: [
                      { id: 'i7-10', label: '10' },
                      { id: 'i7-20', label: '20' },
                      { id: 'i7-25', label: '25', tone: 'active', badge: 'mid' },
                      { id: 'i7-30', label: '30', tone: 'error' },
                    ],
                  },
                ],
                edges: [],
                overlaySvg: `
                  <line x1="340" y1="128" x2="340" y2="218" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="5 3" />
                  <line x1="412" y1="128" x2="412" y2="218" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="5 3" />
                  <rect x="412" y="138" width="78" height="72" rx="6" fill="none" stroke="#DC2626" stroke-width="2" stroke-dasharray="4 3" />
                  <text x="451" y="232" text-anchor="middle" fill="#B91C1C" font-size="12" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Vượt giới hạn 3 ô!</text>
                `,
              }
            : {
                viewBox: [0, 0, 680, 310],
                nodes: [
                  {
                    id: 'n7-root',
                    x: 340,
                    y: 68,
                    cellW: 70,
                    cellH: 48,
                    state: 'success',
                    tag: 'Gốc mới tạo từ khóa giữa 25',
                    tagTone: 'success',
                    keys: [{ id: 'i7-25', label: '25', tone: 'success' }],
                  },
                  {
                    id: 'n7-left',
                    x: 205,
                    y: 196,
                    cellW: 66,
                    cellH: 46,
                    keys: [
                      { id: 'i7-10', label: '10' },
                      { id: 'i7-20', label: '20' },
                    ],
                  },
                  {
                    id: 'n7-right',
                    x: 475,
                    y: 196,
                    cellW: 66,
                    cellH: 46,
                    keys: [{ id: 'i7-30', label: '30' }],
                  },
                ],
                edges: [
                  { id: 'e7-l', fromNode: 'n7-root', portIndex: 0, toNode: 'n7-left', state: 'active', arrow: true },
                  { id: 'e7-r', fromNode: 'n7-root', portIndex: 1, toNode: 'n7-right', state: 'active', arrow: true },
                ],
                baselineY: { y: 244, x1: 85, x2: 595, label: 'Mọi nút lá vẫn ở cùng một mức (h = 1)' },
              };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion(), durationMs: 520 });

    const msgs = [
      '<strong>M = 4:</strong> lá <code>[10 | 30]</code> còn 1 ô trống; chuẩn bị chèn khóa <code>20</code>.',
      '<strong>Nhịp 1:</strong> dịch <code>30</code> sang phải, đặt <code>20</code> vào giữa → <code>[10 | 20 | 30]</code>. Cây chưa tăng chiều cao.',
      '<strong>Nhịp 2:</strong> chèn <code>25</code> tạo <code>[10 | 20 | 25 | 30]</code> (<strong>4 &gt; 3</strong>). Quy ước <code>len//2 = 2</code> chọn khóa <strong>25</strong> để đẩy lên.',
      '<strong>Nhịp 3:</strong> tách thành <code>[10 | 20]</code> và <code>[30]</code>, đẩy <strong>25</strong> lên làm gốc mới. Nếu lá nằm sâu hơn bị tràn, khóa giữa sẽ đi lên <em>nút cha</em>.',
    ];
    status.innerHTML = msgs[step];
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 08 — Chèn 72 gây split dây chuyền
// ============================================================================
const slide08: SlideDef = {
  number: 8,
  title: 'Chèn 72 gây split dây chuyền',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Ở click trước, ta đã tách một lá mà cây vẫn cao như cũ. Chính lần tách gốc này mới thêm một tầng.”',
  fullScript:
    'Nếu khóa được đẩy lên lại rơi đúng vào một nút cha cũng đang đầy thì sao? Lúc này sẽ xảy ra hiện tượng tách dây chuyền từ dưới lên tận gốc. Khi thêm 72 vào cây M = 4 có gốc [30 | 50 | 75], khóa 72 theo khoảng (50, 75) đi vào lá thứ ba tạo [52 | 60 | 65 | 72] bị tràn. Tách lá thành [52 | 60] và [72], đẩy khóa giữa 65 lên gốc tạo [30 | 50 | 65 | 75] — gốc cũng bị tràn! Tiếp tục tách gốc: 65 lên tạo gốc mới, [30 | 50] giữ ba con đầu và [75] giữ hai con cuối. Chiều cao h chỉ tăng từ 1 lên 2 đúng khi nút gốc bị tách.',
  fullView: {
    summary: 'Ví dụ tách dây chuyền (cascading split) khi chèn 72 vào cây M = 4 đầy gốc.',
    sections: [
      {
        heading: 'Bốn mốc của phép Insert(72)',
        bodyHtml:
          '<ol>' +
          '<li><strong>Trước khi chèn (h = 1):</strong> Gốc <code>[30|50|75]</code>; 4 lá <code>[10|20]</code>, <code>[40]</code>, <code>[52|60|65]</code>, <code>[80|91]</code>.</li>' +
          '<li><strong>Lá tràn:</strong> 72 vào khoảng (50, 75) → <code>[52|60|65|72]</code> (4 &gt; 3).</li>' +
          '<li><strong>Gốc tràn:</strong> Tách lá thành <code>[52|60]</code> và <code>[72]</code>; đẩy <strong>65</strong> lên gốc → <code>[30|50|65|75]</code> (4 &gt; 3).</li>' +
          '<li><strong>Tạo gốc mới (h = 2):</strong> Tách gốc đẩy <strong>65</strong> lên làm gốc mới; con trái <code>[30|50]</code> giữ 3 lá đầu, con phải <code>[75]</code> giữ 2 lá cuối.</li>' +
          '</ol>',
      },
      {
        heading: 'Kết luận cốt lõi',
        bodyHtml: '<p>Một lần chèn có thể gây split dây chuyền từ lá lên gốc, và <strong>chiều cao cây chỉ tăng khi gốc bị tách</strong>.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Chèn và split</span> dây chuyền</h1>
            <p class="slide-lead">Split không chỉ xảy ra ở lá</p>
          </div>
          <div class="height-pill" data-role="h-pill">Chiều cao: <strong>h = 1</strong></div>
        </header>

        <div class="s08-layout">
          <aside class="s08-sidebar">
            <div class="s08-sidebar__title">Kết luận</div>
            <p>Một lần chèn có thể gây <strong>split dây chuyền</strong> từ lá lên gốc.</p>
            <p><strong>Chiều cao cây chỉ tăng khi nút gốc bị tách.</strong></p>
            <p>Sau xử lý, mọi khóa vẫn giữ đúng thứ tự và mọi nút lá nằm cùng độ sâu.</p>
            <div class="s08-milestones" data-role="milestones">
              <div class="ms-pill" data-ms="0">0. Trước khi chèn (h=1)</div>
              <div class="ms-pill" data-ms="1">1. Lá [52|60|65|72] tràn</div>
              <div class="ms-pill" data-ms="2">2. Gốc [30|50|65|75] tràn</div>
              <div class="ms-pill" data-ms="3">3. Tạo gốc mới [65] (h=2)</div>
            </div>
          </aside>

          <div class="s08-stage-col">
            <div class="s08-tree" data-role="tree"></div>
            <div class="s08-caption" data-role="caption"></div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const hPill = ctx.slideEl.querySelector<HTMLElement>('[data-role="h-pill"]')!;
    const cap = ctx.slideEl.querySelector<HTMLElement>('[data-role="caption"]')!;
    const pills = ctx.slideEl.querySelectorAll<HTMLElement>('.ms-pill');

    pills.forEach((p) => {
      const m = Number(p.dataset.ms);
      p.classList.toggle('is-done', m < step);
      p.classList.toggle('is-now', m === step);
    });

    hPill.innerHTML = step === 3 ? 'Chiều cao: <strong>h = 2 (+1 tầng)</strong>' : 'Chiều cao: <strong>h = 1</strong>';
    hPill.classList.toggle('is-changed', step === 3);

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 860, 380],
            nodes: [
              {
                id: 'r8',
                x: 430,
                y: 120,
                cellW: 56,
                cellH: 44,
                tag: 'Gốc đã đầy (3 / 3 khóa)',
                tagTone: 'warn',
                keys: [
                  { id: 'c8-30', label: '30' },
                  { id: 'c8-50', label: '50' },
                  { id: 'c8-75', label: '75' },
                ],
              },
              { id: 'l8-0', x: 110, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-10', label: '10' }, { id: 'c8-20', label: '20' }] },
              { id: 'l8-1', x: 270, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-40', label: '40' }] },
              { id: 'l8-2', x: 475, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-52', label: '52' }, { id: 'c8-60', label: '60' }, { id: 'c8-65', label: '65' }] },
              { id: 'l8-3', x: 720, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-80', label: '80' }, { id: 'c8-91', label: '91' }] },
            ],
            edges: [
              { id: 'e8-0', fromNode: 'r8', portIndex: 0, toNode: 'l8-0' },
              { id: 'e8-1', fromNode: 'r8', portIndex: 1, toNode: 'l8-1' },
              { id: 'e8-2', fromNode: 'r8', portIndex: 2, toNode: 'l8-2' },
              { id: 'e8-3', fromNode: 'r8', portIndex: 3, toNode: 'l8-3' },
            ],
            chips: [{ id: 'ch-72', x: 740, y: 60, text: 'Insert(72)', tone: 'active' }],
          }
        : step === 1
          ? {
              viewBox: [0, 0, 860, 380],
              nodes: [
                {
                  id: 'r8',
                  x: 430,
                  y: 120,
                  cellW: 56,
                  cellH: 44,
                  keys: [
                    { id: 'c8-30', label: '30' },
                    { id: 'c8-50', label: '50' },
                    { id: 'c8-75', label: '75' },
                  ],
                },
                { id: 'l8-0', x: 100, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-10', label: '10' }, { id: 'c8-20', label: '20' }] },
                { id: 'l8-1', x: 245, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-40', label: '40' }] },
                {
                  id: 'l8-2',
                  x: 485,
                  y: 280,
                  cellW: 50,
                  cellH: 42,
                  state: 'overflow',
                  tag: 'Lá tràn (4 > 3) · mid = 65',
                  tagPos: 'bottom',
                  tagTone: 'error',
                  keys: [
                    { id: 'c8-52', label: '52' },
                    { id: 'c8-60', label: '60' },
                    { id: 'c8-65', label: '65', tone: 'active', badge: 'mid' },
                    { id: 'c8-72', label: '72', tone: 'active' },
                  ],
                },
                { id: 'l8-3', x: 745, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-80', label: '80' }, { id: 'c8-91', label: '91' }] },
              ],
              edges: [
                { id: 'e8-0', fromNode: 'r8', portIndex: 0, toNode: 'l8-0' },
                { id: 'e8-1', fromNode: 'r8', portIndex: 1, toNode: 'l8-1' },
                { id: 'e8-2', fromNode: 'r8', portIndex: 2, toNode: 'l8-2', state: 'active', arrow: true, label: '50 < 72 < 75' },
                { id: 'e8-3', fromNode: 'r8', portIndex: 3, toNode: 'l8-3' },
              ],
            }
          : step === 2
            ? {
                viewBox: [0, 0, 860, 380],
                nodes: [
                  {
                    id: 'r8',
                    x: 430,
                    y: 120,
                    cellW: 56,
                    cellH: 44,
                    state: 'overflow',
                    tag: 'Gốc tràn (4 > 3)! Lớp dự đoán bước tiếp?',
                    tagTone: 'error',
                    keys: [
                      { id: 'c8-30', label: '30' },
                      { id: 'c8-50', label: '50' },
                      { id: 'c8-65', label: '65', tone: 'active', badge: 'mid' },
                      { id: 'c8-75', label: '75' },
                    ],
                  },
                  { id: 'l8-0', x: 96, y: 280, cellW: 46, cellH: 40, keys: [{ id: 'c8-10', label: '10' }, { id: 'c8-20', label: '20' }] },
                  { id: 'l8-1', x: 245, y: 280, cellW: 46, cellH: 40, keys: [{ id: 'c8-40', label: '40' }] },
                  { id: 'l8-2', x: 410, y: 280, cellW: 46, cellH: 40, state: 'success', keys: [{ id: 'c8-52', label: '52' }, { id: 'c8-60', label: '60' }] },
                  { id: 'l8-2b', x: 575, y: 280, cellW: 46, cellH: 40, state: 'success', keys: [{ id: 'c8-72', label: '72' }] },
                  { id: 'l8-3', x: 740, y: 280, cellW: 46, cellH: 40, keys: [{ id: 'c8-80', label: '80' }, { id: 'c8-91', label: '91' }] },
                ],
                edges: [
                  { id: 'e8-0', fromNode: 'r8', portIndex: 0, toNode: 'l8-0' },
                  { id: 'e8-1', fromNode: 'r8', portIndex: 1, toNode: 'l8-1' },
                  { id: 'e8-2', fromNode: 'r8', portIndex: 2, toNode: 'l8-2', state: 'active' },
                  { id: 'e8-2b', fromNode: 'r8', portIndex: 3, toNode: 'l8-2b', state: 'active' },
                  { id: 'e8-3', fromNode: 'r8', portIndex: 4, toNode: 'l8-3' },
                ],
              }
            : {
                viewBox: [0, 0, 860, 380],
                nodes: [
                  {
                    id: 'r8-new',
                    x: 430,
                    y: 48,
                    cellW: 58,
                    cellH: 42,
                    state: 'success',
                    tag: 'Gốc mới · Tầng thêm phía trên',
                    tagPos: 'right',
                    tagTone: 'success',
                    keys: [{ id: 'c8-65', label: '65', tone: 'success' }],
                  },
                  {
                    id: 'r8',
                    x: 245,
                    y: 162,
                    cellW: 54,
                    cellH: 40,
                    keys: [
                      { id: 'c8-30', label: '30' },
                      { id: 'c8-50', label: '50' },
                    ],
                  },
                  {
                    id: 'r8-right',
                    x: 645,
                    y: 162,
                    cellW: 54,
                    cellH: 40,
                    keys: [{ id: 'c8-75', label: '75' }],
                  },
                  { id: 'l8-0', x: 96, y: 294, cellW: 46, cellH: 40, keys: [{ id: 'c8-10', label: '10' }, { id: 'c8-20', label: '20' }] },
                  { id: 'l8-1', x: 245, y: 294, cellW: 46, cellH: 40, keys: [{ id: 'c8-40', label: '40' }] },
                  { id: 'l8-2', x: 400, y: 294, cellW: 46, cellH: 40, keys: [{ id: 'c8-52', label: '52' }, { id: 'c8-60', label: '60' }] },
                  { id: 'l8-2b', x: 565, y: 294, cellW: 46, cellH: 40, keys: [{ id: 'c8-72', label: '72' }] },
                  { id: 'l8-3', x: 735, y: 294, cellW: 46, cellH: 40, keys: [{ id: 'c8-80', label: '80' }, { id: 'c8-91', label: '91' }] },
                ],
                edges: [
                  { id: 'e8-nr0', fromNode: 'r8-new', portIndex: 0, toNode: 'r8', state: 'active', arrow: true },
                  { id: 'e8-nr1', fromNode: 'r8-new', portIndex: 1, toNode: 'r8-right', state: 'active', arrow: true },
                  { id: 'e8-0', fromNode: 'r8', portIndex: 0, toNode: 'l8-0' },
                  { id: 'e8-1', fromNode: 'r8', portIndex: 1, toNode: 'l8-1' },
                  { id: 'e8-2', fromNode: 'r8', portIndex: 2, toNode: 'l8-2' },
                  { id: 'e8-2b', fromNode: 'r8-right', portIndex: 0, toNode: 'l8-2b' },
                  { id: 'e8-3', fromNode: 'r8-right', portIndex: 1, toNode: 'l8-3' },
                ],
                baselineY: { y: 334, x1: 35, x2: 815, label: '5 lá giữ nguyên hàng · Cây tăng lên h = 2' },
              };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion(), durationMs: 560 });

    const caps = [
      'Gốc <code>[30|50|75]</code> đã đầy 3 khóa. Chuẩn bị chèn <code>72</code> (<code>h = 1</code>).',
      'Khóa <code>72</code> vào khoảng <code>(50, 75)</code> làm lá thứ ba tràn: <code>[52|60|65|72]</code>.',
      'Lá tách thành <code>[52|60]</code> và <code>[72]</code>; <strong>65</strong> lên gốc khiến gốc tràn <code>[30|50|65|75]</code> (vẫn <code>h = 1</code>!).',
      'Tách gốc: <strong>65</strong> lên tạo gốc mới, <code>[30|50]</code> nhận 3 con đầu, <code>[75]</code> nhận 2 con cuối → <strong>h = 2</strong>.',
    ];
    cap.innerHTML = caps[step];
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 09 — Cây quyết định khi xóa
// ============================================================================
const slide09: SlideDef = {
  number: 9,
  title: 'Cây quyết định khi xóa',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Điểm phải kiểm tra sau một lần gộp là nút cha, vì nó vừa mất một khóa phân cách.”',
  fullScript:
    'Sang thao tác Xóa khóa, ta phải đồng thời duy trì thứ tự khóa, giới hạn số khóa tối thiểu min_keys và mọi lá ở cùng độ sâu. Cây quyết định cho thấy luồng xử lý: Đầu tiên kiểm tra khóa ở lá hay nút trong. Ở lá thì xóa trực tiếp; ở nút trong thì thay bằng tiền nhiệm (predecessor) rồi xóa bản gốc ở lá. Sau khi xóa ở lá, nếu nút vẫn đủ min_keys thì kết thúc; nếu thiếu khóa, xem hai anh em liền kề cùng cha: anh em dư khóa thì mượn (Borrow) qua cha; cả hai sát ngưỡng thì gộp (Merge) lại và quay ngược lên kiểm tra nút cha. Nếu gốc rỗng còn một con duy nhất thì hạ chiều cao cây.',
  fullView: {
    summary: 'Lưu đồ quyết định đầy đủ khi xóa khóa trên B-tree và ba bất biến phải bảo toàn.',
    sections: [
      {
        heading: 'Ba bất biến phải duy trì khi xóa',
        bodyHtml:
          '<ol><li>Thứ tự tăng dần của các khóa.</li><li>Giới hạn số khóa tối thiểu <code>min_keys</code> ở mọi nút khác gốc.</li><li>Tất cả nút lá nằm trên cùng một độ sâu.</li></ol>',
      },
      {
        heading: 'Luồng quyết định',
        bodyHtml:
          '<p>1) Ở lá → xóa trực tiếp; ở nút trong → thay bằng <strong>predecessor</strong> rồi xóa bản cũ ở lá.</p>' +
          '<p>2) Kiểm tra <code>len(keys) &lt; min_keys</code>? Không → kết thúc. Có → kiểm tra anh em trái/phải.</p>' +
          '<p>3) Có anh em dư → <strong>Borrow</strong> (kết thúc). Không → <strong>Merge</strong> và vòng lên kiểm tra nút cha. Nếu gốc rỗng có 1 con → hạ chiều cao.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Xóa khóa</span> và các trường hợp xóa</h1>
          </div>
          <div class="btn-row">
            <button type="button" class="inline-action-btn" data-branch="leaf">Nhánh ở lá</button>
            <button type="button" class="inline-action-btn" data-branch="borrow">Nhánh Borrow</button>
            <button type="button" class="inline-action-btn" data-branch="merge">Nhánh Merge</button>
            <button type="button" class="inline-action-btn inline-action-btn--primary" data-branch="all">Xem toàn luồng</button>
          </div>
        </header>

        <div class="s09-grid">
          <aside class="s09-left">
            <div class="canva-card s09-stack">
              <h3>Ba bất biến bắt buộc</h3>
              <ul>
                <li><strong>Thứ tự khóa</strong> trong mọi nút và mọi khoảng con.</li>
                <li><strong>Ngưỡng tối thiểu</strong> <code>min_keys</code> ở mọi nút ngoài gốc.</li>
                <li><strong>Cùng độ sâu</strong> của tất cả các nút lá.</li>
              </ul>
            </div>
            <div class="canva-card s09-note">
              <div class="callout-kicker">Hệ quả khi xóa khóa</div>
              <p class="s09-note__sub">Để giữ đủ 3 bất biến trên, thuật toán chạy theo chuỗi:</p>
              <div class="s09-chain" aria-label="Predecessor sang Borrow hoặc Merge sang Kiểm tra cha">
                <div class="s09-step">
                  <span class="s09-step__num">1</span>
                  <span class="chain-chip">Predecessor</span>
                  <span class="s09-step__desc">Đưa về xóa tại lá</span>
                </div>
                <div class="s09-step">
                  <span class="s09-step__num">2</span>
                  <span class="chain-chip chain-chip--cobalt">Borrow / Merge</span>
                  <span class="s09-step__desc">Xử lý thiếu khóa</span>
                </div>
                <div class="s09-step">
                  <span class="s09-step__num s09-step__num--dark">3</span>
                  <span class="chain-chip chain-chip--dark">Kiểm tra cha</span>
                  <span class="s09-step__desc">Lan ngược lên gốc</span>
                </div>
              </div>
            </div>
          </aside>

          <div class="s09-flow" data-role="flow"></div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-branch]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.branch as 'leaf' | 'borrow' | 'merge' | 'all';
        renderFlowchart(ctx.slideEl.querySelector<HTMLElement>('[data-role="flow"]')!, 3, mode);
      });
    });
  },
  renderStep(step, prev, ctx) {
    const prevStep = prev ?? -1;
    renderFlowchart(
      ctx.slideEl.querySelector<HTMLElement>('[data-role="flow"]')!,
      step,
      'all',
      !ctx.getReducedMotion() && step > prevStep ? step : -1,
    );
  },
};

function renderFlowchart(
  container: HTMLElement,
  step: number,
  focus: 'all' | 'leaf' | 'borrow' | 'merge',
  animLevel = -1,
): void {
  const op = (group: string) => {
    if (focus === 'all') return 1;
    if (focus === 'leaf') return ['q1', 'leaf', 'check', 'ok'].includes(group) ? 1 : 0.25;
    if (focus === 'borrow') return ['q1', 'leaf', 'internal', 'check', 'sib', 'borrow'].includes(group) ? 1 : 0.25;
    return ['q1', 'internal', 'check', 'sib', 'merge', 'loop', 'root'].includes(group) ? 1 : 0.25;
  };
  const show1 = step >= 1;
  const show2 = step >= 2;
  const show3 = step >= 3;
  const lvlCls = (lvl: number) => (animLevel === lvl ? 'class="flow-level-in"' : '');

  container.innerHTML = `
  <svg class="flow-svg" viewBox="0 0 820 470" role="img" aria-label="Lưu đồ quyết định khi xóa khóa trong B-tree">
    <defs>
      <marker id="fl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#004AAD"/>
      </marker>
      <marker id="fl-arr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#DC2626"/>
      </marker>
    </defs>

    <!-- Q1 -->
    <g opacity="${op('q1')}">
      <rect x="235" y="14" width="320" height="50" rx="25" fill="#FEF08A" stroke="#B45309" stroke-width="2.5"/>
      <text x="395" y="45" text-anchor="middle" fill="#0F1D3A" font-size="16" font-weight="800" font-family="'Be Vietnam Pro'">Khóa ở lá hay ở nút trong?</text>
    </g>

    ${show1 ? `
    <g ${lvlCls(1)}>
    <!-- Branch Leaf & Internal -->
    <g opacity="${op('leaf')}">
      <path class="flow-edge" pathLength="1" d="M 310 64 L 185 104" stroke="#004AAD" stroke-width="2.4" marker-end="url(#fl-arr)"/>
      <text x="215" y="80" fill="#004AAD" font-size="13" font-weight="800">Ở lá</text>
      <rect x="55" y="106" width="250" height="54" rx="12" fill="#FFFFFF" stroke="#004AAD" stroke-width="2.2"/>
      <text x="180" y="138" text-anchor="middle" fill="#0F1D3A" font-size="15" font-weight="700">Xóa trực tiếp tại lá</text>
    </g>

    <g opacity="${op('internal')}">
      <path class="flow-edge" pathLength="1" d="M 480 64 L 595 104" stroke="#004AAD" stroke-width="2.4" marker-end="url(#fl-arr)"/>
      <text x="565" y="80" fill="#004AAD" font-size="13" font-weight="800">Ở nút trong</text>
      <rect x="440" y="106" width="335" height="54" rx="12" fill="#FFFFFF" stroke="#004AAD" stroke-width="2.2"/>
      <text x="608" y="130" text-anchor="middle" fill="#0F1D3A" font-size="14" font-weight="700">Thay bằng tiền nhiệm (Predecessor)</text>
      <text x="608" y="149" text-anchor="middle" fill="#004AAD" font-size="13" font-weight="600">→ Xóa bản cũ tại lá</text>
    </g>
    </g>
    ` : ''}

    ${show2 ? `
    <g ${lvlCls(2)}>
    <!-- Converge to underflow check -->
    <g opacity="${op('check')}">
      <path class="flow-edge" pathLength="1" d="M 180 160 L 340 202" stroke="#004AAD" stroke-width="2.2" marker-end="url(#fl-arr)"/>
      <path class="flow-edge" pathLength="1" d="M 608 160 L 450 202" stroke="#004AAD" stroke-width="2.2" marker-end="url(#fl-arr)"/>
      <rect x="200" y="204" width="390" height="52" rx="14" fill="#EEF7FF" stroke="#5284FF" stroke-width="2.5"/>
      <text x="395" y="235" text-anchor="middle" fill="#004AAD" font-size="15.5" font-weight="800">Nút ngoài gốc có ít hơn min_keys?</text>
    </g>

    <g opacity="${op('ok')}">
      <path class="flow-edge" pathLength="1" d="M 200 230 L 136 230" stroke="#16A34A" stroke-width="2.5" marker-end="url(#fl-arr)"/>
      <text x="168" y="220" text-anchor="middle" fill="#15803D" font-size="13" font-weight="800">Không</text>
      <rect x="18" y="206" width="116" height="48" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2.2"/>
      <text x="76" y="235" text-anchor="middle" fill="#14532D" font-size="14.5" font-weight="800">Kết thúc</text>
    </g>

    <g opacity="${op('sib')}">
      <path class="flow-edge" pathLength="1" d="M 395 256 L 395 292" stroke="#DC2626" stroke-width="2.5" marker-end="url(#fl-arr-r)"/>
      <text x="412" y="280" fill="#B91C1C" font-size="13" font-weight="800">Có (Underflow)</text>
      <rect x="190" y="294" width="410" height="46" rx="12" fill="#FEE2E2" stroke="#DC2626" stroke-width="2.2"/>
      <text x="395" y="322" text-anchor="middle" fill="#991B1B" font-size="14.5" font-weight="800">Anh em liền kề cùng cha có dư khóa?</text>
    </g>
    </g>
    ` : ''}

    ${show3 ? `
    <g ${lvlCls(3)}>
    <g opacity="${op('borrow')}">
      <path class="flow-edge" pathLength="1" d="M 280 340 L 175 384" stroke="#16A34A" stroke-width="2.5" marker-end="url(#fl-arr)"/>
      <text x="200" y="365" fill="#15803D" font-size="13" font-weight="800">Có</text>
      <rect x="28" y="386" width="275" height="62" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2.3"/>
      <text x="165" y="412" text-anchor="middle" fill="#14532D" font-size="15" font-weight="800">BORROW (Mượn qua cha)</text>
      <text x="165" y="434" text-anchor="middle" fill="#166534" font-size="12.5" font-weight="600">Đổi khóa phân cách → Kết thúc</text>
    </g>

    <g opacity="${op('merge')}">
      <path class="flow-edge" pathLength="1" d="M 480 340 L 545 384" stroke="#DC2626" stroke-width="2.5" marker-end="url(#fl-arr-r)"/>
      <text x="540" y="365" fill="#B91C1C" font-size="13" font-weight="800">Không</text>
      <rect x="355" y="386" width="335" height="62" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="2.3"/>
      <text x="522" y="412" text-anchor="middle" fill="#92400E" font-size="15" font-weight="800">MERGE (Gộp với anh em + khóa cha)</text>
      <text x="522" y="434" text-anchor="middle" fill="#92400E" font-size="12.5" font-weight="600">Cha mất 1 khóa → Quay lại kiểm tra cha ↑</text>
    </g>

    <!-- Loop back arrow to parent check + Root shrink note -->
    <g opacity="${op('loop')}">
      <path class="flow-loop-dash" d="M 690 417 L 786 417 L 786 230 L 594 230" fill="none" stroke="#DC2626" stroke-width="2.6" stroke-dasharray="7 5" marker-end="url(#fl-arr-r)"/>
      <text x="772" y="328" text-anchor="middle" fill="#B91C1C" font-size="12" font-weight="800" transform="rotate(-90 772 328)">Kiểm tra ngược lên cha</text>
    </g>
    <g opacity="${op('root')}">
      <rect x="612" y="252" width="160" height="58" rx="10" fill="#004AAD"/>
      <text x="692" y="276" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700">Nếu gốc rỗng còn</text>
      <text x="692" y="295" text-anchor="middle" fill="#FEF08A" font-size="12.5" font-weight="800">1 con → Hạ chiều cao</text>
    </g>
    </g>
    ` : ''}
  </svg>
  `;
}

// ============================================================================
// SLIDE 10 — Xóa ở lá và xóa ở nút trong
// ============================================================================
const slide10: SlideDef = {
  number: 10,
  title: 'Xóa ở lá và xóa ở nút trong',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Khóa lớn nhất trong cây con trái vẫn nhỏ hơn tất cả khóa của khoảng bên phải. Vì thế 7 có thể nhận vị trí của 10.”',
  fullScript:
    'Xét hai ví dụ trên cây bậc M = 3 (mỗi nút ngoài gốc tối thiểu 1 khóa): Nửa trên là xóa ở lá không gây thiếu khóa — xóa số 7 khỏi [5 | 7], lá còn [5] vẫn thỏa 1 ≥ min_keys nên kết thúc. Nửa dưới là xóa ở nút trong — cần xóa 10 tại gốc [10 | 20]. Ta đi sang cây con trái, chọn khóa lớn nhất (lá ngoài cùng bên phải) là 7 — gọi là predecessor — đưa lên thay thế cho 10, rồi xóa bản 7 cũ ở lá. Lá còn [5] vẫn hợp lệ, hai cây con còn lại giữ nguyên.',
  fullView: {
    summary: 'Minh họa xóa ở lá (Delete 7) và xóa ở nút trong bằng Predecessor (Delete 10) với M = 3.',
    sections: [
      {
        heading: 'Trường hợp 1 · Xóa trực tiếp ở lá (Delete 7)',
        bodyHtml: '<p>Cây gốc <code>[10|20]</code> với lá <code>[5|7], [12], [25]</code>. Xóa 7 → lá co lại thành <code>[5]</code>, thỏa <code>1 ≥ min_keys</code> → kết thúc.</p>',
      },
      {
        heading: 'Trường hợp 2 · Xóa ở nút trong (Delete 10)',
        bodyHtml:
          '<p><strong>Predecessor (khóa tiền nhiệm):</strong> khóa lớn nhất nhỏ hơn khóa cần xóa, nằm ở lá ngoài cùng bên phải của cây con ngay bên trái khóa đó.</p>' +
          '<p>Thay 10 bằng 7 → gốc thành <code>[7|20]</code>, xóa bản 7 cũ ở lá → lá trái thành <code>[5]</code>. Các nhánh <code>[12|17]</code> và <code>[25|30]</code> giữ nguyên.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Minh họa</span> xóa khóa</h1>
        </header>

        <div class="s10-rows">
          <article class="s10-row" data-row="top">
            <div class="s10-row__label">
              <span class="row-badge">Ví dụ 1</span>
              <h3>Xóa ở lá: <code>Delete(7)</code></h3>
              <p data-role="top-msg">Xóa trực tiếp tại lá <code>[5 | 7]</code>.</p>
            </div>
            <div class="s10-row__tree" data-role="tree-top"></div>
          </article>

          <article class="s10-row" data-row="bot">
            <div class="s10-row__label">
              <span class="row-badge row-badge--cobalt">Ví dụ 2</span>
              <h3>Xóa ở nút trong: <code>Delete(10)</code></h3>
              <p class="pred-box"><strong>Predecessor:</strong> khóa lớn nhất nhỏ hơn khóa cần xóa, nằm ở lá ngoài cùng bên phải của cây con trái (lấy <strong>7</strong> thay cho <strong>10</strong>).</p>
            </div>
            <div class="s10-row__tree" data-role="tree-bot"></div>
          </article>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const rowTop = ctx.slideEl.querySelector<HTMLElement>('[data-row="top"]')!;
    const rowBot = ctx.slideEl.querySelector<HTMLElement>('[data-row="bot"]')!;
    const treeTop = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-top"]')!;
    const treeBot = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree-bot"]')!;
    const topMsg = ctx.slideEl.querySelector<HTMLElement>('[data-role="top-msg"]')!;

    rowTop.classList.toggle('is-dim', step >= 2);
    rowBot.classList.toggle('is-dim', step < 2);

    const sceneTop: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 740, 200],
            nodes: [
              { id: 't10r', x: 370, y: 44, cellW: 54, cellH: 38, keys: [{ id: 'a10', label: '10' }, { id: 'a20', label: '20' }] },
              { id: 't10l0', x: 165, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a5', label: '5' }, { id: 'a7', label: '7', tone: 'error', badge: 'xóa' }] },
              { id: 't10l1', x: 370, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a12', label: '12' }] },
              { id: 't10l2', x: 575, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a25', label: '25' }] },
            ],
            edges: [
              { id: 'ta0', fromNode: 't10r', portIndex: 0, toNode: 't10l0' },
              { id: 'ta1', fromNode: 't10r', portIndex: 1, toNode: 't10l1' },
              { id: 'ta2', fromNode: 't10r', portIndex: 2, toNode: 't10l2' },
            ],
          }
        : {
            viewBox: [0, 0, 740, 200],
            nodes: [
              { id: 't10r', x: 370, y: 44, cellW: 54, cellH: 38, keys: [{ id: 'a10', label: '10' }, { id: 'a20', label: '20' }] },
              { id: 't10l0', x: 165, y: 146, cellW: 52, cellH: 38, state: 'success', tag: '1 ≥ min_keys · Kết thúc', tagPos: 'right', tagTone: 'success', keys: [{ id: 'a5', label: '5', tone: 'success' }] },
              { id: 't10l1', x: 430, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a12', label: '12' }] },
              { id: 't10l2', x: 605, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a25', label: '25' }] },
            ],
            edges: [
              { id: 'ta0', fromNode: 't10r', portIndex: 0, toNode: 't10l0' },
              { id: 'ta1', fromNode: 't10r', portIndex: 1, toNode: 't10l1' },
              { id: 'ta2', fromNode: 't10r', portIndex: 2, toNode: 't10l2' },
            ],
          };

    const sceneBot: TreeSceneSpec =
      step <= 2
        ? {
            viewBox: [0, 0, 740, 210],
            nodes: [
              {
                id: 'b10r',
                x: 370,
                y: 48,
                cellW: 56,
                cellH: 40,
                keys: [
                  { id: 'b10', label: '10', tone: step === 2 ? 'error' : 'default', badge: step === 2 ? 'xóa' : undefined },
                  { id: 'b20', label: '20' },
                ],
              },
              {
                id: 'b10l0',
                x: 155,
                y: 154,
                cellW: 52,
                cellH: 40,
                state: step === 2 ? 'active' : 'normal',
                tag: step === 2 ? 'Predecessor = 7' : undefined,
                tagPos: 'bottom',
                tagTone: 'warn',
                keys: [
                  { id: 'b5', label: '5' },
                  { id: 'b7', label: '7', tone: step === 2 ? 'active' : 'default' },
                ],
              },
              { id: 'b10l1', x: 370, y: 154, cellW: 52, cellH: 40, keys: [{ id: 'b12', label: '12' }, { id: 'b17', label: '17' }] },
              { id: 'b10l2', x: 585, y: 154, cellW: 52, cellH: 40, keys: [{ id: 'b25', label: '25' }, { id: 'b30', label: '30' }] },
            ],
            edges: [
              { id: 'tb0', fromNode: 'b10r', portIndex: 0, toNode: 'b10l0', state: step === 2 ? 'active' : 'normal', arrow: step === 2, label: step === 2 ? 'nhánh trái' : undefined },
              { id: 'tb1', fromNode: 'b10r', portIndex: 1, toNode: 'b10l1' },
              { id: 'tb2', fromNode: 'b10r', portIndex: 2, toNode: 'b10l2' },
            ],
          }
        : {
            viewBox: [0, 0, 740, 210],
            nodes: [
              {
                id: 'b10r',
                x: 370,
                y: 48,
                cellW: 56,
                cellH: 40,
                state: 'success',
                keys: [
                  { id: 'b7', label: '7', tone: 'success' },
                  { id: 'b20', label: '20' },
                ],
              },
              {
                id: 'b10l0',
                x: 155,
                y: 154,
                cellW: 52,
                cellH: 40,
                state: 'success',
                tag: 'Đã xóa bản 7 cũ · còn [5]',
                tagPos: 'bottom',
                tagTone: 'success',
                keys: [{ id: 'b5', label: '5', tone: 'success' }],
              },
              { id: 'b10l1', x: 370, y: 154, cellW: 52, cellH: 40, keys: [{ id: 'b12', label: '12' }, { id: 'b17', label: '17' }] },
              { id: 'b10l2', x: 585, y: 154, cellW: 52, cellH: 40, keys: [{ id: 'b25', label: '25' }, { id: 'b30', label: '30' }] },
            ],
            edges: [
              { id: 'tb0', fromNode: 'b10r', portIndex: 0, toNode: 'b10l0' },
              { id: 'tb1', fromNode: 'b10r', portIndex: 1, toNode: 'b10l1' },
              { id: 'tb2', fromNode: 'b10r', portIndex: 2, toNode: 'b10l2' },
            ],
            transfers: [
              { id: 'tr-pred', fromX: 185, fromY: 132, toX: 334, toY: 56, ctrlX: 230, ctrlY: 54, label: '7 thay 10', tone: 'success' },
            ],
          };

    renderTreeScene(treeTop, sceneTop, { reducedMotion: ctx.getReducedMotion() });
    renderTreeScene(treeBot, sceneBot, { reducedMotion: ctx.getReducedMotion() });
    topMsg.innerHTML = step === 0 ? 'Chuẩn bị xóa <code>7</code> ở lá <code>[5 | 7]</code>.' : 'Gạch <code>7</code> → co lá thành <code>[5]</code> (<code>1 ≥ min_keys</code>).';
  },
  cancelAnimations(slideEl) {
    slideEl.querySelectorAll<HTMLElement>('[data-role^="tree-"]').forEach((el) => cancelTreeAnimations(el));
  },
};

// ============================================================================
// SLIDE 11 — Mượn qua cha hay gộp? (Borrow & Merge)
// ============================================================================
const slide11: SlideDef = {
  number: 11,
  title: 'Mượn qua cha hay gộp?',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'blue',
  stepCount: 4,
  leadIn: '“Cả hai lượt đều xóa cùng một khóa. Hãy nhìn lá giữa trước khi quyết định mượn hay gộp.”',
  fullScript:
    'Khi xóa ở lá gây thiếu khóa (underflow — ít hơn min_keys), ta kiểm tra các anh em liền kề cùng cha. Lượt A (Borrow): gốc [10 | 20], lá [5], [12 | 17], [25]. Xóa 5 làm lá trái rỗng; lá giữa [12 | 17] dư khóa nên ta mượn qua nút cha: kéo 10 xuống lá trái và đẩy 12 lên cha → cha [12 | 20], các lá [10], [17], [25]. Lượt B (Merge): vẫn xóa 5 nhưng lá giữa chỉ có [12] không thể cho mượn → kéo khóa phân cách 10 từ cha xuống gộp thành [10 | 12], giảm 1 khóa và 1 cạnh ở cha (còn [20]).',
  fullView: {
    summary: 'Đối chiếu trực tiếp Borrow (mượn qua cha) và Merge (gộp nút) trên cùng phép toán Delete(5).',
    sections: [
      {
        heading: 'Borrow — Mượn khóa',
        bodyHtml:
          '<p>Nếu anh em liền kề có nhiều hơn <code>min_keys</code> khóa: kéo khóa phân cách từ cha xuống nút thiếu, đồng thời đưa khóa biên của anh em lên thay ở cha (lớn nhất của anh em trái hoặc nhỏ nhất của anh em phải). Nếu ở nút trong, chuyển kèm nhánh con tương ứng.</p>',
      },
      {
        heading: 'Merge — Gộp nút',
        bodyHtml:
          '<p>Nếu không anh em nào cho mượn được: gộp nút thiếu + khóa phân cách ở cha + nút anh em thành 1 nút. Nút cha giảm 1 khóa và 1 nhánh con; nếu cha tiếp tục thiếu khóa thì lặp lại lên tầng trên.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Borrow</span> và Merge</h1>
        </header>

        <div class="s11-grid">
          <aside class="s11-defs">
            <div class="canva-card">
              <h3>Underflow (Thiếu khóa)</h3>
              <p>Nút ngoài gốc có ít hơn <code>min_keys</code> khóa sau khi xóa → kiểm tra anh em trái/phải cùng cha.</p>
            </div>
            <div class="canva-card s11-card-borrow" data-def="borrow">
              <h3>Borrow — Mượn khóa</h3>
              <p>Anh em dư khóa: kéo khóa phân cách từ cha xuống, đưa khóa biên của anh em lên thay. (Nút trong chuyển kèm nhánh con.)</p>
            </div>
            <div class="canva-card s11-card-merge" data-def="merge">
              <h3>Merge — Gộp nút</h3>
              <p>Không anh em nào dư: gộp nút thiếu + khóa phân cách + anh em. Cha giảm 1 khóa và 1 nhánh con.</p>
            </div>
          </aside>

          <div class="s11-right">
            <div class="s11-turn-badge" data-role="turn">Lượt A · Delete(5) khi lá giữa có [12 | 17]</div>
            <div class="s11-tree" data-role="tree"></div>
            <div class="s11-cap" data-role="cap"></div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const turn = ctx.slideEl.querySelector<HTMLElement>('[data-role="turn"]')!;
    const cap = ctx.slideEl.querySelector<HTMLElement>('[data-role="cap"]')!;
    const defB = ctx.slideEl.querySelector<HTMLElement>('[data-def="borrow"]')!;
    const defM = ctx.slideEl.querySelector<HTMLElement>('[data-def="merge"]')!;

    defB.classList.toggle('is-active-card', step === 1 || step === 2);
    defM.classList.toggle('is-active-card', step === 3 || step === 4);

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 740, 320],
            nodes: [
              { id: 'r11', x: 370, y: 66, cellW: 60, cellH: 44, tag: 'Cha có 3 cạnh', keys: [{ id: 'm10', label: '10' }, { id: 'm20', label: '20' }] },
              { id: 'l11-0', x: 155, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm5', label: '5', tone: 'error', badge: 'xóa' }] },
              { id: 'l11-1', x: 370, y: 218, cellW: 56, cellH: 42, tag: 'Anh em có 2 khóa (dư)', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'm12', label: '12' }, { id: 'm17', label: '17' }] },
              { id: 'l11-2', x: 585, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm25', label: '25' }] },
            ],
            edges: [
              { id: 'e11-0', fromNode: 'r11', portIndex: 0, toNode: 'l11-0' },
              { id: 'e11-1', fromNode: 'r11', portIndex: 1, toNode: 'l11-1' },
              { id: 'e11-2', fromNode: 'r11', portIndex: 2, toNode: 'l11-2' },
            ],
          }
        : step === 1
          ? {
              viewBox: [0, 0, 740, 320],
              nodes: [
                { id: 'r11', x: 370, y: 66, cellW: 60, cellH: 44, keys: [{ id: 'm10', label: '10', tone: 'active' }, { id: 'm20', label: '20' }] },
                { id: 'l11-0', x: 155, y: 218, cellW: 56, cellH: 42, state: 'underflow', tag: 'Rỗng (0 < 1)', tagPos: 'bottom', tagTone: 'error', keys: [] },
                { id: 'l11-1', x: 370, y: 218, cellW: 56, cellH: 42, state: 'active', tag: 'Dư khóa → cho mượn 12', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'm12', label: '12', tone: 'active' }, { id: 'm17', label: '17' }] },
                { id: 'l11-2', x: 585, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm25', label: '25' }] },
              ],
              edges: [
                { id: 'e11-0', fromNode: 'r11', portIndex: 0, toNode: 'l11-0', state: 'error' },
                { id: 'e11-1', fromNode: 'r11', portIndex: 1, toNode: 'l11-1' },
                { id: 'e11-2', fromNode: 'r11', portIndex: 2, toNode: 'l11-2' },
              ],
              transfers: [
                { id: 't-10down', fromX: 332, fromY: 82, toX: 168, toY: 190, ctrlX: 210, ctrlY: 105, label: '10 ↓', tone: 'warn' },
                { id: 't-12up', fromX: 344, fromY: 192, toX: 346, toY: 92, ctrlX: 392, ctrlY: 140, label: '12 ↑', tone: 'success' },
              ],
            }
          : step === 2
            ? {
                viewBox: [0, 0, 740, 320],
                nodes: [
                  { id: 'r11', x: 370, y: 66, cellW: 60, cellH: 44, state: 'success', tag: 'Vẫn giữ nguyên 3 cạnh', tagTone: 'success', keys: [{ id: 'm12', label: '12', tone: 'success' }, { id: 'm20', label: '20' }] },
                  { id: 'l11-0', x: 155, y: 218, cellW: 56, cellH: 42, state: 'success', keys: [{ id: 'm10', label: '10', tone: 'success' }] },
                  { id: 'l11-1', x: 370, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm17', label: '17' }] },
                  { id: 'l11-2', x: 585, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm25', label: '25' }] },
                ],
                edges: [
                  { id: 'e11-0', fromNode: 'r11', portIndex: 0, toNode: 'l11-0', state: 'active' },
                  { id: 'e11-1', fromNode: 'r11', portIndex: 1, toNode: 'l11-1', state: 'active' },
                  { id: 'e11-2', fromNode: 'r11', portIndex: 2, toNode: 'l11-2' },
                ],
              }
            : step === 3
              ? {
                  viewBox: [0, 0, 740, 320],
                  nodes: [
                    { id: 'r11', x: 370, y: 66, cellW: 60, cellH: 44, tag: 'Cha: 2 khóa, 3 cạnh', keys: [{ id: 'm10', label: '10', tone: 'active' }, { id: 'm20', label: '20' }] },
                    { id: 'l11-0', x: 155, y: 218, cellW: 56, cellH: 42, state: 'underflow', tag: 'Rỗng sau xóa 5', tagPos: 'bottom', tagTone: 'error', keys: [] },
                    { id: 'l11-1', x: 370, y: 218, cellW: 56, cellH: 42, state: 'highlight-box', tag: 'Chỉ 1 khóa — không thể cho mượn!', tagPos: 'bottom', tagTone: 'error', keys: [{ id: 'm12', label: '12', tone: 'error' }] },
                    { id: 'l11-2', x: 585, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm25', label: '25' }] },
                  ],
                  edges: [
                    { id: 'e11-0', fromNode: 'r11', portIndex: 0, toNode: 'l11-0', state: 'error' },
                    { id: 'e11-1', fromNode: 'r11', portIndex: 1, toNode: 'l11-1', state: 'error' },
                    { id: 'e11-2', fromNode: 'r11', portIndex: 2, toNode: 'l11-2' },
                  ],
                  transfers: [
                    { id: 't-m10', fromX: 340, fromY: 90, toX: 262, toY: 196, ctrlX: 278, ctrlY: 120, label: 'Kéo 10 ↓ gộp', tone: 'error' },
                  ],
                  brackets: [{ x1: 118, x2: 404, y: 274, dir: 'down', label: 'Gộp [∅] + 10 + [12]', tone: 'error' }],
                }
              : {
                  viewBox: [0, 0, 740, 320],
                  nodes: [
                    { id: 'r11', x: 370, y: 66, cellW: 60, cellH: 44, state: 'success', tag: 'Cha giảm còn 1 khóa, 2 cạnh', tagTone: 'cobalt', keys: [{ id: 'm20', label: '20' }] },
                    { id: 'l11-merged', x: 245, y: 218, cellW: 60, cellH: 44, state: 'success', tag: 'Nút sau gộp [10 | 12]', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'm10', label: '10', tone: 'success' }, { id: 'm12', label: '12', tone: 'success' }] },
                    { id: 'l11-2', x: 545, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm25', label: '25' }] },
                  ],
                  edges: [
                    { id: 'e11-0', fromNode: 'r11', portIndex: 0, toNode: 'l11-merged', state: 'active', arrow: true },
                    { id: 'e11-2', fromNode: 'r11', portIndex: 1, toNode: 'l11-2' },
                  ],
                };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion(), durationMs: 520 });

    const turns = [
      'Lượt A · Delete(5) khi lá giữa có [12 | 17]',
      'Lượt A · Underflow → Borrow qua nút cha',
      'Lượt A · Kết quả sau Borrow',
      'Lượt B · Delete(5) khi lá giữa chỉ có [12]',
      'Lượt B · Kết quả sau Merge',
    ];
    const caps = [
      'Cùng xóa <code>5</code> khỏi gốc <code>[10 | 20]</code>. Ở lượt A, lá giữa có <code>[12 | 17]</code> (dư khóa).',
      'Xóa 5 tạo ô rỗng. Hai cung đồng bộ qua cha: <strong>10 ↓</strong> xuống lá trái, <strong>12 ↑</strong> lên thay ở cha.',
      'Sau Borrow: cha thành <code>[12 | 20]</code>, ba lá <code>[10], [17], [25]</code> — số cạnh giữ nguyên (3).',
      'Đổi sang lượt B: lá giữa chỉ còn <code>[12]</code> (1 khóa, không thể cho mượn). Kéo <strong>10</strong> từ cha xuống để gộp.',
      'Sau Merge: nút gộp <code>[10 | 12]</code>, cha chỉ còn <code>[20]</code> và giảm từ 3 cạnh xuống còn 2 cạnh.',
    ];
    turn.textContent = turns[step];
    cap.innerHTML = caps[step];
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 12 — Trace Delete(5) và thu gọn gốc
// ============================================================================
const S12_STEPS = [
  '0. Ban đầu (3 tầng, h=2)',
  '1. Xóa 5 → lá rỗng',
  '2. Gộp [6|7] → cha rỗng',
  '3. Xét tầng trên ([20] sát ngưỡng)',
  '4. Gộp [10|20] → gốc cũ rỗng',
  '5. Nâng gốc mới (2 tầng, h=1)',
];

const slide12: SlideDef = {
  number: 12,
  title: 'Trace Delete(5) và thu gọn gốc',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'white',
  stepCount: 5,
  leadIn: '“Nếu dừng ở bước 2, lá đã hợp lệ nhưng cây vẫn chưa hợp lệ. Ai vừa mất khóa duy nhất của mình?”',
  fullScript:
    'Tương tự phép chèn có tách dây chuyền, phép xóa cũng có gộp dây chuyền làm giảm chiều cao cây. Theo dõi 6 mốc của Delete(5) trên cây M = 3: ban đầu cây 3 tầng (h = 2) với gốc [10], hai nút trong [6] và [20], các lá [5], [7], [12|17], [30]. Bước 1: xóa 5 làm lá rỗng. Bước 2: anh em [7] chỉ có 1 khóa nên kéo 6 xuống gộp thành [6|7]; nút cha trái trở nên rỗng. Bước 3: đẩy kiểm tra lên tầng trên, anh em [20] cũng chỉ có 1 khóa. Bước 4: kéo gốc 10 xuống gộp hai nút trong thành [10|20] giữ 3 lá; gốc cũ rỗng còn đúng 1 nhánh con. Bước 5: loại bỏ gốc cũ, nâng [10|20] làm gốc mới → cây thu gọn từ 3 tầng (h = 2) xuống 2 tầng (h = 1).',
  fullView: {
    summary: '6 mốc chi tiết của Trace Delete(5) gây gộp dây chuyền và thu gọn gốc (M = 3, h: 2 → 1).',
    sections: [
      {
        heading: 'Diễn tiến 6 mốc',
        bodyHtml:
          '<ol start="0">' +
          '<li>Ban đầu: gốc <code>[10]</code>, tầng trong <code>[6]</code> và <code>[20]</code>, lá <code>[5], [7], [12|17], [30]</code> (3 tầng, h = 2).</li>' +
          '<li>Xóa 5 → lá trái rỗng <code>[∅]</code> (underflow).</li>' +
          '<li>Anh em <code>[7]</code> sát ngưỡng → kéo 6 xuống gộp thành <code>[6|7]</code>; nút cha trái thành <code>[∅]</code> với 1 nhánh.</li>' +
          '<li>Kiểm tra nút cha trái: anh em <code>[20]</code> chỉ có 1 khóa → không thể mượn.</li>' +
          '<li>Kéo 10 từ gốc xuống gộp thành <code>[10|20]</code> nối 3 lá <code>[6|7], [12|17], [30]</code>; gốc cũ thành <code>[∅]</code> có 1 cạnh.</li>' +
          '<li>Thu ô gốc cũ, đặt <code>[10|20]</code> làm gốc mới → <strong>2 tầng, h = 1</strong>.</li>' +
          '</ol>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Trace</span> Delete(k)</h1>
          </div>
          <div class="height-pill" data-role="h-pill">3 tầng · <strong>h = 2</strong></div>
        </header>

        <div class="s12-bar" data-role="pills">
          ${S12_STEPS.map((txt, i) => `<button type="button" class="step-chip" data-s12="${i}">${txt}</button>`).join('')}
        </div>

        <div class="s12-tree" data-role="tree"></div>
        <div class="s12-footer" data-role="footer"></div>
      </div>
    `;

    // Clickable milestone replay chips (optional exploration without advancing slide)
    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-s12]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const s = Number(btn.dataset.s12);
        renderSlide12State(s, ctx.slideEl, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderSlide12State(step, ctx.slideEl, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderSlide12State(step: number, slideEl: HTMLElement, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const hPill = slideEl.querySelector<HTMLElement>('[data-role="h-pill"]')!;
  const footer = slideEl.querySelector<HTMLElement>('[data-role="footer"]')!;
  const pills = slideEl.querySelectorAll<HTMLElement>('[data-s12]');

  pills.forEach((p) => {
    const idx = Number(p.dataset.s12);
    p.classList.toggle('is-now', idx === step);
    p.classList.toggle('is-done', idx < step);
  });

  hPill.innerHTML = step === 5 ? '2 tầng · <strong>h = 1 (đã hạ gốc)</strong>' : '3 tầng · <strong>h = 2</strong>';
  hPill.classList.toggle('is-changed', step === 5);

  const scene: TreeSceneSpec =
    step === 0
      ? {
          viewBox: [0, 0, 880, 355],
          nodes: [
            { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, keys: [{ id: 'dk-10', label: '10' }] },
            { id: 'd-i0', x: 240, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-6', label: '6' }] },
            { id: 'd-i1', x: 640, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-20', label: '20' }] },
            { id: 'd-l0', x: 140, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-5', label: '5', tone: 'error', badge: 'xóa' }] },
            { id: 'd-l1', x: 340, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-7', label: '7' }] },
            { id: 'd-l2', x: 545, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
            { id: 'd-l3', x: 745, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-30', label: '30' }] },
          ],
          edges: [
            { id: 'de-r0', fromNode: 'd-root', portIndex: 0, toNode: 'd-i0' },
            { id: 'de-r1', fromNode: 'd-root', portIndex: 1, toNode: 'd-i1' },
            { id: 'de-00', fromNode: 'd-i0', portIndex: 0, toNode: 'd-l0' },
            { id: 'de-01', fromNode: 'd-i0', portIndex: 1, toNode: 'd-l1' },
            { id: 'de-10', fromNode: 'd-i1', portIndex: 0, toNode: 'd-l2' },
            { id: 'de-11', fromNode: 'd-i1', portIndex: 1, toNode: 'd-l3' },
          ],
        }
      : step === 1
        ? {
            viewBox: [0, 0, 880, 355],
            nodes: [
              { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, keys: [{ id: 'dk-10', label: '10' }] },
              { id: 'd-i0', x: 240, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-6', label: '6', tone: 'active' }] },
              { id: 'd-i1', x: 640, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-20', label: '20' }] },
              { id: 'd-l0', x: 140, y: 282, cellW: 50, cellH: 40, state: 'underflow', tag: 'Underflow!', tagPos: 'bottom', tagTone: 'error', keys: [] },
              { id: 'd-l1', x: 340, y: 282, cellW: 50, cellH: 40, tag: '1 khóa (không mượn)', tagPos: 'bottom', tagTone: 'warn', keys: [{ id: 'dk-7', label: '7' }] },
              { id: 'd-l2', x: 545, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
              { id: 'd-l3', x: 745, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-30', label: '30' }] },
            ],
            edges: [
              { id: 'de-r0', fromNode: 'd-root', portIndex: 0, toNode: 'd-i0' },
              { id: 'de-r1', fromNode: 'd-root', portIndex: 1, toNode: 'd-i1' },
              { id: 'de-00', fromNode: 'd-i0', portIndex: 0, toNode: 'd-l0', state: 'error' },
              { id: 'de-01', fromNode: 'd-i0', portIndex: 1, toNode: 'd-l1' },
              { id: 'de-10', fromNode: 'd-i1', portIndex: 0, toNode: 'd-l2' },
              { id: 'de-11', fromNode: 'd-i1', portIndex: 1, toNode: 'd-l3' },
            ],
          }
        : step === 2
          ? {
              viewBox: [0, 0, 880, 355],
              nodes: [
                { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, keys: [{ id: 'dk-10', label: '10' }] },
                { id: 'd-i0', x: 240, y: 158, cellW: 54, cellH: 40, state: 'underflow', tag: 'Cha trái bị rỗng!', tagPos: 'left', tagTone: 'error', keys: [] },
                { id: 'd-i1', x: 640, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-20', label: '20' }] },
                { id: 'd-l01', x: 240, y: 282, cellW: 54, cellH: 40, state: 'success', tag: 'Lá gộp [6|7]', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'dk-6', label: '6', tone: 'success' }, { id: 'dk-7', label: '7', tone: 'success' }] },
                { id: 'd-l2', x: 545, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
                { id: 'd-l3', x: 745, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-30', label: '30' }] },
              ],
              edges: [
                { id: 'de-r0', fromNode: 'd-root', portIndex: 0, toNode: 'd-i0', state: 'error' },
                { id: 'de-r1', fromNode: 'd-root', portIndex: 1, toNode: 'd-i1' },
                { id: 'de-00', fromNode: 'd-i0', portIndex: 0, toNode: 'd-l01', state: 'active' },
                { id: 'de-10', fromNode: 'd-i1', portIndex: 0, toNode: 'd-l2' },
                { id: 'de-11', fromNode: 'd-i1', portIndex: 1, toNode: 'd-l3' },
              ],
            }
          : step === 3
            ? {
                viewBox: [0, 0, 880, 355],
                nodes: [
                  { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, keys: [{ id: 'dk-10', label: '10', tone: 'active' }] },
                  { id: 'd-i0', x: 240, y: 158, cellW: 54, cellH: 40, state: 'underflow', tag: 'Kiểm tra tầng trên ↑', tagPos: 'left', tagTone: 'error', keys: [] },
                  { id: 'd-i1', x: 640, y: 158, cellW: 54, cellH: 40, state: 'highlight-box', tag: '[20] chỉ 1 khóa → không mượn', tagPos: 'right', tagTone: 'error', keys: [{ id: 'dk-20', label: '20', tone: 'error' }] },
                  { id: 'd-l01', x: 240, y: 282, cellW: 54, cellH: 40, keys: [{ id: 'dk-6', label: '6' }, { id: 'dk-7', label: '7' }] },
                  { id: 'd-l2', x: 545, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
                  { id: 'd-l3', x: 745, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-30', label: '30' }] },
                ],
                edges: [
                  { id: 'de-r0', fromNode: 'd-root', portIndex: 0, toNode: 'd-i0', state: 'error' },
                  { id: 'de-r1', fromNode: 'd-root', portIndex: 1, toNode: 'd-i1', state: 'error' },
                  { id: 'de-00', fromNode: 'd-i0', portIndex: 0, toNode: 'd-l01' },
                  { id: 'de-10', fromNode: 'd-i1', portIndex: 0, toNode: 'd-l2' },
                  { id: 'de-11', fromNode: 'd-i1', portIndex: 1, toNode: 'd-l3' },
                ],
                transfers: [
                  { id: 'tr-10m', fromX: 440, fromY: 74, toX: 440, toY: 148, ctrlX: 440, ctrlY: 112, label: 'Kéo 10 ↓ gộp tầng trên', tone: 'error' },
                ],
              }
            : step === 4
              ? {
                  viewBox: [0, 0, 880, 355],
                  nodes: [
                    { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, state: 'empty-root', tag: 'Gốc cũ rỗng · còn 1 nhánh duy nhất', tagPos: 'right', tagTone: 'error', keys: [] },
                    { id: 'd-merged', x: 440, y: 162, cellW: 60, cellH: 42, state: 'active', keys: [{ id: 'dk-10', label: '10', tone: 'active' }, { id: 'dk-20', label: '20', tone: 'active' }] },
                    { id: 'd-l01', x: 210, y: 286, cellW: 54, cellH: 40, keys: [{ id: 'dk-6', label: '6' }, { id: 'dk-7', label: '7' }] },
                    { id: 'd-l2', x: 440, y: 286, cellW: 54, cellH: 40, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
                    { id: 'd-l3', x: 670, y: 286, cellW: 54, cellH: 40, keys: [{ id: 'dk-30', label: '30' }] },
                  ],
                  edges: [
                    { id: 'de-rm', fromNode: 'd-root', portIndex: 0, toNode: 'd-merged', state: 'error', arrow: true },
                    { id: 'de-00', fromNode: 'd-merged', portIndex: 0, toNode: 'd-l01', state: 'active' },
                    { id: 'de-10', fromNode: 'd-merged', portIndex: 1, toNode: 'd-l2', state: 'active' },
                    { id: 'de-11', fromNode: 'd-merged', portIndex: 2, toNode: 'd-l3', state: 'active' },
                  ],
                }
              : {
                  viewBox: [0, 0, 880, 355],
                  nodes: [
                    { id: 'd-merged', x: 440, y: 86, cellW: 64, cellH: 44, state: 'success', tag: 'Gốc mới [10 | 20] · Đã loại bỏ gốc rỗng', tagTone: 'success', keys: [{ id: 'dk-10', label: '10', tone: 'success' }, { id: 'dk-20', label: '20', tone: 'success' }] },
                    { id: 'd-l01', x: 210, y: 242, cellW: 54, cellH: 42, keys: [{ id: 'dk-6', label: '6' }, { id: 'dk-7', label: '7' }] },
                    { id: 'd-l2', x: 440, y: 242, cellW: 54, cellH: 42, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
                    { id: 'd-l3', x: 670, y: 242, cellW: 54, cellH: 42, keys: [{ id: 'dk-30', label: '30' }] },
                  ],
                  edges: [
                    { id: 'de-00', fromNode: 'd-merged', portIndex: 0, toNode: 'd-l01', state: 'active', arrow: true },
                    { id: 'de-10', fromNode: 'd-merged', portIndex: 1, toNode: 'd-l2', state: 'active', arrow: true },
                    { id: 'de-11', fromNode: 'd-merged', portIndex: 2, toNode: 'd-l3', state: 'active', arrow: true },
                  ],
                  baselineY: { y: 288, x1: 110, x2: 770, label: 'Cây thu gọn từ 3 tầng (h = 2) → 2 tầng (h = 1)' },
                };

  renderTreeScene(treeBox, scene, { reducedMotion, durationMs: 520 });

  const notes = [
    'Trạng thái ban đầu: <code>M = 3</code>, 3 tầng (<code>h = 2</code>). Bắt đầu gọi <code>delete(5)</code>.',
    '<strong>Bước 1:</strong> Xóa <code>5</code> → lá trái trở nên rỗng (<code>underflow</code>).',
    '<strong>Bước 2:</strong> Lá <code>[7]</code> sát ngưỡng nên kéo <code>6</code> xuống gộp thành <code>[6|7]</code>. Hậu quả: nút cha trái vừa mất khóa duy nhất!',
    '<strong>Bước 3:</strong> Kiểm tra tầng trên: anh em <code>[20]</code> cũng chỉ có 1 khóa nên không thể cho mượn.',
    '<strong>Bước 4:</strong> Kéo <code>10</code> từ gốc xuống gộp hai nút trong thành <code>[10|20]</code>; gốc cũ rỗng và chỉ còn 1 nhánh con.',
    '<strong>Bước 5:</strong> Thu bỏ gốc cũ, nâng <code>[10|20]</code> lên làm gốc mới → <strong>2 tầng, h = 1</strong> (nhấn bất kỳ mốc nào ở trên để tua lại).',
  ];
  footer.innerHTML = notes[step];
}

export const PART2_SLIDES: SlideDef[] = [slide06, slide07, slide08, slide09, slide10, slide11, slide12];
