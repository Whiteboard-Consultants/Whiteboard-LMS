
"use client";

import Image from "next/image";
import { Star, Award, PlayCircle, IndianRupee, BookOpen, Clock, BarChart3, User, NotebookPen, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GradientProgress } from "./ui/gradient-progress";
import { RatingForm } from "./rating-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { requestCertificate } from "@/app/student/certificate-actions";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

interface CourseCardProps {
  course: Course;
  context?: 'dashboard' | 'listing';
}

export function CourseCard({ course, context = 'listing' }: CourseCardProps) {
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isInCart = cart.some(item => item.id === course.id);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(course);
      toast({ title: "Success", description: "Course added to cart." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to add course to cart." });
    }
    setIsAddingToCart(false);
  };

  const handleRequestCertificate = async () => {
    if (!course.enrollmentId) return;
    setIsRequesting(true);
    const result = await requestCertificate(course.enrollmentId);
    if (result.success) {
      toast({ title: "Success", description: "Your certificate request has been submitted." });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error });
    }
    setIsRequesting(false);
  };

  const certificateButton = () => {
    if (!course.enrollment) return null;

    const certificateStatus = course.enrollment.certificateStatus;
    
    switch (certificateStatus) {
      case 'requested':
        return <Button disabled className="w-full">Request Pending</Button>;
      case 'approved':
         return (
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href={`/student/certificate/${course.enrollmentId}`}>
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                </Link>
            </Button>
        );
      case 'eligible':
        return (
          <Button onClick={handleRequestCertificate} disabled={isRequesting} variant="secondary" className="w-full">
            {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
            Request Certificate
          </Button>
        );
      // 'not_eligible' or undefined will not show a button
      default:
        return (
             <Button onClick={handleRequestCertificate} disabled={isRequesting} variant="secondary" className="w-full">
                {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                Request Certificate
            </Button>
        );
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card text-card-foreground">
      <CardHeader className="p-0">
        <div className="relative h-[180px] w-full">
          {course.imageUrl && course.imageUrl.trim() !== '' ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="course thumbnail"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Course Image</p>
              </div>
            </div>
          )}
           {course.enrollment?.completed && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-white p-4">
                    <Award className="h-12 w-12 text-amber-400" />
                    <span className="text-xl font-bold mt-2">Completed</span>
                </div>
            </div>
           )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <CardTitle className="mb-2 text-xl font-headline">{course.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-2">
          <User className="h-4 w-4" /> By {course.instructor.name}
        </CardDescription>
        <div className="mt-4 flex items-center gap-2">
          <span className="font-bold text-amber-500">{course.rating?.toFixed(1)}</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  (course.rating ?? 0) > i
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300 dark:text-gray-600"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({course.studentCount})</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {course.duration && (
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                </div>
            )}
            {course.level && (
                <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4" />
                    <span>{course.level}</span>
                </div>
            )}
        </div>
        {context === 'dashboard' && course.progress !== undefined && (
            <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">
                    {course.completedLessons || 0} / {course.lessonCount || 0} Lessons
                </p>
                <GradientProgress value={course.progress || 0} />
            </div>
        )}
      </CardContent>
      
      <CardFooter className="px-6 pb-4 mt-auto flex flex-col gap-2">
         {context === 'dashboard' && course.enrollment ? (
            <div className="w-full space-y-2">
                {course.enrollment.completed ? (
                  <div className="flex gap-2 w-full">
                    <Button asChild className="flex-1">
                        <Link href={`/student/course/${course.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Revisit
                        </Link>
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="flex-1">
                                <Star className="mr-2 h-4 w-4" />
                                Rate
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rate: {course.title}</DialogTitle>
                            </DialogHeader>
                            <RatingForm courseId={course.id} instructorId={course.instructor.id} />
                        </DialogContent>
                    </Dialog>
                  </div>
                ) : !course.enrollment.completed && course.enrollment.progress >= 99 && course.finalAssessmentId ? (
                     <Button asChild className="w-full">
                        <Link href={`/student/test/${course.finalAssessmentId}`}>
                            <NotebookPen className="mr-2 h-4 w-4" />
                            Start Final Test
                        </Link>
                    </Button>
                ) : (
                     <Button asChild className="w-full">
                        <Link href={`/student/course/${course.id}`}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Continue Learning
                        </Link>
                    </Button>
                )}
                {certificateButton()}
            </div>
        ) : (
            <div className="flex items-center justify-between w-full">
                <div className="text-lg font-bold text-primary dark:text-white flex items-center gap-1">
                    {course.type === 'paid' ? (
                        <>
                        <IndianRupee className="h-5 w-5" />
                        {course.price}
                        </>
                    ) : (
                        'Free'
                    )}
                </div>
                {user && !course.enrollment ? (
                    isInCart ? (
                        <Button asChild size="sm" variant="secondary">
                            <Link href="/cart">
                                View Cart
                            </Link>
                        </Button>
                    ) : (
                        <Button size="sm" onClick={handleAddToCart} disabled={isAddingToCart}>
                            {isAddingToCart ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4"/>}
                            Add to Cart
                        </Button>
                    )
                ) : (
                    <Button asChild size="sm">
                        <Link href={`/courses/${course.id}`}>
                            View Course
                        </Link>
                    </Button>
                )}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
