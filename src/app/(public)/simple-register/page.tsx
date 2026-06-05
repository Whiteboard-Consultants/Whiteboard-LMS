import type { Metadata } from 'next';
import { SimpleRegisterForm } from "@/components/simple-register-form";
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Register with Code | Whiteboard Consultants',
  description:
    'Activate your account using your registration code. Join Whiteboard Consultants for expert education guidance and test preparation.',
  path: '/simple-register',
});

export default function SimpleRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use your registration code to activate your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SimpleRegisterForm />
      </div>
    </div>
  );
}