import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  APPLICATION_BASE_URL,
  APPLICATION_PATHS,
  isApplicationHost,
  isLocalMainDevHost,
  localMainSiteUrl,
  MAIN_SITE_URL,
  MAIN_TO_APPLICATION_REDIRECTS,
  type ApplicationPath,
} from '@/lib/application-subdomain';

const APPLICATION_PATH_SET = new Set<string>(APPLICATION_PATHS);

function shouldSkipProxy(pathname: string): boolean {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function applicationOrigin(request: NextRequest): string {
  const host = request.headers.get('host') ?? '';
  if (isApplicationHost(host)) {
    return request.nextUrl.origin;
  }
  return APPLICATION_BASE_URL;
}

function redirectToApplication(
  request: NextRequest,
  path: ApplicationPath,
  permanent = true
) {
  const url = new URL(path, applicationOrigin(request));
  return NextResponse.redirect(url, permanent ? 301 : 302);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldSkipProxy(pathname)) {
    return NextResponse.next();
  }

  const host = request.headers.get('host') ?? '';
  const onApplicationHost = isApplicationHost(host);
  const onLocalMainDev =
    process.env.NODE_ENV === 'development' && isLocalMainDevHost(host);

  if (onApplicationHost) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/apply', request.url), 302);
    }

    const legacyPath = MAIN_TO_APPLICATION_REDIRECTS[pathname];
    if (legacyPath) {
      return NextResponse.redirect(new URL(legacyPath, request.url), 301);
    }

    if (!APPLICATION_PATH_SET.has(pathname)) {
      const mainSiteBase =
        process.env.NODE_ENV === 'development'
          ? localMainSiteUrl(host)
          : MAIN_SITE_URL;
      return NextResponse.redirect(new URL(pathname, mainSiteBase), 302);
    }

    return NextResponse.next();
  }

  if (onLocalMainDev) {
    const legacyPath = MAIN_TO_APPLICATION_REDIRECTS[pathname];
    if (legacyPath) {
      return NextResponse.redirect(new URL(legacyPath, request.url), 307);
    }

    return NextResponse.next();
  }

  const applicationPath = MAIN_TO_APPLICATION_REDIRECTS[pathname];
  if (applicationPath) {
    return redirectToApplication(request, applicationPath);
  }

  if (APPLICATION_PATH_SET.has(pathname)) {
    return redirectToApplication(request, pathname as ApplicationPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
