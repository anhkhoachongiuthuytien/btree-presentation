import type { TransitionKind, TransitionSpec } from './types';

export const TRANSITION_DURATIONS: Record<TransitionKind, number> = {
  'open-chapter': 520,
  'connect-shape': 420,
  'swap-example': 260,
};

export const TRANSITIONS: TransitionSpec[] = [
  { from: 1, to: 2, kind: 'open-chapter', label: 'Mở Mục lục', description: 'Khối máy tính dịch trái vào vùng minh họa; mặt máy chủ ở mục lục hiện cùng kích thước.' },
  { from: 2, to: 3, kind: 'open-chapter', label: 'Phần 1 · Bài toán & lý thuyết', description: 'Dòng 01 của mục lục thu thành nhãn phần 1 ở góc trái, từ đó mở bốn cột bài toán.' },
  { from: 3, to: 4, kind: 'connect-shape', label: 'Bậc M → Nút M nhánh', description: 'Nhãn M ở cột Input dịch đến góc sơ đồ. Một khung nút ba ô xuất hiện.' },
  { from: 4, to: 5, kind: 'connect-shape', label: 'M-way → B-tree cân bằng', description: 'Giữ dáng khối ba ô làm mẫu nhỏ bên trái; cây mới [40|80] hiện bên phải.' },
  { from: 5, to: 6, kind: 'open-chapter', label: 'Phần 2 · Các phép toán', description: 'Đường ngang dưới các lá thu thành gạch chân phần 2. Cây ví dụ search hiện đủ.' },
  { from: 6, to: 7, kind: 'swap-example', label: 'Search(17) → Insert(k)', description: 'Nhãn Search(17) tắt; nhãn Insert(k) và lá [10|30] hiện tại cùng vị trí sân khấu.' },
  { from: 7, to: 8, kind: 'swap-example', label: 'M = 4 · Split dây chuyền', description: 'Giữ nhãn M=4, thay bằng cây đầy gốc [30|50|75] và khóa 72 chờ bên ngoài.' },
  { from: 8, to: 9, kind: 'swap-example', label: 'Chèn → Xóa khóa', description: 'Thu đường split ngược lên cha; tiêu đề chuyển sang xóa khóa và lưu đồ quyết định.' },
  { from: 9, to: 10, kind: 'connect-shape', label: 'Hai nhánh xóa → Hai ví dụ', description: 'Hai nhánh “ở lá” và “ở nút trong” tách thành tiêu đề của hai hàng ví dụ.' },
  { from: 10, to: 11, kind: 'swap-example', label: 'Xóa cơ bản → Borrow / Merge', description: 'Giữ vị trí ba lá và khung gốc; thay số liệu sang cây trước khi xóa 5.' },
  { from: 11, to: 12, kind: 'connect-shape', label: 'Gộp nút → Trace Delete(5)', description: 'Ngoặc của phép gộp thu thành ký hiệu mốc; cây ba tầng h=2 hiện đủ.' },
  { from: 12, to: 13, kind: 'open-chapter', label: 'Phần 3 · Cài đặt Python', description: 'Khung nút thu thành cặp danh sách keys/children trong cửa sổ Python.' },
  { from: 13, to: 14, kind: 'connect-shape', label: 'search → insert & _insert', description: 'Dùng cùng khung editor; đổi tab từ search sang insert và _insert.' },
  { from: 14, to: 15, kind: 'connect-shape', label: 'insert → delete & _delete', description: 'Giữ hai cửa sổ mã ở vị trí tương ứng, đổi sang delete/_delete với khóa 10.' },
  { from: 15, to: 16, kind: 'connect-shape', label: 'Mở _fix_underflow(parent, i)', description: 'Dòng gọi _fix_underflow được viền, mở thành cửa sổ định nghĩa hàm.' },
  { from: 16, to: 17, kind: 'open-chapter', label: 'Phần 4 · Độ phức tạp', description: 'Hai đường viền cửa sổ mã thu thành hai vùng so sánh chiều cao với N, M, h.' },
  { from: 17, to: 18, kind: 'connect-shape', label: 'h + 1 → Bảng chi phí thời gian', description: 'Đưa nhãn h+1 từ hình chiều cao sang ô số nút của hàng Search.' },
  { from: 18, to: 19, kind: 'connect-shape', label: 'Trung bình → Giả thiết & kỳ vọng', description: 'Phóng vùng “trung bình” thành hai bảng song song: tìm kiếm và chèn/xóa.' },
  { from: 19, to: 20, kind: 'swap-example', label: 'Công thức → RAM & I/O thực tế', description: 'Giữ N, M, h ở chân trang; thay bằng cây tìm 65 và hai đồng hồ RAM / I/O.' },
  { from: 20, to: 21, kind: 'connect-shape', label: 'Trang đĩa → Bộ nhớ lưu & stack', description: 'Dời trọng tâm sang ba vùng bộ nhớ: cây thường trú, stack và mảng tạm.' },
  { from: 21, to: 22, kind: 'open-chapter', label: 'Phần 5 · Cải tiến & ứng dụng', description: 'Hàng lá được giữ làm đường chuẩn; cây B+ mới hiện từ hàng lá lên gốc.' },
  { from: 22, to: 23, kind: 'swap-example', label: 'B+ duyệt khoảng → Copy-up 25', description: 'Giữ mũi tên ngang giữa lá; chuyển sang cây trước khi chèn 25.' },
  { from: 23, to: 24, kind: 'swap-example', label: 'B+ → B* (M = 7, 6 ô/nút)', description: 'Mờ nhãn B+ và copy-up; hiện B*, M=7 và hai ô trống ở anh em phải.' },
  { from: 24, to: 25, kind: 'swap-example', label: 'Phân phối lại → Tách 2 thành 3', description: 'Trở về cùng cha [70] và đầu vào 35; lấp hai ô trống bằng 120, 130.' },
  { from: 25, to: 26, kind: 'connect-shape', label: '3 nút B* → 3 hệ thống ứng dụng', description: 'Ba khay khóa thu nhỏ rồi mở thành ba thẻ ứng dụng thực tế.' },
  { from: 26, to: 27, kind: 'connect-shape', label: 'Hệ thống tệp → Bài toán XFS', description: 'Phóng thẻ hệ thống tệp, chuyển sang bài toán 10 block liền nhau trong XFS.' },
  { from: 27, to: 28, kind: 'connect-shape', label: '6 vùng trống → cntbt & bnobt', description: 'Sáu cặp extent thu thành dữ liệu lá của hai cây chỉ mục B+ song song.' },
  { from: 28, to: 29, kind: 'connect-shape', label: '(400, 12) → Vòng đời cấp & thu hồi', description: 'Sao chép vùng (400,12) sang dải 400…411 với trạng thái trước khi cấp.' },
];

const TRANSITION_MAP = new Map<string, TransitionSpec>(
  TRANSITIONS.map((t) => [`${t.from}->${t.to}`, t]),
);

let activeOverlayAnims: Animation[] = [];

export function cancelSlideTransition(overlay: HTMLElement): void {
  for (const anim of activeOverlayAnims) {
    try {
      anim.cancel();
    } catch {
      // ignore
    }
  }
  activeOverlayAnims = [];
  overlay.innerHTML = '';
  overlay.classList.remove('is-active');
}

export function playSlideTransition(
  overlay: HTMLElement,
  fromSlide: number,
  toSlide: number,
  reducedMotion: boolean,
): void {
  cancelSlideTransition(overlay);
  if (fromSlide === toSlide) return;

  const isForward = toSlide > fromSlide;
  const spec = isForward
    ? TRANSITION_MAP.get(`${fromSlide}->${toSlide}`)
    : TRANSITION_MAP.get(`${toSlide}->${fromSlide}`);

  // Chapter jumps or non-adjacent jumps use a crisp short crossfade
  const kind: TransitionKind = spec ? spec.kind : 'swap-example';
  const duration = reducedMotion ? 90 : spec ? TRANSITION_DURATIONS[kind] : 180;
  const easing = 'cubic-bezier(.2,.7,.2,1)';

  overlay.classList.add('is-active');

  if (reducedMotion || !spec) {
    const wash = document.createElement('div');
    wash.className = 'tr-wash';
    overlay.appendChild(wash);
    const anim = wash.animate(
      [{ opacity: 0.22 }, { opacity: 0 }],
      { duration, easing, fill: 'forwards' },
    );
    activeOverlayAnims.push(anim);
    anim.onfinish = () => cancelSlideTransition(overlay);
    return;
  }

  const badge = document.createElement('div');
  badge.className = `tr-pill tr-pill--${kind}`;
  const kindLabel =
    kind === 'open-chapter' ? 'Mở chương' : kind === 'connect-shape' ? 'Nối hình' : 'Đổi ví dụ';
  badge.innerHTML = `<span class="tr-pill__kind">${kindLabel}</span><span class="tr-pill__txt">${isForward ? '' : '↺ '}${spec.label}</span>`;

  const curtain = document.createElement('div');
  curtain.className = `tr-curtain tr-curtain--${kind}`;

  overlay.appendChild(curtain);
  overlay.appendChild(badge);

  const dir = isForward ? 1 : -1;
  const curtainFrames: Keyframe[] =
    kind === 'open-chapter'
      ? [
          { opacity: 0.34, transform: `translateX(${dir * 48}px) scale(0.985)` },
          { opacity: 0, transform: 'translateX(0px) scale(1)' },
        ]
      : kind === 'connect-shape'
        ? [
            { opacity: 0.24, transform: `translateX(${dir * 26}px)` },
            { opacity: 0, transform: 'translateX(0px)' },
          ]
        : [
            { opacity: 0.28 },
            { opacity: 0 },
          ];

  const badgeFrames: Keyframe[] = [
    { opacity: 0, transform: `translate(-50%, ${dir * 12}px) scale(0.94)` },
    { opacity: 0.96, transform: 'translate(-50%, 0px) scale(1)', offset: 0.22 },
    { opacity: 0.96, transform: 'translate(-50%, 0px) scale(1)', offset: 0.72 },
    { opacity: 0, transform: `translate(-50%, ${-dir * 8}px) scale(0.97)` },
  ];

  const a1 = curtain.animate(curtainFrames, { duration, easing, fill: 'forwards' });
  const a2 = badge.animate(badgeFrames, { duration: Math.max(duration, 360), easing, fill: 'forwards' });
  activeOverlayAnims.push(a1, a2);
  a2.onfinish = () => cancelSlideTransition(overlay);
}
