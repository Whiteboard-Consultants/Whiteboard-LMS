
'use client';

import Image from 'next/image';
import { Star, Clock, BarChart3, User, Award, BookOpen } from 'lucide-react';
import { Course, Review } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { enrollInFreeCourse } from '@/app/student/enrollment-actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';


interface CourseDetailsProps {
  course: Course;
  reviews: Review[];
}

export default function CourseDetails({ course, reviews }: CourseDetailsProps) {
    const { cart, addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isEnrolling, setIsEnrolling] = useState(false);

    const isCourseInCart = cart.some(item => item.id === course.id);

    const handleAddToCart = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        addToCart(course);
        toast({ title: "Added to cart", description: `"${course.title}" has been added to your cart.`});
    };

    const handleFreeEnroll = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        setIsEnrolling(true);
    const result = await enrollInFreeCourse(course.id, user.id);
        if (result.success) {
            toast({
                title: "Enrollment Successful!",
                description: "You can now find this course on your dashboard.",
            });
            router.push('/student/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'Enrollment Failed',
                description: result.error,
            });
        }
        setIsEnrolling(false);
    }

    return (
        <div className="bg-background">
            <section className="bg-slate-100 dark:bg-slate-dark py-12">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-foreground">{course.title}</h1>
                                                         <div
                                                             className="mt-4 text-lg text-muted-foreground"
                                                             dangerouslySetInnerHTML={{ __html: course.description }}
                                                         />
                            <div className="mt-4 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    <span className="font-bold">{course.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground">({course.ratingCount || 0} ratings)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-5 w-5" />
                                    <span>{course.studentCount} students</span>
                                </div>
                            </div>
                             <div className="mt-4 flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">Created by {course.instructor.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                       <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-1">
                            <Card>
                                <AccordionItem value="item-1" className="border-b-0">
                                    <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                        What you&apos;ll learn
                                    </AccordionTrigger>
                                                                        <AccordionContent>
                                        <div dangerouslySetInnerHTML={{ __html: course.programOutcome || '' }} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                             <Card>
                                 <AccordionItem value="item-2" className="border-b-0">
                                    <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                        Course Content
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div dangerouslySetInnerHTML={{ __html: course.courseStructure || '' }} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>

                            {course.faqs && (
                               <Card>
                                   <AccordionItem value="item-3" className="border-b-0">
                                        <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
                                            Frequently Asked Questions
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                           <div dangerouslySetInnerHTML={{ __html: course.faqs }} />
                                        </AccordionContent>
                                    </AccordionItem>
                               </Card>
                            )}
                       </Accordion>

                        <Card>
                            <CardHeader><CardTitle>Student Reviews</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <div key={review.id} className="flex gap-4">
                                            <Avatar>
                                                <AvatarImage src={review.userAvatarUrl} />
                                                <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{review.userName}</p>
                                                <div className="flex items-center gap-1">
                                                     {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-muted-foreground">{review.comment}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No reviews for this course yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                     <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader className="p-0">
                                {course.imageUrl && course.imageUrl.trim() !== '' ? (
                                    <Image src={course.imageUrl} alt={course.title} width={500} height={300} className="w-full h-auto rounded-t-lg" />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center rounded-t-lg">
                                        <div className="text-center text-muted-foreground">
                                            <BookOpen className="h-16 w-16 mx-auto mb-3 opacity-50" />
                                            <p className="text-lg font-medium">Course Image</p>
                                        </div>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <p className="text-3xl font-bold text-primary">
                                    {course.type === 'paid' && course.price ? `₹${course.price}` : 'Free'}
                                </p>
                                {course.type === 'paid' ? (
                                     isCourseInCart ? (
                                        <Button asChild className="w-full" variant="secondary">
                                           <Link href="/cart">Go to Cart</Link>
                                        </Button>
                                    ) : (
                                         <Button onClick={handleAddToCart} className="w-full">
                                            Add to Cart
                                        </Button>
                                    )
                                ) : (
                                    <Button onClick={handleFreeEnroll} disabled={isEnrolling} className="w-full">
                                        {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Enroll for Free
                                    </Button>
                                )}
                               
                                <div className="space-y-3 pt-4">
                                     <h4 className="font-semibold">This course includes:</h4>
                                     <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration || 'Self-paced'}</li>
                                        <li className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />{course.level || 'All Levels'}</li>
                                        <li className="flex items-center gap-2"><Award className="h-4 w-4" />Certificate of Completion</li>
                                     </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
