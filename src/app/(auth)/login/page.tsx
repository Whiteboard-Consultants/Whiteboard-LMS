'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { LoginForm } from "@/components/login-form";

function LoginFormWrapper() {
  const router = useRouter();
  return <LoginForm router={router} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormWrapper />
    </Suspense>
  );
}
