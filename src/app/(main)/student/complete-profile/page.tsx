
'use client';

import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CompleteProfilePage() {
    const { userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && userData?.isProfileComplete) {
            router.push('/student/dashboard');
        }
    }, [userData, loading, router]);
    
    return (
        <div>
            <PageHeader
                title="Complete Your Profile"
                description="Welcome to Whiteboard Consultants! Please provide some details to personalize your experience."
            />
            <div className="max-w-2xl mx-auto">
                <ProfileForm isMandatory={true} />
            </div>
        </div>
    );
}
