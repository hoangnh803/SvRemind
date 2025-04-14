// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Lấy token từ cookie

  const { pathname } = request.nextUrl;

  // Nếu không có token và không phải trang login hoặc /mobile-scan, chuyển hướng về /login
  if (!token && (pathname !== '/login' && pathname !== '/mobile-scan')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu đã đăng nhập mà vào trang login, chuyển hướng về trang chính
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Áp dụng cho tất cả route trừ static files
};