export const APPLICATION_HOST = 'application.whiteboardconsultant.com';

export const APPLICATION_HOSTS = [
  APPLICATION_HOST,
  `www.${APPLICATION_HOST}`,
] as const;

export const APPLICATION_BASE_URL = `https://${APPLICATION_HOST}`;

export const MAIN_SITE_URL = 'https://www.whiteboardconsultant.com';

/** Apex host (no www). Prefer www as the single canonical host for SEO. */
export const MAIN_SITE_APEX_HOST = 'whiteboardconsultant.com';

/** Application subdomain paths (short URLs for lead-gen pages). */
export const APPLICATION_PATHS = [
  '/resume-mastery',
  '/campus-placement',
  '/online-mba',
  '/apply',
  '/uow',
  '/bges',
] as const;

export type ApplicationPath = (typeof APPLICATION_PATHS)[number];

/** Old main-site paths that permanently redirect to the application subdomain. */
export const MAIN_TO_APPLICATION_REDIRECTS: Record<string, ApplicationPath> = {
  '/landing/resume-mastery': '/resume-mastery',
  '/landing/campus_placement': '/campus-placement',
  '/landing/online-mba': '/online-mba',
  '/admissions/uow-india/apply': '/uow',
};

/** Main-site /apply redirects to the application subdomain (kept separate to avoid self-redirect loops). */
export const MAIN_SITE_APPLY_PATH = '/apply' as const;

export function applicationUrl(path: ApplicationPath): string {
  return `${APPLICATION_BASE_URL}${path}`;
}

export function getRequestHost(request: {
  headers: { get(name: string): string | null };
  nextUrl: { hostname: string };
}): string {
  const headerHost = request.headers.get('host');
  if (headerHost) return headerHost;
  return request.nextUrl.hostname;
}

export function isApplicationHost(host: string): boolean {
  const normalized = host.split(':')[0].toLowerCase();
  if (APPLICATION_HOSTS.includes(normalized as (typeof APPLICATION_HOSTS)[number])) {
    return true;
  }
  if (
    process.env.NODE_ENV === 'development' &&
    normalized === 'application.localhost'
  ) {
    return true;
  }
  return false;
}

export function isLocalMainDevHost(host: string): boolean {
  const normalized = host.split(':')[0].toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1';
}

/** True when the request is on the bare apex domain (not www). */
export function isApexMainHost(host: string): boolean {
  const normalized = host.split(':')[0].toLowerCase();
  return normalized === MAIN_SITE_APEX_HOST;
}

/** @deprecated Use isLocalMainDevHost */
export function isLocalDevHost(host: string): boolean {
  return isLocalMainDevHost(host);
}

export function localMainSiteUrl(host: string): string {
  const port = host.includes(':') ? host.split(':')[1] : '3000';
  return `http://localhost:${port}`;
}
