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
              <button type="button" class="crumb-card" data-crumb="1"><strong>Mốc 1 · Gốc [10]</strong><span>17 &gt; 10 → <code>i = 1</code>, rẽ phải</span></button>
              <button type="button" class="crumb-card" data-crumb="2"><strong>Mốc 2 · Nút [20]</strong><span>17 &lt; 20 → <code>i = 0</code>, rẽ trái</span></button>
              <button type="button" class="crumb-card" data-crumb="3"><strong>Mốc 3 · Lá [12|17]</strong><span><code>i = 1</code>, <code>keys[1] = 17</code></span></button>
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

    // Clickable search milestones (replay/jump without advancing deck)
    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.crumb-card').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetStep = Number(btn.dataset.crumb);
        renderSlide06State(targetStep, ctx.slideEl, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderSlide06State(step, ctx.slideEl, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderSlide06State(step: number, slideEl: HTMLElement, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const res = slideEl.querySelector<HTMLElement>('[data-role="result"]')!;
  const crumbs = slideEl.querySelectorAll<HTMLElement>('.crumb-card');
  const rules = slideEl.querySelectorAll<HTMLElement>('[data-rule]');

  crumbs.forEach((c) => {
    const n = Number(c.dataset.crumb);
    c.classList.toggle('is-shown', step >= n);
    c.classList.toggle('is-current', step === n);
  });

  rules.forEach((r) => {
    const idx = Number(r.dataset.rule);
    const active =
      (step === 1 || step === 2) ? (idx === 1 || idx === 3) :
      step === 3 ? (idx === 1 || idx === 2) : false;
    r.classList.toggle('is-active', active);
  });

  renderTreeScene(treeBox, buildSearchScene(step, 17), { reducedMotion });

  const messages = [
    'Khung mở: Cây tìm kiếm bậc M = 3, xuất phát tại gốc <code>[10]</code> với khóa <code>k = 17</code>.',
    'Tại <code>[10]</code>: vị trí chèn trái của 17 là <code>i = 1</code> → đi xuống <code>children[1] = [20]</code>.',
    'Tại <code>[20]</code>: <code>17 &lt; 20</code> nên <code>i = 0</code> → đi xuống <code>children[0] = [12 | 17]</code>.',
    '<strong>Tìm thấy:</strong> trả về <code>(lá [12 | 17], 1)</code> — ô thứ hai khi chỉ số bắt đầu từ 0.',
  ];
  res.innerHTML = messages[step];
  res.classList.toggle('is-success', step === 3);
}

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
        x: 472,
        y: 156,
        cellW: 56,
        cellH: 40,
        state: step >= 1 ? 'active' : 'normal',
        tag: step >= 2 ? `${targetKey} < 20 → i=0` : undefined,
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
          <h1 class="slide-title">Chèn khóa: <span>Insert(k)</span></h1>
        </header>
        <div class="def-banner def-banner--flush">Khác với cây nhị phân thông thường, B-tree có thể <strong>tăng chiều cao</strong> bằng cách tạo một root mới.</div>

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
                <li data-ins-step="0">Đi từ gốc xuống nút lá thích hợp và chèn <code>k</code> theo thứ tự.</li>
                <li data-ins-step="1">Không tràn (<code>≤ M−1</code>) → <strong>kết thúc</strong>.</li>
                <li data-ins-step="2">Tràn (<code>&gt; M−1</code>) → <strong>Split</strong>, đẩy khóa <code>mid = len // 2</code> lên nút cha.</li>
                <li data-ins-step="3">Lặp kiểm tra lên cha; nếu gốc tràn thì tách và tạo gốc mới.</li>
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
    ctx.slideEl.querySelectorAll<HTMLElement>('[data-ins-step]').forEach((li) => {
      li.classList.toggle('is-active', Number(li.dataset.insStep) === step);
    });

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 680, 310],
            nodes: [
              {
                id: 'n7-in20',
                x: 304,
                y: 66,
                cellW: 64,
                cellH: 44,
                state: 'active',
                tag: 'Chèn 20 (10 < 20 < 30)',
                tagPos: 'top',
                tagTone: 'warn',
                keys: [{ id: 'i7-20', label: '20', tone: 'active' }],
              },
              {
                id: 'n7-leaf',
                x: 340,
                y: 204,
                capacity: 3,
                cellW: 72,
                cellH: 52,
                tag: 'Lá còn 1 ô trống (2 / 3 khóa)',
                tagPos: 'bottom',
                tagTone: 'cobalt',
                keys: [
                  { id: 'i7-10', label: '10' },
                  { id: 'i7-30', label: '30' },
                ],
              },
            ],
            edges: [],
            transfers: [
              {
                id: 't7-in20',
                fromX: 304,
                fromY: 90,
                toX: 304,
                toY: 169,
                ctrlX: 304,
                ctrlY: 130,
                label: 'vào giữa 10 | 30',
                tone: 'warn',
              },
            ],
            overlaySvg: `
              <line x1="304" y1="178" x2="304" y2="230" stroke="#D97706" stroke-width="3.5" stroke-dasharray="5 3" />
              <circle cx="304" cy="178" r="4.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5" />
              <path d="M 352 164 Q 382 150 408 162" fill="none" stroke="#5284FF" stroke-width="2" stroke-dasharray="4 3" />
              <polygon points="405,157 413,163 404,166" fill="#5284FF" />
              <text x="444" y="158" text-anchor="middle" fill="#004AAD" font-size="11" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">30 dịch phải →</text>
            `,
          }
        : step === 1
          ? {
              viewBox: [0, 0, 680, 310],
              nodes: [
                {
                  id: 'n7-in25',
                  x: 376,
                  y: 66,
                  cellW: 64,
                  cellH: 44,
                  state: 'active',
                  tag: 'Tiếp: chèn 25 (20 < 25 < 30)',
                  tagPos: 'top',
                  tagTone: 'warn',
                  keys: [{ id: 'i7-25', label: '25', tone: 'active' }],
                },
                {
                  id: 'n7-leaf',
                  x: 340,
                  y: 204,
                  capacity: 3,
                  cellW: 72,
                  cellH: 52,
                  state: 'success',
                  tag: '3 / 3 khóa · Không tràn (chiều cao giữ nguyên)',
                  tagPos: 'bottom',
                  tagTone: 'success',
                  keys: [
                    { id: 'i7-10', label: '10' },
                    { id: 'i7-20', label: '20', tone: 'success' },
                    { id: 'i7-30', label: '30' },
                  ],
                },
              ],
              edges: [],
              transfers: [
                {
                  id: 't7-in25',
                  fromX: 376,
                  fromY: 90,
                  toX: 376,
                  toY: 169,
                  ctrlX: 376,
                  ctrlY: 130,
                  label: 'vào giữa 20 | 30',
                  tone: 'warn',
                },
              ],
              overlaySvg: `
                <line x1="376" y1="178" x2="376" y2="230" stroke="#D97706" stroke-width="3.5" stroke-dasharray="5 3" />
                <circle cx="376" cy="178" r="4.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5" />
              `,
            }
          : step === 2
            ? {
                viewBox: [0, 0, 680, 310],
                nodes: [
                  {
                    id: 'n7-leaf',
                    x: 340,
                    y: 204,
                    cellW: 72,
                    cellH: 52,
                    state: 'overflow',
                    tag: 'TRÀN KHÓA: 4 > 3 · Chọn mid = 4//2 = 2 (khóa 25)',
                    tagPos: 'bottom',
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
                transfers: [
                  {
                    id: 't7-mid25',
                    fromX: 376,
                    fromY: 152,
                    toX: 376,
                    toY: 74,
                    ctrlX: 376,
                    ctrlY: 112,
                    label: 'đẩy 25 lên gốc mới',
                    tone: 'error',
                  },
                ],
                overlaySvg: `
                  <line x1="340" y1="158" x2="340" y2="236" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="5 3" />
                  <line x1="412" y1="158" x2="412" y2="236" stroke="#DC2626" stroke-width="2.5" stroke-dasharray="5 3" />
                  <rect x="412" y="166" width="78" height="70" rx="6" fill="none" stroke="#DC2626" stroke-width="2" stroke-dasharray="4 3" />
                  <text x="558" y="208" text-anchor="middle" fill="#B91C1C" font-size="12" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Vượt giới hạn 3 ô!</text>
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
            <h1 class="slide-title">Chèn và split <span>dây chuyền</span></h1>
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
              <button type="button" class="ms-pill" data-ms="0">0. Trước khi chèn (h=1)</button>
              <button type="button" class="ms-pill" data-ms="1">1. Lá [52|60|65|72] tràn</button>
              <button type="button" class="ms-pill" data-ms="2">2. Gốc [30|50|65|75] tràn</button>
              <button type="button" class="ms-pill" data-ms="3">3. Tạo gốc mới [65] (h=2)</button>
            </div>
          </aside>

          <div class="s08-stage-col">
            <div class="s08-tree" data-role="tree"></div>
            <div class="s08-caption" data-role="caption"></div>
          </div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.ms-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderSlide08State(Number(btn.dataset.ms), ctx.slideEl, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderSlide08State(step, ctx.slideEl, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderSlide08State(step: number, slideEl: HTMLElement, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const hPill = slideEl.querySelector<HTMLElement>('[data-role="h-pill"]')!;
  const cap = slideEl.querySelector<HTMLElement>('[data-role="caption"]')!;
  const pills = slideEl.querySelectorAll<HTMLElement>('.ms-pill');

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
              id: 'n8-in72',
              x: 740,
              y: 62,
              cellW: 54,
              cellH: 40,
              state: 'active',
              tag: 'Chèn 72',
              tagPos: 'top',
              tagTone: 'warn',
              keys: [{ id: 'c8-72', label: '72', tone: 'active' }],
            },
            {
              id: 'r8',
              x: 430,
              y: 120,
              cellW: 56,
              cellH: 44,
              state: 'active',
              tag: 'Gốc đã đầy (3 / 3 khóa)',
              tagTone: 'warn',
              keys: [
                { id: 'c8-30', label: '30' },
                { id: 'c8-50', label: '50', tone: 'active' },
                { id: 'c8-75', label: '75', tone: 'active' },
              ],
            },
            { id: 'l8-0', x: 110, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-10', label: '10' }, { id: 'c8-20', label: '20' }] },
            { id: 'l8-1', x: 270, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-40', label: '40' }] },
            {
              id: 'l8-2',
              x: 475,
              y: 280,
              cellW: 48,
              cellH: 40,
              state: 'highlight-box',
              tag: 'Lá đích đã đầy (3 / 3)',
              tagPos: 'bottom',
              tagTone: 'warn',
              keys: [{ id: 'c8-52', label: '52' }, { id: 'c8-60', label: '60' }, { id: 'c8-65', label: '65' }],
            },
            { id: 'l8-3', x: 720, y: 280, cellW: 48, cellH: 40, keys: [{ id: 'c8-80', label: '80' }, { id: 'c8-91', label: '91' }] },
          ],
          edges: [
            { id: 'e8-0', fromNode: 'r8', portIndex: 0, toNode: 'l8-0' },
            { id: 'e8-1', fromNode: 'r8', portIndex: 1, toNode: 'l8-1' },
            { id: 'e8-2', fromNode: 'r8', portIndex: 2, toNode: 'l8-2', state: 'active', arrow: true, label: '50 < 72 < 75' },
            { id: 'e8-3', fromNode: 'r8', portIndex: 3, toNode: 'l8-3' },
          ],
          transfers: [
            { id: 't8-in72', fromX: 708, fromY: 72, toX: 522, toY: 112, ctrlX: 622, ctrlY: 66, label: 'Tìm từ gốc', tone: 'warn' },
          ],
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
              { id: 'e8-2', fromNode: 'r8', portIndex: 2, toNode: 'l8-2', state: 'active', arrow: true },
              { id: 'e8-3', fromNode: 'r8', portIndex: 3, toNode: 'l8-3' },
            ],
            transfers: [
              { id: 't8-up1', fromX: 522, fromY: 244, toX: 472, toY: 148, ctrlX: 564, ctrlY: 194, label: 'đẩy 65 ↑', tone: 'error' },
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
                  tag: 'Gốc tràn (4 > 3)!',
                  tagPos: 'left',
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
              transfers: [
                { id: 't8-up2', fromX: 458, fromY: 78, toX: 458, toY: 16, ctrlX: 458, ctrlY: 46, label: 'đẩy 65 ↑ tạo gốc mới', tone: 'error' },
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

  renderTreeScene(treeBox, scene, { reducedMotion, durationMs: 560 });

  const caps = [
    'Gốc <code>[30|50|75]</code> đã đầy 3 khóa. Tìm đường cho khóa <code>72</code> qua khoảng <code>(50, 75)</code> xuống lá <code>[52|60|65]</code> (<code>h = 1</code>).',
    'Khóa <code>72</code> trượt vào lá thứ ba gây tràn: <code>[52|60|65|72]</code> (4 &gt; 3) → tách lá và đẩy <strong>65 ↑</strong> lên gốc.',
    'Lá tách thành <code>[52|60]</code> và <code>[72]</code>; <strong>65</strong> lên gốc khiến gốc tràn <code>[30|50|65|75]</code> (vẫn <code>h = 1</code>!).',
    'Tách gốc: <strong>65</strong> lên tạo gốc mới, <code>[30|50]</code> nhận 3 con đầu, <code>[75]</code> nhận 2 con cuối → <strong>h = 2</strong>.',
  ];
  cap.innerHTML = caps[step];
}

// ============================================================================
// SLIDE 12 — Cây quyết định khi xóa (Tổng kết cuối phần xóa)
// ============================================================================
const slide09: SlideDef = {
  number: 12,
  title: 'Cây quyết định khi xóa',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Sau khi đi qua xóa ở lá, tiền nhiệm, Borrow, Merge và thu gọn gốc, toàn bộ phép xóa gói gọn trong một cây quyết định duy nhất này.”',
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
            <div class="s09-retro-win">
              <div class="retro-win__bar">
                <span class="retro-win__title">DELETE · 3 BẤT BIẾN</span>
                <span class="retro-win__ctrls" aria-hidden="true"><span>−</span><span>□</span><span>×</span></span>
              </div>
              <div class="retro-win__body">
                <p class="retro-win__lead">Khi xóa một khóa khỏi B-tree, ta phải đồng thời duy trì <strong>3 bất biến bắt buộc</strong>:</p>
                <ul class="retro-win__list">
                  <li><strong>Thứ tự khóa</strong> trong mọi nút và mọi khoảng con.</li>
                  <li><strong>Ngưỡng tối thiểu</strong> <code>min_keys</code> ở mọi nút ngoài gốc.</li>
                  <li><strong>Cùng độ sâu</strong> của tất cả các nút lá.</li>
                </ul>
                <div class="retro-win__divider" aria-hidden="true"></div>
                <div class="retro-win__kicker">HỆ QUẢ · CHUỖI PHÉP TOÁN XÓA</div>
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
            </div>
          </aside>

          <div class="s09-flow" data-role="flow"></div>
        </div>
      </div>
    `;

    const branchBtns = ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-branch]');
    branchBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.dataset.branch as 'leaf' | 'borrow' | 'merge' | 'all';
        branchBtns.forEach((b) => b.classList.toggle('inline-action-btn--primary', b === btn));
        renderFlowchart(ctx.slideEl.querySelector<HTMLElement>('[data-role="flow"]')!, 3, mode);
      });
    });
  },
  renderStep(step, prev, ctx) {
    const prevStep = prev ?? -1;
    ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-branch]').forEach((b) => {
      b.classList.toggle('inline-action-btn--primary', b.dataset.branch === 'all');
    });
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
    if (focus === 'leaf') return ['q1', 'leaf', 'check', 'ok'].includes(group) ? 1 : 0.2;
    if (focus === 'borrow') return ['q1', 'leaf', 'internal', 'check', 'sib', 'borrow'].includes(group) ? 1 : 0.2;
    return ['q1', 'internal', 'check', 'sib', 'merge', 'loop', 'root'].includes(group) ? 1 : 0.2;
  };
  const show1 = step >= 1;
  const show2 = step >= 2;
  const show3 = step >= 3;
  const lvlCls = (lvl: number) => (animLevel === lvl ? 'class="flow-level-in"' : '');

  const existingDecor = container.querySelector<HTMLElement>('.stage-decor');
  container.innerHTML = `
  <svg class="flow-svg" viewBox="0 0 820 470" role="img" aria-label="Lưu đồ quyết định khi xóa khóa trong B-tree">
    <defs>
      <filter id="fl-shadow" x="-10%" y="-12%" width="124%" height="134%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0F1D3A" flood-opacity="0.12" />
      </filter>
      <linearGradient id="fl-g-q1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FEF9C3"/><stop offset="100%" stop-color="#FDE047"/>
      </linearGradient>
      <linearGradient id="fl-g-q2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F0F7FF"/><stop offset="100%" stop-color="#DBEAFE"/>
      </linearGradient>
      <linearGradient id="fl-g-q3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF1F2"/><stop offset="100%" stop-color="#FEE2E2"/>
      </linearGradient>
      <linearGradient id="fl-g-ok" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ECFDF5"/><stop offset="100%" stop-color="#DCFCE7"/>
      </linearGradient>
      <linearGradient id="fl-g-merge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFBEB"/><stop offset="100%" stop-color="#FEF3C7"/>
      </linearGradient>
      <linearGradient id="fl-g-navy" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0F1D3A"/><stop offset="100%" stop-color="#004AAD"/>
      </linearGradient>
      <marker id="fl-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#004AAD"/>
      </marker>
      <marker id="fl-arr-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#16A34A"/>
      </marker>
      <marker id="fl-arr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#DC2626"/>
      </marker>
      <path id="fl-loop-path" d="M 698 419 L 796 419 L 796 231 L 592 231" />
    </defs>

    <!-- Q1 · Root Decision -->
    <g opacity="${op('q1')}" filter="url(#fl-shadow)">
      <rect x="215" y="17" width="360" height="50" rx="6" fill="#B45309" opacity="0.22"/>
      <rect x="215" y="13" width="360" height="50" rx="6" fill="url(#fl-g-q1)" stroke="#B45309" stroke-width="2.2"/>
      <rect x="225" y="24" width="34" height="28" rx="4" fill="#B45309"/>
      <text x="242" y="43" text-anchor="middle" fill="#FEF9C3" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">Q1</text>
      <text x="415" y="44" text-anchor="middle" fill="#0F1D3A" font-size="15.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Khóa cần xóa ở lá hay nút trong?</text>
    </g>

    ${show1 ? `
    <g ${lvlCls(1)}>
    <!-- Branch Leaf -->
    <g opacity="${op('leaf')}">
      <path class="flow-edge" pathLength="1" d="M 310 63 C 310 86, 167 74, 167 104" fill="none" stroke="#004AAD" stroke-width="2.4" marker-end="url(#fl-arr)"/>
      <rect x="195" y="72" width="58" height="20" rx="10" fill="#DBEAFE" stroke="#004AAD" stroke-width="1.4"/>
      <text x="224" y="86" text-anchor="middle" fill="#004AAD" font-size="11" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Ở LÁ</text>
      <g filter="url(#fl-shadow)">
        <rect x="34" y="108" width="266" height="56" rx="5" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <rect x="34" y="108" width="6" height="56" rx="2" fill="#2563EB"/>
        <text x="172" y="132" text-anchor="middle" fill="#0F1D3A" font-size="14.8" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Xóa trực tiếp tại lá</text>
        <text x="172" y="151" text-anchor="middle" fill="#475569" font-size="12" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">Bỏ khóa k khỏi node.keys</text>
      </g>
    </g>

    <!-- Branch Internal -->
    <g opacity="${op('internal')}">
      <path class="flow-edge" pathLength="1" d="M 480 63 C 480 86, 602 74, 602 104" fill="none" stroke="#004AAD" stroke-width="2.4" marker-end="url(#fl-arr)"/>
      <rect x="518" y="72" width="98" height="20" rx="10" fill="#DBEAFE" stroke="#004AAD" stroke-width="1.4"/>
      <text x="567" y="86" text-anchor="middle" fill="#004AAD" font-size="11" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Ở NÚT TRONG</text>
      <g filter="url(#fl-shadow)">
        <rect x="422" y="108" width="360" height="56" rx="5" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <rect x="422" y="108" width="6" height="56" rx="2" fill="#004AAD"/>
        <text x="606" y="131" text-anchor="middle" fill="#0F1D3A" font-size="14.2" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Thay bằng tiền nhiệm (Predecessor)</text>
        <text x="606" y="151" text-anchor="middle" fill="#004AAD" font-size="12.2" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Lấy khóa lớn nhất nhánh trái → xóa bản cũ ở lá</text>
      </g>
    </g>
    </g>
    ` : ''}

    ${show2 ? `
    <g ${lvlCls(2)}>
    <!-- Converge to Q2 underflow check -->
    <g opacity="${op('check')}">
      <path class="flow-edge" pathLength="1" d="M 167 164 C 167 188, 326 178, 326 200" fill="none" stroke="#004AAD" stroke-width="2.2" marker-end="url(#fl-arr)"/>
      <path class="flow-edge" pathLength="1" d="M 602 164 C 602 188, 464 178, 464 200" fill="none" stroke="#004AAD" stroke-width="2.2" marker-end="url(#fl-arr)"/>
      <g filter="url(#fl-shadow)">
        <rect x="204" y="207" width="382" height="52" rx="6" fill="#004AAD" opacity="0.16"/>
        <rect x="204" y="203" width="382" height="52" rx="6" fill="url(#fl-g-q2)" stroke="#2563EB" stroke-width="2.2"/>
        <rect x="214" y="215" width="34" height="28" rx="4" fill="#2563EB"/>
        <text x="231" y="234" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">Q2</text>
        <text x="414" y="235" text-anchor="middle" fill="#004AAD" font-size="15" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Nút ngoài gốc có ít hơn min_keys?</text>
      </g>
    </g>

    <!-- OK terminal -->
    <g opacity="${op('ok')}">
      <path class="flow-edge" pathLength="1" d="M 204 231 L 140 231" fill="none" stroke="#16A34A" stroke-width="2.6" marker-end="url(#fl-arr-g)"/>
      <rect x="145" y="204" width="54" height="19" rx="9.5" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.3"/>
      <text x="172" y="217" text-anchor="middle" fill="#15803D" font-size="10.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">KHÔNG</text>
      <g filter="url(#fl-shadow)">
        <rect x="18" y="205" width="118" height="50" rx="6" fill="url(#fl-g-ok)" stroke="#16A34A" stroke-width="2.2"/>
        <text x="77" y="228" text-anchor="middle" fill="#14532D" font-size="14.2" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Kết thúc</text>
        <text x="77" y="245" text-anchor="middle" fill="#166534" font-size="11" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">Cây hợp lệ</text>
      </g>
    </g>

    <!-- Q3 Sibling check -->
    <g opacity="${op('sib')}">
      <path class="flow-edge" pathLength="1" d="M 395 255 L 395 294" fill="none" stroke="#DC2626" stroke-width="2.6" marker-end="url(#fl-arr-r)"/>
      <rect x="408" y="264" width="118" height="20" rx="10" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.3"/>
      <text x="467" y="278" text-anchor="middle" fill="#B91C1C" font-size="10.8" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">CÓ · UNDERFLOW</text>
      <g filter="url(#fl-shadow)">
        <rect x="186" y="301" width="418" height="46" rx="6" fill="#DC2626" opacity="0.16"/>
        <rect x="186" y="297" width="418" height="46" rx="6" fill="url(#fl-g-q3)" stroke="#DC2626" stroke-width="2.2"/>
        <rect x="196" y="306" width="34" height="28" rx="4" fill="#DC2626"/>
        <text x="213" y="325" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">Q3</text>
        <text x="414" y="325" text-anchor="middle" fill="#991B1B" font-size="14.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Anh em liền kề cùng cha có dư khóa?</text>
      </g>
    </g>
    </g>
    ` : ''}

    ${show3 ? `
    <g ${lvlCls(3)}>
    <!-- BORROW -->
    <g opacity="${op('borrow')}">
      <path class="flow-edge" pathLength="1" d="M 276 343 C 276 364, 172 358, 172 383" fill="none" stroke="#16A34A" stroke-width="2.6" marker-end="url(#fl-arr-g)"/>
      <rect x="150" y="352" width="96" height="20" rx="10" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.3"/>
      <text x="198" y="366" text-anchor="middle" fill="#15803D" font-size="10.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">CÓ · DƯ KHÓA</text>
      <g filter="url(#fl-shadow)">
        <rect x="24" y="386" width="296" height="66" rx="6" fill="url(#fl-g-ok)" stroke="#16A34A" stroke-width="2.2"/>
        <rect x="24" y="386" width="7" height="66" rx="2" fill="#16A34A"/>
        <text x="176" y="413" text-anchor="middle" fill="#14532D" font-size="15" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">BORROW · Mượn qua cha</text>
        <text x="176" y="435" text-anchor="middle" fill="#166534" font-size="12.4" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">Xoay khóa phân cách → Kết thúc ngay</text>
      </g>
    </g>

    <!-- MERGE -->
    <g opacity="${op('merge')}">
      <path class="flow-edge" pathLength="1" d="M 504 343 C 504 364, 526 358, 526 383" fill="none" stroke="#DC2626" stroke-width="2.6" marker-end="url(#fl-arr-r)"/>
      <rect x="488" y="352" width="136" height="20" rx="10" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.3"/>
      <text x="556" y="366" text-anchor="middle" fill="#B91C1C" font-size="10.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">KHÔNG · SÁT NGƯỠNG</text>
      <g filter="url(#fl-shadow)">
        <rect x="356" y="386" width="342" height="66" rx="6" fill="url(#fl-g-merge)" stroke="#D97706" stroke-width="2.2"/>
        <rect x="356" y="386" width="7" height="66" rx="2" fill="#D97706"/>
        <text x="531" y="413" text-anchor="middle" fill="#92400E" font-size="15" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">MERGE · Gộp anh em + khóa cha</text>
        <text x="531" y="435" text-anchor="middle" fill="#92400E" font-size="12.4" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">Cha mất 1 khóa → Vòng lên kiểm tra cha ↑</text>
      </g>
    </g>

    <!-- Loop-back Return Highway + Animated Signal Bead -->
    <g opacity="${op('loop')}">
      <path class="flow-loop-dash" d="M 698 419 L 796 419 L 796 231 L 592 231" fill="none" stroke="#DC2626" stroke-width="2.6" stroke-dasharray="7 5" marker-end="url(#fl-arr-r)"/>
      <circle r="4.2" fill="#FEF08A" stroke="#DC2626" stroke-width="1.8">
        <animateMotion dur="2.6s" repeatCount="indefinite"><mpath href="#fl-loop-path"/></animateMotion>
      </circle>
      <text x="776" y="368" text-anchor="middle" fill="#B91C1C" font-size="11.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif" transform="rotate(-90 776 368)">Lặp lên cha ↑</text>
    </g>

    <!-- Root Shrink Architectural Callout linked to return loop -->
    <g opacity="${op('root')}" filter="url(#fl-shadow)">
      <line x1="796" y1="276" x2="774" y2="276" stroke="#DC2626" stroke-width="2" stroke-dasharray="3 2"/>
      <circle cx="796" cy="276" r="3.5" fill="#DC2626"/>
      <rect x="610" y="248" width="164" height="56" rx="6" fill="url(#fl-g-navy)" stroke="#0F1D3A" stroke-width="1.6"/>
      <rect x="610" y="248" width="5" height="56" rx="2" fill="#FEF08A"/>
      <text x="694" y="271" text-anchor="middle" fill="#FFFFFF" font-size="12" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Gốc rỗng còn 1 con</text>
      <text x="694" y="291" text-anchor="middle" fill="#FEF08A" font-size="12.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">→ Hạ chiều cao (h − 1)</text>
    </g>
    </g>
    ` : ''}
  </svg>
  `;
  if (existingDecor) {
    container.prepend(existingDecor);
  }
}

// ============================================================================
// SLIDE 09 — Xóa ở lá và xóa ở nút trong
// ============================================================================
const slide10: SlideDef = {
  number: 9,
  title: 'Xóa ở lá và xóa ở nút trong',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'blue',
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
          <h1 class="slide-title">Minh họa <span>xóa khóa</span></h1>
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
            viewBox: [0, 0, 740, 210],
            nodes: [
              { id: 't10r', x: 370, y: 44, cellW: 54, cellH: 38, state: 'active', keys: [{ id: 'a10', label: '10', tone: 'active' }, { id: 'a20', label: '20' }] },
              { id: 't10l0', x: 165, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a5', label: '5' }, { id: 'a7', label: '7', tone: 'error', badge: 'xóa' }] },
              { id: 't10l1', x: 370, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a12', label: '12' }] },
              { id: 't10l2', x: 575, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a25', label: '25' }] },
            ],
            edges: [
              { id: 'ta0', fromNode: 't10r', portIndex: 0, toNode: 't10l0', state: 'active', arrow: true, label: '7 < 10' },
              { id: 'ta1', fromNode: 't10r', portIndex: 1, toNode: 't10l1' },
              { id: 'ta2', fromNode: 't10r', portIndex: 2, toNode: 't10l2' },
            ],
          }
        : {
            viewBox: [0, 0, 740, 210],
            nodes: [
              { id: 't10r', x: 370, y: 44, cellW: 54, cellH: 38, keys: [{ id: 'a10', label: '10' }, { id: 'a20', label: '20' }] },
              { id: 't10l0', x: 165, y: 146, cellW: 52, cellH: 38, state: 'success', tag: '1 ≥ min_keys · Kết thúc', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'a5', label: '5', tone: 'success' }] },
              { id: 't10l1', x: 370, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a12', label: '12' }] },
              { id: 't10l2', x: 575, y: 146, cellW: 52, cellH: 38, keys: [{ id: 'a25', label: '25' }] },
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
            transfers: step === 2
              ? [{ id: 'tr-pred-pre', fromX: 185, fromY: 130, toX: 334, toY: 46, ctrlX: 186, ctrlY: 26, label: '7 ↑ thay 10', tone: 'warn' }]
              : [],
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
// SLIDE 10 — Mượn qua cha hay gộp? (Borrow & Merge)
// ============================================================================
const slide11: SlideDef = {
  number: 10,
  title: 'Mượn qua cha hay gộp?',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'white',
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
          <h1 class="slide-title"><span>Borrow</span> và <span>Merge</span></h1>
        </header>

        <div class="s11-grid">
          <aside class="s11-defs">
            <div class="canva-card s11-card-underflow">
              <div class="s11-card-kicker"><span>01 · Điều kiện kích hoạt</span><span>len &lt; min_keys</span></div>
              <h3>Underflow (Thiếu khóa)</h3>
              <p>Nút ngoài gốc có ít hơn <code>min_keys</code> khóa sau khi xóa → kiểm tra anh em trái/phải cùng cha.</p>
            </div>
            <div class="canva-card s11-card-borrow" data-def="borrow">
              <div class="s11-card-kicker"><span>02 · Lượt A (Nhấn xem)</span><span>Giữ nguyên số cạnh</span></div>
              <h3>Borrow — Mượn khóa</h3>
              <p>Anh em dư khóa: kéo khóa phân cách từ cha xuống, đưa khóa biên của anh em lên thay. (Nút trong chuyển kèm nhánh con.)</p>
            </div>
            <div class="canva-card s11-card-merge" data-def="merge">
              <div class="s11-card-kicker"><span>03 · Lượt B (Nhấn xem)</span><span>Cha giảm 1 khóa</span></div>
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

    // Click Borrow or Merge card to jump straight to that scenario
    ctx.slideEl.querySelector<HTMLElement>('[data-def="borrow"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      renderSlide11State(1, ctx.slideEl, ctx.getReducedMotion());
    });
    ctx.slideEl.querySelector<HTMLElement>('[data-def="merge"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      renderSlide11State(3, ctx.slideEl, ctx.getReducedMotion());
    });
  },
  renderStep(step, _prev, ctx) {
    renderSlide11State(step, ctx.slideEl, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderSlide11State(step: number, slideEl: HTMLElement, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const turn = slideEl.querySelector<HTMLElement>('[data-role="turn"]')!;
  const cap = slideEl.querySelector<HTMLElement>('[data-role="cap"]')!;
  const defB = slideEl.querySelector<HTMLElement>('[data-def="borrow"]')!;
  const defM = slideEl.querySelector<HTMLElement>('[data-def="merge"]')!;

  defB.classList.toggle('is-active-card', step === 1 || step === 2);
  defM.classList.toggle('is-active-card', step === 3 || step === 4);

  const scene: TreeSceneSpec =
    step === 0
      ? {
          viewBox: [0, 0, 740, 320],
          nodes: [
            { id: 'r11', x: 370, y: 66, cellW: 60, cellH: 44, state: 'active', tag: 'Cha có 3 cạnh · Tìm 5 < 10', keys: [{ id: 'm10', label: '10', tone: 'active' }, { id: 'm20', label: '20' }] },
            { id: 'l11-0', x: 155, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm5', label: '5', tone: 'error', badge: 'xóa' }] },
            { id: 'l11-1', x: 370, y: 218, cellW: 56, cellH: 42, tag: 'Anh em có 2 khóa (dư)', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'm12', label: '12' }, { id: 'm17', label: '17' }] },
            { id: 'l11-2', x: 585, y: 218, cellW: 56, cellH: 42, keys: [{ id: 'm25', label: '25' }] },
          ],
          edges: [
            { id: 'e11-0', fromNode: 'r11', portIndex: 0, toNode: 'l11-0', state: 'active', arrow: true, label: '5 < 10' },
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
              { id: 't-10down', fromX: 332, fromY: 76, toX: 162, toY: 186, ctrlX: 184, ctrlY: 84, label: '10 ↓', tone: 'warn' },
              { id: 't-12up', fromX: 344, fromY: 192, toX: 346, toY: 92, ctrlX: 396, ctrlY: 140, label: '12 ↑', tone: 'success' },
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

  renderTreeScene(treeBox, scene, { reducedMotion, durationMs: 520 });

  const turns = [
    'Lượt A · Delete(5) khi lá giữa có [12 | 17]',
    'Lượt A · Underflow → Borrow qua nút cha',
    'Lượt A · Kết quả sau Borrow',
    'Lượt B · Delete(5) khi lá giữa chỉ có [12]',
    'Lượt B · Kết quả sau Merge',
  ];
  const caps = [
    'Tìm <code>5 &lt; 10</code> xuống lá trái để xóa <code>5</code>. Ở lượt A, lá giữa có <code>[12 | 17]</code> (dư khóa).',
    'Xóa 5 tạo ô rỗng. Hai cung đồng bộ qua cha: <strong>10 ↓</strong> xuống lá trái, <strong>12 ↑</strong> lên thay ở cha.',
    'Sau Borrow: cha thành <code>[12 | 20]</code>, ba lá <code>[10], [17], [25]</code> — số cạnh giữ nguyên (3).',
    'Đổi sang lượt B: lá giữa chỉ còn <code>[12]</code> (1 khóa, không thể cho mượn). Kéo <strong>10</strong> từ cha xuống để gộp.',
    'Sau Merge: nút gộp <code>[10 | 12]</code>, cha chỉ còn <code>[20]</code> và giảm từ 3 cạnh xuống còn 2 cạnh.',
  ];
  turn.textContent = turns[step];
  cap.innerHTML = caps[step];
}

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
  number: 11,
  title: 'Trace Delete(5) và thu gọn gốc',
  chapter: '2. Các phép toán trong B-tree',
  theme: 'blue',
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
            <h1 class="slide-title">Trace <span>Delete(k)</span></h1>
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
            { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, state: 'active', keys: [{ id: 'dk-10', label: '10', tone: 'active' }] },
            { id: 'd-i0', x: 240, y: 158, cellW: 54, cellH: 40, state: 'active', keys: [{ id: 'dk-6', label: '6', tone: 'active' }] },
            { id: 'd-i1', x: 620, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-20', label: '20' }] },
            { id: 'd-l0', x: 140, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-5', label: '5', tone: 'error', badge: 'xóa' }] },
            { id: 'd-l1', x: 340, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-7', label: '7' }] },
            { id: 'd-l2', x: 545, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-12', label: '12' }, { id: 'dk-17', label: '17' }] },
            { id: 'd-l3', x: 745, y: 282, cellW: 50, cellH: 40, keys: [{ id: 'dk-30', label: '30' }] },
          ],
          edges: [
            { id: 'de-r0', fromNode: 'd-root', portIndex: 0, toNode: 'd-i0', state: 'active', arrow: true, label: '5 < 10' },
            { id: 'de-r1', fromNode: 'd-root', portIndex: 1, toNode: 'd-i1' },
            { id: 'de-00', fromNode: 'd-i0', portIndex: 0, toNode: 'd-l0', state: 'active', arrow: true, label: '5 < 6' },
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
              { id: 'd-i1', x: 620, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-20', label: '20' }] },
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
            transfers: [
              { id: 'tr-6m', fromX: 240, fromY: 184, toX: 240, toY: 256, ctrlX: 240, ctrlY: 220, label: 'Kéo 6 ↓ gộp [6|7]', tone: 'error' },
            ],
          }
        : step === 2
          ? {
              viewBox: [0, 0, 880, 355],
              nodes: [
                { id: 'd-root', x: 440, y: 48, cellW: 58, cellH: 40, keys: [{ id: 'dk-10', label: '10' }] },
                { id: 'd-i0', x: 240, y: 158, cellW: 54, cellH: 40, state: 'underflow', tag: 'Cha trái bị rỗng!', tagPos: 'left', tagTone: 'error', keys: [] },
                { id: 'd-i1', x: 620, y: 158, cellW: 54, cellH: 40, keys: [{ id: 'dk-20', label: '20' }] },
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
                  { id: 'd-i1', x: 620, y: 158, cellW: 54, cellH: 40, state: 'highlight-box', tag: '1 khóa (không mượn)', tagPos: 'right', tagTone: 'error', keys: [{ id: 'dk-20', label: '20', tone: 'error' }] },
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

export const PART2_SLIDES: SlideDef[] = [slide06, slide07, slide08, slide10, slide11, slide12, slide09];
