import type { SlideDef, TreeSceneSpec } from '../types';
import { renderPythonWindow, updateCodeHighlight, highlightPythonLine } from '../pythonCode';
import { renderTreeScene, cancelTreeAnimations } from '../svg/treeRenderer';

function triggerStepPulse(el: HTMLElement, reducedMotion: boolean): void {
  if (reducedMotion) return;
  el.classList.remove('step-flash');
  void el.offsetWidth;
  el.classList.add('step-flash');
}

// ============================================================================
// SLIDE 13 — Python: khởi tạo và search
// ============================================================================
const slide13: SlideDef = {
  number: 13,
  title: 'Python: khởi tạo và search',
  chapter: '3. Cài đặt Python và trực quan hóa',
  chapterStart: 13,
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Hàm chỉ chọn gốc khi người gọi chưa truyền nút. Mỗi lần đệ quy đã biết chính xác cây con phải xét.”',
  fullScript:
    'Chuyển sang phần cài đặt bằng Python. Ta tổ chức cây thành 2 class: BTreeNode lưu mảng keys, mảng con trỏ children riêng cho từng nút và cờ leaf; class BTree lưu bậc M, tính sẵn max_keys = M − 1, min_children = (M + 1) // 2, min_keys = min_children − 1 và khởi tạo root là một lá rỗng. Hàm search(key, node=None) dùng bisect_left để tìm nhị phân vị trí đầu tiên có keys[i] >= key. Nếu khớp thì trả (node, i); nếu ở lá thì trả None; ngược lại gọi đệ quy xuống node.children[i].',
  fullView: {
    summary: 'Cấu trúc lớp BTreeNode, BTree.__init__(M) và hàm đệ quy search(key, node=None) dùng bisect_left.',
    sections: [
      {
        heading: 'Giải thích các thành phần',
        bodyHtml:
          '<ul>' +
          '<li><code>BTreeNode.__init__(leaf=True)</code>: khởi tạo hai danh sách <code>keys</code> và <code>children</code> độc lập cho từng đối tượng nút.</li>' +
          '<li><code>BTree.__init__(M)</code>: kiểm tra <code>M ≥ 3</code>, lưu <code>max_keys</code>, <code>min_children = (M+1)//2</code>, <code>min_keys</code> và tạo gốc là lá rỗng.</li>' +
          '<li><code>search(key, node=None)</code>: gọi ngoài bắt đầu từ <code>self.root</code>, đệ quy truyền thẳng <code>node.children[i]</code>; trả <code>(node, i)</code> hoặc <code>None</code>.</li>' +
          '</ul>',
      },
    ],
    codeSlice: { title: 'BTreeNode, BTree.__init__ & search', startLine: 1, endLine: 31 },
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <div class="slide-chapter-head">3. Cài đặt Python</div>
          <h1 class="slide-title slide-title--sub"><span>Khởi tạo</span> và <span>Search</span></h1>
        </header>

        <div class="code-slide-grid">
          <div class="code-col">
            ${renderPythonWindow({ title: 'BTreeNode & BTree.__init__(M)', startLine: 5, endLine: 21, compact: true, blockId: 's13-code-init' })}
            ${renderPythonWindow({ title: 'BTree.search(key, node=None)', startLine: 23, endLine: 31, compact: true, blockId: 's13-code-search' })}
          </div>

          <div class="vis-col">
            <div class="canva-card vis-panel" data-role="vis"></div>
            <div class="canva-card note-strip" data-role="note">Nhấn vào bất kỳ cửa sổ mã nào để phóng to và cuộn bằng bàn phím.</div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const cInit = ctx.slideEl.querySelector('#s13-code-init');
    const cSearch = ctx.slideEl.querySelector('#s13-code-search');
    const vis = ctx.slideEl.querySelector<HTMLElement>('[data-role="vis"]')!;
    const note = ctx.slideEl.querySelector<HTMLElement>('[data-role="note"]')!;

    if (step === 0) {
      updateCodeHighlight(cInit, []);
      updateCodeHighlight(cSearch, []);
      vis.innerHTML = `
        <div class="obj-stage">
          <h3>Kiến trúc 2 lớp Python</h3>
          <div class="obj-cards">
            <div class="obj-box"><strong>BTreeNode</strong><code>leaf: bool</code><code>keys: list[int]</code><code>children: list[BTreeNode]</code></div>
            <div class="obj-box"><strong>BTree</strong><code>M, max_keys</code><code>min_children, min_keys</code><code>root: BTreeNode</code></div>
          </div>
          <p class="vis-sub">Mỗi khung nút B-tree ánh xạ thành cặp danh sách <code>keys</code> / <code>children</code>.</p>
        </div>
      `;
      note.innerHTML = 'Sẵn sàng đối chiếu từng khối mã với đối tượng trong bộ nhớ và cây <code>Search(17)</code>.';
    } else if (step === 1) {
      updateCodeHighlight(cInit, [6, 7, 8, 9]);
      updateCodeHighlight(cSearch, []);
      vis.innerHTML = `
        <div class="obj-stage">
          <h3>Mỗi nút có danh sách riêng biệt</h3>
          <div class="obj-cards">
            <div class="obj-box is-lit"><strong>node_A = BTreeNode()</strong><code>leaf = True</code><code>keys = []  # id 0x10a</code><code>children = []</code></div>
            <div class="obj-box is-lit"><strong>node_B = BTreeNode()</strong><code>leaf = True</code><code>keys = []  # id 0x20f</code><code>children = []</code></div>
          </div>
          <p class="vis-sub">Tạo <code>[]</code> bên trong <code>__init__</code> tránh lỗi dùng chung danh sách giữa các nút.</p>
        </div>
      `;
      note.innerHTML = '<strong>BTreeNode.__init__():</strong> <code>leaf=True</code> cho phép khởi tạo nhanh nút lá rỗng <code>BTreeNode()</code>.';
    } else if (step === 2) {
      updateCodeHighlight(cInit, [14, 15, 16, 17, 18, 19, 20, 21]);
      updateCodeHighlight(cSearch, []);
      vis.innerHTML = `
        <div class="obj-stage">
          <h3>Tính sẵn các ngưỡng khi khởi tạo <code>BTree(M)</code></h3>
          <table class="mini-kv-table">
            <thead><tr><th>Thuộc tính</th><th>Công thức</th><th>M = 3</th><th>M = 4</th></tr></thead>
            <tbody>
              <tr><td><code>max_keys</code></td><td><code>M - 1</code></td><td>2</td><td>3</td></tr>
              <tr><td><code>min_children</code></td><td><code>(M + 1) // 2</code></td><td>2</td><td>2</td></tr>
              <tr><td><code>min_keys</code></td><td><code>min_children - 1</code></td><td>1</td><td>1</td></tr>
              <tr><td><code>self.root</code></td><td><code>BTreeNode()</code></td><td colspan="2">Lá rỗng <code>[]</code></td></tr>
            </tbody>
          </table>
        </div>
      `;
      note.innerHTML = '<strong>BTree.__init__(M):</strong> Kiểm tra <code>M &ge; 3</code>, lưu hằng số dùng chung và trỏ <code>self.root</code> tới lá rỗng.';
    } else {
      updateCodeHighlight(cInit, []);
      updateCodeHighlight(cSearch, [23, 24, 25, 26, 27, 28, 29, 30, 31]);
      vis.innerHTML = `
        <div class="s13-search-sync">
          <div class="s13-mini-tree" data-role="s13-tree"></div>
          <div class="stack-panel">
            <div class="stack-title">Call Stack · <code>search(17)</code></div>
            <div class="stack-frame is-stagger" style="--fi:0">1. <code>node=[10]</code> · <code>bisect_left → i=1</code></div>
            <div class="stack-frame is-stagger" style="--fi:1">2. <code>node=[20]</code> · <code>bisect_left → i=0</code></div>
            <div class="stack-frame is-stagger is-ok" style="--fi:2">3. <code>node=[12,17]</code> · <code>i=1</code> → trả <code>(node, 1)</code></div>
          </div>
        </div>
      `;
      const miniTree = vis.querySelector<HTMLElement>('[data-role="s13-tree"]')!;
      renderTreeScene(
        miniTree,
        {
          viewBox: [0, 0, 420, 210],
          nodes: [
            { id: 'p13-r', x: 210, y: 34, cellW: 44, cellH: 32, state: 'active', keys: [{ id: 'p13-10', label: '10' }] },
            { id: 'p13-0', x: 105, y: 104, cellW: 40, cellH: 30, state: 'muted', keys: [{ id: 'p13-5', label: '5', tone: 'muted' }] },
            { id: 'p13-1', x: 315, y: 104, cellW: 44, cellH: 32, state: 'active', keys: [{ id: 'p13-20', label: '20' }] },
            { id: 'p13-l', x: 245, y: 176, cellW: 44, cellH: 32, state: 'success', keys: [{ id: 'p13-12', label: '12' }, { id: 'p13-17', label: '17', tone: 'success' }] },
            { id: 'p13-r2', x: 372, y: 176, cellW: 36, cellH: 30, state: 'muted', keys: [{ id: 'p13-25', label: '25', tone: 'muted' }] },
          ],
          edges: [
            { id: 'p13e0', fromNode: 'p13-r', portIndex: 0, toNode: 'p13-0', state: 'muted' },
            { id: 'p13e1', fromNode: 'p13-r', portIndex: 1, toNode: 'p13-1', state: 'active', arrow: true, label: 'i=1' },
            { id: 'p13e2', fromNode: 'p13-1', portIndex: 0, toNode: 'p13-l', state: 'active', arrow: true, label: 'i=0' },
            { id: 'p13e3', fromNode: 'p13-1', portIndex: 1, toNode: 'p13-r2', state: 'muted' },
          ],
        },
        { reducedMotion: ctx.getReducedMotion() },
      );
      note.innerHTML = '<strong>3 nhánh của <code>search</code>:</strong> khớp trả <code>(node, i)</code> · ở lá chưa khớp trả <code>None</code> · còn lại đệ quy <code>children[i]</code>.';
    }
  },
};

// ============================================================================
// SLIDE 14 — Python: insert và split
// ============================================================================
const slide14: SlideDef = {
  number: 14,
  title: 'Python: insert và split',
  chapter: '3. Cài đặt Python và trực quan hóa',
  theme: 'white',
  stepCount: 4,
  leadIn: '“Tại sao hàm chỉ trả khóa giữa và nút phải? Địa chỉ nút cũ mà cha đang giữ đã trỏ vào nửa trái.”',
  fullScript:
    'Thao tác chèn tách làm 2 hàm: insert(key) công khai kiểm tra khóa trùng (nếu có trả False), gọi _insert(self.root, key); nếu gốc bị tách, insert tạo gốc mới nối 2 nửa cũ rồi trả True. Bên trong _insert(node, key), thuật toán đệ quy xuống lá để chèn khóa theo thứ tự. Trên đường quay lên, nếu len(node.keys) <= max_keys thì trả None; nếu tràn, cắt đôi keys (và cắt children tại mid+1 nếu là nút trong), giữ nửa trái ngay trong node cũ rồi trả về cặp (middle, right) cho cha chèn vào vị trí i và i+1.',
  fullView: {
    summary: 'Hợp đồng trả về giữa insert(key) và _insert(node, key) minh họa trên phép Insert(72).',
    sections: [
      {
        heading: 'Hợp đồng hai hàm',
        bodyHtml:
          '<ul>' +
          '<li><code>insert(key)</code>: kiểm tra trùng bằng <code>search(key)</code>; xử lý duy nhất trường hợp gốc tách để nâng chiều cao; trả <code>True/False</code>.</li>' +
          '<li><code>_insert(node, key)</code>: trả <code>None</code> nếu con không tràn, hoặc trả <code>(middle, right)</code>. Không cần trả nút trái vì <code>node</code> cũ được cắt trực tiếp tại chỗ.</li>' +
          '</ul>',
      },
    ],
    codeSlice: { title: 'BTree.insert & BTree._insert', startLine: 33, endLine: 66 },
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Insert</span> và Split</h1>
        </header>

        <div class="s14-grid">
          <div class="s14-left">
            ${renderPythonWindow({ title: 'insert(key) -> bool', startLine: 34, endLine: 44, compact: true, blockId: 's14-pub' })}
            <div class="canva-card contract-box" data-role="contract">
              <h3>Hợp đồng trả về của <code>_insert</code></h3>
              <ul>
                <li>Con không tách → trả <code>None</code></li>
                <li>Con tách → trả <code>(middle, right)</code> (nút trái giữ nguyên tại địa chỉ cũ)</li>
              </ul>
            </div>
          </div>

          <div class="s14-mid">
            ${renderPythonWindow({ title: '_insert(node, key)', startLine: 46, endLine: 66, compact: true, blockId: 's14-priv' })}
          </div>

          <div class="s14-right">
            <div class="ticket-bar" data-role="ticket">Chờ gọi <code>insert(72)</code></div>
            <div class="s14-tree" data-role="tree"></div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const cPub = ctx.slideEl.querySelector('#s14-pub');
    const cPriv = ctx.slideEl.querySelector('#s14-priv');
    const ticket = ctx.slideEl.querySelector<HTMLElement>('[data-role="ticket"]')!;
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;

    const hlPub = [[], [35, 36, 37], [], [], [38, 39, 40, 41, 42, 43, 44]][step];
    const hlPriv = [[], [47, 50, 51], [48, 49, 57, 58, 59, 60, 61, 62, 63], [52, 53, 54, 55, 56, 64, 65, 66], []][step];
    updateCodeHighlight(cPub, hlPub);
    updateCodeHighlight(cPriv, hlPriv);

    const tickets = [
      'Chuẩn bị gọi <code>insert(72)</code> trên cây M = 4',
      '<code>search(72) is None</code> → đệ quy xuống lá <code>[52, 60, 65]</code>',
      'Lá tràn → cắt đôi tại <code>mid = 2</code>, giữ <code>[52, 60]</code>, tạo <code>right = [72]</code>',
      'Trả phiếu <code>(65, [72])</code> ↑ cha → cha tràn, cắt <code>children[mid+1:]</code>',
      'Gốc mới <code>[65]</code> nối <code>[30|50]</code> &amp; <code>[75]</code> → trả <code>True</code>',
    ];
    ticket.innerHTML = tickets[step];
    triggerStepPulse(ticket, ctx.getReducedMotion());

    const scene: TreeSceneSpec =
      step <= 1
        ? {
            viewBox: [0, 0, 360, 260],
            nodes: [
              { id: 'p14r', x: 180, y: 48, cellW: 40, cellH: 34, keys: [{ id: 'q30', label: '30' }, { id: 'q50', label: '50' }, { id: 'q75', label: '75' }] },
              { id: 'p14l0', x: 54, y: 174, cellW: 34, cellH: 30, state: 'muted', keys: [{ id: 'q10', label: '10', tone: 'muted' }] },
              { id: 'p14l2', x: 185, y: 174, cellW: 36, cellH: 32, state: step === 1 ? 'active' : 'normal', keys: [{ id: 'q52', label: '52' }, { id: 'q60', label: '60' }, { id: 'q65', label: '65' }] },
              { id: 'p14l3', x: 314, y: 174, cellW: 34, cellH: 30, state: 'muted', keys: [{ id: 'q80', label: '80', tone: 'muted' }] },
            ],
            edges: [
              { id: 'p14e0', fromNode: 'p14r', portIndex: 0, toNode: 'p14l0', state: 'muted' },
              { id: 'p14e2', fromNode: 'p14r', portIndex: 2, toNode: 'p14l2', state: step === 1 ? 'active' : 'normal', arrow: step === 1 },
              { id: 'p14e3', fromNode: 'p14r', portIndex: 3, toNode: 'p14l3', state: 'muted' },
            ],
          }
        : step === 2
          ? {
              viewBox: [0, 0, 360, 260],
              nodes: [
                { id: 'p14r', x: 180, y: 48, cellW: 40, cellH: 34, keys: [{ id: 'q30', label: '30' }, { id: 'q50', label: '50' }, { id: 'q75', label: '75' }] },
                { id: 'p14l2', x: 180, y: 174, cellW: 42, cellH: 36, state: 'overflow', tag: 'mid = 2 → 65', tagPos: 'bottom', tagTone: 'error', keys: [{ id: 'q52', label: '52' }, { id: 'q60', label: '60' }, { id: 'q65', label: '65', tone: 'active' }, { id: 'q72', label: '72', tone: 'active' }] },
              ],
              edges: [{ id: 'p14e2', fromNode: 'p14r', portIndex: 2, toNode: 'p14l2', state: 'active' }],
            }
          : step === 3
            ? {
                viewBox: [0, 0, 360, 260],
                nodes: [
                  { id: 'p14r', x: 180, y: 54, cellW: 42, cellH: 36, state: 'overflow', tag: 'Nhận (65, [72]) → Tràn!', tagTone: 'error', keys: [{ id: 'q30', label: '30' }, { id: 'q50', label: '50' }, { id: 'q65', label: '65', tone: 'active' }, { id: 'q75', label: '75' }] },
                  { id: 'p14l2', x: 112, y: 184, cellW: 38, cellH: 34, tag: 'node cũ (trái)', tagPos: 'bottom', keys: [{ id: 'q52', label: '52' }, { id: 'q60', label: '60' }] },
                  { id: 'p14l2b', x: 256, y: 184, cellW: 38, cellH: 34, state: 'success', tag: 'right mới', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'q72', label: '72', tone: 'success' }] },
                ],
                edges: [
                  { id: 'p14e2', fromNode: 'p14r', portIndex: 2, toNode: 'p14l2' },
                  { id: 'p14e2b', fromNode: 'p14r', portIndex: 3, toNode: 'p14l2b', state: 'active', label: 'i+1' },
                ],
              }
            : {
                viewBox: [0, 0, 360, 260],
                nodes: [
                  { id: 'p14rn', x: 180, y: 38, cellW: 44, cellH: 34, state: 'success', keys: [{ id: 'q65', label: '65', tone: 'success' }] },
                  { id: 'p14r', x: 102, y: 124, cellW: 40, cellH: 32, keys: [{ id: 'q30', label: '30' }, { id: 'q50', label: '50' }] },
                  { id: 'p14rr', x: 266, y: 124, cellW: 40, cellH: 32, keys: [{ id: 'q75', label: '75' }] },
                  { id: 'p14l2', x: 102, y: 214, cellW: 36, cellH: 30, keys: [{ id: 'q52', label: '52' }, { id: 'q60', label: '60' }] },
                  { id: 'p14l2b', x: 222, y: 214, cellW: 36, cellH: 30, keys: [{ id: 'q72', label: '72' }] },
                  { id: 'p14l3', x: 314, y: 214, cellW: 34, cellH: 30, keys: [{ id: 'q80', label: '80' }] },
                ],
                edges: [
                  { id: 'p14en0', fromNode: 'p14rn', portIndex: 0, toNode: 'p14r', state: 'active', arrow: true },
                  { id: 'p14en1', fromNode: 'p14rn', portIndex: 1, toNode: 'p14rr', state: 'active', arrow: true },
                  { id: 'p14e2', fromNode: 'p14r', portIndex: 2, toNode: 'p14l2' },
                  { id: 'p14e2b', fromNode: 'p14rr', portIndex: 0, toNode: 'p14l2b' },
                  { id: 'p14e3', fromNode: 'p14rr', portIndex: 1, toNode: 'p14l3' },
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
// SLIDE 15 — Python: delete và predecessor
// ============================================================================
const slide15: SlideDef = {
  number: 15,
  title: 'Python: delete và predecessor',
  chapter: '3. Cài đặt Python và trực quan hóa',
  theme: 'blue',
  stepCount: 4,
  leadIn: '“Sau khi gốc hiển thị 7, lời gọi đệ quy mang khóa nào? Nó phải xóa bản cũ của 7 dưới lá.”',
  fullScript:
    'Tương tự thao tác chèn, delete(key) gọi _delete(self.root, key) rồi kiểm tra: nếu sau khi xóa mà gốc rỗng và không phải nút lá, đẩy con duy nhất lên làm self.root để giảm chiều cao. Trong _delete(node, key), nếu ở lá và tìm thấy thì pop(i) trả True (không thấy trả False). Nếu tìm thấy ở nút trong, tìm predecessor bằng cách vào children[i] rồi đi tận cùng về phải (children[-1]), ghi đè node.keys[i] = predecessor.keys[-1], gán lại biến key thành giá trị đó rồi đệ quy xóa bản cũ ở lá. Khi quay lên, nếu deleted và con có ít hơn min_keys khóa thì gọi _fix_underflow(node, i).',
  fullView: {
    summary: 'Cài đặt delete(key) và _delete(node, key) kèm đồng bộ biến key, i, deleted trên ví dụ Delete(10).',
    sections: [
      {
        heading: 'Vai trò hai hàm',
        bodyHtml:
          '<ul>' +
          '<li><code>delete(key)</code>: tập trung việc thu gọn <code>self.root</code> khi gốc là nút trong rỗng (xem lại Trang 11).</li>' +
          '<li><code>_delete(node, key)</code>: biến bài toán xóa nút trong về xóa tiền nhiệm ở lá, rồi dùng cờ <code>deleted</code> khi quay lui để gọi <code>_fix_underflow</code> khi cần.</li>' +
          '</ul>',
      },
    ],
    codeSlice: { title: 'BTree.delete & BTree._delete', startLine: 68, endLine: 90 },
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <h1 class="slide-title"><span>Delete</span> và Predecessor</h1>
          </div>
          <button type="button" class="inline-action-btn" data-role="goto-12">↩ Xem ví dụ thu gọn gốc (Trang 11)</button>
        </header>

        <div class="s15-grid">
          <div class="s15-left">
            ${renderPythonWindow({ title: 'delete(key) -> bool', startLine: 69, endLine: 73, compact: true, blockId: 's15-pub' })}
            <div class="canva-card var-watch" data-role="vars"></div>
            <div class="s15-tree" data-role="tree"></div>
          </div>

          <div class="s15-right">
            ${renderPythonWindow({ title: '_delete(node, key)', startLine: 75, endLine: 90, compact: true, blockId: 's15-priv' })}
            <div class="canva-card note-strip" data-role="note"></div>
          </div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="goto-12"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      ctx.goToSlide(11);
    });
  },
  renderStep(step, _prev, ctx) {
    const cPub = ctx.slideEl.querySelector('#s15-pub');
    const cPriv = ctx.slideEl.querySelector('#s15-priv');
    const vars = ctx.slideEl.querySelector<HTMLElement>('[data-role="vars"]')!;
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const note = ctx.slideEl.querySelector<HTMLElement>('[data-role="note"]')!;

    const hlPub = [[], [70], [], [], [71, 72, 73]][step];
    const hlPriv = [[], [76, 77, 78, 79, 80, 81], [82, 83, 84, 85, 86, 87], [88, 89, 90], []][step];
    updateCodeHighlight(cPub, hlPub);
    updateCodeHighlight(cPriv, hlPriv);

    const varHtml = [
      '<strong>Biến theo dõi:</strong> <code>key = 10</code> · <code>i = ?</code> · <code>deleted = ?</code>',
      '<strong>Biến:</strong> <code>key = 10</code> · <code>i = 0</code> · <code>found = True</code> · <code>node.leaf = False</code>',
      '<strong>Biến:</strong> <code>key: 10 → <strong>7</strong></code> (predecessor) · <code>node.keys[0] = 7</code>',
      '<strong>Biến:</strong> <code>_delete(children[0], 7)</code> → <code>deleted = True</code> · lá còn <code>[5]</code> (1 ≥ 1)',
      '<strong>Kiểm tra gốc:</strong> <code>self.root.keys = [7, 20]</code> (không rỗng) → giữ nguyên chiều cao.',
    ];
    vars.innerHTML = varHtml[step];
    triggerStepPulse(vars, ctx.getReducedMotion());

    const notes = [
      'Cây ví dụ Trang 09 (M = 3): chuẩn bị chạy <code>delete(10)</code>.',
      'Nhánh <code>if node.leaf</code> xử lý xóa trực tiếp hoặc trả <code>False</code> nếu không tìm thấy. Ở đây 10 nằm tại nút trong.',
      'Vòng <code>while not predecessor.leaf</code> đi tận cùng bên phải của nhánh trái → gặp <strong>7</strong>, gán đè lên 10 và đổi <code>key = 7</code>.',
      'Lời gọi đệ quy xóa bản <strong>7</strong> cũ ở lá trả <code>True</code>. Vì <code>len([5]) == 1 ≥ min_keys</code> nên không cần gọi <code>_fix_underflow</code>.',
      'Dòng <code>if not self.root.keys and not self.root.leaf</code> chỉ kích hoạt khi gốc bị rỗng (như ví dụ Delete(5) ở Trang 11).',
    ];
    note.innerHTML = notes[step];

    const scene: TreeSceneSpec = {
      viewBox: [0, 0, 520, 175],
      nodes: [
        {
          id: 'p15r',
          x: 260,
          y: 38,
          cellW: 48,
          cellH: 34,
          state: step === 4 ? 'success' : 'normal',
          keys: [
            {
              id: 'p15-k0',
              label: step >= 2 ? '7' : '10',
              tone: step === 1 ? 'error' : step >= 2 ? 'success' : 'default',
            },
            { id: 'p15-20', label: '20' },
          ],
        },
        {
          id: 'p15l0',
          x: 110,
          y: 132,
          cellW: 44,
          cellH: 34,
          state: step === 2 ? 'active' : step >= 3 ? 'success' : 'normal',
          keys:
            step >= 3
              ? [{ id: 'p15-5', label: '5', tone: 'success' }]
              : [
                  { id: 'p15-5', label: '5' },
                  { id: 'p15-7', label: '7', tone: step === 2 ? 'active' : 'default' },
                ],
        },
        { id: 'p15l1', x: 260, y: 132, cellW: 42, cellH: 32, keys: [{ id: 'p15-12', label: '12' }, { id: 'p15-17', label: '17' }] },
        { id: 'p15l2', x: 410, y: 132, cellW: 42, cellH: 32, keys: [{ id: 'p15-25', label: '25' }, { id: 'p15-30', label: '30' }] },
      ],
      edges: [
        { id: 'p15e0', fromNode: 'p15r', portIndex: 0, toNode: 'p15l0', state: step >= 2 ? 'active' : 'normal', arrow: step >= 2 },
        { id: 'p15e1', fromNode: 'p15r', portIndex: 1, toNode: 'p15l1' },
        { id: 'p15e2', fromNode: 'p15r', portIndex: 2, toNode: 'p15l2' },
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
// SLIDE 16 — Python: _fix_underflow(parent, i)
// ============================================================================
const slide16: SlideDef = {
  number: 16,
  title: 'Python: _fix_underflow(parent, i)',
  chapter: '3. Cài đặt Python và trực quan hóa',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Một phép mượn ở nút trong còn mang theo cả một khoảng giá trị. Nếu quên chuyển cạnh, khóa nhìn vẫn đúng nhưng tìm kiếm sẽ rẽ sai.”',
  fullScript:
    'Hàm _fix_underflow(parent, i) nhận nút cha và chỉ số i của nút con đang thiếu khóa nên từng nút không cần lưu con trỏ ngược về cha. Thứ tự ưu tiên 3 nhánh: (1) Nếu anh em trái dư khóa, kéo parent.keys[i-1] xuống đầu child, đưa left.keys.pop() lên cha; nếu là nút trong phải chuyển luôn left.children.pop() sang đầu child.children rồi return. (2) Nếu anh em phải dư khóa, làm đối xứng với parent.keys[i] và right.keys.pop(0) (cùng right.children.pop(0) nếu là nút trong) rồi return. (3) Nếu không mượn được, chọn cặp liền kề (lùi i nếu thiếu anh em phải), nối left.keys + parent.keys.pop(i) + right.keys và nối children, rồi bỏ tham chiếu nút phải khỏi parent.',
  fullView: {
    summary: 'Ba nhánh ưu tiên trong _fix_underflow(parent, i): mượn trái, mượn phải (chuyển kèm nhánh con nếu nút trong), và gộp nút.',
    sections: [
      {
        heading: 'Chi tiết 3 nhánh',
        bodyHtml:
          '<ol>' +
          '<li><strong>Mượn trái:</strong> <code>parent.keys[i-1]</code> → đầu <code>child</code>; khóa cuối của <code>left</code> → cha; con cuối của <code>left</code> → đầu <code>child.children</code>.</li>' +
          '<li><strong>Mượn phải:</strong> <code>parent.keys[i]</code> → cuối <code>child</code>; khóa đầu của <code>right</code> → cha; con đầu của <code>right</code> → cuối <code>child.children</code>.</li>' +
          '<li><strong>Gộp nút:</strong> nếu <code>right is None</code> thì <code>i -= 1</code>; nối <code>left + parent.keys.pop(i) + right</code> và nối <code>children</code>, bỏ nút phải khỏi <code>parent.children</code>.</li>' +
          '</ol>',
      },
    ],
    codeSlice: { title: 'BTree._fix_underflow(parent, i)', startLine: 92, endLine: 113 },
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Borrow</span> và Merge (_fix_underflow)</h1>
        </header>

        <div class="s16-grid">
          <div class="s16-code">
            ${renderPythonWindow({ title: '_fix_underflow(parent, i)', startLine: 93, endLine: 113, compact: true, blockId: 's16-code' })}
          </div>

          <div class="s16-right">
            <div class="s16-branch-pill" data-role="branch">Cấu trúc tham số: <code>left ← parent.children[i] → right</code></div>
            <div class="s16-tree" data-role="tree"></div>
            <div class="canva-card s16-note" data-role="note"></div>
          </div>
        </div>
      </div>
    `;
  },
  renderStep(step, _prev, ctx) {
    const codeEl = ctx.slideEl.querySelector('#s16-code');
    const branch = ctx.slideEl.querySelector<HTMLElement>('[data-role="branch"]')!;
    const treeBox = ctx.slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
    const note = ctx.slideEl.querySelector<HTMLElement>('[data-role="note"]')!;

    const hlLines = [
      [93, 94, 95, 96],
      [97, 98, 99, 100, 101, 102],
      [103, 104, 105, 106, 107, 108],
      [109, 110, 111, 112, 113],
    ][step];
    updateCodeHighlight(codeEl, hlLines);

    const branchTitles = [
      'Cấu trúc: <code>left ← child[i] → right</code> dưới cùng <code>parent</code>',
      'Nhánh 1 · Mượn từ anh em trái (<code>len(left.keys) &gt; min_keys</code>)',
      'Nhánh 2 · Mượn từ anh em phải (ví dụ <code>10 ↓, 12 ↑</code> ở Trang 10)',
      'Nhánh 3 · Gộp cặp liền kề &amp; trả quyền kiểm tra cha cho <code>_delete</code>',
    ];
    branch.innerHTML = branchTitles[step];
    triggerStepPulse(branch, ctx.getReducedMotion());

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 560, 260],
            nodes: [
              { id: 'f-par', x: 280, y: 48, cellW: 68, cellH: 40, keys: [{ id: 'fk-p0', label: 'k[i-1]' }, { id: 'fk-p1', label: 'k[i]' }] },
              { id: 'f-left', x: 100, y: 174, cellW: 54, cellH: 38, tag: 'left', tagPos: 'bottom', keys: [{ id: 'fk-l', label: '…' }] },
              { id: 'f-child', x: 280, y: 174, cellW: 64, cellH: 38, state: 'underflow', tag: 'child[i] thiếu', tagPos: 'bottom', tagTone: 'error', keys: [] },
              { id: 'f-right', x: 460, y: 174, cellW: 54, cellH: 38, tag: 'right', tagPos: 'bottom', keys: [{ id: 'fk-r', label: '…' }] },
            ],
            edges: [
              { id: 'fe0', fromNode: 'f-par', portIndex: 0, toNode: 'f-left' },
              { id: 'fe1', fromNode: 'f-par', portIndex: 1, toNode: 'f-child', state: 'error' },
              { id: 'fe2', fromNode: 'f-par', portIndex: 2, toNode: 'f-right' },
            ],
          }
        : step === 1
          ? {
              viewBox: [0, 0, 560, 260],
              nodes: [
                { id: 'f-par', x: 280, y: 44, cellW: 66, cellH: 38, keys: [{ id: 'fk-p0', label: '30', tone: 'active' }] },
                { id: 'f-left', x: 130, y: 146, cellW: 50, cellH: 38, state: 'success', showPorts: true, tag: 'left dư (c2 chuyển sang!)', tagPos: 'bottom', tagTone: 'cobalt', keys: [{ id: 'fk-l1', label: '10' }, { id: 'fk-l2', label: '20', tone: 'active' }] },
                { id: 'f-child', x: 410, y: 146, cellW: 54, cellH: 38, state: 'underflow', showPorts: true, tag: 'child[i] nhận 30 & nhánh c2', tagPos: 'bottom', tagTone: 'error', keys: [] },
              ],
              edges: [
                { id: 'fe0', fromNode: 'f-par', portIndex: 0, toNode: 'f-left' },
                { id: 'fe1', fromNode: 'f-par', portIndex: 1, toNode: 'f-child', state: 'error' },
              ],
              transfers: [
                { id: 'ft-l1', fromX: 162, fromY: 122, toX: 256, toY: 50, ctrlX: 185, ctrlY: 54, label: '20 ↑ cha', tone: 'success' },
                { id: 'ft-l2', fromX: 312, fromY: 54, toX: 392, toY: 120, ctrlX: 378, ctrlY: 66, label: '30 ↓ đầu child', tone: 'warn' },
                { id: 'ft-lc', fromX: 182, fromY: 178, toX: 376, toY: 178, ctrlX: 280, ctrlY: 238, label: 'left.children.pop() → đầu child', tone: 'cobalt' },
              ],
            }
          : step === 2
            ? {
                viewBox: [0, 0, 560, 260],
                nodes: [
                  { id: 'f-par', x: 280, y: 44, cellW: 58, cellH: 38, keys: [{ id: 'fk-10', label: '10', tone: 'active' }, { id: 'fk-20', label: '20' }] },
                  { id: 'f-child', x: 118, y: 158, cellW: 56, cellH: 38, state: 'underflow', tag: 'child[0] nhận 10', tagPos: 'bottom', tagTone: 'error', keys: [] },
                  { id: 'f-right', x: 295, y: 158, cellW: 52, cellH: 38, state: 'success', tag: 'right dư → đẩy 12 ↑', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'fk-12', label: '12', tone: 'active' }, { id: 'fk-17', label: '17' }] },
                  { id: 'f-r2', x: 465, y: 158, cellW: 48, cellH: 38, keys: [{ id: 'fk-25', label: '25' }] },
                ],
                edges: [
                  { id: 'fe0', fromNode: 'f-par', portIndex: 0, toNode: 'f-child', state: 'error' },
                  { id: 'fe1', fromNode: 'f-par', portIndex: 1, toNode: 'f-right' },
                  { id: 'fe2', fromNode: 'f-par', portIndex: 2, toNode: 'f-r2' },
                ],
                transfers: [
                  { id: 'ft-r1', fromX: 244, fromY: 56, toX: 132, toY: 134, ctrlX: 162, ctrlY: 64, label: '10 ↓ cuối child', tone: 'warn' },
                  { id: 'ft-r2', fromX: 266, fromY: 136, toX: 256, toY: 66, ctrlX: 306, ctrlY: 102, label: '12 ↑ cha', tone: 'success' },
                ],
              }
            : {
                viewBox: [0, 0, 560, 260],
                nodes: [
                  { id: 'f-par', x: 280, y: 44, cellW: 58, cellH: 38, tag: 'parent.keys.pop(i) & children.pop(i+1)', tagTone: 'cobalt', keys: [{ id: 'fk-20', label: '20' }] },
                  { id: 'f-merged', x: 205, y: 168, cellW: 66, cellH: 42, state: 'success', tag: 'left + sep(10) + right', tagPos: 'bottom', tagTone: 'success', keys: [{ id: 'fk-10', label: '10', tone: 'success' }, { id: 'fk-12', label: '12', tone: 'success' }] },
                  { id: 'f-r2', x: 430, y: 168, cellW: 54, cellH: 40, keys: [{ id: 'fk-25', label: '25' }] },
                ],
                edges: [
                  { id: 'fe0', fromNode: 'f-par', portIndex: 0, toNode: 'f-merged', state: 'active', arrow: true },
                  { id: 'fe2', fromNode: 'f-par', portIndex: 1, toNode: 'f-r2' },
                ],
              };

    renderTreeScene(treeBox, scene, { reducedMotion: ctx.getReducedMotion() });

    const notes = [
      'Nhận <code>(parent, i)</code> nên không cần con trỏ ngược về cha. Xác định <code>left</code> và <code>right</code> rồi xét theo đúng thứ tự 3 nhánh.',
      '<strong>Mượn trái:</strong> chuyển cả khóa biên <em>lẫn nhánh con ngoài cùng</em> nếu là nút trong — quên chuyển cạnh sẽ khiến khoảng tìm kiếm sai lệch!',
      '<strong>Mượn phải:</strong> đối xứng với mượn trái; lệnh <code>return</code> kết thúc ngay khi mượn thành công vì cha không mất khóa.',
      '<strong>Gộp nút:</strong> nếu <code>right is None</code> lùi <code>i -= 1</code> để gộp với trái. Việc kiểm tra cha có bị thiếu khóa hay không do <code>_delete()</code> tiếp tục ở tầng trên.',
    ];
    note.innerHTML = notes[step];
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

// ============================================================================
// SLIDE 17 — Chạy thử B-tree bằng Python (Hiệu ứng gõ code + Console + Cây trực tiếp)
// ============================================================================
interface PyDemoBlock {
  lines: string[];
  stdout: string[];
  cmdBadge: string;
  meta: string;
  note: string;
  scene: TreeSceneSpec;
}

const PY_DEMO_BLOCKS: PyDemoBlock[] = [
  {
    lines: ['# Demo chạy trực tiếp lớp BTree(M=3)', 'from btree import BTree'],
    stdout: [],
    cmdBadge: 'Sẵn sàng chạy demo_btree.py',
    meta: 'M = 3 · 0 khóa · h = 0',
    note: 'Nhấn <strong>→</strong> để gõ từng khối lệnh Python hoặc nhấn <strong>Chạy tự động</strong> để xem toàn bộ quá trình gõ và chạy.',
    scene: {
      viewBox: [0, 0, 560, 270],
      nodes: [
        {
          id: 'py-r',
          x: 280,
          y: 124,
          cellW: 96,
          cellH: 46,
          tag: 'self.root = BTreeNode(leaf=True)',
          tagTone: 'cobalt',
          keys: [{ id: 'py-empty', label: '[]', tone: 'muted' }],
        },
      ],
      edges: [],
    },
  },
  {
    lines: [
      'tree = BTree(M=3)',
      'for k in [10, 20, 5, 6, 12]:',
      '    tree.insert(k)',
      'print("root:", tree.root.keys)',
    ],
    stdout: ['root: [10]', 'leaves: [[5, 6], [12, 20]]'],
    cmdBadge: 'insert([10, 20, 5, 6, 12]) → Split gốc',
    meta: 'M = 3 · 5 khóa · h = 1',
    note: '<strong>Chèn 5 khóa đầu:</strong> khi chèn <code>5</code>, nút gốc <code>[5, 10, 20]</code> tràn (&gt; 2 khóa) → đẩy <code>10</code> lên làm gốc mới, tách thành 2 lá.',
    scene: {
      viewBox: [0, 0, 560, 270],
      nodes: [
        {
          id: 'py-r',
          x: 280,
          y: 58,
          cellW: 60,
          cellH: 42,
          state: 'active',
          tag: 'root.keys = [10]',
          tagTone: 'cobalt',
          keys: [{ id: 'pk-10', label: '10', tone: 'active' }],
        },
        {
          id: 'py-l0',
          x: 156,
          y: 192,
          cellW: 54,
          cellH: 40,
          keys: [
            { id: 'pk-5', label: '5', tone: 'success' },
            { id: 'pk-6', label: '6', tone: 'success' },
          ],
        },
        {
          id: 'py-l1',
          x: 404,
          y: 192,
          cellW: 54,
          cellH: 40,
          keys: [
            { id: 'pk-12', label: '12', tone: 'success' },
            { id: 'pk-20', label: '20', tone: 'success' },
          ],
        },
      ],
      edges: [
        { id: 'pye0', fromNode: 'py-r', portIndex: 0, toNode: 'py-l0', state: 'active', arrow: true },
        { id: 'pye1', fromNode: 'py-r', portIndex: 1, toNode: 'py-l1', state: 'active', arrow: true },
      ],
      baselineY: { y: 234, x1: 62, x2: 498, label: 'Mọi lá cùng độ sâu h = 1' },
    },
  },
  {
    lines: [
      'for k in [30, 17]:',
      '    tree.insert(k)',
      'print("root:", tree.root.keys)',
    ],
    stdout: ['root: [10, 20]', 'leaves: [[5, 6], [12, 17], [30]]'],
    cmdBadge: 'insert(30), insert(17) → Tách lá phải',
    meta: 'M = 3 · 7 khóa · h = 1',
    note: '<strong>Chèn 30 &amp; 17:</strong> lá <code>[12, 20, 30]</code> tràn → trả phiếu <code>(20, [30])</code> lên gốc thành <code>[10 | 20]</code>; sau đó <code>17</code> rơi vào lá giữa <code>[12 | 17]</code>.',
    scene: {
      viewBox: [0, 0, 560, 270],
      nodes: [
        {
          id: 'py-r',
          x: 280,
          y: 58,
          cellW: 60,
          cellH: 42,
          state: 'active',
          tag: 'root.keys = [10, 20]',
          tagTone: 'cobalt',
          keys: [
            { id: 'pk-10', label: '10' },
            { id: 'pk-20', label: '20', tone: 'active' },
          ],
        },
        {
          id: 'py-l0',
          x: 102,
          y: 192,
          cellW: 52,
          cellH: 40,
          keys: [
            { id: 'pk-5', label: '5' },
            { id: 'pk-6', label: '6' },
          ],
        },
        {
          id: 'py-l1',
          x: 280,
          y: 192,
          cellW: 52,
          cellH: 40,
          state: 'success',
          keys: [
            { id: 'pk-12', label: '12' },
            { id: 'pk-17', label: '17', tone: 'success' },
          ],
        },
        {
          id: 'py-l2',
          x: 458,
          y: 192,
          cellW: 52,
          cellH: 40,
          state: 'success',
          keys: [{ id: 'pk-30', label: '30', tone: 'success' }],
        },
      ],
      edges: [
        { id: 'pye0', fromNode: 'py-r', portIndex: 0, toNode: 'py-l0' },
        { id: 'pye1', fromNode: 'py-r', portIndex: 1, toNode: 'py-l1', state: 'active', arrow: true },
        { id: 'pye2', fromNode: 'py-r', portIndex: 2, toNode: 'py-l2', state: 'active', arrow: true },
      ],
      baselineY: { y: 234, x1: 42, x2: 518, label: 'Khớp đúng cây B-tree ở Trang bìa!' },
    },
  },
  {
    lines: [
      'res = tree.search(17)',
      'print("search(17) ->", res[0].keys, "idx =", res[1])',
      'print("search(16) ->", tree.search(16))',
    ],
    stdout: ['search(17) -> [12, 17] idx = 1', 'search(16) -> None'],
    cmdBadge: 'search(17) → (node, 1) · search(16) → None',
    meta: 'M = 3 · 7 khóa · 2 mức duyệt',
    note: '<strong>Tìm kiếm với <code>bisect_left</code>:</strong> <code>17</code> rẽ nhánh <code>i = 1</code> xuống <code>[12 | 17]</code> khớp chỉ số <code>1</code>; còn <code>16</code> không khớp ở lá nên trả <code>None</code>.',
    scene: {
      viewBox: [0, 0, 560, 270],
      nodes: [
        {
          id: 'py-r',
          x: 280,
          y: 58,
          cellW: 60,
          cellH: 42,
          state: 'active',
          tag: 'bisect_left(17) → i = 1',
          tagTone: 'cobalt',
          keys: [
            { id: 'pk-10', label: '10' },
            { id: 'pk-20', label: '20', tone: 'active' },
          ],
        },
        {
          id: 'py-l0',
          x: 102,
          y: 192,
          cellW: 52,
          cellH: 40,
          state: 'muted',
          keys: [
            { id: 'pk-5', label: '5', tone: 'muted' },
            { id: 'pk-6', label: '6', tone: 'muted' },
          ],
        },
        {
          id: 'py-l1',
          x: 280,
          y: 192,
          cellW: 54,
          cellH: 42,
          state: 'success',
          tag: 'Trả (node, idx=1)',
          tagPos: 'bottom',
          tagTone: 'success',
          keys: [
            { id: 'pk-12', label: '12', sublabel: '0' },
            { id: 'pk-17', label: '17', sublabel: '1', tone: 'success' },
          ],
        },
        {
          id: 'py-l2',
          x: 458,
          y: 192,
          cellW: 52,
          cellH: 40,
          state: 'muted',
          keys: [{ id: 'pk-30', label: '30', tone: 'muted' }],
        },
      ],
      edges: [
        { id: 'pye0', fromNode: 'py-r', portIndex: 0, toNode: 'py-l0', state: 'muted' },
        { id: 'pye1', fromNode: 'py-r', portIndex: 1, toNode: 'py-l1', state: 'active', arrow: true, label: '10 < 17 < 20' },
        { id: 'pye2', fromNode: 'py-r', portIndex: 2, toNode: 'py-l2', state: 'muted' },
      ],
    },
  },
  {
    lines: [
      'ok = tree.delete(30)',
      'print("delete(30) ->", ok)',
      'print("root:", tree.root.keys)',
    ],
    stdout: ['delete(30) -> True', 'root: [10, 17]  # Borrow từ anh em trái'],
    cmdBadge: 'delete(30) → _fix_underflow (Borrow trái)',
    meta: 'M = 3 · 6 khóa · h = 1',
    note: '<strong>Xóa 30 kích hoạt <code>_fix_underflow</code>:</strong> lá phải rỗng, anh em trái <code>[12, 17]</code> dư khóa → đẩy <code>17 ↑</code> gốc và kéo <code>20 ↓</code> lấp lá phải.',
    scene: {
      viewBox: [0, 0, 560, 270],
      nodes: [
        {
          id: 'py-r',
          x: 280,
          y: 58,
          cellW: 60,
          cellH: 42,
          state: 'success',
          tag: 'root.keys = [10, 17]',
          tagTone: 'success',
          keys: [
            { id: 'pk-10', label: '10' },
            { id: 'pk-17', label: '17', tone: 'success' },
          ],
        },
        {
          id: 'py-l0',
          x: 102,
          y: 192,
          cellW: 52,
          cellH: 40,
          keys: [
            { id: 'pk-5', label: '5' },
            { id: 'pk-6', label: '6' },
          ],
        },
        {
          id: 'py-l1',
          x: 280,
          y: 192,
          cellW: 52,
          cellH: 40,
          state: 'active',
          tag: 'Cho mượn 17',
          tagPos: 'bottom',
          tagTone: 'cobalt',
          keys: [{ id: 'pk-12', label: '12' }],
        },
        {
          id: 'py-l2',
          x: 458,
          y: 192,
          cellW: 52,
          cellH: 40,
          state: 'success',
          tag: 'Nhận 20 từ cha',
          tagPos: 'bottom',
          tagTone: 'success',
          keys: [{ id: 'pk-20', label: '20', tone: 'success' }],
        },
      ],
      edges: [
        { id: 'pye0', fromNode: 'py-r', portIndex: 0, toNode: 'py-l0' },
        { id: 'pye1', fromNode: 'py-r', portIndex: 1, toNode: 'py-l1', state: 'active' },
        { id: 'pye2', fromNode: 'py-r', portIndex: 2, toNode: 'py-l2', state: 'active', arrow: true },
      ],
      transfers: [
        { id: 'pytr-17', fromX: 304, fromY: 168, toX: 308, toY: 80, ctrlX: 256, ctrlY: 118, label: '17 ↑', tone: 'success' },
        { id: 'pytr-20', fromX: 334, fromY: 72, toX: 438, toY: 168, ctrlX: 422, ctrlY: 96, label: '20 ↓', tone: 'warn' },
      ],
    },
  },
];

interface PyDemoRuntime {
  timerId: number | null;
  autoTimerId: number | null;
  autoRunning: boolean;
  currentStep: number;
}

const pyDemoState = new WeakMap<HTMLElement, PyDemoRuntime>();

function stopPyDemoTimers(slideEl: HTMLElement): void {
  const rt = pyDemoState.get(slideEl);
  if (!rt) return;
  if (rt.timerId !== null) {
    window.clearTimeout(rt.timerId);
    rt.timerId = null;
  }
  if (rt.autoTimerId !== null) {
    window.clearTimeout(rt.autoTimerId);
    rt.autoTimerId = null;
  }
  rt.autoRunning = false;
  const autoBtn = slideEl.querySelector<HTMLButtonElement>('[data-role="py-autoplay"]');
  if (autoBtn) {
    autoBtn.textContent = '▶ Chạy tự động';
    autoBtn.classList.remove('inline-action-btn--primary');
  }
}

function renderPyEditorSnapshot(
  editorBody: HTMLElement,
  completedStep: number,
  activeLines?: string[],
  typingLineIdx?: number,
  typedCharCount?: number,
): void {
  const html: string[] = [];
  let ln = 1;

  for (let s = 0; s <= completedStep; s++) {
    for (const raw of PY_DEMO_BLOCKS[s].lines) {
      html.push(
        `<div class="code-line">` +
          `<span class="code-ln">${ln}</span>` +
          `<span class="code-txt">${highlightPythonLine(raw)}</span>` +
        `</div>`,
      );
      ln++;
    }
  }

  if (activeLines && typingLineIdx !== undefined && typedCharCount !== undefined) {
    for (let i = 0; i <= typingLineIdx && i < activeLines.length; i++) {
      const fullLine = activeLines[i];
      const isCurrent = i === typingLineIdx;
      const partial = isCurrent ? fullLine.slice(0, typedCharCount) : fullLine;
      const rendered = partial.length > 0 ? highlightPythonLine(partial) : '';
      html.push(
        `<div class="code-line is-hl${isCurrent ? ' is-typing-line' : ''}">` +
          `<span class="code-ln">${ln}</span>` +
          `<span class="code-txt">${rendered}${isCurrent ? '<span class="py-caret" aria-hidden="true"></span>' : ''}</span>` +
        `</div>`,
      );
      ln++;
    }
  } else {
    // Resting blinking cursor on the last line
    html.push(
      `<div class="code-line is-idle-cursor">` +
        `<span class="code-ln">${ln}</span>` +
        `<span class="code-txt"><span class="py-caret" aria-hidden="true"></span></span>` +
      `</div>`,
    );
  }

  editorBody.innerHTML = html.join('');
}

function renderPyTerminal(termBody: HTMLElement, upToStep: number, statusText: string, isRunning: boolean): void {
  const rows: string[] = [
    `<div class="term-cmd"><span class="term-prompt">$</span> python demo_btree.py <span class="term-state${isRunning ? ' is-running' : ''}">${statusText}</span></div>`,
  ];
  for (let s = 1; s <= upToStep; s++) {
    const isNewest = s === upToStep;
    for (const out of PY_DEMO_BLOCKS[s].stdout) {
      rows.push(
        `<div class="term-out${isNewest ? ' is-new-out' : ''}"><span class="term-arrow">›</span> ${out}</div>`,
      );
    }
  }
  termBody.innerHTML = rows.join('');
}

function playPyDemoStep(
  slideEl: HTMLElement,
  step: number,
  animateTyping: boolean,
  reducedMotion: boolean,
  onDone?: () => void,
): void {
  const rt = pyDemoState.get(slideEl);
  if (!rt) return;
  if (rt.timerId !== null) {
    window.clearTimeout(rt.timerId);
    rt.timerId = null;
  }
  rt.currentStep = step;

  const editorBody = slideEl.querySelector<HTMLElement>('[data-role="py-editor"]')!;
  const termBody = slideEl.querySelector<HTMLElement>('[data-role="py-term"]')!;
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const badge = slideEl.querySelector<HTMLElement>('[data-role="py-badge"]')!;
  const meta = slideEl.querySelector<HTMLElement>('[data-role="py-meta"]')!;
  const note = slideEl.querySelector<HTMLElement>('[data-role="py-note"]')!;
  const block = PY_DEMO_BLOCKS[step];

  const finishStep = () => {
    renderPyEditorSnapshot(editorBody, step);
    renderPyTerminal(termBody, step, step === 0 ? 'ready' : 'exit 0', false);
    badge.textContent = block.cmdBadge;
    meta.textContent = block.meta;
    note.innerHTML = block.note;
    renderTreeScene(treeBox, block.scene, { reducedMotion, durationMs: 480 });
    triggerStepPulse(badge, reducedMotion);
    onDone?.();
  };

  if (!animateTyping || reducedMotion) {
    finishStep();
    return;
  }

  // Show previous tree state while typing the new Python lines
  const prevIdx = Math.max(0, step - 1);
  if (step > 0) {
    renderTreeScene(treeBox, PY_DEMO_BLOCKS[prevIdx].scene, { reducedMotion: true });
  } else {
    renderTreeScene(treeBox, block.scene, { reducedMotion: true });
  }
  renderPyTerminal(termBody, prevIdx, 'typing…', true);
  badge.textContent = `Đang gõ nhịp ${step}/${PY_DEMO_BLOCKS.length - 1}…`;
  meta.textContent = PY_DEMO_BLOCKS[prevIdx].meta;
  note.innerHTML = block.note;

  const linesToType = block.lines;
  let lineIdx = 0;
  let charIdx = 0;

  const tick = () => {
    renderPyEditorSnapshot(editorBody, step - 1, linesToType, lineIdx, charIdx);
    const curLine = linesToType[lineIdx];
    if (charIdx < curLine.length) {
      const ch = curLine[charIdx];
      charIdx++;
      const delay = ch === ' ' ? 14 : 21;
      rt.timerId = window.setTimeout(tick, delay);
    } else if (lineIdx < linesToType.length - 1) {
      lineIdx++;
      charIdx = 0;
      rt.timerId = window.setTimeout(tick, 90);
    } else {
      rt.timerId = window.setTimeout(() => {
        rt.timerId = null;
        finishStep();
      }, 160);
    }
  };

  tick();
}

const slide17PyDemo: SlideDef = {
  number: 17,
  title: 'Chạy thử B-tree bằng Python',
  chapter: '3. Cài đặt Python và trực quan hóa',
  theme: 'blue',
  stepCount: 4,
  leadIn: '“Bây giờ mình chạy trực tiếp lớp BTree(M=3) vừa cài đặt: chèn 7 khóa dựng lại đúng cây bìa, thử search(17)/search(16), rồi gọi delete(30) để thấy _fix_underflow tự mượn khóa.”',
  fullScript:
    'Để kiểm chứng toàn bộ mã Python vừa trình bày, ta chạy kịch bản demo_btree.py với M = 3. Nhịp 1: khởi tạo BTree(3) và chèn 10, 20, 5, 6, 12 — gốc tràn và tự tách thành [10] với hai lá [5, 6] và [12, 20]. Nhịp 2: chèn tiếp 30 và 17 — lá phải tách đẩy 20 lên gốc, thu được đúng cây bìa [10, 20] với ba lá [5, 6], [12, 17], [30]. Nhịp 3: gọi search(17) trả về nút [12, 17] tại chỉ số 1, còn search(16) trả None. Nhịp 4: gọi delete(30) làm lá phải rỗng, kích hoạt _fix_underflow mượn 17 từ anh em trái qua cha, cập nhật gốc thành [10, 17].',
  fullView: {
    summary: 'Mô phỏng gõ mã và chạy trực tiếp lớp BTree(M=3) bằng Python với 4 nhịp: insert + split gốc, tách lá, search(17)/search(16) và delete(30) kích hoạt Borrow.',
    sections: [
      {
        heading: 'Kịch bản thực thi demo_btree.py (M = 3)',
        bodyHtml:
          '<ol>' +
          '<li><code>insert([10, 20, 5, 6, 12])</code> → tách gốc thành <code>[10]</code> và 2 lá <code>[5, 6]</code>, <code>[12, 20]</code>.</li>' +
          '<li><code>insert([30, 17])</code> → tách lá phải đẩy <code>20</code> lên gốc thành <code>[10, 20]</code>; dựng lại đúng cây bìa.</li>' +
          '<li><code>search(17)</code> → <code>([12, 17], 1)</code>; <code>search(16)</code> → <code>None</code>.</li>' +
          '<li><code>delete(30)</code> → <code>_fix_underflow</code> mượn <code>17 ↑</code> cha, hạ <code>20 ↓</code> lá phải → <code>root = [10, 17]</code>.</li>' +
          '</ol>',
      },
    ],
  },
  mount(ctx) {
    pyDemoState.set(ctx.slideEl, {
      timerId: null,
      autoTimerId: null,
      autoRunning: false,
      currentStep: 0,
    });

    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header slide-header--split">
          <div>
            <div class="slide-chapter-head">3. Cài đặt Python</div>
            <h1 class="slide-title slide-title--sub"><span>Chạy thử</span> B-tree bằng Python</h1>
          </div>
          <div class="btn-row">
            <button type="button" class="inline-action-btn" data-role="py-replay">↺ Gõ lại nhịp</button>
            <button type="button" class="inline-action-btn" data-role="py-autoplay">▶ Chạy tự động</button>
          </div>
        </header>

        <div class="s17py-grid">
          <div class="s17py-left">
            <div class="code-window s17py-editor">
              <div class="code-window__bar">
                <span class="cw-dots"><i></i><i></i><i></i></span>
                <span class="cw-title">demo_btree.py · Python 3.12</span>
                <span class="s17py-live-pill">LIVE</span>
              </div>
              <div class="code-window__body s17py-editor-body" data-role="py-editor"></div>
            </div>

            <div class="s17py-terminal">
              <div class="s17py-term-head">TERMINAL · STDOUT</div>
              <div class="s17py-term-body" data-role="py-term"></div>
            </div>
          </div>

          <div class="s17py-right">
            <div class="s17py-status-strip">
              <span class="s17py-cmd-badge" data-role="py-badge">Sẵn sàng chạy demo_btree.py</span>
              <span class="s17py-meta-pill" data-role="py-meta">M = 3 · 0 khóa · h = 0</span>
            </div>
            <div class="s17py-tree" data-role="tree"></div>
            <div class="canva-card note-strip s17py-note" data-role="py-note"></div>
          </div>
        </div>
      </div>
    `;

    const replayBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="py-replay"]')!;
    const autoBtn = ctx.slideEl.querySelector<HTMLButtonElement>('[data-role="py-autoplay"]')!;

    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rt = pyDemoState.get(ctx.slideEl);
      if (!rt) return;
      stopPyDemoTimers(ctx.slideEl);
      playPyDemoStep(ctx.slideEl, rt.currentStep, true, ctx.getReducedMotion());
    });

    autoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rt = pyDemoState.get(ctx.slideEl);
      if (!rt) return;
      if (rt.autoRunning) {
        stopPyDemoTimers(ctx.slideEl);
        return;
      }
      stopPyDemoTimers(ctx.slideEl);
      rt.autoRunning = true;
      autoBtn.textContent = '■ Dừng tự động';
      autoBtn.classList.add('inline-action-btn--primary');

      const runSeq = (s: number) => {
        if (!rt.autoRunning) return;
        playPyDemoStep(ctx.slideEl, s, true, ctx.getReducedMotion(), () => {
          if (!rt.autoRunning) return;
          if (s < PY_DEMO_BLOCKS.length - 1) {
            rt.autoTimerId = window.setTimeout(() => runSeq(s + 1), 1250);
          } else {
            stopPyDemoTimers(ctx.slideEl);
          }
        });
      };
      runSeq(1);
    });
  },
  renderStep(step, prev, ctx) {
    stopPyDemoTimers(ctx.slideEl);
    const prevStep = prev ?? -1;
    const shouldType = step > prevStep;
    playPyDemoStep(ctx.slideEl, step, shouldType, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    stopPyDemoTimers(slideEl);
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

export const PART3_SLIDES: SlideDef[] = [slide13, slide14, slide15, slide16, slide17PyDemo];
