'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, StarHalf } from 'lucide-react';
import { Review } from '@/types';
import { toast } from 'sonner';
import { submitCourseReview, getCourseReviews, getUserCourseReview } from '@/app/student/actions';

interface CourseReviewsProps {
  courseId: string;
  userId?: string;
  isEnrolled?: boolean;
}

interface ReviewFormData {
  contentRating: number;
  instructorRating: number;
  comment: string;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 20 
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  readonly?: boolean; 
  size?: number; 
}) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleClick = (value: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(value);
  };

  const handleMouseEnter = (value: number) => {
    if (readonly) return;
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
        >
          <Star
            size={size}
            className={`${
              value <= displayRating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ 
  courseId, 
  userId, 
  onReviewSubmitted 
}: { 
  courseId: string; 
  userId: string; 
  onReviewSubmitted: () => void; 
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    contentRating: 0,
    instructorRating: 0,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.contentRating === 0 || formData.instructorRating === 0) {
      toast.error('Please provide both content and instructor ratings');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitCourseReview(
        courseId,
        userId,
        formData.contentRating,
        formData.instructorRating,
        formData.comment
      );

      if (result.success) {
        toast.success('Review submitted successfully!');
        setFormData({ contentRating: 0, instructorRating: 0, comment: '' });
        onReviewSubmitted();
      } else {
        toast.error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallRating = formData.contentRating && formData.instructorRating 
    ? Math.round((formData.contentRating + formData.instructorRating) / 2) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with this course to help other students
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Content Quality Rating
            </label>
            <StarRating
              rating={formData.contentRating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, contentRating: rating }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Instructor Rating
            </label>
            <StarRating
              rating={formData.instructorRating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, instructorRating: rating }))}
            />
          </div>

          {overallRating > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Overall Rating: {overallRating} stars
              </label>
              <StarRating rating={overallRating} readonly />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Review
            </label>
            <Textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your thoughts about the course content, instructor, and overall experience..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={review.userAvatarUrl} alt={review.userName} />
            <AvatarFallback>
              {review.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{review.userName}</h4>
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt.toString())}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Overall:</span>
                <StarRating rating={review.rating} readonly size={16} />
                <Badge variant="secondary">{review.rating}/5</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Content:</span>
                <StarRating rating={review.contentRating} readonly size={14} />
                <span className="text-gray-500">({review.contentRating}/5)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Instructor:</span>
                <StarRating rating={review.instructorRating} readonly size={14} />
                <span className="text-gray-500">({review.instructorRating}/5)</span>
              </div>
            </div>
            
            {review.comment && (
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function CourseReviews({ courseId, userId, isEnrolled }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const [reviewsData, userReviewData] = await Promise.all([
        getCourseReviews(courseId),
        userId ? getUserCourseReview(courseId, userId) : Promise.resolve(null)
      ]);
      
      setReviews(reviewsData);
      setUserReview(userReviewData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId, userId]);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  const calculateAverageRatings = () => {
    if (reviews.length === 0) return { overall: 0, content: 0, instructor: 0 };
    
    const overall = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const content = reviews.reduce((sum, review) => sum + review.contentRating, 0) / reviews.length;
    const instructor = reviews.reduce((sum, review) => sum + review.instructorRating, 0) / reviews.length;
    
    return {
      overall: Math.round(overall * 10) / 10,
      content: Math.round(content * 10) / 10,
      instructor: Math.round(instructor * 10) / 10
    };
  };

  const averages = calculateAverageRatings();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Reviews ({reviews.length})
            {reviews.length > 0 && (
              <div className="flex items-center space-x-2">
                <StarRating rating={Math.round(averages.overall)} readonly />
                <span className="text-lg font-semibold">{averages.overall}/5</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        {reviews.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{averages.overall}/5</div>
                <div className="text-sm text-gray-600">Overall</div>
                <StarRating rating={Math.round(averages.overall)} readonly size={16} />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{averages.content}/5</div>
                <div className="text-sm text-gray-600">Content Quality</div>
                <StarRating rating={Math.round(averages.content)} readonly size={16} />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{averages.instructor}/5</div>
                <div className="text-sm text-gray-600">Instructor</div>
                <StarRating rating={Math.round(averages.instructor)} readonly size={16} />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Review Form */}
      {isEnrolled && userId && !userReview && (
        <ReviewForm
          courseId={courseId}
          userId={userId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Review</h3>
          <ReviewCard review={userReview} />
        </div>
      )}

      {/* All Reviews */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {userReview ? 'Other Reviews' : 'Student Reviews'}
        </h3>
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            {reviews
              .filter(review => userReview ? review.id !== userReview.id : true)
              .map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseReviews;