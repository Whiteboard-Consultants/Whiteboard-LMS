import { ResetPasswordForm } from "@/components/reset-password-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password | Whiteboard Consultants",
  description: "Reset your password to regain access to your account",
};

function ResetPasswordContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a new password to regain access to your account
          </p>
        </div>

        <ResetPasswordForm />

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in instead
          </a>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
