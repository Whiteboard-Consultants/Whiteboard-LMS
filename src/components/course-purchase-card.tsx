'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { IndianRupee, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/types';

interface CoursePurchaseCardProps {
  course: Course;
}

export function CoursePurchaseCard({ course }: CoursePurchaseCardProps) {
  const { cart, addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const isCourseInCart = cart.some(item => item.id === course.id);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      await addToCart(course);
      toast({
        title: 'Added to cart',
        description: `"${course.title}" has been added to your cart.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add course to cart. Please try again.',
      });
      console.error('Add to cart error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      await addToCart(course);
      // Redirect to cart for checkout
      router.push('/cart');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process your request. Please try again.',
      });
      console.error('Buy now error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-bold text-primary dark:text-white flex items-center gap-1">
            {course.type === 'paid' ? (
              <>
                <IndianRupee className="h-7 w-7" />
                {course.price}
              </>
            ) : (
              'Free'
            )}
          </div>
          {course.originalPrice && course.type === 'paid' && (
            <span className="text-lg text-muted-foreground line-through">
              <IndianRupee className="inline h-4 w-4" />
              {course.originalPrice}
            </span>
          )}
        </div>

        {course.type === 'free' ? (
          <Button size="lg" className="w-full mb-2" asChild>
            <Link href="/register">Enroll Now - Free</Link>
          </Button>
        ) : (
          <>
            {isCourseInCart ? (
              <Button
                size="lg"
                className="w-full mb-2"
                variant="secondary"
                asChild
              >
                <Link href="/cart">Go to Cart</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full mb-2"
                onClick={handleAddToCart}
                disabled={isProcessing || cartLoading}
              >
                {isProcessing || cartLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="mr-2 h-5 w-5" />
                )}
                Add to Cart
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleBuyNow}
              disabled={isProcessing || cartLoading}
            >
              {isProcessing || cartLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              Buy Now
            </Button>
          </>
        )}

        <div className="text-xs text-center text-muted-foreground mt-2">
          30-Day Money-Back Guarantee •{' '}
          <Link href="/refund-policy" className="hover:underline text-blue-600 dark:text-blue-400">
            See refund details
          </Link>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <h3 className="font-bold text-md">This course includes:</h3>
          {course.duration && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>📹</span> <span>{course.duration} on-demand video</span>
            </div>
          )}
          {course.hasPracticeTests && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>🏆</span> <span>Practice tests</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>📜</span> <span>Certificate of completion</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
