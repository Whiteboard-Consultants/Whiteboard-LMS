
'use client';

import { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Notification } from '@/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export function StudentNotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data: notificationsData, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('receiver_id', user.id)  // Fixed: use snake_case column name
          .eq('is_read', false)         // Fixed: use snake_case column name
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching notifications:", error);
          console.error("Error details:", JSON.stringify(error, null, 2));
          
          // Check if this is a "table doesn't exist" error
          if (error.message?.includes('does not exist') || 
              error.code === 'PGRST205' || 
              error.message?.includes('schema cache')) {
            console.log("Notifications table doesn't exist yet. This is normal for new installations.");
            // Set empty array instead of continuing to show error
            setNotifications([]);
          } else {
            // For other errors, also set empty array to prevent UI issues
            console.error("Unexpected error fetching notifications, setting empty state");
            setNotifications([]);
          }
        } else {
          // Map database fields to component format
          const mappedNotifications = (notificationsData || []).map(notification => ({
            id: notification.id,
            senderId: notification.sender_id,
            senderName: notification.sender_name,
            receiverId: notification.receiver_id,
            message: notification.message,
            isRead: notification.is_read,
            createdAt: notification.created_at
          }));
          setNotifications(mappedNotifications);
        }
      } catch (error) {
        console.error("Unexpected error in notification fetch:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        // Always set empty array on unexpected errors
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Only set up real-time subscription if we don't have table errors
    let channel: any = null;
    
    // Test if table exists before setting up real-time subscription
    supabase
      .from('notifications')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (!error) {
          // Table exists, safe to set up subscription
          channel = supabase
            .channel(`user_${user.id}_notifications`)
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `receiver_id=eq.${user.id}`  // Fixed: use snake_case column name
            }, (payload) => {
              fetchNotifications(); // Refetch notifications when changes occur
            })
            .subscribe();
        } else {
          console.log("Skipping real-time subscription - notifications table not available");
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  const handleDismiss = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })  // Fixed: use snake_case column name
        .eq('id', id);
      
      if (error) {
        console.error("Failed to dismiss notification:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
      } else {
        // Remove the notification from the local state
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
  };

  if (loading) {
    return <Skeleton className="h-16 w-full mb-6" />;
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {notifications.map(notification => (
        <Alert key={notification.id} className="bg-primary/10 border-primary/20 text-primary-foreground">
           <div className='flex items-center gap-2 text-primary dark:text-primary-foreground'>
             <Mail className="h-5 w-5" />
             <AlertTitle>New Message from {notification.senderName}</AlertTitle>
           </div>
           <div className="pl-7">
            <AlertDescription className="text-primary/90 dark:text-primary-foreground/90">
                {notification.message}
            </AlertDescription>
             <p className="text-xs text-primary/70 dark:text-primary-foreground/70 mt-2">
              {formatDistanceToNow(new Date(notification.createdAt as string), { addSuffix: true })}
            </p>
           </div>
           <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDismiss(notification.id)}
            className="absolute top-2 right-2 h-7 w-7 text-primary/80 hover:text-primary"
           >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss message</span>
           </Button>
        </Alert>
      ))}
    </div>
  );
}

      