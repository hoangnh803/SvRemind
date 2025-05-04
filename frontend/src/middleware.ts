import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Handle unauthenticated users
  if (!token && (pathname !== '/login' && pathname !== '/mobile-scan')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users from /login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Role-based redirection for /dashboard
  if (token && pathname === '/') {
    try {
      const secret = new TextEncoder().encode('8f673032-d0b0-4dcb-8e9c-c55c9b348167'); // Replace with your JWT secret
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin', request.url)); // Redirect to admin dashboard
      } else {
        return NextResponse.next(); 

      }
    } catch (error) {
      console.error('Error verifying JWT:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};