[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/hoangnh803/SvRemind)

# Hệ Thống Quét QR Code Sinh Viên

Hệ thống cho phép quét mã QR của sinh viên thông qua camera máy tính hoặc điện thoại di động, với khả năng gửi email tự động cho sinh viên.

## Tính Năng Chính

### 1. Quét QR Code
- **Quét bằng Camera Máy Tính**: Sử dụng webcam để quét mã QR trực tiếp
- **Quét bằng Điện Thoại**: Cho phép sử dụng camera điện thoại để quét mã QR
- **Nhập URL Thủ Công**: Hỗ trợ nhập URL barcode thủ công
- **Máy Quét QR**: Tương thích với các máy quét QR vật lý

### 2. Quản Lý Sinh Viên
- Tự động lấy thông tin sinh viên từ mã QR
- Hiển thị thông tin chi tiết: tên, MSSV, email, lớp, trường
- Lưu trữ thông tin sinh viên vào cơ sở dữ liệu
- Tránh trùng lặp sinh viên trong danh sách

### 3. Gửi Email
- Tạo và quản lý template email
- Gửi email hàng loạt cho nhiều sinh viên
- Hỗ trợ biến động trong nội dung email (tên, MSSV, email)
- Theo dõi trạng thái gửi email

## Công Nghệ Sử Dụng

### Frontend
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Socket.IO Client
- HTML5 QR Code Scanner
- TinyMCE Editor

### Backend
- Node.js
- Express.js
- Socket.IO
- TypeScript
- PostgreSQL

## Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js 16+
- PostgreSQL 12+
- npm hoặc yarn

### Cài Đặt

1. Clone repository:
```bash
git clone [repository-url]
```

2. Cài đặt dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Cấu hình môi trường:
- Tạo file `.env` trong thư mục frontend và backend
- Cấu hình các biến môi trường cần thiết

4. Chạy ứng dụng:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

## Cấu Trúc Dự Án

```
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (main)/
│   │   │   │   └── send-email/
│   │   │   └── mobile-scan/
│   │   ├── components/
│   │   └── services/
│   └── public/
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── services/
    └── config/
```

## API Endpoints

### Sinh Viên
- `GET /api/students/barcode/:url` - Lấy thông tin sinh viên từ barcode
- `POST /api/students/card` - Lưu thông tin thẻ sinh viên

### Email
- `GET /api/email-templates` - Lấy danh sách template
- `POST /api/email-templates` - Tạo template mới
- `PUT /api/email-templates/:id` - Cập nhật template
- `POST /api/email/send` - Gửi email

## WebSocket Events

### Client -> Server
- `sendStudentQrData` - Gửi dữ liệu QR từ điện thoại

### Server -> Client
- `dataForwarded` - Xác nhận dữ liệu đã được chuyển tiếp
- `dataForwardFailed` - Thông báo lỗi khi chuyển tiếp dữ liệu

## Đóng Góp

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy Phép

[MIT License](LICENSE)
