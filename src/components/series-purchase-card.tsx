'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useTestCart } from '@/hooks/use-test-cart';
import { IndianRupee, Check, TrendingUp, Loader2, ShoppingCart, Percent, X } from 'lucide-react';
import { PaymentCheckout } from './payment-checkout';

interface SeriesPurchaseCardProps {
  series: {
    id: string;
    title: string;
    price: number;
    discountPercentage?: number;
    testCount?: number;
    description?: string;
    individualTestPrice?: number; // Individual test price
  };
  onPurchaseSuccess?: () => void;
  isTestPurchase?: boolean;
  testId?: string;
}

export function SeriesPurchaseCard({
  series,
  onPurchaseSuccess,
  isTestPurchase = false,
  testId
}: SeriesPurchaseCardProps) {
  const { toast } = useToast();
  const { userData } = useAuth();
  const { testCart, addToTestCart } = useTestCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'individual' | 'series'>('individual');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const discountPercentage = series.discountPercentage || 0;
  const testCount = series.testCount || 1;
  const individualPrice = series.individualTestPrice || 0;
  const seriesPrice = series.price || 0;
  
  // Calculate discounted series price
  const discountedSeriesPrice = seriesPrice * (1 - discountPercentage / 100);
  
  // Calculate base price based on purchase type
  const basePrice = purchaseType === 'individual' ? individualPrice : discountedSeriesPrice;
  
  // Calculate coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? basePrice * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;
  
  // Final price after coupon
  const finalPrice = Math.max(0, basePrice - couponDiscount);
  
  // For non-test purchases (courses), default to series
  useEffect(() => {
    if (!isTestPurchase) {
      setPurchaseType('series');
    }
  }, [isTestPurchase]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.toUpperCase() }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAppliedCoupon({ code: couponCode.toUpperCase(), ...data.discount });
        toast({ title: 'Success', description: 'Coupon applied successfully!' });
      } else {
        setCouponError(data.error || 'Failed to apply coupon.');
      }
    } catch (error) {
      setCouponError('An unexpected error occurred.');
      console.error('Coupon validation error:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const buildCartItem = () => {
    if (purchaseType === 'series') {
      return {
        id: series.id,
        title: series.title,
        price: discountedSeriesPrice,
        type: 'series' as const,
      };
    }
    return {
      id: (isTestPurchase ? testId : series.id) as string,
      title: series.title,
      price: individualPrice,
      type: 'individual' as const,
      seriesId: isTestPurchase ? series.id : undefined,
    };
  };

  /** Guests: stash selection, then login → test cart (Razorpay checkout). */
  const redirectGuestToLoginWithCart = () => {
    try {
      localStorage.setItem('pendingCartItem', JSON.stringify(buildCartItem()));
      localStorage.setItem('pendingCartAction', 'add');
    } catch (error) {
      console.error('Failed to save pending cart item:', error);
    }
    router.push(`/login?returnUrl=${encodeURIComponent('/student/test-cart')}`);
  };

  const handleAddToCart = async () => {
    if (!userData?.id) {
      redirectGuestToLoginWithCart();
      return;
    }

    try {
      await addToTestCart(buildCartItem());
      toast({
        title: 'Added to Cart',
        description: `${series.title} added to your test cart.`,
      });
      router.push('/student/test-cart');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      console.error('Add to cart error:', message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    }
  };

  const handlePurchase = async () => {
    if (!userData?.id) {
      // Same path as Add to Cart: item lands in cart after login for Razorpay checkout
      redirectGuestToLoginWithCart();
      return;
    }

    setShowPayment(true);
  };

  return (
    <>
      {showPayment ? (
        <PaymentCheckout
          testId={isTestPurchase ? testId : undefined}
          seriesId={!isTestPurchase ? series.id : undefined}
          price={finalPrice}
          originalPrice={purchaseType === 'series' ? seriesPrice : undefined}
          discountPercentage={purchaseType === 'series' ? discountPercentage : 0}
          couponCode={appliedCoupon?.code}
          title={series.title}
          isTestPurchase={isTestPurchase}
          purchaseType={purchaseType}
          onSuccess={onPurchaseSuccess}
        />
      ) : (
        <Card className="border-2 border-green-200 dark:border-green-800/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl text-green-900 dark:text-green-100">
              {isTestPurchase ? 'Unlock Test Access' : 'Get Full Series Access'}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300/80">
              {series.title}
            </CardDescription>
          </div>
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1">
              Save {discountPercentage}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Purchase Type Selection - Only for Tests with both price options */}
        {isTestPurchase && individualPrice > 0 && seriesPrice > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Individual Test Option */}
            <button
              onClick={() => setPurchaseType('individual')}
              className={`p-3 rounded-lg border-2 transition-all ${
                purchaseType === 'individual'
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Individual Test</p>
              <div className="flex items-baseline gap-1 mt-1">
                <IndianRupee className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">{individualPrice}</p>
              </div>
            </button>
            
            {/* Series Package Option */}
            <button
              onClick={() => setPurchaseType('series')}
              className={`p-3 rounded-lg border-2 transition-all relative ${
                purchaseType === 'series'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {discountPercentage > 0 && (
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Save {discountPercentage}%
                </div>
              )}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Full Series</p>
              <div className="flex items-baseline gap-1 mt-1">
                <IndianRupee className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">{seriesPrice}</p>
              </div>
            </button>
          </div>
        )}

        {/* Coupon Code Input */}
        <div className="border border-amber-200 dark:border-amber-800 rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">Have a coupon code?</p>
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={!!appliedCoupon}
              className="flex-grow text-sm"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !!appliedCoupon || !couponCode.trim()}
              variant="outline"
              size="sm"
            >
              {isApplyingCoupon ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
          {couponError && <p className="text-xs text-destructive">{couponError}</p>}
          {appliedCoupon && (
            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300 bg-green-100/50 dark:bg-green-900/30 rounded px-2 py-1.5">
              <Percent className="h-3 w-3" />
              <span className="font-semibold">{appliedCoupon.code}</span>
              <span>applied</span>
              <button
                onClick={handleRemoveCoupon}
                className="ml-auto text-destructive hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Price Display */}
        <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-4 border border-green-300 dark:border-green-700">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
            {purchaseType === 'individual' ? 'Individual Test Price' : 'Series Package Price'}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            {purchaseType === 'series' && discountPercentage > 0 && (
              <div className="flex items-baseline gap-1">
                <IndianRupee className="w-4 h-4 text-slate-400 line-through" />
                <p className="text-lg font-semibold text-slate-400 line-through">
                  {seriesPrice}
                </p>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <IndianRupee className="w-5 h-5 text-green-700 dark:text-green-300" />
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {finalPrice}
              </p>
            </div>
          </div>
          
          {/* Show savings info for series */}
          {purchaseType === 'series' && discountPercentage > 0 && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-2 font-medium">
              ✨ Series discount: ₹{(seriesPrice - discountedSeriesPrice).toFixed(0)} ({discountPercentage}% off)
            </p>
          )}
          
          {/* Show coupon discount */}
          {appliedCoupon && couponDiscount > 0 && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-2 font-medium">
              🎉 Coupon discount: ₹{couponDiscount.toFixed(0)} ({appliedCoupon.type === 'percentage' ? appliedCoupon.value + '%' : '₹' + appliedCoupon.value})
            </p>
          )}
          
          {/* Show savings for individual when series has discount */}
          {purchaseType === 'individual' && discountPercentage > 0 && seriesPrice > 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 font-medium">
              💡 Save ₹{(seriesPrice - discountedSeriesPrice).toFixed(0)} by purchasing the full series (₹{discountedSeriesPrice.toFixed(0)})
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">What you get:</p>
          <ul className="space-y-2">
            {purchaseType === 'individual' ? (
              <>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Instant access to take this test
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Unlimited attempts
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Lifetime access (no expiration)
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Detailed performance analytics
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Instant access to all tests in this series
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Lifetime access (no expiration)
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Save {discountPercentage}% vs buying individual tests
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  Detailed performance analytics
                </li>
              </>
            )}
          </ul>
        </div>

        {/* CTA Button - Purchase or Add to Cart */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handlePurchase}
            disabled={isLoading}
            className="sm:flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-base gap-2 whitespace-normal"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                {purchaseType === 'individual' 
                  ? 'Buy Individual Test' 
                  : (isTestPurchase ? 'Buy Full Series' : 'Buy Series Package')}
              </>
            )}
          </Button>
          
          {/* Add to Cart option for tests */}
          {isTestPurchase && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 gap-2 whitespace-normal"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
          {userData?.id
            ? 'Complete payment to unlock access instantly'
            : 'Sign in or create an account — this item will be waiting in your cart to checkout'}
        </p>
      </CardContent>
    </Card>
      )}
    </>
  );
}
