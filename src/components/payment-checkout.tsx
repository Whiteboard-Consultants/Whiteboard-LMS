'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { purchaseIndividualTest, purchaseSeriesPackage } from '@/app/instructor/series-purchase-actions';

interface PaymentCheckoutProps {
  testId?: string;
  seriesId?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  couponCode?: string;
  title: string;
  isTestPurchase?: boolean;
  purchaseType?: 'individual' | 'series';
  onSuccess?: () => void;
}

export function PaymentCheckout({
  testId,
  seriesId,
  price,
  originalPrice,
  discountPercentage = 0,
  couponCode,
  title,
  isTestPurchase = false,
  purchaseType = 'series',
  onSuccess
}: PaymentCheckoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { userData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRazorpayPayment = async () => {
    if (!userData?.id) {
      setError('User not authenticated');
      return;
    }

    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('💳 [PAYMENT] Creating order for:', { price, originalPrice, discountPercentage, couponCode, testId, seriesId, isTestPurchase, purchaseType });
      
      // Create order on backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price * 100, // Razorpay expects amount in paise
          currency: 'INR',
          description: `Purchase: ${title}`,
          testId,
          seriesId,
          userId: userData.id,
          isTestPurchase,
          purchaseType,
          originalPrice: originalPrice || price,
          discountPercentage,
          couponCode
        })
      });

      console.log('💳 [PAYMENT] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [PAYMENT] Order creation failed with status', response.status, ':', errorData);
        console.error('❌ [PAYMENT] Error details:', errorData.details);
        console.error('❌ [PAYMENT] Error stack:', errorData.stack);
        throw new Error(errorData.details || errorData.error || 'Failed to create payment order');
      }

      const orderData = await response.json();
      console.log('✅ [PAYMENT] Order created:', orderData.id);

      // Handle free purchases (100% discount)
      if (orderData.isFreeOrder && orderData.amount === 0) {
        console.log('🎉 [PAYMENT] Free order - skipping Razorpay');
        try {
          const verifyResponse = await fetch('/api/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isFreeOrder: true,
              userId: userData.id,
              testId,
              seriesId,
              isTestPurchase,
              couponCode,
              orderId: orderData.id,
              amount: 0
            })
          });

          if (!verifyResponse.ok) {
            throw new Error('Failed to process free purchase');
          }

          // Record enrollment for free purchase
          let result;
          if (isTestPurchase && testId) {
            result = await purchaseIndividualTest(userData.id, testId, 0, couponCode);
          } else if (seriesId) {
            result = await purchaseSeriesPackage(userData.id, seriesId, 0, couponCode);
          }

          if (result && result.success) {
            toast({
              title: 'Purchase Successful! 🎉',
              description: `Your free purchase of "${title}" is complete!`,
            });
            onSuccess?.();
          } else if (result) {
            throw new Error(result.error || 'Failed to record purchase');
          }

          setIsProcessing(false);
          return;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to process free purchase';
          setError(message);
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive'
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
        description: title,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: userData.id,
                testId,
                seriesId,
                isTestPurchase,
                couponCode
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            // Record enrollment after successful payment
            let result;
            if (isTestPurchase && testId) {
              result = await purchaseIndividualTest(userData.id, testId, price, couponCode);
            } else if (seriesId) {
              result = await purchaseSeriesPackage(userData.id, seriesId, price, couponCode);
            }

            if (result && result.success) {
              toast({
                title: 'Payment Successful!',
                description: `Your purchase of "${title}" is complete. You now have access.`,
              });
              onSuccess?.();
            } else if (result) {
              throw new Error(result.error || 'Failed to record purchase');
            } else {
              throw new Error('Failed to record purchase - no result');
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Payment verification failed';
            setError(message);
            toast({
              title: 'Error',
              description: message,
              variant: 'destructive'
            });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: userData.email || '',
          name: userData.name || ''
        },
        theme: {
          color: '#0f172a'
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setError(message);
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            ₹{price.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{title}</p>
        </div>

        <Button
          onClick={handleRazorpayPayment}
          disabled={isProcessing}
          className="w-full h-12 text-base"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            'Pay with Razorpay'
          )}
        </Button>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Secure payment powered by Razorpay. Your payment is encrypted and safe.
        </p>
      </CardContent>
    </Card>
  );
}
