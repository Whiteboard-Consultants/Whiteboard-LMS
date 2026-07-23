import type { ManagerPermission, User, UserRole } from '@/types';

export type PermissionKey = Exclude<ManagerPermission, '*'>;

export const MANAGER_PERMISSION_CATALOG: {
  key: PermissionKey;
  label: string;
  href: string;
}[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin/dashboard' },
  { key: 'announcements', label: 'Announcements', href: '/admin/announcements' },
  { key: 'coupons', label: 'Coupons', href: '/admin/coupons' },
  { key: 'courses', label: 'Courses', href: '/admin/courses' },
  { key: 'programs', label: 'Programs', href: '/admin/programs' },
  { key: 'blog', label: 'Blog', href: '/admin/blog' },
  { key: 'commissions', label: 'Commissions', href: '/admin/commissions' },
  { key: 'tests', label: 'Tests', href: '/instructor/tests' },
  { key: 'enrollments', label: 'Enrollments', href: '/admin/enrollments' },
  { key: 'certificates', label: 'Certificates', href: '/admin/certificates' },
  { key: 'contact_forms', label: 'Contact Forms', href: '/admin/contact-submissions' },
  { key: 'riasec', label: 'RIASEC Leads', href: '/admin/riasec' },
  { key: 'reports', label: 'Reports', href: '/admin/reports' },
];

/** Route prefix → required permission (Users/system always admin-only). */
export const ROUTE_PERMISSION_MAP: { prefix: string; permission: PermissionKey | null }[] = [
  { prefix: '/admin/users', permission: null }, // admin only
  { prefix: '/admin/faqs', permission: null },
  { prefix: '/admin/performance', permission: null },
  { prefix: '/admin/manual-users', permission: null },
  { prefix: '/admin/dashboard', permission: 'dashboard' },
  { prefix: '/admin/announcements', permission: 'announcements' },
  { prefix: '/admin/coupons', permission: 'coupons' },
  { prefix: '/admin/courses', permission: 'courses' },
  { prefix: '/admin/programs', permission: 'programs' },
  { prefix: '/admin/blog', permission: 'blog' },
  { prefix: '/admin/commissions', permission: 'commissions' },
  { prefix: '/admin/enrollments', permission: 'enrollments' },
  { prefix: '/admin/certificates', permission: 'certificates' },
  { prefix: '/admin/contact-submissions', permission: 'contact_forms' },
  { prefix: '/admin/riasec', permission: 'riasec' },
  { prefix: '/admin/reports', permission: 'reports' },
  { prefix: '/admin/tests', permission: 'tests' },
  { prefix: '/instructor/tests', permission: 'tests' },
];

export function isAdminRole(role?: UserRole | string | null): boolean {
  return role === 'admin';
}

export function isManagerRole(role?: UserRole | string | null): boolean {
  return role === 'manager';
}

export function isAdminOrManager(role?: UserRole | string | null): boolean {
  return role === 'admin' || role === 'manager';
}

export function hasPermission(
  user: Pick<User, 'role' | 'permissions'> | null | undefined,
  permission: PermissionKey
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'manager') return false;

  const perms = user.permissions || [];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function getPermissionForPath(pathname: string): PermissionKey | null | undefined {
  const match = ROUTE_PERMISSION_MAP.find((entry) => pathname.startsWith(entry.prefix));
  if (!match) return undefined;
  return match.permission;
}

/** Returns true if user may access this admin path. */
export function canAccessPath(
  user: Pick<User, 'role' | 'permissions'> | null | undefined,
  pathname: string
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'manager') return false;

  const required = getPermissionForPath(pathname);
  // Unknown admin path or explicitly admin-only (null)
  if (required === undefined || required === null) return false;
  return hasPermission(user, required);
}

export function assertCan(
  user: Pick<User, 'role' | 'permissions'> | null | undefined,
  permission: PermissionKey
): void {
  if (!hasPermission(user, permission)) {
    throw new Error('Permission denied');
  }
}

export function normalizeManagerPermissions(
  mode: 'all' | 'custom',
  selected: PermissionKey[]
): ManagerPermission[] {
  if (mode === 'all') return ['*'];
  return selected;
}
