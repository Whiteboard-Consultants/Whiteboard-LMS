'use client';

import Image from 'next/image';
import { X, Loader2, ShoppingCart, ArrowLeft, Percent, BookOpen, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useTestCart, testCartItemKey } from '@/hooks/use-test-cart';
import type { TestCartItem } from '@/hooks/use-test-cart';
import { purchaseIndividualTest, purchaseSeriesPackage } from '@/app/instructor/series-purchase-actions';
import { useState } from 'react';
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
    metadata?: {
      order_id: string;
      payment_id: string;
    };
  };
}

export default function TestCartPage() {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const { testCart, removeFromTestCart, clearTestCart } = useTestCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = testCart.reduce((sum, item) => sum + (item.price || 0), 0);

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? subtotal * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setAppliedCoupon({ code: couponCode.toUpperCase(), ...data.discount });
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

  const handleRemoveItem = (item: TestCartItem) => {
    removeFromTestCart(item);
    toast({ title: 'Removed from cart' });
  };

  const handleCheckout = async () => {
    if (!user || !userData) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      router.push('/login');
      return;
    }

    if (testCart.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Your cart is empty.' });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * 100,
          currency: 'INR',
          description: `Test Purchase: ${testCart.map(t => t.title).join(', ')}`,
          testIds: testCart.filter(t => t.type === 'individual').map(t => t.id),
          seriesIds: testCart.filter(t => t.type === 'series').map(t => t.id),
          userId: user.id,
          isTestPurchase: true,
          couponCode: appliedCoupon?.code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();

      // Handle free purchases (100% discount applied)
      if (orderData.isFreeOrder && orderData.amount === 0) {
        console.log('🎉 [CHECKOUT] Free order - skipping payment, processing enrollments');
        
        try {
          // Process free enrollments directly
          const testIds = testCart.filter(t => t.type === 'individual').map(t => t.id);
          const seriesIds = testCart.filter(t => t.type === 'series').map(t => t.id);

          console.log('🛒 [CHECKOUT] Cart details:', { 
            cartLength: testCart.length,
            cartItems: testCart,
            testIds, 
            seriesIds 
          });

          // Verify free order with backend
          const verifyResponse = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isFreeOrder: true,
              userId: user.id,
              testIds,
              seriesIds,
              isTestPurchase: true,
              couponCode: appliedCoupon?.code,
              orderId: orderData.id,
              amount: 0
            })
          });

          if (!verifyResponse.ok) {
            const error = await verifyResponse.text();
            console.error(`🔴 Verify-payment failed with status ${verifyResponse.status}:`, error);
            // Don't abort, continue with direct enrollment creation
          } else {
            const verifyResult = await verifyResponse.json();
            console.log('✅ Verify-payment succeeded:', verifyResult);
          }

          // Create enrollment records for individual tests
          console.log(`📚 Creating enrollments for ${testIds.length} individual tests...`);
          for (const testId of testIds) {
            try {
              const result = await purchaseIndividualTest(
                user.id,
                testId,
                0, // free price
                appliedCoupon?.code || ''
              );
              console.log(`✅ Individual test ${testId} enrolled:`, result);
            } catch (enrollErr) {
              console.error(`❌ Failed to enroll in test ${testId}:`, enrollErr);
              throw enrollErr;
            }
          }

          // Create enrollment records for series
          console.log(`📚 Creating enrollments for ${seriesIds.length} series...`);
          for (const seriesId of seriesIds) {
            try {
              const result = await purchaseSeriesPackage(
                user.id,
                seriesId,
                0, // free price
                appliedCoupon?.code || ''
              );
              console.log(`✅ Series ${seriesId} enrolled:`, result);
            } catch (enrollErr) {
              console.error(`❌ Failed to enroll in series ${seriesId}:`, enrollErr);
              throw enrollErr;
            }
          }

          toast({
            title: 'Purchase Successful! 🎉',
            description: 'Your free purchase is complete. Redirecting to your tests...',
          });

          await clearTestCart();
          router.push('/student/tests');
          return;
        } catch (err) {
          toast({
            variant: 'destructive',
            title: 'Error Processing Free Purchase',
            description: err instanceof Error ? err.message : 'Failed to process purchase',
          });
          setIsProcessing(false);
          return;
        }
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: 'INR',
        name: 'WhitedgeLMS',
        description: `Test Purchase`,
        order_id: orderData.id,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                testIds: testCart.filter(t => t.type === 'individual').map(t => t.id),
                seriesIds: testCart.filter(t => t.type === 'series').map(t => t.id),
                isTestPurchase: true,
                couponCode: appliedCoupon?.code
              })
            });

            toast({
              title: 'Payment Successful!',
              description: 'Your test purchases are complete.',
            });

            await clearTestCart();
            router.push('/student/tests');
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: err instanceof Error ? err.message : 'Payment verification failed',
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: userData.email || '',
          name: userData.name || '',
        },
        theme: {
          color: '#0f172a',
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: response.error.description,
        });
        setIsProcessing(false);
      });

      rzp.open();
      setIsProcessing(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/student/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>

      <PageHeader title="Test Cart" />

      {testCart.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-bold tracking-tight">Your cart is empty.</h3>
            <p className="text-sm text-muted-foreground">
              Add tests or series to proceed to checkout.
            </p>
            <Button asChild className="mt-4">
              <Link href="/student/tests">Browse Tests</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Your Tests ({testCart.length})</h2>
            <div className="space-y-4">
              {testCart.map((item) => (
                <Card key={testCartItemKey(item)} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {item.image && (
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={`${item.title} - Online test`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.type === 'individual' ? 'Individual Test' : 'Series Package'}</p>
                        <p className="font-semibold flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {item.price}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item)}
                        className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coupon Code Input */}
                <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20 space-y-2">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Have a coupon?</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                      className="flex-grow text-sm"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !!appliedCoupon}
                      variant="outline"
                      size="sm"
                    >
                      {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                </div>

                <Separator />

                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {subtotal.toFixed(2)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-4 w-4" />
                      Discount ({appliedCoupon.code})
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="ml-1 text-destructive hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                    <span className="flex items-center">
                      - <IndianRupee className="h-4 w-4" />
                      {discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {total.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isProcessing || testCart.length === 0}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by Razorpay
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
