
'use client';
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to be determined

    // If a user is logged in but is not an admin, redirect.
    if (user && userData && userData.role !== 'admin') {
      router.push('/login'); 
    }
  }, [user, userData, loading, router]);
  
  // While loading, or if the user is not authorized, show a loading skeleton.
  if (loading || !user || (userData?.role !== 'admin')) {
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
