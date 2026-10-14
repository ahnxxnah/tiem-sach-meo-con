# 🐱 Tiệm Sách Mèo Con – game web học toán

Một trò chơi **HTML + CSS + JavaScript thuần**, chạy offline, mở trên điện thoại/máy tính và đăng được miễn phí trên GitHub Pages.

## Bắt đầu chơi

- Mở tệp `index.html` bằng Chrome, Safari hoặc Edge. Để kiểm tra như website, từ thư mục này chạy `python -m http.server 8000`, rồi mở `http://localhost:8000`.
- Chọn cấp **Dễ**, **Vừa**, hoặc **Khó** ngay trang **Cửa tiệm**.
- Bấm **Mở cửa hàng** → **Quầy thu ngân** → **Mời khách vào tiệm**.
- Giải câu hỏi. Nếu khó, dùng **Giấy nháp** và chuyển giữa **Viết tay** / **Đặt tính cột dọc**.
- Sau khi tính đúng, dùng **tiền mèo** để thối đúng số tiền khách cần nhận lại.
- Bán xong có +10 sao, doanh thu và tiến trình được lưu tự động.
- Vào **Nhập hàng** để nhập thêm số lượng hoặc tự thêm sách, vở, bút và mặt hàng khác. Nhập hàng trừ tiền quỹ; doanh thu bán hàng tăng tiền quỹ.
- Đóng cửa kết thúc ngày, tăng số ngày chơi.

## Hệ thống bài toán

**Đơn vị tính: 1 = 1.000 VNĐ (tiền giả trong game)**.

- **Dễ:** phép cộng/trừ, mỗi loại một món, giá nhỏ, hóa đơn <= 95.000đ, học cộng trừ trong phạm vi gần 100.
- **Vừa:** cộng/trừ/nhân; một số mặt hàng xuất hiện với số lượng 2–4, hóa đơn <= 295.000đ.
- **Khó:** cộng/trừ/nhân/chia, có câu hỏi suy ngược ra giá đơn vị bằng phép chia, hóa đơn <= 495.000đ.
- Bài được sinh từ chính giỏ mua hàng, và đáp án kiểm tra bằng phép tính chính xác. Không đưa sẵn lời giải.
- 9 mệnh giá: **1 / 2 / 5 / 10 / 20 / 50 / 100 / 200 / 500 nghìn**, tiền vẽ hình mèo SVG trong code; không sử dụng hình tiền thật.
- Giấy nháp vẽ tay với ngón tay/chuột và phép đặt tính cột dọc có ô nhập chữ số; phép chia có thương và số dư.

Nội dung lấy cảm hứng từ trình tự kỹ năng số học của Toán Tiểu học trong bộ **Kết nối tri thức với cuộc sống**. Đây không phải bài tập/ứng dụng chính thức của bộ sách và chưa áp dụng bản phân phối chương trình chi tiết từng tuần.

## Chỉnh sửa

- `index.html`: tiêu đề, nút bấm, các màn hình, biểu mẫu và giấy nháp.
- `style.css`: màu sắc, kích thước, phối cảnh tiệm sách, hình dáng tờ tiền.
- `script.js`: giá, tồn kho, chương trình học, sinh câu hỏi và quy tắc giao dịch.
- Tìm hằng số `INITIAL` đầu `script.js` để sửa danh mục mẫu: `id, tên, emoji, loại, giá bán, giá nhập, số lượng`.
- Tìm `LEVELS` trong `script.js` để thay đổi độ khó/giới hạn giá.
- Tìm `makeQuiz(order)` trong `script.js` để sửa kiểu bài toán theo cấp độ.
- Tiền mèo tạo trong hàm `catSVG()` và `noteHTML()`.
- Lưu tiến trình trên chính trình duyệt qua `localStorage` với khóa `tiem-sach-meo-con-v1`. Xóa dữ liệu trang web hoặc dùng nút reset sẽ xóa tiến trình.
- Game là bản mẫu chơi **một máy, một người**, chưa có tài khoản, bảng xếp hạng trực tuyến hay điều khiển nhân vật di chuyển.

## Đăng giống link Gánh Bún Bò Huế (GitHub Pages)

1. Tạo tài khoản tại https://github.com nếu chưa có.
2. Tạo repository public, ví dụ `tiem-sach-meo-con`.
3. Tải lên **3 tệp** `index.html`, `style.css`, `script.js` (giữ nguyên tên và đặt ở thư mục gốc).
4. Vào **Settings → Pages → Build and deployment → Deploy from a branch**, chọn nhánh `main`, thư mục `/(root)` và Save.
5. Khi GitHub triển khai xong, game có địa chỉ dạng `https://ten-tai-khoan.github.io/tiem-sach-meo-con/`.

Không cần cài Godot, React, npm hoặc cơ sở dữ liệu để dùng bản này.

## Lưu ý kỹ thuật

- Kết quả phép tính được tính bằng **nghìn đồng**, sau đó giao diện hiển thị thành tiền đồng.
- Kho trừ hàng sau khi cả phép toán và thối tiền đều chính xác.
- Tiền quỹ ban đầu là 500.000đ **giả** và một số mặt hàng có sẵn để trẻ thử trò chơi.
- Google Fonts chỉ dùng khi có mạng; trình duyệt sẽ tự dùng phông dự phòng nếu mất mạng.
- Khi muốn phát triển sâu hơn: thêm khách di chuyển, khu quầy/kho với sơ đồ, trải nghiệm nhập hàng ở chợ, hiệu ứng âm thanh và tiến độ học theo từng bài học của sách.
