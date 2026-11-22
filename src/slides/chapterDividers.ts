import type { SlideDef, SlideTheme } from '../types';
import { soundFx } from '../soundEffects';

interface ChapterDividerSpec {
  number: number;
  numStr: string;
  chapter: string;
  kicker: string;
  titleHtml: string;
  plainTitle: string;
  subtitle: string;
  theme: SlideTheme;
  rangeLabel: string;
  pills: Array<{ label: string; targetSlide: number }>;
  leadIn: string;
  fullScript: string;
  artSvg: string;
}

function buildChapterDividerSlide(spec: ChapterDividerSpec): SlideDef {
  return {
    number: spec.number,
    title: spec.plainTitle,
    chapter: spec.chapter,
    chapterStart: spec.number,
    theme: spec.theme,
    stepCount: 0,
    leadIn: spec.leadIn,
    fullScript: spec.fullScript,
    fullView: {
      summary: `${spec.kicker}: ${spec.subtitle}`,
      sections: [
        {
          heading: `Nội dung chính (${spec.rangeLabel})`,
          bodyHtml:
            '<ul>' +
            spec.pills.map((p) => `<li><strong>${p.label}</strong> (Trang ${String(p.targetSlide).padStart(2, '0')})</li>`).join('') +
            '</ul>',
        },
      ],
    },
    mount(ctx) {
      ctx.slideEl.innerHTML = `
        <div class="chd-stage" data-role="chd-stage">
          <div class="chd-scan" aria-hidden="true"></div>
          <div class="chd-watermark" aria-hidden="true">${spec.numStr}</div>

          <div class="chd-grid">
            <div class="chd-left">
              <div class="chd-top-row">
                <span class="chd-kicker">${spec.kicker}</span>
                <span class="chd-range">${spec.rangeLabel}</span>
              </div>
              <h1 class="chd-title">${spec.titleHtml}</h1>
              <p class="chd-sub">${spec.subtitle}</p>

              <div class="chd-roadmap">
                <div class="chd-roadmap-lbl">LỘ TRÌNH TRONG CHƯƠNG · NHẤN ĐỂ NHẢY NHANH</div>
                <div class="chd-pills">
                  ${spec.pills
                    .map(
                      (p, i) => `
                    <button type="button" class="chd-pill" data-chd-jump="${p.targetSlide}" style="--ci:${i}">
                      <span class="chd-pill-idx">${String(i + 1).padStart(2, '0')}</span>
                      <span class="chd-pill-txt">${p.label}</span>
                      <span class="chd-pill-pg">Tr.${String(p.targetSlide).padStart(2, '0')}</span>
                    </button>
                  `,
                    )
                    .join('')}
                </div>
              </div>
            </div>

            <div class="chd-right">
              <div class="chd-art-frame">
                ${spec.artSvg}
              </div>
            </div>
          </div>

          <div class="chd-foot">
            <span class="chd-foot-brand">B-TREE · NHÓM 10</span>
            <span class="chd-foot-hint">Nhấn <kbd>→</kbd> hoặc click vào màn hình để bắt đầu chương</span>
          </div>
        </div>
      `;

      ctx.slideEl.querySelectorAll<HTMLButtonElement>('[data-chd-jump]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = Number(btn.dataset.chdJump);
          if (target >= 1 && target <= 35) {
            soundFx.playClick();
            ctx.goToSlide(target);
          }
        });
      });
    },
    renderStep(_step, _prev, ctx) {
      const stage = ctx.slideEl.querySelector<HTMLElement>('[data-role="chd-stage"]');
      if (!stage) return;
      stage.classList.remove('is-play');
      if (ctx.getReducedMotion()) return;
      void stage.offsetWidth;
      stage.classList.add('is-play');
    },
  };
}

export const chapter01Slide = buildChapterDividerSlide({
  number: 3,
  numStr: '01',
  chapter: '1. Bài toán và cơ sở lý thuyết',
  kicker: 'PHẦN 01 · CƠ SỞ LÝ THUYẾT',
  plainTitle: 'Phần 1: Bài toán & Cấu trúc B-tree',
  titleHtml: 'Bài toán &amp; Cấu trúc<br/><span>B-tree Cân bằng</span>',
  subtitle: 'Từ nút thắt đọc trang đĩa bộ nhớ ngoài đến cây tìm kiếm M nhánh đồng mức lá.',
  theme: 'ch-01',
  rangeLabel: 'TRANG 04 – 06',
  pills: [
    { label: 'Bài toán, đầu vào & đầu ra', targetSlide: 4 },
    { label: 'M-way Search Tree (M = 4)', targetSlide: 5 },
    { label: '4 Quy tắc B-tree cân bằng', targetSlide: 6 },
  ],
  leadIn: '“Chúng ta bắt đầu Phần 1: vì sao dữ liệu lớn trên đĩa cần một cây nhiều nhánh thay vì cây nhị phân thông thường?”',
  fullScript: 'Phần 1 đặt nền móng lý thuyết: bài toán tìm kiếm dữ liệu nằm trên đĩa cứng, cấu trúc tiền thân M-way Search Tree, và 4 quy tắc bất biến tạo nên B-tree luôn cân bằng.',
  artSvg: `
    <svg viewBox="0 0 480 400" class="chd-svg" role="img" aria-label="Minh họa M-way và B-tree cân bằng">
      <defs>
        <marker id="chd1-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#2563EB"/>
        </marker>
        <path id="chd1-e0" d="M 142 152 C 142 204, 72 204, 72 252"/>
        <path id="chd1-e1" d="M 206 152 C 206 204, 184 204, 184 252"/>
        <path id="chd1-e2" d="M 274 152 C 274 204, 296 204, 296 252"/>
        <path id="chd1-e3" d="M 338 152 C 338 204, 408 204, 408 252"/>
      </defs>
      <rect x="14" y="14" width="452" height="372" rx="8" fill="rgba(255,255,255,0.94)" stroke="#004AAD" stroke-width="2.2"/>
      <text x="32" y="42" fill="#004AAD" font-size="12.5" font-weight="800" font-family="'IBM Plex Mono', monospace">BLUEPRINT · CH.01 · M = 4</text>
      <rect x="344" y="25" width="106" height="24" rx="4" fill="#EEF7FF" stroke="#5284FF" stroke-width="1.4"/>
      <text x="397" y="41" text-anchor="middle" fill="#004AAD" font-size="11" font-weight="800" font-family="'IBM Plex Mono', monospace">1 NODE = 4 KB</text>

      <!-- 3D Root node floating smoothly -->
      <g class="chd-float">
        <polygon points="122,98 130,90 366,90 358,98" fill="#93C5FD" stroke="#004AAD" stroke-width="1.6" stroke-linejoin="round"/>
        <polygon points="358,98 366,90 366,144 358,152" fill="#5284FF" stroke="#004AAD" stroke-width="1.6" stroke-linejoin="round"/>
        <rect x="122" y="98" width="78" height="54" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <rect x="200" y="98" width="80" height="54" fill="#FEF08A" stroke="#B45309" stroke-width="2.2"/>
        <rect x="280" y="98" width="78" height="54" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <text x="161" y="131" text-anchor="middle" fill="#0F1D3A" font-size="21" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
        <text x="240" y="131" text-anchor="middle" fill="#0F1D3A" font-size="21" font-weight="800" font-family="'IBM Plex Mono', monospace">50</text>
        <text x="319" y="131" text-anchor="middle" fill="#0F1D3A" font-size="21" font-weight="800" font-family="'IBM Plex Mono', monospace">80</text>
      </g>

      <!-- Animated branching edges + travelling beads -->
      <path d="M 142 152 C 142 204, 72 204, 72 252" fill="none" stroke="#2563EB" stroke-width="2.4" class="chd-flow" marker-end="url(#chd1-arr)"/>
      <path d="M 206 152 C 206 204, 184 204, 184 252" fill="none" stroke="#2563EB" stroke-width="2.4" class="chd-flow" marker-end="url(#chd1-arr)"/>
      <path d="M 274 152 C 274 204, 296 204, 296 252" fill="none" stroke="#2563EB" stroke-width="2.4" class="chd-flow" marker-end="url(#chd1-arr)"/>
      <path d="M 338 152 C 338 204, 408 204, 408 252" fill="none" stroke="#2563EB" stroke-width="2.4" class="chd-flow" marker-end="url(#chd1-arr)"/>

      <circle r="4.2" fill="#FEF08A" stroke="#004AAD" stroke-width="1.5"><animateMotion dur="2.1s" begin="-0.2s" repeatCount="indefinite"><mpath href="#chd1-e0"/></animateMotion></circle>
      <circle r="4.2" fill="#FEF08A" stroke="#004AAD" stroke-width="1.5"><animateMotion dur="2.1s" begin="-0.7s" repeatCount="indefinite"><mpath href="#chd1-e1"/></animateMotion></circle>
      <circle r="4.2" fill="#FEF08A" stroke="#004AAD" stroke-width="1.5"><animateMotion dur="2.1s" begin="-1.2s" repeatCount="indefinite"><mpath href="#chd1-e2"/></animateMotion></circle>
      <circle r="4.2" fill="#FEF08A" stroke="#004AAD" stroke-width="1.5"><animateMotion dur="2.1s" begin="-1.7s" repeatCount="indefinite"><mpath href="#chd1-e3"/></animateMotion></circle>

      <!-- 4 Equal-depth 3D leaves -->
      ${[
        { x: 30, lbl: '5 | 12' },
        { x: 142, lbl: '25 | 40' },
        { x: 254, lbl: '60 | 72' },
        { x: 366, lbl: '88 | 95' },
      ]
        .map(
          (lf) => `
        <g>
          <polygon points="${lf.x},260 ${lf.x + 6},254 ${lf.x + 90},254 ${lf.x + 84},260" fill="#86EFAC" stroke="#16A34A" stroke-width="1.4"/>
          <polygon points="${lf.x + 84},260 ${lf.x + 90},254 ${lf.x + 90},294 ${lf.x + 84},300" fill="#4ADE80" stroke="#16A34A" stroke-width="1.4"/>
          <rect x="${lf.x}" y="260" width="84" height="40" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.9"/>
          <text x="${lf.x + 42}" y="285" text-anchor="middle" fill="#14532D" font-size="14" font-weight="800" font-family="'IBM Plex Mono', monospace">${lf.lbl}</text>
        </g>
      `,
        )
        .join('')}

      <!-- Equal depth baseline -->
      <line x1="28" y1="322" x2="452" y2="322" stroke="#16A34A" stroke-width="2.4" stroke-dasharray="8 6"/>
      <rect x="92" y="336" width="296" height="30" rx="15" fill="#004AAD"/>
      <text x="240" y="355" text-anchor="middle" fill="#FFFFFF" font-size="12.5" font-weight="700" font-family="'Be Vietnam Pro', sans-serif">Mọi lá cùng độ sâu · h = O(log_M N)</text>
    </svg>
  `,
});

export const chapter02Slide = buildChapterDividerSlide({
  number: 7,
  numStr: '02',
  chapter: '2. Tìm kiếm, chèn và xóa trên B-tree',
  kicker: 'PHẦN 02 · THUẬT TOÁN CỐT LÕI',
  plainTitle: 'Phần 2: Các phép toán trong B-tree',
  titleHtml: 'Các phép toán<br/><span>Search · Insert · Delete</span>',
  subtitle: 'Tách nút dây chuyền khi tràn khóa · Mượn khóa (Borrow) &amp; Gộp nút (Merge) khi thiếu khóa.',
  theme: 'ch-02',
  rangeLabel: 'TRANG 08 – 14',
  pills: [
    { label: 'Search(k) dùng bisect', targetSlide: 8 },
    { label: 'Insert & Split dây chuyền', targetSlide: 9 },
    { label: 'Delete · Borrow · Merge', targetSlide: 11 },
    { label: 'Lưu đồ quyết định xóa khóa', targetSlide: 14 },
  ],
  leadIn: '“Khi thêm hoặc xóa khóa, B-tree làm thế nào để luôn giữ đúng mọi luật cân bằng? Hãy đi vào 3 phép toán cốt lõi.”',
  fullScript: 'Phần 2 trình bày chi tiết Search(17), Insert trượt khe và Split dây chuyền lên gốc, Delete ở lá/nút trong bằng Predecessor, xử lý Underflow qua Borrow/Merge và hệ thống hóa thành lưu đồ quyết định xóa khóa.',
  artSvg: `
    <svg viewBox="0 0 480 400" class="chd-svg" role="img" aria-label="Minh họa Split, Borrow và Merge trên B-tree">
      <defs>
        <marker id="chd2-arr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#DC2626"/>
        </marker>
        <marker id="chd2-arr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#2563EB"/>
        </marker>
        <path id="chd2-up" d="M 240 210 L 240 132"/>
      </defs>
      <rect x="14" y="14" width="452" height="372" rx="8" fill="#EEF7FF" stroke="#004AAD" stroke-width="2.2"/>
      <text x="32" y="42" fill="#B45309" font-size="12.5" font-weight="800" font-family="'IBM Plex Mono', monospace">OP · SEARCH · SPLIT ↑ · BORROW ⇄</text>

      <!-- Rising median node (animated cycle) -->
      <g class="chd-split-up">
        <polygon points="194,76 202,68 294,68 286,76" fill="#86EFAC" stroke="#16A34A" stroke-width="1.6"/>
        <polygon points="286,76 294,68 294,118 286,126" fill="#4ADE80" stroke="#16A34A" stroke-width="1.6"/>
        <rect x="194" y="76" width="92" height="50" fill="#DCFCE7" stroke="#16A34A" stroke-width="2.2"/>
        <text x="240" y="108" text-anchor="middle" fill="#14532D" font-size="22" font-weight="800" font-family="'IBM Plex Mono', monospace">20 ↑</text>
      </g>

      <!-- Split promotion beam & branching edges -->
      <path d="M 240 210 L 240 132" fill="none" stroke="#DC2626" stroke-width="2.8" class="chd-flow" marker-end="url(#chd2-arr-r)"/>
      <circle r="4.5" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.6"><animateMotion dur="1.6s" begin="-0.3s" repeatCount="indefinite"><mpath href="#chd2-up"/></animateMotion></circle>

      <path d="M 212 126 C 156 164, 128 178, 128 214" fill="none" stroke="#2563EB" stroke-width="2.2" marker-end="url(#chd2-arr-b)"/>
      <path d="M 268 126 C 324 164, 352 178, 352 214" fill="none" stroke="#2563EB" stroke-width="2.2" marker-end="url(#chd2-arr-b)"/>

      <!-- Left split sibling -->
      <g>
        <polygon points="52,222 60,214 206,214 198,222" fill="#BDD8FF" stroke="#004AAD" stroke-width="1.5"/>
        <polygon points="198,222 206,214 206,262 198,270" fill="#7EB2FF" stroke="#004AAD" stroke-width="1.5"/>
        <rect x="52" y="222" width="73" height="48" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <rect x="125" y="222" width="73" height="48" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <text x="88.5" y="253" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800" font-family="'IBM Plex Mono', monospace">10</text>
        <text x="161.5" y="253" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800" font-family="'IBM Plex Mono', monospace">15</text>
      </g>

      <!-- Right split sibling -->
      <g>
        <polygon points="282,222 290,214 436,214 428,222" fill="#BDD8FF" stroke="#004AAD" stroke-width="1.5"/>
        <polygon points="428,222 436,214 436,262 428,270" fill="#7EB2FF" stroke="#004AAD" stroke-width="1.5"/>
        <rect x="282" y="222" width="73" height="48" fill="#FFFFFF" stroke="#004AAD" stroke-width="2"/>
        <rect x="355" y="222" width="73" height="48" fill="#FEF08A" stroke="#B45309" stroke-width="2"/>
        <text x="318.5" y="253" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800" font-family="'IBM Plex Mono', monospace">25</text>
        <text x="391.5" y="253" text-anchor="middle" fill="#0F1D3A" font-size="18" font-weight="800" font-family="'IBM Plex Mono', monospace">30</text>
      </g>

      <!-- Borrow / Merge exchange ribbon -->
      <line x1="210" y1="246" x2="274" y2="246" stroke="#D97706" stroke-width="2.6" stroke-dasharray="6 4"/>
      <rect x="216" y="234" width="52" height="24" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
      <text x="242" y="250" text-anchor="middle" fill="#92400E" font-size="12" font-weight="800">⇄</text>

      <!-- 3 Op pills inside artwork -->
      <rect x="38" y="308" width="124" height="50" rx="5" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.6"/>
      <text x="100" y="330" text-anchor="middle" fill="#004AAD" font-size="12.5" font-weight="800">SEARCH</text>
      <text x="100" y="347" text-anchor="middle" fill="#475569" font-size="10.5" font-weight="600">bisect từng tầng</text>

      <rect x="178" y="308" width="124" height="50" rx="5" fill="#FFFFFF" stroke="#DC2626" stroke-width="1.6"/>
      <text x="240" y="330" text-anchor="middle" fill="#B91C1C" font-size="12.5" font-weight="800">INSERT / SPLIT</text>
      <text x="240" y="347" text-anchor="middle" fill="#475569" font-size="10.5" font-weight="600">tràn → đẩy trung vị</text>

      <rect x="318" y="308" width="124" height="50" rx="5" fill="#FFFFFF" stroke="#16A34A" stroke-width="1.6"/>
      <text x="380" y="330" text-anchor="middle" fill="#15803D" font-size="12.5" font-weight="800">BORROW / MERGE</text>
      <text x="380" y="347" text-anchor="middle" fill="#475569" font-size="10.5" font-weight="600">vá thiếu khóa</text>
    </svg>
  `,
});

export const chapter03Slide = buildChapterDividerSlide({
  number: 15,
  numStr: '03',
  chapter: '3. Cài đặt Python và trực quan hóa',
  kicker: 'PHẦN 03 · HIỆN THỰC MÃ NGUỒN',
  plainTitle: 'Phần 3: Cài đặt Python & Demo trực tiếp',
  titleHtml: 'Cài đặt Python<br/><span>&amp; Chạy thử trực tiếp</span>',
  subtitle: 'Từ lớp BTreeNode, BTree gọn sạch bằng bisect_left đến mô phỏng chạy live demo_btree.py.',
  theme: 'ch-03',
  rangeLabel: 'TRANG 16 – 20',
  pills: [
    { label: 'BTreeNode, BTree & search', targetSlide: 16 },
    { label: 'insert & tách nút _insert', targetSlide: 17 },
    { label: 'delete & _fix_underflow', targetSlide: 18 },
    { label: 'Chạy thử live demo_btree.py', targetSlide: 20 },
  ],
  leadIn: '“Bây giờ ta biến toàn bộ quy tắc hình học vừa rồi thành 113 dòng Python sạch sẽ và chạy kiểm chứng trực tiếp.”',
  fullScript: 'Phần 3 trình bày chi tiết từng phương thức Python (search, insert/_insert, delete/_delete, _fix_underflow) kèm theo dõi biến thời gian thực và màn chạy thử trực tiếp demo_btree.py.',
  artSvg: `
    <svg viewBox="0 0 480 400" class="chd-svg" role="img" aria-label="Minh họa mã Python đồng bộ cây B-tree trong RAM">
      <defs>
        <path id="chd3-link" d="M 240 232 L 240 286"/>
      </defs>
      <!-- Dark IDE Code Window -->
      <rect x="18" y="18" width="444" height="214" rx="8" fill="#0F1D3A" stroke="#004AAD" stroke-width="2.4"/>
      <rect x="18" y="18" width="444" height="34" rx="8" fill="#172A54"/>
      <circle cx="40" cy="35" r="5" fill="#EF4444"/><circle cx="58" cy="35" r="5" fill="#F59E0B"/><circle cx="76" cy="35" r="5" fill="#22C55E"/>
      <text x="98" y="39" fill="#93C5FD" font-size="12" font-weight="700" font-family="'IBM Plex Mono', monospace">btree.py · Python 3.12</text>
      <rect x="394" y="25" width="52" height="20" rx="3" fill="#15803D"/>
      <text x="420" y="39" text-anchor="middle" fill="#FFFFFF" font-size="10.5" font-weight="800" font-family="'IBM Plex Mono', monospace">LIVE</text>

      <!-- Highlighted syntax lines -->
      <text x="36" y="80" fill="#93C5FD" font-size="15" font-weight="700" font-family="'IBM Plex Mono', monospace">class <tspan fill="#FEF08A">BTree</tspan>:</text>
      <text x="56" y="108" fill="#CBD5E1" font-size="14" font-family="'IBM Plex Mono', monospace">def <tspan fill="#4ADE80">search</tspan>(self, k): <tspan fill="#64748B"># bisect_left</tspan></text>
      <rect x="26" y="119" width="428" height="28" rx="3" fill="rgba(82,132,255,0.22)"/>
      <rect x="26" y="119" width="4" height="28" fill="#FEF08A"/>
      <text x="56" y="138" fill="#FFFFFF" font-size="14" font-weight="700" font-family="'IBM Plex Mono', monospace">def <tspan fill="#FEF08A">insert</tspan>(self, k): <tspan fill="#93C5FD">_split_if_full()</tspan></text>
      <text x="56" y="168" fill="#CBD5E1" font-size="14" font-family="'IBM Plex Mono', monospace">def <tspan fill="#4ADE80">delete</tspan>(self, k): <tspan fill="#64748B"># predecessor</tspan></text>
      <text x="56" y="198" fill="#CBD5E1" font-size="14" font-family="'IBM Plex Mono', monospace">def <tspan fill="#4ADE80">_fix_underflow</tspan>(parent, i):</text>
      <rect x="318" y="185" width="8" height="17" fill="#FEF08A" class="chd-caret"/>

      <!-- Glowing fiber conduit from Python to RAM Tree -->
      <line x1="240" y1="232" x2="240" y2="286" stroke="#004AAD" stroke-width="3" class="chd-flow"/>
      <circle r="5" fill="#FEF08A" stroke="#004AAD" stroke-width="1.6"><animateMotion dur="1.3s" begin="-0.2s" repeatCount="indefinite"><mpath href="#chd3-link"/></animateMotion></circle>

      <!-- Live RAM Tree Card -->
      <rect x="24" y="288" width="432" height="94" rx="8" fill="rgba(255,255,255,0.96)" stroke="#004AAD" stroke-width="2.2"/>
      <g class="chd-float">
        <polygon points="48,316 55,309 199,309 192,316" fill="#93C5FD" stroke="#004AAD" stroke-width="1.5"/>
        <polygon points="192,316 199,309 199,353 192,360" fill="#5284FF" stroke="#004AAD" stroke-width="1.5"/>
        <rect x="48" y="316" width="72" height="44" fill="#EEF7FF" stroke="#004AAD" stroke-width="2"/>
        <rect x="120" y="316" width="72" height="44" fill="#FEF08A" stroke="#B45309" stroke-width="2"/>
        <text x="84" y="344" text-anchor="middle" fill="#0F1D3A" font-size="19" font-weight="800" font-family="'IBM Plex Mono', monospace">10</text>
        <text x="156" y="344" text-anchor="middle" fill="#0F1D3A" font-size="19" font-weight="800" font-family="'IBM Plex Mono', monospace">20</text>
      </g>
      <circle cx="228" cy="326" r="5" fill="#16A34A" class="chd-pulse-dot"/>
      <text x="242" y="331" fill="#15803D" font-size="13" font-weight="800" font-family="'IBM Plex Mono', monospace">RAM SYNC · M = 3</text>
      <text x="223" y="355" fill="#334155" font-size="11.8" font-weight="600" font-family="'Be Vietnam Pro', sans-serif">exit 0 · đồng bộ từng biến &amp; nút cây</text>
    </svg>
  `,
});

export const chapter04Slide = buildChapterDividerSlide({
  number: 21,
  numStr: '04',
  chapter: '4. Độ phức tạp thời gian và không gian',
  kicker: 'PHẦN 04 · PHÂN TÍCH HIỆU NĂNG',
  plainTitle: 'Phần 4: Độ phức tạp của B-tree',
  titleHtml: 'Độ phức tạp<br/><span>Thời gian &amp; Không gian</span>',
  subtitle: 'Chứng minh chiều cao h = O(log_M N), chi phí các thao tác, kỳ vọng trung bình và RAM vs Đĩa.',
  theme: 'ch-04',
  rangeLabel: 'TRANG 22 – 26',
  pills: [
    { label: 'Chiều cao h (N_max vs N_min)', targetSlide: 22 },
    { label: 'Chi phí 3 thao tác & Đua quy mô', targetSlide: 23 },
    { label: 'Kỳ vọng trung bình O(log N + M)', targetSlide: 24 },
    { label: 'RAM vs Đĩa I/O & Bộ nhớ phụ', targetSlide: 25 },
  ],
  leadIn: '“Sau khi chạy được bằng Python, câu hỏi quan trọng nhất là: với 1 tỷ khóa, cây cao bao nhiêu tầng và tốn bao nhiêu lần đọc đĩa?”',
  fullScript: 'Phần 4 chứng minh cận chặt chiều cao h = O(log_M N), phân tích thời gian tốt nhất/xấu nhất/trung bình, tách bạch chi phí RAM với I/O trang đĩa và đánh giá không gian bộ nhớ.',
  artSvg: `
    <svg viewBox="0 0 480 400" class="chd-svg" role="img" aria-label="Đồ thị so sánh độ phức tạp log_M N với log_2 N">
      <rect x="14" y="14" width="452" height="372" rx="8" fill="#EEF7FF" stroke="#004AAD" stroke-width="2.2"/>
      <text x="32" y="42" fill="#004AAD" font-size="12.5" font-weight="800" font-family="'IBM Plex Mono', monospace">COORDINATE · CH.04 · SCALE CURVES</text>

      <!-- Subtle grid lines inside chart -->
      <g stroke="#CBD5E1" stroke-width="1" stroke-dasharray="4 4">
        <line x1="62" y1="100" x2="438" y2="100"/>
        <line x1="62" y1="158" x2="438" y2="158"/>
        <line x1="62" y1="216" x2="438" y2="216"/>
      </g>

      <!-- Axes -->
      <line x1="62" y1="274" x2="442" y2="274" stroke="#0F1D3A" stroke-width="2.2"/>
      <line x1="62" y1="274" x2="62" y2="66" stroke="#0F1D3A" stroke-width="2.2"/>
      <text x="434" y="294" text-anchor="end" fill="#334155" font-size="11.5" font-weight="700" font-family="'IBM Plex Mono', monospace">Số khóa N → 10⁹</text>
      <text x="72" y="76" fill="#334155" font-size="11.5" font-weight="700" font-family="'IBM Plex Mono', monospace">Số tầng h</text>

      <!-- Steep BST log2 curve -->
      <path d="M 62 272 Q 160 132, 426 84" fill="none" stroke="#DC2626" stroke-width="3.4" class="chd-curve"/>
      <circle cx="426" cy="84" r="5.5" fill="#DC2626"/>
      <rect x="276" y="64" width="142" height="24" rx="4" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.3"/>
      <text x="347" y="80" text-anchor="middle" fill="#B91C1C" font-size="11.5" font-weight="800" font-family="'IBM Plex Mono', monospace">BST: log₂ N ≈ 30</text>

      <!-- Ultra-flat B-tree log_M curve -->
      <path d="M 62 272 Q 186 242, 426 232" fill="none" stroke="#16A34A" stroke-width="4" class="chd-curve"/>
      <circle cx="426" cy="232" r="6" fill="#16A34A" class="chd-pulse-dot"/>
      <rect x="248" y="200" width="174" height="26" rx="4" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
      <text x="335" y="217" text-anchor="middle" fill="#14532D" font-size="12" font-weight="800" font-family="'IBM Plex Mono', monospace">B-tree: log_M N ≤ 5</text>

      <!-- RAM vs Disk comparison footer cards -->
      <rect x="34" y="312" width="196" height="54" rx="5" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.6"/>
      <text x="132" y="334" text-anchor="middle" fill="#004AAD" font-size="13" font-weight="800" font-family="'IBM Plex Mono', monospace">RAM · ~100 ns</text>
      <text x="132" y="353" text-anchor="middle" fill="#475569" font-size="11" font-weight="600">bisect &amp; xử lý nút cực nhanh</text>

      <rect x="250" y="312" width="196" height="54" rx="5" fill="#FEF3C7" stroke="#D97706" stroke-width="1.6"/>
      <text x="348" y="334" text-anchor="middle" fill="#92400E" font-size="13" font-weight="800" font-family="'IBM Plex Mono', monospace">ĐĨA CỨNG · ~5 ms</text>
      <text x="348" y="353" text-anchor="middle" fill="#78350F" font-size="11" font-weight="600">chậm hơn RAM ~50.000×</text>
    </svg>
  `,
});

export const chapter05Slide = buildChapterDividerSlide({
  number: 27,
  numStr: '05',
  chapter: '5. Các biến thể và ứng dụng',
  kicker: 'PHẦN 05 · BIẾN THỂ &amp; THỰC TẾ',
  plainTitle: 'Phần 5: Các biến thể & Ứng dụng thực tế',
  titleHtml: 'Các biến thể<br/><span>&amp; Ứng dụng thực tế</span>',
  subtitle: 'Từ B+ Tree, B* Tree đến InnoDB, HFS+, Berkeley DB và cặp chỉ mục vùng trống XFS.',
  theme: 'ch-05',
  rangeLabel: 'TRANG 28 – 35',
  pills: [
    { label: 'B+ Tree (Range Scan & Copy-up)', targetSlide: 28 },
    { label: 'B* Tree (Phân phối lại & 2→3)', targetSlide: 30 },
    { label: 'InnoDB · HFS+ · Berkeley DB', targetSlide: 32 },
    { label: 'XFS (cntbt & bnobt · 400–411)', targetSlide: 33 },
  ],
  leadIn: '“B-tree kinh điển chưa phải điểm dừng. Trong các hệ quản trị CSDL và hệ thống tệp thực tế, nó được cải tiến thành B+, B* và cặp cây XFS như thế nào?”',
  fullScript: 'Phần 5 giới thiệu hai biến thể nổi bật nhất (B+ Tree và B* Tree), khảo sát ứng dụng trên InnoDB, HFS+, Berkeley DB và phân tích sâu kiến trúc 2 cây B+ song song cntbt & bnobt của hệ thống tệp XFS.',
  artSvg: `
    <svg viewBox="0 0 480 400" class="chd-svg" role="img" aria-label="Minh họa B+ Tree liên kết lá và cấp phát vùng trống XFS">
      <defs>
        <marker id="chd5-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
          <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#16A34A"/>
        </marker>
        <path id="chd5-hwy" d="M 48 106 L 432 106"/>
      </defs>
      <rect x="14" y="14" width="452" height="372" rx="8" fill="rgba(255,255,255,0.95)" stroke="#004AAD" stroke-width="2.2"/>
      <text x="32" y="42" fill="#004AAD" font-size="12.5" font-weight="800" font-family="'IBM Plex Mono', monospace">B+ LEAF HIGHWAY · XFS DUAL INDEX</text>

      <!-- B+ Linked Leaf Chain -->
      <g>
        <rect x="34" y="76" width="108" height="52" rx="4" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
        <text x="88" y="108" text-anchor="middle" fill="#14532D" font-size="17" font-weight="800" font-family="'IBM Plex Mono', monospace">15 | 20</text>
        <line x1="142" y1="102" x2="178" y2="102" stroke="#16A34A" stroke-width="3" class="chd-flow" marker-end="url(#chd5-arr)"/>

        <rect x="186" y="76" width="108" height="52" rx="4" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
        <text x="240" y="108" text-anchor="middle" fill="#14532D" font-size="17" font-weight="800" font-family="'IBM Plex Mono', monospace">25 | 30</text>
        <line x1="294" y1="102" x2="330" y2="102" stroke="#16A34A" stroke-width="3" class="chd-flow" marker-end="url(#chd5-arr)"/>

        <rect x="338" y="76" width="108" height="52" rx="4" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
        <text x="392" y="108" text-anchor="middle" fill="#14532D" font-size="17" font-weight="800" font-family="'IBM Plex Mono', monospace">35 | 40</text>
      </g>
      <circle r="4.5" fill="#BBF7D0" stroke="#15803D" stroke-width="1.6"><animateMotion dur="2.2s" begin="-0.3s" repeatCount="indefinite"><mpath href="#chd5-hwy"/></animateMotion></circle>

      <!-- XFS 12-block disk strip -->
      <text x="34" y="168" fill="#1E3A8A" font-size="12.5" font-weight="800" font-family="'Be Vietnam Pro', sans-serif">XFS · Cấp phát 10 block (400–409) · Dư 410–411</text>
      ${Array.from(
        { length: 10 },
        (_, i) =>
          `<rect x="${34 + i * 34.4}" y="182" width="30" height="46" rx="3" fill="#2563EB" class="chd-xfs-alloc" style="--bi:${i}"/>` +
          `<text x="${49 + i * 34.4}" y="209" text-anchor="middle" fill="#FFFFFF" font-size="9.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${400 + i}</text>`,
      ).join('')}
      ${[10, 11]
        .map(
          (i) =>
            `<rect x="${34 + i * 34.4}" y="182" width="30" height="46" rx="3" fill="#FEF08A" stroke="#B45309" stroke-width="1.6"/>` +
            `<text x="${49 + i * 34.4}" y="209" text-anchor="middle" fill="#92400E" font-size="9.5" font-weight="800" font-family="'IBM Plex Mono', monospace">${400 + i}</text>`,
        )
        .join('')}

      <!-- Dual synchronized index cards -->
      <rect x="34" y="256" width="198" height="104" rx="6" fill="#EEF7FF" stroke="#004AAD" stroke-width="1.8"/>
      <rect x="48" y="270" width="114" height="22" rx="3" fill="#004AAD"/>
      <text x="105" y="285" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="800" font-family="'IBM Plex Mono', monospace">bnobt · địa chỉ</text>
      <text x="48" y="316" fill="#0F1D3A" font-size="14" font-weight="800" font-family="'IBM Plex Mono', monospace">(400, 12) → (410, 2)</text>
      <text x="48" y="340" fill="#475569" font-size="11.5" font-weight="600">Sửa tại chỗ · gộp vùng kề</text>

      <rect x="248" y="256" width="198" height="104" rx="6" fill="#0F1D3A" stroke="#004AAD" stroke-width="1.8"/>
      <rect x="262" y="270" width="114" height="22" rx="3" fill="#2563EB"/>
      <text x="319" y="285" text-anchor="middle" fill="#FEF08A" font-size="11" font-weight="800" font-family="'IBM Plex Mono', monospace">cntbt · độ dài</text>
      <text x="262" y="316" fill="#FFFFFF" font-size="14" font-weight="800" font-family="'IBM Plex Mono', monospace">(12, 400) → (2, 410)</text>
      <text x="262" y="340" fill="#93C5FD" font-size="11.5" font-weight="600">Tìm nhanh vùng ≥ 10 block</text>
    </svg>
  `,
});
