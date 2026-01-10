'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'feedback_posted' | 'grade_available';
  title: string;
  message: string;
  related_attempt_id?: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        // Get current user
        const supabase = await import('@supabase/supabase-js').then(m =>
          m.createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/auth/sign-in');
          return;
        }

        setUserId(user.id);

        // Fetch notifications
        const { getStudentNotifications } = await import('@/app/(main)/instructor/grading/actions');
        const result = await getStudentNotifications(user.id);

        if (result.success) {
          setNotifications(result.data as Notification[]);
        }
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [router]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { markNotificationAsRead } = await import('@/app/(main)/instructor/grading/actions');
      await markNotificationAsRead(notificationId, userId!);

      // Update local state
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const handleViewAssessment = (attemptId?: string) => {
    if (attemptId) {
      router.push(`/student/quiz-results/${attemptId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-64 bg-slate-200 rounded"></div>
          <div className="h-32 w-full bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Notifications</h1>
          <p className="text-slate-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'No unread notifications'}
          </p>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications yet</h3>
              <p className="text-slate-600">
                You'll see feedback notifications here when instructors post feedback on your assessments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={notification.read ? 'opacity-75' : 'border-blue-300 bg-blue-50'}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {notification.type === 'feedback_posted' ? (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-slate-600 text-sm mb-3">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge className="bg-blue-600 hover:bg-blue-700">New</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>

                        {notification.related_attempt_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleMarkAsRead(notification.id);
                              handleViewAssessment(notification.related_attempt_id);
                            }}
                          >
                            View <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
