'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Enrollment, Course, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';


interface CertificateData {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  instructorName: string;
}

function CertificateSkeleton() {
  return (
    <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-background shadow-2xl aspect-[1.414/1] border-8 border-primary p-8 flex flex-col items-center justify-center text-center">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2 mt-4" />
        <Skeleton className="h-16 w-3/5 my-8" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-8 w-1/2 mt-2" />
        <div className="flex-grow"></div>
        <div className="w-full flex justify-between items-center mt-12">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

function StudentCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const { enrollmentId } = params as { enrollmentId: string };
      // 1. Fetch enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, enrolled_at, completed, user_id, course_id, student_name, course_title, instructor_name')
        .eq('id', enrollmentId)
        .single();
      if (enrollmentError || !enrollment) {
        setError('Certificate not found.');
        setLoading(false);
        return;
      }
      // 2. Fetch user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', enrollment.user_id)
        .single();
      // 3. Fetch course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('title')
        .eq('id', enrollment.course_id)
        .single();
      setData({
        studentName: user?.name || enrollment.student_name || 'Student',
        courseTitle: course?.title || enrollment.course_title || 'Course',
        completionDate: enrollment.completed ? new Date(enrollment.enrolled_at).toLocaleDateString() : '',
        instructorName: enrollment.instructor_name || '',
      });
      setLoading(false);
    }
    fetchData();
  }, [params]);

  if (loading) return <CertificateSkeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
        <p className="text-destructive mb-4">{error}</p>
        <Button asChild variant="outline">
          <Link href="/student/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  if (!data) return null;

  return (
    <>
      <style>{`
        @media print {
          body {
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #certificate-content, #certificate-content * {
            visibility: visible;
          }
          #certificate-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            border: none;
            transform: scale(1);
            background-color: transparent !important;
          }
        }
      `}</style>
      <div className="bg-muted min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl flex justify-between items-center mb-4 print:hidden">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print or Save as PDF
          </Button>
        </div>
        <div
          id="certificate-content"
          className="w-full max-w-5xl bg-white shadow-2xl aspect-[1.414/1] relative"
          style={{ backgroundImage: `url(/certificate.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="relative z-10 flex flex-col h-full text-center p-[5%]">
            <div className="flex-grow-[3] flex flex-col justify-end items-center text-slate-800 pb-16">
              <p className="text-lg md:text-xl lg:text-2xl mt-2">This certificate is proudly presented to</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold my-2 md:my-2 text-[#004B93]" style={{ fontFamily: "'Brush Script MT', cursive" }}>{data.studentName}</h1>
              <div className="w-48 h-0.5 md:h-1 bg-slate-400 mx-auto"></div>
            </div>
            <div className="flex-grow-[2] flex flex-col justify-start items-center pt-8 text-slate-700">
              <p className="text-base md:text-lg lg:text-xl">For successfully completing the course</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold my-2 md:my-2">{data.courseTitle}</h2>
              <p className="text-base md:text-lg lg:text-xl">on {data.completionDate}</p>
            </div>
            <div className="w-full flex justify-around items-end text-xs md:text-sm lg:text-base px-[15%] text-slate-600 mt-8">
              <div className="text-center">
                <p className="font-semibold border-b-2 border-slate-400 pb-1 px-4">{data.instructorName}</p>
                <p className="mt-1">Instructor</p>
              </div>
              <div className="text-center">
                <p className="font-semibold border-b-2 border-slate-400 pb-1 px-4">Management</p>
                <p className="mt-1">Whiteboard Consultants</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentCertificatePage;



