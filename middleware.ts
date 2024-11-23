import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCountryFromIP } from '@/lib/getCountryFromIP';
import { verifyAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const PUBLIC_FILES = /\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css|woff|woff2|ttf|eot)$/i;
const PUBLIC_PATHS = ['/blocked', '/api/blocked', '/_next', '/favicon.ico', '/api/auth'];

// Add WebSocket and dynamic routes that shouldn't be cached
const NO_CACHE_PATHS = [
  '/api/',
  '/admin',
  '/payment',
  '/blocked'
];

function shouldSkipCache(pathname: string): boolean {
  return NO_CACHE_PATHS.some(path => pathname.startsWith(path));
}

async function getPaymentStatus(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL is not defined');
      return false;
    }

    const url = new URL('/api/payment/config/public', baseUrl);
    const response = await fetch(url.toString(), {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    const data = await response.json();
    return data.isEnabled;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return false;
  }
}

async function getBlockedCountries(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_countries')
      .select('country_code');

    if (error) throw error;
    
    return data.map(country => country.country_code.toUpperCase());
  } catch (error) {
    console.error('Error fetching blocked countries:', error);
    return [];
  }
}

async function handlePaymentRoutes(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname === '/api/payment/config') {
    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }
  
  if (pathname === '/payment' || pathname.startsWith('/api/payment/')) {
    const isEnabled = await getPaymentStatus();
    
    if (!isEnabled && pathname !== '/api/payment/config/public') {
      return NextResponse.redirect(new URL('/payment-disabled', request.url));
    }
  }
  
  return NextResponse.next();
}

function getClientIP(request: NextRequest): string {
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = 
    request.headers.get('cf-connecting-ip') || 
    request.headers.get('x-real-ip') || 
    (forwardedFor ? forwardedFor.split(',')[0].trim() : null);

  return ip || '0.0.0.0';
}

async function handleAdminAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('token');
  const validAccessToken = process.env.ADMIN_ACCESS_TOKEN;

  if (pathname === '/api/auth/logout') {
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    if (!accessToken || accessToken !== validAccessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!accessToken || accessToken !== validAccessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const isAuthenticated = await verifyAuth(request);
    if (!isAuthenticated && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL(`/admin/login?token=${accessToken}`, request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

async function handleGeoBlocking(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || PUBLIC_FILES.test(pathname)) {
    return NextResponse.next();
  }

  const blockedCountries = await getBlockedCountries();

  if (!blockedCountries.length) {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  
  try {
    const countryCode = process.env.NODE_ENV === 'development' 
      ? (process.env.TEST_COUNTRY || 'MA')
      : await getCountryFromIP(clientIP);

    if (blockedCountries.includes(countryCode)) {
      const response = NextResponse.redirect(new URL('/blocked', request.url));
      response.headers.set('X-Country-Blocked', countryCode);
      response.headers.set('X-Client-IP', clientIP);
      return response;
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  
  // Set appropriate cache control headers based on the route
  if (!shouldSkipCache(pathname)) {
    // Enable bfcache for static pages
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    response.headers.delete('Set-Cookie'); // Remove any cookies that might prevent bfcache
  } else {
    // Disable caching for dynamic routes
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  if (pathname.startsWith('/admin')) {
    return handleAdminAuth(request);
  }

  const paymentResponse = await handlePaymentRoutes(request);
  if (paymentResponse.status !== 200) {
    return paymentResponse;
  }

  const geoResponse = await handleGeoBlocking(request);
  const finalResponse = geoResponse === NextResponse.next() ? response : geoResponse;

  // Ensure WebSocket connections are properly handled
  if (request.headers.get('upgrade') === 'websocket') {
    finalResponse.headers.delete('Cache-Control');
  }

  return finalResponse;
}

export const config = {
  matcher: ['/((?!api/health|_next/static|_next/image|favicon.ico).*)'],
};