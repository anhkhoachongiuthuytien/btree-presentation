import type { SlideDef, TreeSceneSpec } from '../types';
import { texInline, texBlock } from '../math';
import { renderTreeScene, cancelTreeAnimations } from '../svg/treeRenderer';
import { coverHardwareSvg, tocServerSvg, iconSvg } from '../svg/illustrations';

// ============================================================================
// SLIDE 01 — B-tree, các cải tiến và ứng dụng (Cover)
// ============================================================================
const slide01: SlideDef = {
  number: 1,
  title: 'B-tree, các cải tiến và ứng dụng',
  chapter: 'Bìa',
  theme: 'cover',
  stepCount: 2,
  leadIn:
    '“Khi MySQL cần tìm một khóa, liệu nó phải đọc bao nhiêu trang dữ liệu? Chúng mình là nhóm 10. Hôm nay mình sẽ theo một khóa từ gốc xuống lá để trả lời câu hỏi đó.”',
  fullScript:
    'Xin chào thầy cô và các bạn, chúng mình là nhóm 10. Hôm nay chúng mình sẽ cùng tìm hiểu về một cấu trúc dữ liệu cực kỳ quyền lực, được dùng để tổ chức chỉ mục trong cơ sở dữ liệu như MySQL và trong một số hệ thống tệp: đó là B-tree.',
  fullView: {
    summary: 'Trang bìa giới thiệu đề tài “B-tree, các cải tiến và ứng dụng” của Nhóm 10 cùng mô hình trực quan từ trang đĩa đến cây B-tree cân bằng.',
    sections: [
      {
        heading: 'Mục tiêu mở đầu',
        bodyHtml:
          '<p>Đặt câu hỏi trung tâm cho toàn bài giảng: <em>khi hệ quản trị cơ sở dữ liệu như MySQL cần tìm một khóa, hệ thống phải đọc bao nhiêu trang dữ liệu từ bộ nhớ ngoài?</em></p>' +
          '<p>Từ biểu tượng ổ đĩa, một trang dữ liệu mở ra thành nút gốc <code>[10 | 20]</code> với 3 nhánh dẫn xuống 3 nút lá <code>[5 | 6]</code>, <code>[12 | 17]</code>, <code>[30]</code> nằm trên cùng một độ sâu.</p>',
      },
      {
        heading: 'Thông tin nhóm',
        bodyHtml: '<p><strong>Nhóm 10</strong> · Môn Cấu trúc dữ liệu & Giải thuật · Trình bày tương tác theo từng nhịp điều khiển.</p>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="cover-layout">
        <div class="cover-left">
          <div class="cover-left-top">
            <span class="cover-chip-top">NHÓM 10 · CTDL &amp; GT</span>
            <span class="cover-chip-sec">EXTERNAL MEMORY INDEX</span>
          </div>
          <div class="cover-illus" data-role="illus"></div>
          <div class="cover-left-foot">
            <span>MySQL · InnoDB</span>
            <span>XFS · HFS+</span>
            <span>Berkeley DB</span>
          </div>
        </div>
        <div class="cover-right">
          <div class="cover-title-block">
            <div class="cover-eyebrow">
              <span class="cover-eyebrow__dot"></span>
              <span>CẤU TRÚC DỮ LIỆU &amp; GIẢI THUẬT</span>
            </div>
            <h1 class="cover-title">B-tree,<br/><span>Các cải tiến và ứng dụng</span></h1>
            <div class="cover-rule" aria-hidden="true"><span></span></div>
          </div>
          <div class="cover-tree-stage" data-role="tree"></div>
          <div class="cover-bottom">
            <div class="cover-caption" data-role="caption">Nhấn <strong>→</strong> để mở một trang dữ liệu từ ổ đĩa.</div>
            <div class="cover-step-pills" data-role="cover-pills">
              <button type="button" class="cov-pill is-on" data-cstep="0">01 Trang đĩa</button>
              <button type="button" class="cov-pill" data-cstep="1">02 Nút gốc</button>
              <button type="button" class="cov-pill" data-cstep="2">03 Cây B-tree</button>
            </div>
          </div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.cov-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderCoverStep(ctx.slideEl, Number(btn.dataset.cstep), ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderCoverStep(ctx.slideEl, step, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderCoverStep(slideEl: HTMLElement, step: number, reducedMotion: boolean): void {
  const illus = slideEl.querySelector<HTMLElement>('[data-role="illus"]')!;
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const cap = slideEl.querySelector<HTMLElement>('[data-role="caption"]')!;

  illus.innerHTML = coverHardwareSvg(step >= 1);
  slideEl.querySelectorAll<HTMLElement>('.cov-pill').forEach((p) => {
    p.classList.toggle('is-on', Number(p.dataset.cstep) === step);
  });

  const scene: TreeSceneSpec =
    step === 0
      ? {
          viewBox: [0, 0, 560, 260],
          nodes: [],
          edges: [],
          overlaySvg: `
            <g transform="translate(50, 34)">
              <!-- 3D Page block (wide, well-padded) -->
              <polygon points="0,18 14,4 468,4 454,18" fill="#93C5FD" stroke="#004AAD" stroke-width="1.8" stroke-linejoin="round" />
              <polygon points="454,18 468,4 468,166 454,180" fill="#3B82F6" stroke="#004AAD" stroke-width="1.8" stroke-linejoin="round" />
              <rect x="0" y="18" width="454" height="162" fill="#FFFFFF" stroke="#004AAD" stroke-width="2" />
              <!-- Header strip -->
              <rect x="0" y="18" width="454" height="36" fill="#E6F0FF" stroke="#004AAD" stroke-width="1.5" />
              <text x="18" y="41" fill="#0B1B59" font-size="13.5" font-weight="800" font-family="'IBM Plex Mono', monospace">PAGE #001 · 4 KB</text>
              <rect x="344" y="25" width="96" height="22" rx="3" fill="#004AAD" />
              <text x="392" y="40" text-anchor="middle" fill="#FEF08A" font-size="11.2" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Sẵn sàng mở</text>
              <!-- Preview key slots inside page -->
              <rect x="26" y="74" width="124" height="48" rx="3" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.8" />
              <rect x="165" y="74" width="124" height="48" rx="3" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.8" />
              <rect x="304" y="74" width="124" height="48" rx="3" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="5 3" />
              <text x="88" y="104" text-anchor="middle" fill="#004AAD" font-size="17" font-weight="800" font-family="'IBM Plex Mono', monospace">10</text>
              <text x="227" y="104" text-anchor="middle" fill="#004AAD" font-size="17" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
              <text x="366" y="103" text-anchor="middle" fill="#94A3B8" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">ô trống</text>
              <text x="227" y="156" text-anchor="middle" fill="#334155" font-size="13.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Một nút B-tree ánh xạ trực tiếp 1 trang dữ liệu (4–16 KB)</text>
              ${!reducedMotion ? `<defs><clipPath id="s01-page-clip"><rect x="0" y="18" width="454" height="162" /></clipPath></defs><g clip-path="url(#s01-page-clip)"><rect class="s01-page-sheen" x="-90" y="18" width="76" height="162" fill="rgba(255,255,255,0.46)" pointer-events="none" /></g>` : ''}
            </g>
          `,
        }
      : step === 1
        ? {
            viewBox: [0, 0, 560, 260],
            nodes: [
              {
                id: 'root',
                x: 280,
                y: 88,
                cellW: 72,
                cellH: 50,
                showPorts: true,
                state: 'active',
                tag: 'Nút gốc · nạp từ 1 trang đĩa (3 cổng con)',
                tagTone: 'cobalt',
                keys: [
                  { id: 'c-10', label: '10', tone: 'active' },
                  { id: 'c-20', label: '20', tone: 'active' },
                ],
              },
            ],
            edges: [],
          }
        : {
            viewBox: [0, 0, 560, 260],
            nodes: [
              {
                id: 'root',
                x: 280,
                y: 66,
                cellW: 64,
                cellH: 46,
                showPorts: true,
                tag: 'Gốc [10 | 20]',
                tagTone: 'cobalt',
                keys: [
                  { id: 'c-10', label: '10' },
                  { id: 'c-20', label: '20' },
                ],
              },
              {
                id: 'l0',
                x: 105,
                y: 184,
                cellW: 56,
                cellH: 44,
                keys: [
                  { id: 'c-5', label: '5', tone: 'success' },
                  { id: 'c-6', label: '6', tone: 'success' },
                ],
              },
              {
                id: 'l1',
                x: 280,
                y: 184,
                cellW: 56,
                cellH: 44,
                keys: [
                  { id: 'c-12', label: '12', tone: 'success' },
                  { id: 'c-17', label: '17', tone: 'success' },
                ],
              },
              {
                id: 'l2',
                x: 455,
                y: 184,
                cellW: 56,
                cellH: 44,
                keys: [{ id: 'c-30', label: '30', tone: 'success' }],
              },
            ],
            edges: [
              { id: 'e0', fromNode: 'root', portIndex: 0, toNode: 'l0', state: 'active', arrow: true },
              { id: 'e1', fromNode: 'root', portIndex: 1, toNode: 'l1', state: 'active', arrow: true },
              { id: 'e2', fromNode: 'root', portIndex: 2, toNode: 'l2', state: 'active', arrow: true },
            ],
            baselineY: { y: 222, x1: 35, x2: 525, label: 'Mọi nút lá nằm cùng một mức' },
          };

  renderTreeScene(treeBox, scene, { reducedMotion });
  cap.innerHTML =
    step === 0
      ? 'Nhấn <strong>→</strong> để mở 1 trang dữ liệu từ ổ đĩa lên RAM.'
      : step === 1
        ? 'Bus dữ liệu nạp 1 trang thành nút gốc <code>[10 | 20]</code> với 3 cổng con.'
        : '3 lá <code>[5|6]</code>, <code>[12|17]</code>, <code>[30]</code> thẳng hàng trên cùng độ sâu.';
}

// ============================================================================
// SLIDE 02 — Nội dung trình bày (TOC — Editorial Roadmap)
// ============================================================================
const TOC_ITEMS = [
  { num: '01', title: 'Bài toán và cơ sở lý thuyết', sub: 'Bộ nhớ ngoài, M-way Search Tree & 4 tính chất B-tree', target: 3, range: 'Trang 03–06' },
  { num: '02', title: 'Tìm kiếm, chèn và xóa trên B-tree', sub: 'Search(17), Insert + Split, Delete + Borrow / Merge', target: 7, range: 'Trang 07–14' },
  { num: '03', title: 'Cài đặt Python và trực quan hóa', sub: 'Lớp BTreeNode, BTree, xử lý tách/gộp & chạy thử live', target: 15, range: 'Trang 15–20' },
  { num: '04', title: 'Độ phức tạp thời gian và không gian', sub: 'Chiều cao h, thao tác, kỳ vọng trung bình, RAM/I/O & bộ nhớ', target: 21, range: 'Trang 21–26' },
  { num: '05', title: 'Các biến thể và ứng dụng', sub: 'B+ Tree, B* Tree, InnoDB, HFS+ & bài toán XFS (2 cây B+)', target: 27, range: 'Trang 27–35', dest: 'Đích: XFS' },
];

const slide02: SlideDef = {
  number: 2,
  title: 'Nội dung trình bày',
  chapter: 'Mục lục',
  theme: 'toc',
  stepCount: 2,
  leadIn:
    '“Đầu tiên mình dựng cây, sau đó chạy ba phép toán, đọc mã Python và đếm chi phí. Cuối cùng cả lớp sẽ dùng hai chỉ mục để tìm chỗ trống trên đĩa.”',
  fullScript:
    'Vậy thì hôm nay chúng mình sẽ giới thiệu cho các bạn những gì về B-tree? Đầu tiên là bài toán thực tế và lý thuyết đằng sau nó. Tiếp theo, chúng mình sẽ giới thiệu cách nó vận hành qua 3 thao tác cơ bản nhất. Sau đó, chúng mình sẽ giới thiệu một cài đặt cơ bản bằng Python, qua đó phân tích độ phức tạp xem nó tối ưu đến đâu. Và cuối cùng là các phiên bản cải tiến và cách người ta ứng dụng B-tree ngoài thực tế.',
  fullView: {
    summary: 'Mục lục 5 phần chính của bài thuyết trình B-tree, hỗ trợ nhảy thẳng tới bất kỳ chương nào.',
    sections: [
      {
        heading: 'Lộ trình 5 chương (Trang 03 → 35)',
        bodyHtml:
          '<ol>' +
          '<li><strong>Bài toán và cơ sở lý thuyết (Trang 03–06):</strong> Động lực bộ nhớ ngoài, đầu vào/đầu ra, M-way Search Tree và định nghĩa B-tree.</li>' +
          '<li><strong>Tìm kiếm, chèn và xóa trên B-tree (Trang 07–14):</strong> Search(17), Insert + split dây chuyền, minh họa xóa, Borrow/Merge, thu gọn gốc và cây quyết định Delete.</li>' +
          '<li><strong>Cài đặt Python và trực quan hóa (Trang 15–20):</strong> BTreeNode, BTree, search, insert/_insert, delete/_delete, _fix_underflow và chạy thử trực tiếp bằng Python.</li>' +
          '<li><strong>Độ phức tạp thời gian và không gian (Trang 21–26):</strong> Chiều cao h, chi phí các thao tác, kỳ vọng trung bình, RAM vs I/O và bộ nhớ phụ.</li>' +
          '<li><strong>Các biến thể và ứng dụng (Trang 27–35):</strong> B+ Tree (duyệt khoảng, copy-up), B* Tree (phân phối lại, tách 2 thành 3), InnoDB/HFS+/Berkeley DB và bài toán XFS (cntbt, bnobt).</li>' +
          '</ol>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="toc-layout">
        <aside class="toc-left">
          <div class="toc-hero-head">
            <span class="toc-kicker__tag">LỘ TRÌNH BÀI GIẢNG</span>
            <h1 class="toc-heading">NỘI DUNG<br/><span>TRÌNH BÀY</span></h1>
          </div>
          <div class="toc-server">${tocServerSvg()}</div>
          <div class="toc-stats">
            <div><strong>05</strong><span>Chương</span></div>
            <div><strong>35</strong><span>Trang</span></div>
            <div><strong>Live</strong><span>Demo Python</span></div>
          </div>
        </aside>

        <div class="toc-right">
          <div class="toc-list" data-role="list">
            <div class="toc-rail" data-role="rail" aria-hidden="true"></div>
            ${TOC_ITEMS.map(
              (item, idx) => `
              <button type="button" class="toc-bar" data-toc-idx="${idx}" data-target-slide="${item.target}">
                <span class="toc-bar__num">${item.num}</span>
                <span class="toc-bar__body">
                  <span class="toc-bar__title">${item.title}</span>
                  <span class="toc-bar__sub">${item.sub}</span>
                </span>
                <span class="toc-bar__right">
                  ${item.dest ? `<strong class="toc-dest" data-role="xfs-dest">${item.dest}</strong>` : ''}
                  <span class="toc-bar__range">${item.range}</span>
                </span>
              </button>
            `,
            ).join('')}
          </div>
          <p class="toc-hint">Nhấn trực tiếp vào bất kỳ chương nào để nhảy thẳng tới trang đầu chương đó.</p>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.toc-bar').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const target = Number(btn.dataset.targetSlide);
        if (target >= 1 && target <= 35) ctx.goToSlide(target);
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const bars = ctx.slideEl.querySelectorAll<HTMLElement>('.toc-bar');
    const rail = ctx.slideEl.querySelector<HTMLElement>('[data-role="rail"]')!;
    const dest = ctx.slideEl.querySelector<HTMLElement>('[data-role="xfs-dest"]');

    bars.forEach((b, idx) => {
      b.classList.remove('is-lit', 'is-focus');
      if (step === 1 && idx <= 1) b.classList.add('is-lit');
      if (step === 2) b.classList.add('is-lit');
      if ((step === 1 && idx === 1) || (step === 2 && idx === 4)) b.classList.add('is-focus');
    });

    rail.style.height = step === 0 ? '0%' : step === 1 ? '44%' : '94%';
    if (dest) dest.classList.toggle('is-visible', step >= 2);
  },
};

// ============================================================================
// SLIDE 03 — Bài toán, đầu vào và đầu ra
// ============================================================================
const slide03: SlideDef = {
  number: 3,
  title: 'Bài toán, đầu vào và đầu ra',
  chapter: '1. Bài toán và cơ sở lý thuyết',
  chapterStart: 3,
  theme: 'blue',
  stepCount: 3,
  leadIn:
    '“Trên RAM ta đếm so sánh. Nếu mỗi tầng cần đọc thêm một trang trên đĩa, ta còn quan tâm đến chiều cao. Tăng số nhánh giúp giảm số tầng mà vẫn giữ được thứ tự.”',
  fullScript:
    'OK, vậy để bắt đầu, khi nói đến quản lý các cơ sở dữ liệu, hay một trường hợp cụ thể hơn là đi truy vấn hay tìm kiếm dữ liệu bên trong cơ sở dữ liệu đó, có thể các bạn sẽ nghĩ ngay đến Binary Search Tree hay Red-Black Tree. Điểm chung của các loại cây này là mỗi nút chỉ chứa 1 khóa duy nhất và chia làm 2 nhánh con. Nó làm rất tốt nhiệm vụ tìm kiếm với độ phức tạp O(log N) trên cây cân bằng trong RAM. Nhưng khi đem xuống làm việc với bộ nhớ ngoài chậm như ổ cứng HDD/SSD, cây quá cao khiến số lần đọc/ghi đĩa bị đội lên rất nhiều. Khi trang chưa có trong bộ nhớ đệm, đi xuống thêm một tầng có thể cần thêm một lần đọc đĩa. Gặp vấn đề như vậy, người ta nhồi nhiều khóa hơn vào cùng một nút để giảm độ cao của cây — đó là cách B-tree ra đời. Về đầu vào, ta cần bậc M ≥ 3 (tối đa M nhánh con, M − 1 khóa), tập khóa nguyên phân biệt và chuỗi thao tác search(k), insert(k), delete(k). Sau mỗi thao tác, cây tự cân bằng để giữ tốc độ truy xuất O(log N) khi M cố định.',
  fullView: {
    summary: 'Phát biểu bài toán, mục tiêu bộ nhớ ngoài, đầu vào và hợp đồng đầu ra của 3 thao tác cơ bản trên B-tree (đã chuẩn hóa chính tả từ bản Canva).',
    sections: [
      {
        heading: '1. Phát biểu bài toán',
        bodyHtml:
          '<p>Xây dựng cấu trúc dữ liệu B-tree nhằm xử lý một tập hợp các khóa nguyên có thứ tự, hỗ trợ 3 thao tác cơ bản: <strong>Tìm kiếm (Search)</strong>, <strong>Chèn (Insert)</strong> và <strong>Xóa (Delete)</strong>. Các thao tác phải hiệu quả ngay cả khi số lượng khóa lớn, đồng thời duy trì tính cân bằng của cây.</p>',
      },
      {
        heading: '2. Mục tiêu của bài toán',
        bodyHtml:
          '<ul>' +
          '<li>Tối ưu lưu trữ và truy xuất dữ liệu trên bộ nhớ ngoài (ổ cứng HDD và SSD).</li>' +
          '<li>Giảm số lần truy cập trang dữ liệu bằng cách lưu nhiều khóa trong cùng một nút (“một nút vừa một trang”) thay vì mỗi nút 1 khóa như BST.</li>' +
          '<li>Đảm bảo tìm kiếm, chèn và xóa có độ phức tạp ' + texInline('O(\\log N)') + ' (khi ' + texInline('M') + ' cố định).</li>' +
          '</ul>',
      },
      {
        heading: '3. Đầu vào (Input) & Đầu ra (Output)',
        bodyHtml:
          '<p><strong>Input:</strong> Bậc ' + texInline('M \\ge 3') + ' (tối đa ' + texInline('M') + ' con, ' + texInline('M-1') + ' khóa); tập khóa nguyên phân biệt; chuỗi thao tác <code>search(k)</code>, <code>insert(k)</code>, <code>delete(k)</code>.</p>' +
          '<p><strong>Output:</strong></p>' +
          '<ul>' +
          '<li><code>search(k)</code>: trả về vị trí <code>(node, i)</code> nếu tìm thấy, ngược lại trả về <code>None</code>.</li>' +
          '<li><code>insert(k)</code>: trả về <code>True</code> nếu chèn mới thành công, <code>False</code> nếu khóa đã tồn tại.</li>' +
          '<li><code>delete(k)</code>: trả về <code>True</code> nếu xóa thành công, <code>False</code> nếu không tìm thấy khóa.</li>' +
          '</ul>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title">Bài toán <span>đầu vào và đầu ra</span></h1>
        </header>

        <div class="s03-layout">
          <div class="s03-left">
            <div class="s03-visual" data-role="visual"></div>
            <div class="s03-demo" data-role="demo">
              <div class="s03-demo__head">
                <span>Kiểm chứng nhanh trên cây bìa</span>
                <span class="s03-demo__hint">Nhấn để thử trực tiếp</span>
              </div>
              <div class="s03-call-list" data-role="calls">
                <button type="button" class="s03-call" data-call="0">
                  <code>search(17)</code>
                  <span class="badge-ok">(lá [12|17], 1)</span>
                </button>
                <button type="button" class="s03-call" data-call="1">
                  <code>insert(17)</code>
                  <span class="badge-warn">False · đã có</span>
                </button>
                <button type="button" class="s03-call" data-call="2">
                  <code>delete(99)</code>
                  <span class="badge-err">False · không có</span>
                </button>
              </div>
              <div class="s03-demo__note" data-role="contract">
                Quy ước: tìm hụt → <code>None</code> · thêm mới hoặc xóa khóa có thật → <code>True</code>
              </div>
            </div>
          </div>

          <div class="s03-cols">
            <article class="s03-card" data-col="0">
              <div class="s03-card__head">${iconSvg('tree')}<h3>01. Phát biểu bài toán</h3></div>
              <div class="s03-card__body">
                <p>Xây dựng cấu trúc quản lý tập khóa nguyên có thứ tự, hỗ trợ 3 thao tác cơ bản hiệu quả trên dữ liệu lớn và luôn tự <strong>cân bằng</strong>.</p>
                <div class="s03-chip-row"><span>Search</span><span>Insert</span><span>Delete</span></div>
              </div>
            </article>

            <article class="s03-card" data-col="1">
              <div class="s03-card__head">${iconSvg('disk')}<h3>02. Mục tiêu bộ nhớ ngoài</h3></div>
              <div class="s03-card__body">
                <p>Tối ưu đọc/ghi trên <strong>HDD / SSD</strong>: gom nhiều khóa vào cùng <strong>1 nút = 1 trang đĩa</strong> để nén chiều cao cây, giảm số lần đọc trang.</p>
                <div class="s03-metric-pill">1 nút = 1 trang (4–16 KB) · ${texInline('O(\\log N)')}</div>
              </div>
            </article>

            <article class="s03-card" data-col="2">
              <div class="s03-card__head">${iconSvg('input')}<h3>03. Đầu vào (Input)</h3></div>
              <div class="s03-card__body">
                <ul class="s03-list">
                  <li>Bậc nguyên <strong>${texInline('M \\ge 3')}</strong> (tối đa ${texInline('M')} con, ${texInline('M-1')} khóa)</li>
                  <li>Tập khóa nguyên phân biệt có thứ tự</li>
                  <li>Chuỗi <code>search</code> / <code>insert</code> / <code>delete(k)</code></li>
                </ul>
              </div>
            </article>

            <article class="s03-card s03-card--dark" data-col="3">
              <div class="s03-card__head">${iconSvg('output')}<h3>04. Đầu ra (Output)</h3></div>
              <div class="s03-card__body">
                <div class="s03-out-row"><code>search(k)</code><span>(node, i) / <strong>None</strong></span></div>
                <div class="s03-out-row"><code>insert(k)</code><span><strong>True</strong> / False</span></div>
                <div class="s03-out-row"><code>delete(k)</code><span><strong>True</strong> / False</span></div>
              </div>
            </article>
          </div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.s03-call').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderS03Probe(ctx.slideEl, Number(btn.dataset.call), ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    const visual = ctx.slideEl.querySelector<HTMLElement>('[data-role="visual"]')!;
    const demo = ctx.slideEl.querySelector<HTMLElement>('[data-role="demo"]')!;
    const cols = ctx.slideEl.querySelectorAll<HTMLElement>('.s03-card');

    cols.forEach((c, idx) => {
      const visible =
        (step >= 1 && idx <= 1) ||
        (step >= 2 && idx === 2) ||
        (step >= 3 && idx === 3);
      c.classList.toggle('is-dim', !visible);
      c.classList.toggle('is-active-card', (step === 1 && idx === 1) || (step === 2 && idx === 2) || (step === 3 && idx === 3));
    });

    demo.classList.toggle('is-revealed', step >= 3);
    ctx.slideEl.querySelectorAll<HTMLElement>('.s03-call').forEach((callEl, idx) => {
      callEl.classList.toggle('is-lit', step >= 3);
      callEl.classList.toggle('is-selected', step >= 3 && idx === 0);
    });

    if (step >= 3) {
      renderS03Probe(ctx.slideEl, 0, ctx.getReducedMotion());
      return;
    }

    const scene: TreeSceneSpec =
      step === 0
        ? {
            viewBox: [0, 0, 620, 270],
            nodes: [
              { id: 'bst1', x: 155, y: 46, cellW: 50, cellH: 38, keys: [{ id: 'b1', label: '20' }] },
              { id: 'bst2', x: 100, y: 128, cellW: 50, cellH: 38, keys: [{ id: 'b2', label: '10' }] },
              { id: 'bst3', x: 210, y: 128, cellW: 50, cellH: 38, keys: [{ id: 'b3', label: '30', tone: 'muted' }], state: 'muted' },
              { id: 'bst4', x: 155, y: 212, cellW: 50, cellH: 38, keys: [{ id: 'b4', label: '17' }] },
            ],
            edges: [
              { id: 'be1', fromNode: 'bst1', portIndex: 0, toNode: 'bst2' },
              { id: 'be2', fromNode: 'bst1', portIndex: 1, toNode: 'bst3', state: 'muted' },
              { id: 'be3', fromNode: 'bst2', portIndex: 1, toNode: 'bst4' },
            ],
            overlaySvg: `
              <g transform="translate(290, 46)">
                <rect x="0" y="0" width="308" height="176" rx="6" fill="#EEF7FF" stroke="#004AAD" stroke-width="2" stroke-dasharray="6 4"/>
                <text x="154" y="42" text-anchor="middle" fill="#004AAD" font-size="16.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Trang đĩa (4 KB – 16 KB)</text>
                <text x="154" y="78" text-anchor="middle" fill="#334155" font-size="13.8" font-family="'Be Vietnam Pro', sans-serif">BST chỉ đặt 1 khóa / nút → cây cao,</text>
                <text x="154" y="102" text-anchor="middle" fill="#334155" font-size="13.8" font-family="'Be Vietnam Pro', sans-serif">mỗi tầng có thể tốn thêm 1 lần đọc đĩa.</text>
                <rect x="44" y="124" width="220" height="32" rx="4" fill="#FEF08A" stroke="#B45309" stroke-width="1.6"/>
                <text x="154" y="145" text-anchor="middle" fill="#0F1D3A" font-size="13.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">Nhồi nhiều khóa vào 1 nút?</text>
              </g>
            `,
          }
        : step === 1
          ? {
              viewBox: [0, 0, 620, 270],
              nodes: [
                { id: 'bst1', x: 112, y: 46, cellW: 44, cellH: 36, state: 'active', keys: [{ id: 'b1', label: '20', tone: 'active' }] },
                { id: 'bst2', x: 70, y: 128, cellW: 44, cellH: 36, state: 'active', keys: [{ id: 'b2', label: '10', tone: 'active' }] },
                { id: 'bst4', x: 116, y: 212, cellW: 44, cellH: 36, state: 'active', tag: '3 tầng đọc đĩa', tagPos: 'right', tagTone: 'error', keys: [{ id: 'b4', label: '17', tone: 'active' }] },
                {
                  id: 'page-node',
                  x: 452,
                  y: 136,
                  cellW: 48,
                  cellH: 46,
                  state: 'success',
                  showPorts: true,
                  tag: '1 nút = 1 trang · Giảm số tầng',
                  tagPos: 'top',
                  tagTone: 'success',
                  keys: [
                    { id: 'p5', label: '5' },
                    { id: 'p10', label: '10' },
                    { id: 'p17', label: '17', tone: 'success' },
                    { id: 'p20', label: '20' },
                    { id: 'p30', label: '30' },
                  ],
                },
              ],
              edges: [
                { id: 'be1', fromNode: 'bst1', portIndex: 0, toNode: 'bst2', state: 'active', arrow: true },
                { id: 'be3', fromNode: 'bst2', portIndex: 1, toNode: 'bst4', state: 'active', arrow: true },
              ],
              transfers: [
                { id: 'tr-pack', fromX: 205, fromY: 136, toX: 318, toY: 136, ctrlX: 262, ctrlY: 102, label: 'Gom vào 1 trang', tone: 'cobalt' },
              ],
            }
          : {
              viewBox: [0, 0, 620, 270],
              nodes: [
                {
                  id: 'm-root',
                  x: 310,
                  y: 80,
                  cellW: 66,
                  cellH: 46,
                  showPorts: true,
                  tag: 'Tối đa M − 1 khóa (ở đây M = 3 → 2 khóa)',
                  tagTone: 'cobalt',
                  keys: [
                    { id: 'k10', label: '10', tone: 'active' },
                    { id: 'k20', label: '20', tone: 'active' },
                  ],
                },
                { id: 'ml0', x: 112, y: 206, cellW: 54, cellH: 42, keys: [{ id: 'k5', label: '5' }, { id: 'k6', label: '6' }] },
                { id: 'ml1', x: 310, y: 206, cellW: 54, cellH: 42, keys: [{ id: 'k12', label: '12' }, { id: 'k17', label: '17' }] },
                { id: 'ml2', x: 508, y: 206, cellW: 54, cellH: 42, keys: [{ id: 'k30', label: '30' }] },
              ],
              edges: [
                { id: 'me0', fromNode: 'm-root', portIndex: 0, toNode: 'ml0', label: 'nhánh 1' },
                { id: 'me1', fromNode: 'm-root', portIndex: 1, toNode: 'ml1', label: 'nhánh 2' },
                { id: 'me2', fromNode: 'm-root', portIndex: 2, toNode: 'ml2', label: 'nhánh M' },
              ],
            };

    renderTreeScene(visual, scene, { reducedMotion: ctx.getReducedMotion() });
  },
  cancelAnimations(slideEl) {
    const v = slideEl.querySelector<HTMLElement>('[data-role="visual"]');
    if (v) cancelTreeAnimations(v);
  },
};

function renderS03Probe(slideEl: HTMLElement, callIdx: number, reducedMotion: boolean): void {
  const visual = slideEl.querySelector<HTMLElement>('[data-role="visual"]')!;
  slideEl.querySelectorAll<HTMLElement>('.s03-call').forEach((c, idx) => {
    c.classList.toggle('is-selected', idx === callIdx);
  });

  const isSearch = callIdx === 0;
  const isDup = callIdx === 1;
  const isMiss = callIdx === 2;

  const scene: TreeSceneSpec = {
    viewBox: [0, 0, 620, 270],
    nodes: [
      {
        id: 'm-root',
        x: 310,
        y: 80,
        cellW: 66,
        cellH: 46,
        showPorts: true,
        state: 'active',
        tag: isSearch
          ? 'search(17) → gặp tại (lá [12|17], chỉ số 1)'
          : isDup
            ? 'insert(17) → 17 đã tồn tại trong cây ⇒ False'
            : 'delete(99) → 99 > 20, đi nhánh phải ⇒ không có!',
        tagTone: isSearch ? 'success' : isDup ? 'warn' : 'error',
        keys: [
          { id: 'k10', label: '10', tone: !isMiss ? 'active' : 'default' },
          { id: 'k20', label: '20', tone: 'active' },
        ],
      },
      { id: 'ml0', x: 112, y: 206, cellW: 54, cellH: 42, state: 'muted', keys: [{ id: 'k5', label: '5', tone: 'muted' }, { id: 'k6', label: '6', tone: 'muted' }] },
      {
        id: 'ml1',
        x: 310,
        y: 206,
        cellW: 54,
        cellH: 42,
        state: isSearch ? 'success' : isDup ? 'highlight-box' : 'muted',
        keys: [
          { id: 'k12', label: '12', tone: isMiss ? 'muted' : 'default' },
          { id: 'k17', label: '17', tone: isSearch ? 'success' : isDup ? 'active' : 'muted' },
        ],
      },
      {
        id: 'ml2',
        x: 508,
        y: 206,
        cellW: 54,
        cellH: 42,
        state: isMiss ? 'overflow' : 'muted',
        tag: isMiss ? 'Không thấy 99 → False' : undefined,
        tagPos: 'bottom',
        tagTone: 'error',
        keys: [{ id: 'k30', label: '30', tone: isMiss ? 'error' : 'muted' }],
      },
    ],
    edges: [
      { id: 'me0', fromNode: 'm-root', portIndex: 0, toNode: 'ml0', state: 'muted' },
      { id: 'me1', fromNode: 'm-root', portIndex: 1, toNode: 'ml1', state: !isMiss ? 'active' : 'muted', arrow: !isMiss, label: !isMiss ? '10 < 17 < 20' : undefined },
      { id: 'me2', fromNode: 'm-root', portIndex: 2, toNode: 'ml2', state: isMiss ? 'error' : 'muted', arrow: isMiss, label: isMiss ? '99 > 20' : undefined },
    ],
  };

  renderTreeScene(visual, scene, { reducedMotion });
}

// ============================================================================
// SLIDE 04 — Một nút của cây tìm kiếm M nhánh
// ============================================================================
const slide04: SlideDef = {
  number: 4,
  title: 'Một nút của cây tìm kiếm M nhánh',
  chapter: '1. Bài toán và cơ sở lý thuyết',
  theme: 'white',
  stepCount: 3,
  leadIn: '“Ba khóa chia trục số thành mấy khoảng? Nếu mình đưa 65 vào, hãy chỉ nhánh trước khi mình bấm.”',
  fullScript:
    'Để hiểu rõ hơn về cấu trúc của B-Tree, chúng ta sẽ bắt đầu với tiền thân của nó, gọi là M-way Search Tree. Một M-way search tree là cây tìm kiếm mà mỗi nút chứa tối đa M − 1 khóa có thứ tự và tối đa M nhánh con. Như trên hình minh họa với M = 4, mỗi nút có tối đa 4 nhánh và chứa tối đa 3 khóa. Ba khóa 20, 50 và 80 chia các khóa còn lại thành bốn khoảng tăng dần. Ví dụ 65 thuộc khoảng giữa 50 và 80 nên đi xuống cổng thứ ba; còn nếu khóa cần tìm bằng 50 thì gặp ngay tại nút.',
  fullView: {
    summary: 'Cấu trúc một nút của M-way Search Tree với ví dụ M = 4 ([20 | 50 | 80]) và dạng tổng quát r khóa / r + 1 nhánh con.',
    sections: [
      {
        heading: 'Định nghĩa M-way Search Tree',
        bodyHtml:
          '<p>Mỗi nút có tối đa ' + texInline('M') + ' nhánh con (children) và tối đa ' + texInline('M - 1') + ' khóa (keys) được sắp xếp tăng dần.</p>',
      },
      {
        heading: 'Phân hoạch khoảng tìm kiếm',
        bodyHtml:
          '<p>Nếu một nút trong có ' + texInline('r') + ' khóa ' + texInline('[k_1 \\mid k_2 \\mid \\dots \\mid k_r]') + ' thì nó có ' + texInline('r + 1') + ' nhánh con ' + texInline('P_0, P_1, \\dots, P_r') + ' thỏa mãn:</p>' +
          '<ul>' +
          '<li>Mọi khóa trong ' + texInline('P_0 < k_1') + '</li>' +
          '<li>Mọi khóa trong ' + texInline('P_j') + ' nằm giữa ' + texInline('k_j') + ' và ' + texInline('k_{j+1}') + '</li>' +
          '<li>Mọi khóa trong ' + texInline('P_r > k_r') + '</li>' +
          '</ul>',
      },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title"><span>Thế nào là một</span> M-way Search Tree?</h1>
        </header>

        <div class="def-banner">
          Một <strong>M-way search tree</strong> là cây tìm kiếm mà mỗi nút có tối đa <strong>${texInline('M')} nhánh con</strong> và tối đa <strong>${texInline('M - 1')} khóa</strong> được sắp xếp tăng dần.
        </div>

        <div class="s04-grid">
          <div class="s04-stage" data-role="tree"></div>
          <aside class="s04-side">
            <div class="canva-card s04-box">
              <h3>Ví dụ với ${texInline('M = 4')}</h3>
              <div class="metric-row"><span>Tối đa số nhánh con</span><strong>${texInline('M = 4')}</strong></div>
              <div class="metric-row"><span>Tối đa số khóa</span><strong>${texInline('M - 1 = 3')}</strong></div>
              <div class="s04-probe-bar" data-role="probe-bar">
                <span class="s04-probe-lbl">Thử tìm khóa:</span>
                <div class="s04-probe-btns">
                  <button type="button" class="s04-probe-btn" data-probe="15">15</button>
                  <button type="button" class="s04-probe-btn" data-probe="50">50</button>
                  <button type="button" class="s04-probe-btn is-on" data-probe="65">65</button>
                  <button type="button" class="s04-probe-btn" data-probe="95">95</button>
                </div>
              </div>
              <p class="s04-note" data-role="step-note">3 khóa chia trục số thành 4 khoảng tìm kiếm.</p>
            </div>
            <div class="canva-card s04-box s04-gen" data-role="gen-box">
              <h3>Tổng quát hóa</h3>
              <p>Nút trong có ${texInline('r')} khóa ${texInline('[k_1 \\mid \\dots \\mid k_r]')} sẽ có ${texInline('r + 1')} cổng con ${texInline('P_0 \\dots P_r')}:</p>
              <ul class="s04-conds">
                <li>${texInline('P_0 < k_1')}</li>
                <li>${texInline('k_1 < P_1 < k_2')}</li>
                <li>${texInline('\\dots')}</li>
                <li>${texInline('P_r > k_r')}</li>
              </ul>
              <div class="s04-gen-foot">Nút <strong>r khóa</strong> luôn chia trục số thành <strong>r + 1 khoảng rời nhau</strong>.</div>
            </div>
          </aside>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.s04-probe-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = Number(btn.dataset.probe);
        renderS04Scene(ctx.slideEl, 2, val, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderS04Scene(ctx.slideEl, step, 65, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderS04Scene(slideEl: HTMLElement, step: number, probeKey: number, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const note = slideEl.querySelector<HTMLElement>('[data-role="step-note"]')!;
  const genBox = slideEl.querySelector<HTMLElement>('[data-role="gen-box"]')!;
  const probeBar = slideEl.querySelector<HTMLElement>('[data-role="probe-bar"]')!;

  genBox.classList.toggle('is-dim', step < 3);
  probeBar.classList.toggle('is-dim', step !== 2);
  slideEl.querySelectorAll<HTMLElement>('.s04-probe-btn').forEach((b) => {
    b.classList.toggle('is-on', step === 2 && Number(b.dataset.probe) === probeKey);
  });

  const isGen = step === 3;
  const isProbe = step === 2;
  const isHit50 = isProbe && probeKey === 50;
  const targetPort = !isProbe || isHit50 ? -1 : probeKey < 20 ? 0 : probeKey < 50 ? 1 : probeKey < 80 ? 2 : 3;

  const nodes: TreeSceneSpec['nodes'] = [
    {
      id: 'mway-node',
      x: 370,
      y: 78,
      cellW: 96,
      cellH: 52,
      showPorts: true,
      tag: isGen
        ? 'Nút trong: r khóa → r + 1 con'
        : isHit50
          ? '50 = 50 · Khớp ngay tại nút!'
          : isProbe
            ? `Đang định tuyến khóa ${probeKey} → đi Cổng ${targetPort}`
            : 'M = 4 · Tối đa 3 khóa',
      tagTone: isHit50 ? 'success' : isProbe ? 'warn' : 'cobalt',
      keys: isGen
        ? [
            { id: 'mw-k1', label: 'k₁', tone: 'guide' },
            { id: 'mw-k2', label: 'k₂', tone: 'guide' },
            { id: 'mw-kr', label: '… kᵣ', tone: 'guide' },
          ]
        : [
            { id: 'mw-k1', label: '20' },
            { id: 'mw-k2', label: '50', tone: isHit50 ? 'success' : 'default' },
            { id: 'mw-kr', label: '80' },
          ],
    },
  ];

  const edges: TreeSceneSpec['edges'] = [];

  if (step >= 1) {
    const ranges = isGen
      ? [
          { id: 'p0', x: 105, label: 'P₀', sub: 'x < k₁' },
          { id: 'p1', x: 280, label: 'P₁', sub: 'k₁ < x < k₂' },
          { id: 'p2', x: 460, label: 'P₂', sub: 'k₂ < x < kᵣ' },
          { id: 'p3', x: 635, label: 'Pᵣ', sub: 'x > kᵣ' },
        ]
      : [
          { id: 'p0', x: 105, label: 'x < 20', sub: 'Cổng 0' },
          { id: 'p1', x: 280, label: '20 < x < 50', sub: 'Cổng 1' },
          { id: 'p2', x: 460, label: '50 < x < 80', sub: 'Cổng 2' },
          { id: 'p3', x: 635, label: 'x > 80', sub: 'Cổng 3' },
        ];
    ranges.forEach((r, idx) => {
      const isAct = targetPort === idx;
      nodes.push({
        id: r.id,
        x: r.x,
        y: 214,
        cellW: 136,
        cellH: 48,
        state: isAct ? 'active' : 'normal',
        keys: [{ id: `rng-${idx}`, label: r.label, sublabel: r.sub, tone: isAct ? 'active' : 'guide' }],
      });
      edges.push({
        id: `e-mw-${idx}`,
        fromNode: 'mway-node',
        portIndex: idx,
        toNode: r.id,
        state: isAct ? 'active' : 'normal',
        arrow: true,
      });
    });
  }

  // Clean number-line partition BELOW the 4 portals (ZERO collision with curved arrows!)
  const probeXMap: Record<number, number> = { 15: 98, 50: 320, 65: 400, 95: 558 };
  const segCoords: Record<number, [number, number]> = {
    0: [24, 170],
    1: [170, 320],
    2: [320, 480],
    3: [480, 626],
  };
  const px = probeXMap[probeKey] ?? 400;
  const activeSeg = targetPort >= 0 ? segCoords[targetPort] : null;

  const numberLineSvg =
    step === 1 || step === 2
      ? `
      <g transform="translate(45, 314)">
        <rect x="0" y="-34" width="650" height="62" rx="4" fill="#F8FBFF" stroke="#BFDBFE" stroke-width="1.4"/>
        <text x="16" y="-17" fill="#64748B" font-size="10.5" font-weight="800" font-family="'IBM Plex Mono', monospace">TRỤC SỐ PHÂN HOẠCH</text>
        <line x1="24" y1="4" x2="626" y2="4" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        ${activeSeg ? `<line class="s04-numline-hl" x1="${activeSeg[0]}" y1="4" x2="${activeSeg[1]}" y2="4" stroke="#5284FF" stroke-width="6.5" stroke-linecap="round"/>` : ''}
        <circle cx="170" cy="4" r="5.5" fill="#004AAD"/><text x="170" y="21" text-anchor="middle" fill="#004AAD" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
        <circle cx="320" cy="4" r="5.5" fill="${isHit50 ? '#16A34A' : '#004AAD'}"/><text x="320" y="21" text-anchor="middle" fill="${isHit50 ? '#15803D' : '#004AAD'}" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">50</text>
        <circle cx="480" cy="4" r="5.5" fill="#004AAD"/><text x="480" y="21" text-anchor="middle" fill="#004AAD" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">80</text>
        ${
          isProbe
            ? `<circle class="s04-probe-ring" cx="${px}" cy="4" r="13" fill="none" stroke="${isHit50 ? '#16A34A' : '#F59E0B'}" stroke-width="2"/>
               <circle cx="${px}" cy="4" r="7" fill="${isHit50 ? '#DCFCE7' : '#FEF08A'}" stroke="${isHit50 ? '#15803D' : '#B45309'}" stroke-width="2.4"/>
               <text x="${px}" y="-11" text-anchor="middle" fill="${isHit50 ? '#15803D' : '#B45309'}" font-size="12.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${probeKey}${isHit50 ? ' (Khớp!)' : ''}</text>`
            : ''
        }
      </g>`
      : '';

  renderTreeScene(
    treeBox,
    {
      viewBox: [0, 0, 740, 365],
      nodes,
      edges,
      underlaySvg: numberLineSvg,
    },
    { reducedMotion },
  );

  note.innerHTML =
    step === 0
      ? 'Nút <code>[20 | 50 | 80]</code> có 4 cổng chờ phía dưới.'
      : step === 1
        ? '3 khóa chia trục số thành đúng 4 khoảng ứng với 4 cổng con.'
        : step === 2
          ? isHit50
            ? 'Thử <strong>50</strong>: trùng ngay khóa giữa tại nút → dừng tìm kiếm!'
            : `Thử <strong>${probeKey}</strong>: rơi vào khoảng Cổng ${targetPort} → rẽ xuống nhánh ${targetPort}.`
          : 'Tổng quát: nút trong <em>r</em> khóa có <em>r + 1</em> con (tối đa <em>M</em> con, <em>M − 1</em> khóa).';
}

// ============================================================================
// SLIDE 05 — Từ M-way search tree đến B-tree
// ============================================================================
const slide05: SlideDef = {
  number: 5,
  title: 'Từ M-way search tree đến B-tree',
  chapter: '1. Bài toán và cơ sở lý thuyết',
  theme: 'blue',
  stepCount: 3,
  leadIn: '“Cân bằng ở đây có nghĩa rất cụ thể. Chọn bất kỳ lá nào, số cạnh đi từ gốc đến lá ấy đều bằng nhau.”',
  fullScript:
    'Chỉ M-way search tree là chưa đủ, vì nó chưa có ràng buộc về mức lấp đầy và độ sâu của lá — ta vẫn có thể tạo cây lệch. Để trở thành B-tree hoàn chỉnh, ngoài 2 điều kiện giới hạn trên của M-way search tree (tối đa M nhánh con và M − 1 khóa tăng dần), ta bổ sung 2 ràng buộc quan trọng: thứ nhất là mức độ lấp đầy tối thiểu — đặt t = ⌈M/2⌉, mọi nút trong không phải gốc có ít nhất t nhánh con và mọi nút không phải gốc chứa ít nhất t − 1 khóa (riêng gốc nếu không phải lá có ít nhất 2 con); thứ hai là tính cân bằng tuyệt đối — tất cả nút lá nằm trên cùng một mức nên mọi đường từ gốc đến lá có cùng độ dài.',
  fullView: {
    summary: '4 tính chất định nghĩa B-tree bậc M cùng ngoại lệ của nút gốc và nút lá.',
    sections: [
      {
        heading: 'Bốn tính chất của B-tree bậc M',
        bodyHtml:
          '<ol>' +
          '<li><strong>Số nhánh tối đa:</strong> Mỗi nút có tối đa ' + texInline('M') + ' nhánh con.</li>' +
          '<li><strong>Số khóa tối đa:</strong> Mỗi nút chứa tối đa ' + texInline('M - 1') + ' khóa sắp xếp tăng dần.</li>' +
          '<li><strong>Mức độ lấp đầy tối thiểu:</strong> Đặt ' + texInline('t = \\lceil M/2 \\rceil') + '. Mỗi nút trong khác gốc có ít nhất ' + texInline('t') + ' con; mọi nút khác gốc có ít nhất ' + texInline('t - 1') + ' khóa.</li>' +
          '<li><strong>Tính cân bằng:</strong> Tất cả nút lá nằm cùng một mức — mọi đường từ gốc đến lá đều dài bằng nhau.</li>' +
          '</ol>',
      },
      {
        heading: 'Ngoại lệ của gốc và lá',
        bodyHtml: '<p>Nút gốc có ít nhất <strong>2 nhánh con</strong> nếu không phải nút lá; nút lá không có nhánh con.</p>',
      },
    ],
    formulas: [
      { label: 'Ngưỡng tối thiểu t', tex: 't = \\lceil M/2 \\rceil, \\quad \\text{min\\_keys} = t - 1' },
    ],
  },
  mount(ctx) {
    ctx.slideEl.innerHTML = `
      <div class="slide-frame">
        <header class="slide-header">
          <h1 class="slide-title">Từ <span>M-way Search Tree</span> đến <span>B-tree</span></h1>
        </header>

        <div class="def-banner def-banner--dark">
          B-tree bổ sung <strong>ràng buộc mức độ lấp đầy</strong> và <strong>tính cân bằng tuyệt đối</strong> lên M-way search tree.
        </div>

        <div class="s05-grid">
          <div class="s05-props">
            <button type="button" class="prop-item" data-prop="0" data-s05-step="1">
              <span class="prop-badge">01</span>
              <div class="prop-body">
                <div class="prop-top"><strong>Số nhánh tối đa</strong><span class="prop-kind">Kế thừa M-way</span></div>
                <p>Mỗi nút có tối đa ${texInline('M')} nhánh con ứng với các khoảng tìm kiếm.</p>
              </div>
            </button>
            <button type="button" class="prop-item" data-prop="1" data-s05-step="1">
              <span class="prop-badge">02</span>
              <div class="prop-body">
                <div class="prop-top"><strong>Số khóa tối đa</strong><span class="prop-kind">Kế thừa M-way</span></div>
                <p>Mỗi nút chứa tối đa ${texInline('M - 1')} khóa, sắp xếp tăng dần.</p>
              </div>
            </button>
            <button type="button" class="prop-item" data-prop="2" data-s05-step="2">
              <span class="prop-badge prop-badge--new">03</span>
              <div class="prop-body">
                <div class="prop-top"><strong>Lấp đầy tối thiểu</strong><span class="prop-kind prop-kind--new">Ràng buộc B-tree</span></div>
                <p>Đặt ${texInline('t = \\lceil M/2 \\rceil')}. Nút trong khác gốc có ${texInline('\\ge t')} con; nút khác gốc có ${texInline('\\ge t - 1')} khóa.</p>
              </div>
            </button>
            <button type="button" class="prop-item" data-prop="3" data-s05-step="3">
              <span class="prop-badge prop-badge--new">04</span>
              <div class="prop-body">
                <div class="prop-top"><strong>Tính cân bằng tuyệt đối</strong><span class="prop-kind prop-kind--new">Ràng buộc B-tree</span></div>
                <p>Mọi nút lá nằm cùng một mức — đường từ gốc đến mọi lá đều bằng nhau.</p>
              </div>
            </button>
          </div>

          <div class="s05-right">
            <div class="s05-tree-box" data-role="tree"></div>
            <div class="s05-exception" data-role="exc">
              <strong>Ngoại lệ:</strong> Root có ít nhất <strong>2 nhánh con</strong> nếu không phải nút lá; nút lá không có nhánh con.
            </div>
          </div>
        </div>
      </div>
    `;

    ctx.slideEl.querySelectorAll<HTMLButtonElement>('.prop-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetStep = Number(btn.dataset.s05Step || '1');
        renderS05View(ctx.slideEl, targetStep, ctx.getReducedMotion());
      });
    });
  },
  renderStep(step, _prev, ctx) {
    renderS05View(ctx.slideEl, step, ctx.getReducedMotion());
  },
  cancelAnimations(slideEl) {
    const t = slideEl.querySelector<HTMLElement>('[data-role="tree"]');
    if (t) cancelTreeAnimations(t);
  },
};

function renderS05View(slideEl: HTMLElement, step: number, reducedMotion: boolean): void {
  const treeBox = slideEl.querySelector<HTMLElement>('[data-role="tree"]')!;
  const props = slideEl.querySelectorAll<HTMLElement>('.prop-item');
  const exc = slideEl.querySelector<HTMLElement>('[data-role="exc"]')!;

  props.forEach((p, idx) => {
    const lit =
      (step >= 1 && idx <= 1) ||
      (step >= 2 && idx === 2) ||
      (step >= 3 && idx === 3);
    p.classList.toggle('is-lit', lit);
    p.classList.toggle('is-current', (step === 1 && idx <= 1) || (step === 2 && idx === 2) || (step === 3 && idx === 3));
  });
  exc.classList.toggle('is-lit', step >= 2);

  const leafDefs = [
    { id: 'f0', x: 58, keys: ['5', '10'], parent: 'n0', port: 0 },
    { id: 'f1', x: 158, keys: ['25', '30'], parent: 'n0', port: 1 },
    { id: 'f2', x: 258, keys: ['45', '50'], parent: 'n1', port: 0 },
    { id: 'f3', x: 358, keys: ['65', '70'], parent: 'n1', port: 1 },
    { id: 'f4', x: 458, keys: ['85', '90'], parent: 'n2', port: 0 },
    { id: 'f5', x: 558, keys: ['105', '110'], parent: 'n2', port: 1 },
    { id: 'f6', x: 658, keys: ['125', '130'], parent: 'n2', port: 2 },
  ];

  const nodes: TreeSceneSpec['nodes'] = [
    {
      id: 'r',
      x: 358,
      y: 52,
      cellW: 48,
      cellH: 38,
      state: step === 2 ? 'active' : 'normal',
      tag: step === 2 ? 'Gốc: ≥ 2 con (đang có 3)' : undefined,
      tagTone: 'cobalt',
      keys: [
        { id: 'k40', label: '40', tone: step === 2 ? 'active' : 'default' },
        { id: 'k80', label: '80', tone: step === 2 ? 'active' : 'default' },
      ],
    },
    {
      id: 'n0',
      x: 112,
      y: 148,
      cellW: 46,
      cellH: 36,
      state: step === 2 ? 'highlight-box' : 'normal',
      tag: step === 2 ? '≥ t−1 = 1 khóa · ≥ t = 2 con' : undefined,
      tagPos: 'top',
      tagTone: 'warn',
      keys: [{ id: 'k20', label: '20' }],
    },
    {
      id: 'n1',
      x: 310,
      y: 148,
      cellW: 46,
      cellH: 36,
      keys: [{ id: 'k60', label: '60' }],
    },
    {
      id: 'n2',
      x: 558,
      y: 148,
      cellW: 52,
      cellH: 36,
      state: step === 1 ? 'active' : 'normal',
      tag: step === 1 ? '2 khóa (≤ M−1) · 3 nhánh (≤ M)' : undefined,
      tagTone: 'cobalt',
      keys: [
        { id: 'k100', label: '100', tone: step === 1 ? 'active' : 'default' },
        { id: 'k120', label: '120', tone: step === 1 ? 'active' : 'default' },
      ],
    },
  ];

  const edges: TreeSceneSpec['edges'] = [
    { id: 'er0', fromNode: 'r', portIndex: 0, toNode: 'n0', state: step === 3 ? 'active' : 'normal', arrow: step === 3, label: step === 3 ? 'cạnh 1' : undefined },
    { id: 'er1', fromNode: 'r', portIndex: 1, toNode: 'n1' },
    { id: 'er2', fromNode: 'r', portIndex: 2, toNode: 'n2', state: step === 3 ? 'active' : 'normal', arrow: step === 3, label: step === 3 ? 'cạnh 1' : undefined },
  ];

  for (const lf of leafDefs) {
    const isOuter = lf.id === 'f0' || lf.id === 'f6';
    nodes.push({
      id: lf.id,
      x: lf.x,
      y: 256,
      cellW: 41,
      cellH: 34,
      state: step === 3 && isOuter ? 'success' : 'normal',
      keys: lf.keys.map((v) => ({
        id: `k${v}`,
        label: v,
        tone: step === 3 && isOuter ? 'success' : 'default',
      })),
    });
    edges.push({
      id: `e-${lf.id}`,
      fromNode: lf.parent,
      portIndex: lf.port,
      toNode: lf.id,
      state: step === 3 && isOuter ? 'active' : 'normal',
      arrow: step === 3 && isOuter,
      label: step === 3 && isOuter ? 'cạnh 2' : undefined,
    });
  }

  const chips: TreeSceneSpec['chips'] =
    step === 2 ? [{ id: 's05-mchip', x: 582, y: 26, text: 'M = 3 ⇒ t = ⌈3/2⌉ = 2', tone: 'active' }] : [];

  renderTreeScene(
    treeBox,
    {
      viewBox: [0, 0, 718, 326],
      nodes,
      edges,
      chips,
      baselineY:
        step === 3
          ? { y: 292, x1: 16, x2: 702, label: 'Đường chuẩn 7 lá · cùng độ sâu h = 2 cạnh' }
          : undefined,
    },
    { reducedMotion },
  );
}

export const PART1_SLIDES: SlideDef[] = [slide01, slide02, slide03, slide04, slide05];
