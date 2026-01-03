'use client';

import { useEffect, useState } from 'react';
import { getUnreadNotifications } from '@/app/api/messages/message-actions';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await getUnreadNotifications();
        if (response.success) {
          setUnreadCount(response.data?.length || 0);
        }
      } catch (err) {
        console.error('Failed to load unread notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUnreadCount();

    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadUnreadCount, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || unreadCount === 0) {
    return (
      <button className="relative p-2 text-gray-600 hover:text-gray-900">
        <MessageSquare className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button className="relative p-2 text-gray-600 hover:text-gray-900">
      <MessageSquare className="w-5 h-5" />
      <Badge
        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        variant="destructive"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </button>
  );
}
