"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { signOut } from "@/lib/supabase-auth";

export default function AccountSuspendedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-red-600">Account Suspended</CardTitle>
          <CardDescription>
            Your account has been temporarily suspended
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              Your account has been suspended due to a violation of our terms of service or community guidelines.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-red-600">•</span>
                <span>Review our terms of service to understand what may have caused the suspension</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600">•</span>
                <span>Contact our support team to appeal the suspension</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Need Help?</strong> Email us at <a href="mailto:info@whiteboardconsultant.com" className="underline font-medium">info@whiteboardconsultant.com</a> to discuss your account status.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
