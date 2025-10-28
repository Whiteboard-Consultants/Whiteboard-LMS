
import { PageHeader } from "@/components/page-header";
import { UowApplyForm } from "@/components/uow-apply-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function UowApplyPage() {
    return (
        <div className="container py-12 md:py-16">
            <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admissions/uow-india">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to UOW Page
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col items-center text-center">
                <PageHeader 
                    title="Apply to University of Wollongong, India"
                    description="Complete the form below to begin your application journey with our expert guidance."
                />
            </div>
            <UowApplyForm />
        </div>
    );
}
