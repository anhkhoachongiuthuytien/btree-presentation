import type { TransitionKind, TransitionSpec } from './types';

export const TRANSITION_DURATIONS: Record<TransitionKind, number> = {
  'open-chapter': 620,
  'connect-shape': 500,
  'swap-example': 440,
};

export const TRANSITIONS: TransitionSpec[] = [
  { from: 1, to: 2, kind: 'open-chapter', label: 'Mở Mục lục', description: 'Khối máy tính dịch trái vào vùng minh họa; mặt máy chủ ở mục lục hiện cùng kích thước.' },
  { from: 2, to: 3, kind: 'open-chapter', label: 'Phần 1 · Bài toán & cơ sở lí thuyết', description: 'Dòng 01 của mục lục mở sang bốn cột bài toán.' },
  { from: 3, to: 4, kind: 'connect-shape', label: 'Bậc M → Nút M nhánh', description: 'Chuyển từ tham số M sang cấu trúc nút M-way Search Tree.' },
  { from: 4, to: 5, kind: 'connect-shape', label: 'M-way → B-tree cân bằng', description: 'Bổ sung ràng buộc lấp đầy và cân bằng lá lên M-way Search Tree.' },
  { from: 5, to: 6, kind: 'open-chapter', label: 'Phần 2 · Các phép toán trong B-tree', description: 'Mở chương các phép toán bắt đầu với Search(k).' },
  { from: 6, to: 7, kind: 'swap-example', label: 'Search(k) → Insert(k)', description: 'Chuyển từ tìm kiếm sang chèn khóa và tách nút.' },
  { from: 7, to: 8, kind: 'swap-example', label: 'M = 4 · Split dây chuyền', description: 'Mở rộng tách lá thành tách dây chuyền lên gốc.' },
  { from: 8, to: 9, kind: 'swap-example', label: 'Chèn → Xóa khóa', description: 'Chuyển sang lưu đồ quyết định của thao tác xóa khóa.' },
  { from: 9, to: 10, kind: 'connect-shape', label: 'Hai nhánh xóa → Minh họa cụ thể', description: 'Đối chiếu xóa ở lá và xóa ở nút trong bằng Predecessor.' },
  { from: 10, to: 11, kind: 'swap-example', label: 'Xóa cơ bản → Borrow & Merge', description: 'Xử lý thiếu khóa bằng mượn qua cha hoặc gộp nút.' },
  { from: 11, to: 12, kind: 'connect-shape', label: 'Gộp nút → Trace Delete(k)', description: 'Theo dõi gộp dây chuyền và thu gọn gốc.' },
  { from: 12, to: 13, kind: 'open-chapter', label: 'Phần 3 · Cài đặt Python', description: 'Chuyển sang cài đặt hai lớp BTreeNode, BTree và search.' },
  { from: 13, to: 14, kind: 'connect-shape', label: 'Search → Insert & Split', description: 'Cài đặt insert(key) và _insert(node, key).' },
  { from: 14, to: 15, kind: 'connect-shape', label: 'Insert → Delete & Predecessor', description: 'Cài đặt delete(key) và _delete(node, key).' },
  { from: 15, to: 16, kind: 'connect-shape', label: 'Mở _fix_underflow(parent, i)', description: 'Ba nhánh mượn trái, mượn phải và gộp nút.' },
  { from: 16, to: 17, kind: 'open-chapter', label: 'Phần 4 · Độ phức tạp của B-tree', description: 'Chứng minh cận chiều cao h = O(log_M N).' },
  { from: 17, to: 18, kind: 'connect-shape', label: 'Chiều cao h → Chi phí 3 thao tác', description: 'Tổng hợp độ phức tạp thời gian Search, Insert, Delete.' },
  { from: 18, to: 19, kind: 'connect-shape', label: 'Thời gian → Độ phức tạp trung bình', description: 'Cây quyết định 3 nhánh và giả thiết đuôi cho R.' },
  { from: 19, to: 20, kind: 'swap-example', label: 'Lý thuyết → RAM & I/O thực tế', description: 'Tách riêng số lần đọc trang đĩa và xử lý trong RAM.' },
  { from: 20, to: 21, kind: 'connect-shape', label: 'Trang đĩa → Độ phức tạp không gian', description: 'Lưu cây Θ(N), ngăn xếp đệ quy và vùng tạm O(M).' },
  { from: 21, to: 22, kind: 'open-chapter', label: 'Phần 5 · B+ Tree & Cải tiến', description: 'Mở phần cải tiến với B+ Tree và duyệt khoảng.' },
  { from: 22, to: 23, kind: 'swap-example', label: 'B+ duyệt khoảng → Copy-up 25', description: 'Giải thích vì sao khóa 25 xuất hiện hai lần.' },
  { from: 23, to: 24, kind: 'swap-example', label: 'B+ Tree → B* Tree phân phối lại', description: 'Tận dụng ô trống ở anh em trước khi tách.' },
  { from: 24, to: 25, kind: 'swap-example', label: 'Phân phối lại → Tách 2 thành 3', description: 'Gom 14 khóa chia đều 3 nút đạt 2/3 dung lượng.' },
  { from: 25, to: 26, kind: 'connect-shape', label: 'Biến thể → Ứng dụng cơ bản', description: 'InnoDB, HFS+ và Berkeley DB.' },
  { from: 26, to: 27, kind: 'connect-shape', label: 'Hệ thống tệp → Bài toán XFS', description: 'Bài toán tìm 10 block trống liền nhau.' },
  { from: 27, to: 28, kind: 'connect-shape', label: '6 vùng trống → cntbt & bnobt', description: 'Hai cây B+ song song theo độ dài và địa chỉ.' },
  { from: 28, to: 29, kind: 'connect-shape', label: '(400, 12) → Cấp phát rồi thu hồi', description: 'Theo dõi trọn vòng đời cấp 10 block và gộp vùng trống.' },
];

const TRANSITION_MAP = new Map<string, TransitionSpec>(
  TRANSITIONS.map((t) => [`${t.from}->${t.to}`, t]),
);

let activeAnims: Animation[] = [];
let activeLeavingEl: HTMLElement | null = null;
let activeEnteringEl: HTMLElement | null = null;
let enterClassTimer: number | null = null;

function cleanupSlideClasses(): void {
  if (activeLeavingEl) {
    activeLeavingEl.classList.remove('is-leaving-slide');
    const st = activeLeavingEl.querySelector<HTMLElement>('.slide-stage');
    if (st) {
      st.style.transform = '';
      st.style.opacity = '';
      st.style.filter = '';
      st.style.clipPath = '';
    }
    activeLeavingEl = null;
  }
  if (activeEnteringEl) {
    activeEnteringEl.classList.remove('is-entering-slide');
    const st = activeEnteringEl.querySelector<HTMLElement>('.slide-stage');
    if (st) {
      st.style.transform = '';
      st.style.opacity = '';
      st.style.filter = '';
      st.style.clipPath = '';
    }
    activeEnteringEl = null;
  }
}

export function triggerSlideEntrance(slideEl: HTMLElement | null, reducedMotion: boolean): void {
  if (!slideEl) return;
  if (enterClassTimer !== null) {
    window.clearTimeout(enterClassTimer);
    enterClassTimer = null;
  }
  slideEl.classList.remove('slide-entering');
  if (reducedMotion) return;
  // Force reflow so staggered CSS entrance animations always replay cleanly
  void slideEl.offsetWidth;
  slideEl.classList.add('slide-entering');
  enterClassTimer = window.setTimeout(() => {
    slideEl.classList.remove('slide-entering');
    enterClassTimer = null;
  }, 900);
}

export function cancelSlideTransition(overlay: HTMLElement): void {
  for (const anim of activeAnims) {
    try {
      anim.cancel();
    } catch {
      // ignore
    }
  }
  activeAnims = [];
  cleanupSlideClasses();
  overlay.innerHTML = '';
  overlay.classList.remove('is-active');
}

export function playSlideTransition(
  overlay: HTMLElement,
  prevSlideEl: HTMLElement | null,
  nextSlideEl: HTMLElement | null,
  fromSlide: number,
  toSlide: number,
  reducedMotion: boolean,
): void {
  cancelSlideTransition(overlay);
  if (fromSlide === toSlide) return;

  const isForward = toSlide > fromSlide;
  const dir = isForward ? 1 : -1;
  const spec = isForward
    ? TRANSITION_MAP.get(`${fromSlide}->${toSlide}`)
    : TRANSITION_MAP.get(`${toSlide}->${fromSlide}`);

  const kind: TransitionKind = spec ? spec.kind : 'connect-shape';
  const duration = reducedMotion ? 110 : spec ? TRANSITION_DURATIONS[kind] : 420;
  const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const easeInOut = 'cubic-bezier(0.32, 0.72, 0, 1)';

  const prevStage = prevSlideEl?.querySelector<HTMLElement>('.slide-stage') ?? null;
  const nextStage = nextSlideEl?.querySelector<HTMLElement>('.slide-stage') ?? null;

  if (prevSlideEl && nextSlideEl && prevSlideEl !== nextSlideEl) {
    prevSlideEl.classList.add('is-leaving-slide');
    nextSlideEl.classList.add('is-entering-slide');
    activeLeavingEl = prevSlideEl;
    activeEnteringEl = nextSlideEl;
  }

  overlay.classList.add('is-active');

  if (reducedMotion) {
    if (prevStage && nextStage) {
      const aOut = prevStage.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: 'ease-out', fill: 'forwards' });
      const aIn = nextStage.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: 'ease-out', fill: 'forwards' });
      activeAnims.push(aOut, aIn);
      aIn.onfinish = () => cancelSlideTransition(overlay);
    } else {
      cancelSlideTransition(overlay);
    }
    return;
  }

  // 1. Physical slide-to-slide choreography (3 distinct signature B-tree transitions)
  let mainAnim: Animation | null = null;

  if (prevStage && nextStage) {
    if (kind === 'open-chapter') {
      // Blueprint Shutter Wipe + 3D Depth Recede + Glowing Drafting Scanline
      const outAnim = prevStage.animate(
        [
          { opacity: 1, transform: 'perspective(1200px) translateX(0px) scale(1) rotateY(0deg)', filter: 'blur(0px)' },
          { opacity: 0.15, transform: `perspective(1200px) translateX(${-dir * 70}px) scale(0.93) rotateY(${-dir * 4.5}deg)`, filter: 'blur(3.5px)' },
        ],
        { duration: Math.round(duration * 0.92), easing: easeInOut, fill: 'forwards' },
      );

      const startClip = isForward ? 'inset(0 0 0 100% round 14px)' : 'inset(0 100% 0 0 round 14px)';
      const endClip = 'inset(0 0 0 0 round 14px)';
      const inAnim = nextStage.animate(
        [
          { opacity: 0.65, clipPath: startClip, transform: `translateX(${dir * 46}px) scale(0.975)` },
          { opacity: 1, clipPath: endClip, transform: 'translateX(0px) scale(1)' },
        ],
        { duration, easing: easeInOut, fill: 'forwards' },
      );

      // Glowing drafting scanline sweeping across the viewport along the shutter edge
      const scanline = document.createElement('div');
      scanline.className = 'tr-scanline';
      overlay.appendChild(scanline);
      const scanAnim = scanline.animate(
        [
          { opacity: 0, transform: `translateX(${isForward ? '100vw' : '-10vw'})` },
          { opacity: 0.95, offset: 0.12 },
          { opacity: 0.85, offset: 0.82 },
          { opacity: 0, transform: `translateX(${isForward ? '-10vw' : '100vw'})` },
        ],
        { duration: Math.round(duration * 0.95), easing: easeInOut, fill: 'forwards' },
      );

      activeAnims.push(outAnim, inAnim, scanAnim);
      mainAnim = inAnim;
    } else if (kind === 'connect-shape') {
      // 3D Perspective Card Glide (crisp directional slide with subtle depth tilt)
      const outAnim = prevStage.animate(
        [
          { opacity: 1, transform: 'perspective(1300px) translateX(0px) scale(1) rotateY(0deg)', filter: 'blur(0px)' },
          { opacity: 0, transform: `perspective(1300px) translateX(${-dir * 135}px) scale(0.945) rotateY(${-dir * 3.5}deg)`, filter: 'blur(2px)' },
        ],
        { duration: Math.round(duration * 0.88), easing: easeOut, fill: 'forwards' },
      );

      const inAnim = nextStage.animate(
        [
          { opacity: 0, transform: `perspective(1300px) translateX(${dir * 125}px) scale(0.96) rotateY(${dir * 3}deg)` },
          { opacity: 1, transform: 'perspective(1300px) translateX(0px) scale(1) rotateY(0deg)' },
        ],
        { duration, easing: easeOut, fill: 'forwards' },
      );

      activeAnims.push(outAnim, inAnim);
      mainAnim = inAnim;
    } else {
      // swap-example: Optical Depth Focus (crisp zoom cross-focus between sibling examples)
      const outAnim = prevStage.animate(
        [
          { opacity: 1, transform: 'scale(1) translateY(0px)', filter: 'blur(0px)' },
          { opacity: 0, transform: `scale(${isForward ? 1.038 : 0.962}) translateY(${-dir * 14}px)`, filter: 'blur(3.5px)' },
        ],
        { duration: Math.round(duration * 0.82), easing: easeOut, fill: 'forwards' },
      );

      const inAnim = nextStage.animate(
        [
          { opacity: 0, transform: `scale(${isForward ? 0.952 : 1.042}) translateY(${dir * 18}px)`, filter: 'blur(4px)' },
          { opacity: 1, transform: 'scale(1) translateY(0px)', filter: 'blur(0px)' },
        ],
        { duration, easing: easeOut, fill: 'forwards' },
      );

      activeAnims.push(outAnim, inAnim);
      mainAnim = inAnim;
    }
  }

  // 2. Crisp contextual transition pill at top (only for adjacent mapped transitions)
  if (spec) {
    const badge = document.createElement('div');
    badge.className = `tr-pill tr-pill--${kind}`;
    const kindLabel =
      kind === 'open-chapter' ? 'Mở chương' : kind === 'connect-shape' ? 'Nối ý' : 'Đổi ví dụ';
    badge.innerHTML = `<span class="tr-pill__kind">${kindLabel}</span><span class="tr-pill__txt">${isForward ? '' : '↺ '}${spec.label}</span>`;
    overlay.appendChild(badge);

    const badgeAnim = badge.animate(
      [
        { opacity: 0, transform: `translate(-50%, ${dir * 10}px) scale(0.93)` },
        { opacity: 0.96, transform: 'translate(-50%, 0px) scale(1)', offset: 0.18 },
        { opacity: 0.96, transform: 'translate(-50%, 0px) scale(1)', offset: 0.74 },
        { opacity: 0, transform: `translate(-50%, ${-dir * 8}px) scale(0.96)` },
      ],
      { duration: Math.max(duration + 180, 620), easing: easeOut, fill: 'forwards' },
    );
    activeAnims.push(badgeAnim);

    const finishWatcher = mainAnim ?? badgeAnim;
    // Release leaving slide immediately once slide motion finishes, while badge fades gracefully
    if (mainAnim) {
      mainAnim.onfinish = () => cleanupSlideClasses();
    }
    badgeAnim.onfinish = () => cancelSlideTransition(overlay);
    if (!mainAnim) {
      finishWatcher.onfinish = () => cancelSlideTransition(overlay);
    }
  } else if (mainAnim) {
    mainAnim.onfinish = () => cancelSlideTransition(overlay);
  } else {
    cancelSlideTransition(overlay);
  }
}
