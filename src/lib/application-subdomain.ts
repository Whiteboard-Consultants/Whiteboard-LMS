export const APPLICATION_HOST = 'application.whiteboardconsultant.com';

export const APPLICATION_BASE_URL = `https://${APPLICATION_HOST}`;

export const MAIN_SITE_URL = 'https://www.whiteboardconsultant.com';

/** Application subdomain paths (short URLs for lead-gen pages). */
export const APPLICATION_PATHS = [
  '/resume-mastery',
  '/campus-placement',
  '/online-mba',
  '/apply',
  '/uow',
] as const;

export type ApplicationPath = (typeof APPLICATION_PATHS)[number];

/** Old main-site paths that permanently redirect to the application subdomain. */
export const MAIN_TO_APPLICATION_REDIRECTS: Record<string, ApplicationPath> = {
  '/landing/resume-mastery': '/resume-mastery',
  '/landing/campus_placement': '/campus-placement',
  '/landing/online-mba': '/online-mba',
  '/apply': '/apply',
  '/admissions/uow-india/apply': '/uow',
};

export function applicationUrl(path: ApplicationPath): string {
  return `${APPLICATION_BASE_URL}${path}`;
}

export function isApplicationHost(host: string): boolean {
  const normalized = host.split(':')[0].toLowerCase();
  if (normalized === APPLICATION_HOST) return true;
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

/** @deprecated Use isLocalMainDevHost */
export function isLocalDevHost(host: string): boolean {
  return isLocalMainDevHost(host);
}

export function localMainSiteUrl(host: string): string {
  const port = host.includes(':') ? host.split(':')[1] : '3000';
  return `http://localhost:${port}`;
}
