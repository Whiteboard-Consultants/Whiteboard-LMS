
'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const variantMap: Record<Announcement['type'], 'default' | 'destructive'> = {
    Info: 'default',
    Success: 'default',
    Warning: 'default',
    Destructive: 'destructive',
};

const colorClassMap: Record<Announcement['type'], string> = {
    Info: 'border-blue-500/50 text-blue-800 dark:border-blue-500/60 dark:text-blue-200',
    Success: 'border-green-500/50 text-green-800 dark:border-green-500/60 dark:text-green-200',
    Warning: 'border-yellow-500/50 text-yellow-800 dark:border-yellow-500/60 dark:text-yellow-200',
    Destructive: 'border-red-500/50 text-red-700 dark:border-red-500/60 dark:text-red-400',
};

const iconMap: Record<Announcement['type'], React.ReactNode> = {
    Info: <Info className="h-5 w-5" />,
    Success: <CheckCircle className="h-5 w-5" />,
    Warning: <AlertTriangle className="h-5 w-5" />,
    Destructive: <XCircle className="h-5 w-5" />,
};

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    try {
      const dismissedItems = localStorage.getItem('dismissedAnnouncements');
      if (dismissedItems) {
        setDismissed(JSON.parse(dismissedItems));
      }
    } catch (error) {
      console.error("Could not parse dismissed announcements:", error);
    }
  }, []);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // Fetch initial announcements
    const fetchAnnouncements = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .limit(5);

        if (error) {
          if (error.code === '42P01' || error.message?.includes('relation "public.announcements" does not exist')) {
            console.warn("Announcements table doesn't exist yet. Announcements will not be displayed.");
            setAnnouncements([]);
          } else if (error.code === '42703' || error.message?.includes('does not exist')) {
            console.warn("Announcements table schema incomplete, will display without ordering:", error.message);
            // Try again without ordering by createdAt
            const { data: retryData, error: retryError } = await supabase
              .from('announcements')
              .select('id, title, content, type')
              .limit(5);
            
            if (retryError) {
              console.warn("Announcements completely unavailable:", retryError.message);
              setAnnouncements([]);
            } else {
              // Map database types to frontend types
              const dbToFrontendType: Record<string, string> = {
                'info': 'Info',
                'success': 'Success',
                'warning': 'Warning',
                'error': 'Destructive'
              };
              
              // Add default createdAt for compatibility
              const announcements = (retryData || []).map(item => ({
                ...item,
                type: dbToFrontendType[item.type] || 'Info',
                createdAt: new Date().toISOString()
              })) as Announcement[];
              setAnnouncements(announcements);
            }
          } else {
            console.warn("Announcements unavailable:", error.code || 'unknown', error.message || 'Database table not ready');
            setAnnouncements([]);
          }
        } else {
          // Map database types to frontend types
          const dbToFrontendType: Record<string, string> = {
            'info': 'Info',
            'success': 'Success',
            'warning': 'Warning',
            'error': 'Destructive'
          };
          
          const mappedData = (data || []).map(item => ({
            ...item,
            type: dbToFrontendType[item.type] || 'Info',
            createdAt: item.created_at || new Date().toISOString()
          })) as Announcement[];
          setAnnouncements(mappedData);
        }
      } catch (err) {
        console.warn("Announcements disabled - database table not ready:", err);
        setAnnouncements([]);
      }
      setLoading(false);
    };

    fetchAnnouncements();

    // Set up real-time subscription for announcements
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, (payload) => {
        // Refetch announcements when changes occur
        fetchAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    if(isMounted) {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    }
  };

  const activeAnnouncements = useMemo(() => {
      return announcements.filter(ann => !dismissed.includes(ann.id))
  }, [announcements, dismissed]);
  
  if (loading || authLoading) {
      return <Skeleton className="h-16 w-full mb-6" />;
  }

  if (!isMounted || !user || activeAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {activeAnnouncements.map(ann => (
        <Alert key={ann.id} variant={variantMap[ann.type]} className={cn("bg-opacity-10 dark:bg-opacity-20", colorClassMap[ann.type])} role="alert">
          <div className='flex items-center gap-2'>
            {iconMap[ann.type]}
            <AlertTitle>{ann.title}</AlertTitle>
          </div>
          <div className='pl-7'>
             <AlertDescription>{ann.content}</AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDismiss(ann.id)}
            className="absolute top-2 right-2 h-7 w-7"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </Alert>
      ))}
    </div>
  );
}
