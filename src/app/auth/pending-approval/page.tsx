import type { Metadata } from 'next';
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { signOut } from "@/lib/supabase-auth";


export const metadata: Metadata = {
  alternates: {
    canonical: '/auth/pending-approval',
  },
};

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Your instructor application is being reviewed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Thank you for applying as an instructor! Your application is currently under review by our admin team.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  1
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Application Submitted</p>
                <p className="text-xs text-gray-500">Your application has been received</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600 text-sm font-medium">
                  2
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Under Review</p>
                <p className="text-xs text-gray-500">Admin team is reviewing your details</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-600 text-sm font-medium">
                  3
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Notification</p>
                <p className="text-xs text-gray-500">You'll receive an email when approved</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Expected Timeline:</strong> Most applications are reviewed within 24-48 hours.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-600 text-center mb-4">
              Check your email regularly for approval notification. You'll be able to log in once approved.
            </p>
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
