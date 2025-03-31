import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Đăng nhập - Hệ thống nhắc hẹn SV',
  description: 'Trang đăng nhập ứng dụng HUST',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}