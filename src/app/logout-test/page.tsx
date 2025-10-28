'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase-auth-clean';
import { useRouter } from 'next/navigation';

export default function LogoutTestPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    console.log('🔄 Testing clean logout...');
    try {
      const { error } = await signOut();
      if (error) {
        console.error('❌ Logout failed:', error);
      } else {
        console.log('✅ Logout successful, redirecting...');
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Logout Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">✅ Logged In</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {userData?.role || 'Unknown'}</p>
            <p><strong>Name:</strong> {userData?.name || 'Unknown'}</p>
          </div>
          
          <Button onClick={handleLogout} className="w-full">
            Test Clean Logout
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <h3 className="font-semibold text-gray-800">❌ Not Logged In</h3>
            <p>Please log in to test logout functionality.</p>
          </div>
          
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </div>
      )}
    </div>
  );
}