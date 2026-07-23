
'use client';
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { canAccessPath, hasPermission, isAdminOrManager, MANAGER_PERMISSION_CATALOG } from "@/lib/permissions";
import type { User } from "@/types";

function firstAllowedAdminPath(user: User): string {
  if (hasPermission(user, 'dashboard')) return '/admin/dashboard';
  for (const item of MANAGER_PERMISSION_CATALOG) {
    if (hasPermission(user, item.key)) return item.href;
  }
  return '/login';
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (user && userData && !isAdminOrManager(userData.role)) {
      router.push('/login');
      return;
    }

    if (user && userData && userData.role === 'manager') {
      if (!canAccessPath(userData, pathname)) {
        router.replace(firstAllowedAdminPath(userData));
      }
    }
  }, [user, userData, loading, router, pathname]);
  
  const authorized =
    !!user &&
    !!userData &&
    isAdminOrManager(userData.role) &&
    (userData.role === 'admin' || canAccessPath(userData, pathname));

  if (loading || !authorized) {
    return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  return <>{children}</>;
}
