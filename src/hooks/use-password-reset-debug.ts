'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function usePasswordResetDebug() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    if (error) {
      console.error('🔴 PASSWORD RESET ERROR');
      console.error('Error:', error);
      console.error('Description:', errorDesc);
      console.error('Current URL:', window.location.href);
      console.error('URL Params:', {
        code: code ? `${code.substring(0, 20)}...` : 'none',
        error,
        errorDesc
      });
    } else if (code) {
      console.log('🟢 PASSWORD RESET CODE RECEIVED');
      console.log('Code:', `${code.substring(0, 20)}...`);
      console.log('Code length:', code.length);
      console.log('Current URL:', window.location.href);
    }
  }, [searchParams]);
}
