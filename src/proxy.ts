import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  APPLICATION_BASE_URL,
  APPLICATION_PATHS,
  getRequestHost,
  isApplicationHost,
  isLocalMainDevHost,
  localMainSiteUrl,
  MAIN_SITE_URL,
  MAIN_TO_APPLICATION_REDIRECTS,
  MAIN_SITE_APPLY_PATH,
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

function samePathRedirect(
  request: NextRequest,
  target: URL
): NextResponse | null {
  if (
    request.nextUrl.pathname === target.pathname &&
    request.nextUrl.hostname === target.hostname &&
    request.nextUrl.protocol === target.protocol
  ) {
    return NextResponse.next();
  }

  return null;
}

function redirect(
  request: NextRequest,
  target: URL,
  status: 301 | 302 | 307 | 308 = 301
) {
  const samePath = samePathRedirect(request, target);
  if (samePath) return samePath;
  return NextResponse.redirect(target, status);
}

function applicationOrigin(request: NextRequest): string {
  const host = getRequestHost(request);
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
  return redirect(request, url, permanent ? 301 : 302);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (shouldSkipProxy(pathname)) {
    return NextResponse.next();
  }

  const host = getRequestHost(request);
  const onApplicationHost = isApplicationHost(host);
  const onLocalMainDev =
    process.env.NODE_ENV === 'development' && isLocalMainDevHost(host);

  if (onApplicationHost) {
    if (pathname === '/') {
      return redirect(request, new URL('/apply', request.url), 302);
    }

    if (APPLICATION_PATH_SET.has(pathname)) {
      return NextResponse.next();
    }

    const legacyPath = MAIN_TO_APPLICATION_REDIRECTS[pathname];
    if (legacyPath && legacyPath !== pathname) {
      return redirect(request, new URL(legacyPath, request.url), 301);
    }

    const mainSiteBase =
      process.env.NODE_ENV === 'development'
        ? localMainSiteUrl(host)
        : MAIN_SITE_URL;
    return redirect(request, new URL(pathname, mainSiteBase), 302);
  }

  if (onLocalMainDev) {
    const legacyPath = MAIN_TO_APPLICATION_REDIRECTS[pathname];
    if (legacyPath && legacyPath !== pathname) {
      return redirect(request, new URL(legacyPath, request.url), 307);
    }

    return NextResponse.next();
  }

  if (pathname === MAIN_SITE_APPLY_PATH) {
    return redirectToApplication(request, '/apply');
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
