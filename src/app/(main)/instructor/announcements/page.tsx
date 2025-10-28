
'use client';

import { useState, useEffect } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/types';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { convertToDate } from '@/lib/date-utils';

const announcementIcons: Record<Announcement['type'], React.ReactNode> = {
    Info: <Info className="h-5 w-5 text-blue-500" />,
    Success: <CheckCircle className="h-5 w-5 text-green-500" />,
    Warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    Destructive: <XCircle className="h-5 w-5 text-red-500" />,
}

export default function InstructorAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    const fetchAnnouncements = async () => {
      try {
        const { data: announcementsData, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching announcements:', error);
          setAnnouncements([]);
        } else {
          // Map database types to frontend types
          const dbToFrontendType: Record<string, string> = {
            'info': 'Info',
            'success': 'Success',
            'warning': 'Warning',
            'error': 'Destructive'
          };
          
          // Map database fields to frontend format
          const mappedAnnouncements = (announcementsData || []).map(ann => ({
            ...ann,
            type: dbToFrontendType[ann.type] || 'Info',
            createdAt: ann.created_at,
          }));
          setAnnouncements(mappedAnnouncements);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [user]);


  return (
    <div>
      <PageHeader title="Platform Announcements" description="Stay updated with the latest news and updates from the platform." />
      <div className="space-y-4">
        {loading || authLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ) : announcements.length > 0 ? announcements.map(ann => (
            <Card key={ann.id}>
                <CardContent className="p-4 flex items-start gap-4">
                    {announcementIcons[ann.type]}
                    <div className="flex-grow">
                        <p className="font-semibold">{ann.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">{ann.createdAt ? (() => {
                          const date = convertToDate(ann.createdAt);
                          return date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Invalid date';
                        })() : 'No date'}</p>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="mt-2 text-lg font-medium">No announcements yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later for updates.</p>
            </div>
        )}
      </div>
    </div>
  );
}
