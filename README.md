# B-tree, các cải tiến và ứng dụng — Bộ thuyết trình web tương tác (Nhóm 10)

Bộ thuyết trình 29 trang tương tác bằng tiếng Việt, dựng bằng **reveal.js 5**, **Vite 7**, **TypeScript**, **KaTeX**, **Be Vietnam Pro**, **IBM Plex Mono**, **SVG** và **Web Animations API**, hoạt động hoàn toàn ngoại tuyến sau khi build.

## Cài đặt & Chạy thử

```powershell
cd btree-presentation
npm ci
```

- **Chạy tập dượt (dev server):**
  ```powershell
  npm run dev
  ```
- **Kiểm tra kiểu TypeScript & đóng gói bản tĩnh (`dist/`):**
  ```powershell
  npm run build
  ```
- **Kiểm tra bản build tĩnh trên localhost (dùng được khi ngắt mạng):**
  ```powershell
  npm run preview
  ```
- **Chạy đối chiếu thuật toán Python tham chiếu (tùy chọn):**
  ```powershell
  python scripts/verify_btree.py
  ```

## Phím tắt trên bục giảng

| Phím / Thao tác | Chức năng |
|---|---|
| `→`, `Space`, hoặc click nền sân khấu | Tiến đúng 1 nhịp (sang trang kế ở nhịp cuối; giữ nguyên kết quả ở cuối trang 29) |
| `←` hoặc nút **Lùi** | Khôi phục chính xác trạng thái cây, mã tô sáng và bộ đếm của nhịp trước |
| Nút **Làm lại ví dụ** | Trở về nhịp 0 của trang hiện tại (ngắt animation đang chạy) |
| Nút **Xem đầy đủ** | Mở bảng đọc đầy đủ nội dung, công thức KaTeX, mã Python & tài liệu XFS |
| `O` / `Esc` | Mở/đóng tổng quan (Esc đóng hộp thoại lớp trên cùng trước) |
| `S` / nút **Ghi chú** | Mở cửa sổ người nói (Speaker View) có đồng hồ, lời dẫn và lời thuyết trình đầy đủ |
| `F` / nút **⛶** | Bật/tắt toàn màn hình |
| `L` / nút **Laser** | Bật/tắt chấm laser bám con trỏ |
| Nhấn cửa sổ mã (Trang 13–16) | Phóng to khối mã Python và cuộn bằng bàn phím |
