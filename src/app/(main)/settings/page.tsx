
'use client';

import { ChangePasswordForm } from "@/components/change-password-form";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
    const { userData } = useAuth();
    const isStudent = userData?.role === 'student';

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences."
      />
      <div className="max-w-2xl mx-auto space-y-8">
        {isStudent && (
            <>
                <ProfileForm />
                <Separator />
            </>
        )}
        <ChangePasswordForm />
      </div>
    </div>
  );
}
