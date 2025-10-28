
'use client';

import Image from 'next/image';
import { X, Loader2, ShoppingCart, ArrowLeft, Percent, BookOpen } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { enrollInPaidCourses, enrollInFreeCourse } from '../student/enrollment-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayErrorResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id: string;
            payment_id?: string;
        };
    };
}


export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cart.reduce((sum, course) => sum + (course.price || 0), 0);

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
        ? subtotal * (appliedCoupon.value / 100)
        : appliedCoupon.value
    : 0;
  
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
      if (!couponCode) return;
      setIsApplyingCoupon(true);
      setCouponError("");
      try {
          const res = await fetch('/api/validate-coupon', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ couponCode }),
          });
          const data = await res.json();
          if (res.ok) {
              setAppliedCoupon({ code: couponCode, ...data.discount });
              toast({ title: 'Success', description: 'Coupon applied successfully!' });
          } else {
              setCouponError(data.error || 'Failed to apply coupon.');
              setAppliedCoupon(null);
          }
      } catch {
          setCouponError('An unexpected error occurred.');
          setAppliedCoupon(null);
      } finally {
          setIsApplyingCoupon(false);
      }
  };

  const handleFreeEnrollment = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    console.log('🛒 Starting free enrollment process for courses:', cart.map(c => c.id));
    
    let successfulEnrollments = 0;
    let errors: string[] = [];
    
    for (const course of cart) {
      console.log('🔄 Enrolling in course:', course.title, course.id);
      
      const result = await enrollInFreeCourse(course.id, user.id, appliedCoupon?.code);
      
      if (result.success) {
        console.log('✅ Successfully enrolled in:', course.title);
        successfulEnrollments++;
      } else {
        console.error('❌ Failed to enroll in:', course.title, result.error);
        errors.push(`${course.title}: ${result.error}`);
      }
    }
    
    if (successfulEnrollments > 0 && errors.length === 0) {
      toast({
        title: "Enrollment Successful!",
        description: `Successfully enrolled in ${successfulEnrollments} course${successfulEnrollments > 1 ? 's' : ''}. Check your dashboard.`,
      });
      clearCart();
      router.push('/student/dashboard');
    } else if (successfulEnrollments > 0 && errors.length > 0) {
      toast({
        title: "Partial Success",
        description: `${successfulEnrollments} enrollments succeeded, ${errors.length} failed. Check console for details.`,
      });
      console.error('Enrollment errors:', errors);
    } else {
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: errors.length > 0 ? errors[0] : "All enrollments failed. Please try again.",
      });
      console.error('All enrollment errors:', errors);
    }
    
    setIsProcessing(false);
  }

  const handleCheckout = async () => {
    if (!user || !userData) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to checkout.' });
      router.push('/login');
      return;
    }
    
    if (total <= 0) {
        await handleFreeEnrollment();
        return;
    }

    setIsProcessing(true);

    try {
      const courseIds = cart.map(item => item.id);
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds, finalAmount: total }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order.');
      }

      const { order, keyId } = data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Whiteboard Consultants",
        description: "Course Purchase",
        order_id: order.id,
        handler: async function (response: RazorpaySuccessResponse) {
           const courseItems = cart.map(item => ({
             courseId: item.id,
             title: item.title,
             price: item.price,
             instructorId: item.instructor?.id || ''
           }));
           
           const result = await enrollInPaidCourses(
                courseItems,
                user.id,
                response.razorpay_payment_id,
                response.razorpay_order_id,
                appliedCoupon?.code
            );
            if (result.success) {
                toast({ title: 'Payment Successful', description: 'Your new courses will appear on your dashboard after admin approval.' });
                clearCart();
                router.push('/student/dashboard');
            } else {
                 toast({ variant: 'destructive', title: 'Enrollment Failed', description: result.error });
            }
        },
        prefill: {
            name: userData.name,
            email: userData.email,
            contact: userData.phone || '',
        },
        notes: {
            userId: user.id,
            courseIds: JSON.stringify(courseIds),
            coupon: appliedCoupon?.code || '',
        },
        theme: {
            color: "#004B93",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
        toast({
            variant: 'destructive',
            title: 'Payment Failed',
            description: response.error.description,
        });
      });
      rzp.open();

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({
            variant: 'destructive',
            title: 'Checkout Error',
            description: errorMessage,
        });
    } finally {
      setIsProcessing(false);
    }
  };

  const checkoutButtonText = total <= 0 ? "Enroll for Free" : "Proceed to Checkout";

  return (
    <div className="container mx-auto py-8">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/courses">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Link>
            </Button>
        </div>
      <PageHeader title="Shopping Cart" />

      {cart.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
            <div className="flex flex-col items-center gap-2">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                <h3 className="text-xl font-bold tracking-tight">Your cart is empty.</h3>
                <p className="text-sm text-muted-foreground">
                    Looks like you haven&apos;t added anything to your cart yet.
                </p>
                <Button asChild className="mt-4">
                    <Link href="/courses">Browse Courses</Link>
                </Button>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Your Items ({cart.length})</h2>
            <div className="space-y-4">
              {cart.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="flex items-start">
                    <div className="relative h-24 w-40 flex-shrink-0">
                      {course.image && course.image.trim() !== '' ? (
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor?.name ? `By ${course.instructor.name}` : 'Course in your cart'}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                         <p className="font-semibold text-lg flex items-center">
                           <IndianRupee className="h-4 w-4" />{course.price?.toFixed(2)}
                         </p>
                         <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(course.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
             <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="Coupon Code" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="flex-grow"
                                disabled={!!appliedCoupon}
                            />
                            <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !!appliedCoupon}>
                               {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                            </Button>
                        </div>
                        {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                    </div>

                    <Separator />
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className='flex items-center'><IndianRupee className="h-4 w-4" />{subtotal.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center gap-1">
                            <Percent className="h-4 w-4" />
                            Discount ({appliedCoupon.code})
                            <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); setCouponError(""); }} className="ml-1 text-destructive">
                                <X className="h-3 w-3" />
                            </button>
                          </span>
                          <span className='flex items-center'>- <IndianRupee className="h-4 w-4" />{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className='flex items-center'><IndianRupee className="h-5 w-5" />{total.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isProcessing}
                    >
                      {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {checkoutButtonText}
                    </Button>
                  </CardContent>
                </Card>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
