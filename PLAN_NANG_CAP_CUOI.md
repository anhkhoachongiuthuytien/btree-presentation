# Đặc tả Kỹ thuật Chi tiết Nâng cấp Lần cuối: Âm thanh · Giao diện · Animation (30/30 Trang B-Tree — Nhóm 10)

> **Trạng thái:** Bản đặc tả kỹ thuật cấp độ mã nguồn (Engineering-Grade Master Plan) bao gồm thông số tần số (`Hz`), thời gian (`ms`), quỹ đạo toán học (`Parabolic FLIP`), selector CSS/DOM và kịch bản từng nhịp (`step 0 → stepCount`) cho **đủ 30/30 trang**. **Mã nguồn hiện tại (`37421ee`) vẫn giữ nguyên 100% — chỉ bắt đầu code khi bạn ra lệnh.**

---

## 1. Kiến trúc Tổng thể & Chuỗi Xử lý Tín hiệu (DSP & Rendering Pipeline)

- **Chuỗi DSP Web Audio API (`src/soundEffects.ts`):**
  `Oscillator / NoiseBuffer (1.5s)` → `BiquadFilter (LP/BP/HP)` → `Exponential ADSR Gain` → `StereoPanner (-0.68 .. +0.68)` → `Master Gain (0.52)` → `DynamicsCompressor (-16dB, knee 12dB, ratio 4:1, attack 4ms, release 140ms)` → `AudioContext.destination`.
- **Chuỗi Đồ họa & Chuyển động 60fps (`src/svg/treeRenderer.ts` & `src/transitions.ts`):**
  `Snapshot DOMRect trước` → `Render SVG mới + tính (dx, dy)` → `Phân loại: Same-Node Shift vs Cross-Level Parabolic Flight` → `WAAPI 5-Keyframe Arc + Arrival Shockwave Ring + Multi-Stage Sound Callbacks`.

---

## 2. Đặc tả Kỹ thuật Chi tiết Hệ thống Âm thanh (`src/soundEffects.ts`)

### 2.1. Bảng Thông số Tổng hợp Âm thanh Đa pha (Multi-Stage Choreographed SFX)
Mỗi thao tác thuật toán được chia thành **3 pha âm học** khớp chính xác với thời lượng `durationMs = 440ms` của `renderTreeScene`:

| Mã hiệu ứng | Pha 1: Khởi phát (`t + 0 ms`) | Pha 2: Quỹ đạo giữa (`t + 140..175 ms`) | Pha 3: Khóa chốt đích (`t + 310..360 ms`) |
| --- | --- | --- | --- |
| **`playSlotShiftSlide()`** *(Chèn khóa trượt khe)* | **Slip Air:** Bandpass noise `950Hz → 2150Hz`, `Q=2.2`, `d=95ms`, `gain=0.11`, `pan: -0.25 → 0` | **Key Shift:** Triangle `580Hz → 360Hz`, `d=110ms`, `gain=0.13`, `pan: 0 → +0.35` (dịch khóa bên phải) | **Magnetic Clack:** Sine `740Hz → 1046.5Hz (C6)`, `a=2ms`, `d=130ms`, `gain=0.16`, `pan: 0` + Highpass snap `3200Hz` (`14ms`) |
| **`playCascadeSplit(level)`** *(Tách nút tầng `1..3`, hệ số `k = 1 + 0.15*(level-1)`)* | **Split Thud:** Sine `132*k Hz → 48Hz`, `glide=260ms`, `d=320ms`, `gain=0.33` + Lowpass puff `400Hz` (`d=120ms`, `gain=0.14`) | **Stereo Separation:** Kênh trái Triangle `440*k → 587*k Hz` (`pan: -0.52`, `d=210ms`) + Kênh phải Sine `523*k → 784*k Hz` (`pan: +0.52`, `d=230ms`) | **Promote Lock / Root Crown:** Sine `880*k → 1174.66Hz`, `d=240ms`, `gain=0.12`, `pan: 0`. Nếu `level === 3` (tạo gốc mới): bung hợp âm 4 nốt `[784, 1046.5, 1318.5, 1568] Hz` đan xen `pan: ±0.4` |
| **`playPredecessorSwap()`** *(Tìm & thế tiền nhiệm)* | **Left Subtree Dive:** Triangle `660Hz → 310Hz`, `glide=115ms`, `d=135ms`, `gain=0.13`, `pan: -0.38` | **Rightmost Leaf Hop:** 2 xung radar `1480Hz` & `1760Hz` (`d=45ms`, `pan: -0.35 → -0.1`) | **Promote Overwrite:** Sine `349.23Hz → 783.99Hz`, `glide=150ms`, `d=220ms`, `gain=0.14`, `pan: -0.1 → 0` |
| **`playBorrowRotate()`** *(Mượn khóa qua cha / B\* phân phối)* | **Parent Demote:** Triangle `659.25Hz → 440Hz`, `glide=110ms`, `d=150ms`, `gain=0.13`, `pan: 0 → -0.44` | **Sibling Promote:** Sine `440Hz → 659.25Hz`, `glide=120ms`, `d=170ms`, `gain=0.13`, `pan: +0.44 → 0` | **Equilibrium Lock:** Hợp âm quãng 5 hoàn hảo `[440Hz, 659.25Hz]`, `d=210ms`, `gain=0.09`, `pan: ±0.25` |
| **`playMergeFold()`** *(Gộp 2 nút + khóa cha)* | **Separator Drop:** Triangle `587.33Hz → 293.66Hz`, `glide=110ms`, `d=140ms`, `gain=0.13`, `pan: 0` | **Stereo Converge:** Trái Sine `330Hz → 220Hz` (`pan: -0.52 → 0`) + Phải Triangle `293.66Hz → 220Hz` (`pan: +0.52 → 0`), `d=165ms` | **Magnetic Snap:** Bandpass click `1950Hz` (`16ms`, `Q=3.0`, `gain=0.13`) + âm trầm `220Hz` (`d=240ms`, `gain=0.14`) |
| **`playRootCollapse()`** *(Xóa gốc rỗng `h → h−1`)* | **Empty Frame Release:** Bandpass noise `1200Hz → 320Hz`, `d=140ms`, `gain=0.12` | **Gravity Drop:** Sine `230Hz → 64Hz`, `glide=270ms`, `d=340ms`, `gain=0.29` | **New Root Settle:** Hợp âm `[392Hz (G4), 523.25Hz (C5), 659.25Hz (E5)]`, `d=360ms`, `gain=0.11`, `pan: [-0.3, 0, +0.3]` |
| **`playBPlusCopyUp()`** *(B+ Tree Copy-up 25)* | **Leaf Split:** Low thud `135Hz → 54Hz` (`d=220ms`, `gain=0.24`) + Leaf anchor Triangle `440Hz` (`d=240ms`, `pan: +0.25`) | **Upward Clone Flight:** Sine glide `440Hz → 880Hz`, `glide=135ms`, `d=160ms`, `gain=0.11`, `pan: +0.25 → 0` | **Octave Dual-Presence Echo:** Đồng thời vang `440Hz` ở lá (`pan: +0.35`, `gain=0.08`) và `880Hz` ở cha (`pan: -0.15`, `gain=0.13`, `d=300ms`) |
| **`playBStarSplit2to3()`** *(B\* tách 2 nút → 3 nút `2/3`)* | **14-Key Gather & Thud:** Sine `128Hz → 50Hz` (`d=300ms`, `gain=0.31`) + Lowpass burst `390Hz` | **Tri-Node Partition:** 3 xung định vị stereo ở `t+90ms`, `t+155ms`, `t+220ms` | **3-Voice Triad Lock:** Trái `440Hz` (`pan: -0.68`) · Giữa `554.37Hz` (`pan: 0`) · Phải `659.25Hz` (`pan: +0.68`), `d=320ms`, `gain=0.12` |
| **`playXfsDualIndexSync(mode)`** *(Đồng bộ `bnobt` & `cntbt`)* | **Block Cut / Merge Snap:** Bandpass transient `2250Hz` (`alloc`) hoặc `1850Hz` (`coalesce`), `d=20ms`, `gain=0.15` | **Left Tree (`bnobt` địa chỉ):** Triangle `493.88Hz` (`alloc` tại chỗ) hoặc `392→523.25Hz` (`coalesce`), `pan: -0.58`, `d=180ms` | **Right Tree (`cntbt` độ dài):** Sine glide `740Hz → 370Hz` (`alloc` nhảy sang lá đầu) hoặc `440Hz → 783.99Hz` (`coalesce` quay về lá giữa), `pan: +0.58`, `d=260ms` |

### 2.2. Đặc tả Phòng thu Phím cơ Đa lớp v2 (`playKeystroke(ch)` & `playPythonExecHum()`)
- **Phím ký tự thường (`a-z`, `0-9`):**
  - *Lớp 1 (Bottom-out PBT Thock):* Triangle `215 * jitter Hz → 86Hz` (`glide=24ms`, `a=1.5ms`, `d=36ms`, `lpFreq=880Hz`, `gain=0.18`).
  - *Lớp 2 (Switch Stem Click):* Bandpass noise `2500 * jitter Hz` (`Q=1.7`, `a=1.5ms`, `d=15ms`, `gain=0.10`).
  - *Lớp 3 (Keycap Upstroke Release):* Highpass noise `3500Hz` (`delay=18ms`, `d=10ms`, `gain=0.045`).
  - *Stereo Micro-Spread:* `pan` dịch nhẹ theo vị trí cột ký tự đang gõ trên dòng (`-0.22 → +0.22`).
- **Phím dấu câu & toán tử (`( ) [ ] : = , . + -`):** Tăng tần số Lớp 1 lên `255Hz`, Lớp 2 lên `3200Hz` (`Q=2.4`, `gain=0.13`).
- **Phím Space (`' '`):** Triangle trầm `145Hz → 60Hz` (`d=56ms`, `lpFreq=560Hz`, `gain=0.23`, `pan=0`) + Bandpass `1350Hz` (`Q=1.3`, `d=20ms`, `gain=0.13`).
- **Phím Enter (`'\n'`):** Triangle nặng `175Hz → 68Hz` (`d=65ms`, `gain=0.26`, `pan=+0.28`) + 2 xung noise liên tiếp ở `0ms` (`1950Hz`) và `24ms` (`3000Hz`).
- **Xung thực thi Python (`playPythonExecHum()`):** Ngay khi gõ xong dòng cuối của mỗi nhịp trên Trang 17, phát xung biên dịch `110Hz → 220Hz` (`d=55ms`, `type='sine'`, `gain=0.08`) trước khi `stdout` bung kết quả và cây B-tree bên phải chuyển động.
- **Vi âm thanh lướt chuột (`playHoverTick()`):** Sine `1650Hz → 1200Hz` (`a=1ms`, `d=16ms`, `gain=0.018`), cooldown `90ms`.

---

## 3. Đặc tả Kỹ thuật Engine Chuyển động & Đồ họa (`src/svg/treeRenderer.ts` & `src/transitions.ts`)

### 3.1. Công thức Quỹ đạo Parabol 5-Keyframe trong `treeRenderer.ts`
Khi một khóa (`keyId` giữ nguyên giữa `prevKeyRects` và `nextKeyRects`) di chuyển giữa hai tầng (`Math.abs(dy) > 22`) hoặc bay từ hộp chờ bên ngoài vào cây:
- Vector gốc từ vị trí mới về vị trí cũ: `dx = prevCenter.x - nextCenter.x`, `dy = prevCenter.y - nextCenter.y`.
- Độ vồng cung Parabol: `arcLift = Math.min(34, Math.max(14, Math.hypot(dx, dy) * 0.18))`.
- Tại tham số tiến trình $u \in [0, 1]$:
  $$x(u) = (1 - u)\cdot dx, \qquad y(u) = (1 - u)\cdot dy - 4\cdot \text{arcLift}\cdot u(1 - u), \qquad s(u) = 1 + 0.12 \cdot \sin(\pi u)$$
- Mảng 5 Keyframe WAAPI (`duration: 460ms`, `easing: 'cubic-bezier(0.22, 1, 0.36, 1)'`):
  - `0.00`: `translate(dx, dy) scale(1)`
  - `0.25`: `translate(0.75*dx, 0.75*dy - 0.75*arcLift) scale(1.08)`
  - `0.50`: `translate(0.50*dx, 0.50*dy - 1.00*arcLift) scale(1.12)`
  - `0.75`: `translate(0.25*dx, 0.25*dy - 0.75*arcLift) scale(1.06)`
  - `1.00`: `translate(0px, 0px) scale(1)`

### 3.2. Vòng Xung Chấn Đích (`Arrival Shockwave Ring`) trên Nút 3D
- Trong `renderNode3D(node)`: với các nút có `node.state === 'success' || node.state === 'overflow' || node.state === 'highlight-box'`, gắn thêm `<rect class="tr-arrival-ring tr-arrival-ring--${node.state}" ... />` chạy animation `trArrivalPulse` (`420ms`: `scale(0.96 → 1.12)`, `opacity: 0.95 → 0`).

### 3.3. Nhịp Xuất Hiện Thác 3 Tầng (`Staggered Slide Entrance`) trong `src/deck.css`
- **Tầng 1 (`0ms`):** `.slide-header`, `.s17-header`, `.cover-top-tag`, `.toc-left`.
- **Tầng 2 (`55ms`):** `.stage-skinned`, `.code-window`, `.complexity-table`, `.xfs-band-card`, `.toc-bar:nth-child(-n+3)`.
- **Tầng 3 (`110ms`):** `.canva-card`, `.var-watch`, `.ch3-trace-card`, `.s18-case-card`, `.toc-bar:nth-child(n+4)`.

---

## 4. Đặc tả Chi tiết Từng Trang Một: Trang 01 → Trang 30

1. **Trang 01 (Bìa):** `Nhịp 1` quét vệt sáng ánh kim (`sheen sweep` 520ms) qua thẻ `PAGE #001 · 4 KB` khi nạp lên RAM + `playPageLoad()`; `Nhịp 2` sáng huy hiệu tổng kết + `playSparkleChime()`.
2. **Trang 02 (Mục lục):** Thanh tiến trình dọc có đầu sáng (`glowing tip`) kéo dài `0% → 44% → 94%`; bấm chương bất kỳ nhảy tới trang đích và phát `playChapterIdent()` của chương đó.
3. **Trang 03 (Bài toán nền):** 4 cột thẻ sáng tuần tự; `Nhịp 3` phát `playScaleCollapse()` (nén 1 tỷ khóa → 3 nhịp đọc đĩa); 3 nút thử nghiệm trên cây nhỏ phát `playSuccess()` / `playAlert()`.
4. **Trang 04 (M-way Search Tree):** Bấm thử `15 / 50 / 65 / 95` làm sáng đoạn tương ứng trên **Trục số phân hoạch**, cổng `Cổng 0..3` nảy đàn hồi kèm `playIntervalGate(port, isDirect)` định vị stereo từ trái sang phải (`-0.66 .. +0.66`).
5. **Trang 05 (B-tree cân bằng):** `Nhịp 3` vẽ đường gióng ngang đứt nét màu xanh lục nối tâm 3 nút lá nhấn mạnh *"Mọi lá cùng độ sâu"* + `playBalanceLevel()`.
6. **Trang 06 (`Search(17)`):** `Nhịp 1, 2` chạy hạt xung trên cạnh + `playBisectProbe(0..1)`; `Nhịp 3` bung vòng `Arrival Ring` tại ô `17` + `playSuccess()`.
7. **Trang 07 (`Insert` & `Split`):** `Nhịp 1` hộp `[20]` trượt khe dịch `30` + `playSlotShiftSlide()` (3 pha); `Nhịp 2` hộp `[25]` gây tràn 4 khóa + `playOverflow()`; `Nhịp 3` khóa `20` bay Parabol lên cha + `playCascadeSplit(1)`.
8. **Trang 08 (`Cascading Split`):** `Nhịp 1` chèn `72` tràn lá + `playCascadeSplit(1)`; `Nhịp 2` đẩy `65` tràn cha + `playCascadeSplit(2)`; `Nhịp 3` đẩy `50` lên tạo **Gốc mới (`h = 2`)** kèm `Arrival Ring` + `playCascadeSplit(3)` (hợp âm **New Root Crown**).
9. **Trang 09 (`Delete` lá & nút trong):** `Nhịp 1` rút `12` ở lá + `playDeletePop()`; `Nhịp 2` lặn tìm tiền nhiệm `7` + `playPredecessorSwap()`; `Nhịp 3` nâng `7` bay Parabol lên thế chỗ `10` ở gốc + `playBorrowRotate()`.
10. **Trang 10 (`Borrow` & `Merge`):** `Nhịp 1` xóa `6` gây thiếu khóa + `playDeletePop()`; `Nhịp 2` `5` bay xuống & `4` bay lên theo 2 cung Parabol ngược chiều + `playBorrowRotate()` (3 pha); `Nhịp 3` xóa `17` + `playOverflow()`; `Nhịp 4` hạ `10` gộp thành `[5 | 10]` + `playMergeFold()` (3 pha).
11. **Trang 11 (`Trace Delete(5)` hạ tầng gốc):** `Nhịp 1..4` xóa và gộp dây chuyền; `Nhịp 5` khung gốc rỗng thu gọn, `[7 | 12]` nâng lên làm gốc mới (`h = 1`) + `playRootCollapse()`.
12. **Trang 12 (Cây quyết định xóa khóa):** Nhánh mũi tên đi ra từ `Q1 / Q2 / Q3` sáng rực theo từng nhịp + `playDecisionRelay(1..3)`.
13. **Trang 13 (Python `BTreeNode` & `search`):** Nút `M = 3..6` phát `playOrderDial(M)`; khung `.var-watch` nháy `.is-var-changed` mỗi khi biến `i` đổi giá trị.
14. **Trang 14 (Python `insert` & split):** Đồng bộ nháy biến `mid`, `up_key`, `right` trong `.var-watch` + quỹ đạo Parabol trên cây `insert(72)` + `playCascadeSplit(1..3)`.
15. **Trang 15 (Python `delete` & `predecessor`):** Ô biến `key` nháy sáng khi đổi từ `10 → 7` ở Nhịp 2 + `7` bay Parabol lên gốc + `playPredecessorSwap()`.
16. **Trang 16 (Python `_fix_underflow`):** Nháy biến nhánh `Borrow Left / Borrow Right / Merge` + âm 3 pha `playBorrowRotate()` / `playMergeFold()`.
17. **Trang 17 (`demo_btree.py` Live Coding):** Gõ phím cơ 3 lớp có stereo theo cột chữ + `playPythonExecHum()` khi nhấn Enter kết thúc nhịp + FLIP Parabol trên cây kết quả đồng bộ với âm thuật toán của từng nhịp (`Split` / `Terminal` / `Borrow`).
18. **Trang 18 (Chiều cao $h$):** Hiện thác từng tầng `0 → 1 → i → h` trên hai sơ đồ $N_{\max}$ và $N_{\min}$ + `playTreeGrowth('max' | 'min')`.
19. **Trang 19 (Bảng chi phí thời gian):** Thêm **thanh tiến độ pha mảnh (`2.5px`)** trên hai thẻ *Thuận lợi* và *Xấu nhất* chạy đồng bộ với từng pha mô phỏng và âm thanh pha.
20. **Trang 20 (Độ phức tạp trung bình):** Nổi bật độ suy giảm xác suất $p^k$ theo tầng 3D Isometric + `playDecayProbability(1..3)`.
21. **Trang 21 (RAM vs Disk I/O):** Hiệu ứng đếm chỉ số tốc độ truy cập & nạp khối `4 KB Page` + `playRamVsDisk('ram' | 'disk')`.
22. **Trang 22 (Độ phức tạp không gian):** Khung `Stack Frame` trượt nạp/rút trong ngăn xếp `O(h)` + `playStackFrame('push' | 'pop')`.
23. **Trang 23 (B+ Tree `Range Scan`):** Ở Nhịp 2, các ô khóa `15..35` và mũi tên liên kết lá `→` sáng đuổi nhau tuần tự `55ms/khóa` khớp với 5 nốt stereo `playRangeScan(5)`.
24. **Trang 24 (B+ Tree `Copy-up`):** Bản sao `25` bay Parabol lên cha trong khi bản gốc `25` ở lá cùng phát sáng kép + `playBPlusCopyUp()`.
25. **Trang 25 (B\* Tree `Redistribute`):** Khóa `40 ↑` và `50 ↓` bay Parabol qua cha, thanh đo % lấp đầy chạy mượt + `playBorrowRotate()`.
26. **Trang 26 (B\* Tree `Split 2 → 3`):** 2 khóa phân cách `30, 62` bay Parabol lên cha, 3 nút lá khóa vào mốc `2/3 (67%)` + `playBStarSplit2to3()` (3 giọng stereo Trái · Giữa · Phải).
27. **Trang 27 (Ứng dụng `InnoDB / HFS+ / Berkeley DB`):** Bấm 3 nút truy vấn mở mượt dải kết quả + phát `playRangeScan` / `playDiskSeek`.
28. **Trang 28 (Bài toán XFS 10 block):** Bấm từng thẻ vùng trống (`.ext-card`) phản hồi rung cảnh báo (`< 10`) hoặc sáng xanh lá (`≥ 10`).
29. **Trang 29 (Hai cây `cntbt` & `bnobt`):** Đồng bộ hai cây B+ với thanh sơ đồ đĩa 6 phân đoạn + `playXfsDualIndexSync('alloc' | 'coalesce')`.
30. **Trang 30 (XFS Cấp phát & Thu hồi trên `400–411`):** Hiệu ứng **sóng domino `18ms/block`** quét qua 10 ô `400 → 409` khi cấp phát và thu hồi, đồng bộ tức thì với hai lá SVG `bnobt` (cập nhật tại chỗ) & `cntbt` (phóng đường cong chuyển lá) + `playXfsDualIndexSync` & `playSparkleChime()`.
