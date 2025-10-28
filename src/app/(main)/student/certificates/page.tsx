
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Eye, Calendar, Download, ExternalLink } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getApprovedCertificates } from '@/app/student/certificate-actions';

interface CertificateData {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  certificate_status: string;
  certificate_approved_at?: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    image_url?: string;
    instructor_name?: string;
  };
}

export default function MyCertificatesPage() {
    const { user, loading: authLoading } = useAuth();
    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            setCertificates([]);
            return;
        }

        const fetchCertificates = async () => {
            try {
                const result = await getApprovedCertificates(user.id);
                if (result.success) {
                    setCertificates(result.data as CertificateData[]);
                } else {
                    toast({ variant: 'destructive', title: 'Error', description: result.error });
                }
            } catch (error) {
                console.error('Error fetching certificates:', error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load certificates.' });
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div>
                <PageHeader title="My Certificates" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <PageHeader
                title="My Certificates"
                description="View and download the certificates you have earned."
            />
            {certificates.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {certificates.map(cert => (
                        <Card key={cert.id} className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <CardTitle className="text-lg leading-tight">{cert.courses.title}</CardTitle>
                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                        <Award className="h-3 w-3 mr-1" />
                                        Certified
                                    </Badge>
                                </div>
                                {cert.courses.instructor_name && (
                                    <p className="text-sm text-muted-foreground">
                                        by {cert.courses.instructor_name}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            Completed: {new Date(cert.enrolled_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {cert.certificate_approved_at && (
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4" />
                                            <span>
                                                Certified: {new Date(cert.certificate_approved_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <div className="h-2 w-2 bg-white rounded-full"></div>
                                        </div>
                                        <span>{cert.progress}% Course Progress</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button asChild className="flex-1" size="sm">
                                        <Link href={`/student/certificate/${cert.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm" className="flex-1">
                                        <Link href={`/student/certificate/${cert.id}/download`}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
                    <Award className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No certificates yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Complete a course and request your certificate to see it here. 
                        Certificates will appear once approved by an administrator.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button asChild>
                            <Link href="/student/dashboard">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                My Learning
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/courses">
                                Browse Courses
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

      