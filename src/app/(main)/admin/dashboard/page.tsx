'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, UserCheck, DollarSign, Mail } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { getContactSubmissionStats } from '../contact-submissions/actions';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { AdminRevenueCard } from '@/components/admin-revenue-card';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simple stat card component
function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user, userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactStats, setContactStats] = useState<{
    totalSubmissions: number;
    recentSubmissions: number;
  }>({ totalSubmissions: 0, recentSubmissions: 0 });

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // Simplified data fetching for now
    const fetchDashboardData = async () => {
      try {
        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError && usersError.code !== '42P01') {
          console.warn("Users data unavailable:", usersError.message);
        } else if (usersData) {
          setUsers(usersData);
        }

        // Fetch contact submission stats
        const contactStatsResult = await getContactSubmissionStats();
        if (contactStatsResult.success && contactStatsResult.data) {
          setContactStats({
            totalSubmissions: contactStatsResult.data.totalSubmissions,
            recentSubmissions: contactStatsResult.data.recentSubmissions
          });
        }

      } catch (error) {
        console.warn("Dashboard data unavailable - database not fully set up:", error);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  // Calculate stats from available data
  const totalUsers = users.length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading Dashboard..."
          description="Please wait while we load your dashboard."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${userData?.name || 'Admin'}!`}
        description="Oversee and manage the Whiteboard Consultants platform."
      />
      
      <AnnouncementBanner />
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Dashboard Overview</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total Users"
            value={totalUsers}
            description="All registered users"
            icon={Users}
          />
          <StatCard
            title="Instructors"
            value={totalInstructors}
            description="Teaching staff"
            icon={UserCheck}
          />
          <StatCard
            title="Students"
            value={totalStudents}
            description="Learning participants"
            icon={BookOpen}
          />
          <StatCard
            title="Pending Approvals"
            value={pendingUsers}
            description="Users awaiting approval"
            icon={DollarSign}
          />
          <Link href="/admin/contact-submissions">
            <StatCard
              title="Contact Forms"
              value={contactStats.recentSubmissions}
              description={`${contactStats.totalSubmissions} total submissions`}
              icon={Mail}
            />
          </Link>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/admin/users" 
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium">Manage Users</h4>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all user accounts
              </p>
            </Link>
            <Link 
              href="/admin/courses" 
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium">Manage Courses</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Oversee course content and enrollment
              </p>
            </Link>
            <Link 
              href="/admin/announcements" 
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h4 className="font-medium">Create Announcement</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Broadcast messages to all users
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Revenue Analytics</h2>
        <AdminRevenueCard />
      </div>
    </div>
  );
}