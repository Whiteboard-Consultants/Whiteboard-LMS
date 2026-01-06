'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, UserCheck, DollarSign, Mail, BarChart3, Settings, Bell, TrendingUp } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { getContactSubmissionStats } from '../contact-submissions/actions';
import { getDashboardStats } from './actions';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { AdminRevenueCard } from '@/components/admin-revenue-card';
import { StatCard } from '@/components/stat-card';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { user, userData } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
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

    // Verify user is admin and fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // Use server action to fetch dashboard stats
        const statsResult = await getDashboardStats();
        
        if (statsResult.success && statsResult.data) {
          setTotalUsers(statsResult.data.totalUsers);
          setTotalInstructors(statsResult.data.totalInstructors);
          setTotalStudents(statsResult.data.totalStudents);
          setPendingUsers(statsResult.data.pendingApprovals);
          setUsers(statsResult.data.users);
          console.log('Dashboard stats loaded:', statsResult.data);
        } else {
          console.error('Failed to load dashboard stats:', statsResult.error);
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
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-indigo-600/90 to-blue-600/90 dark:from-indigo-900/40 dark:to-blue-900/40 p-8">
          <PageHeader
            title="Loading Dashboard..."
            description="Please wait while we load your dashboard."
            className="text-white dark:text-slate-100 [&>p]:text-indigo-100"
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 dark:from-slate-900/50 to-background">
      <div className="space-y-8">
        <div className="rounded-xl bg-gradient-to-r from-indigo-600/90 to-blue-600/90 dark:from-indigo-900/40 dark:to-blue-900/40 p-8 mb-8">
          <PageHeader
            title={`Welcome back, ${userData?.name || 'Admin'}!`}
            description="Monitor platform performance and manage system operations."
            showGradient={false}
            className="text-white dark:text-white"
          />
        </div>
        
        <div className="px-4 md:px-0">
          <AnnouncementBanner />
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">System Statistics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={totalUsers.toString()}
            icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            gradient="blue"
          />
          <StatCard
            title="Active Instructors"
            value={totalInstructors.toString()}
            icon={<UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />}
            gradient="green"
          />
          <StatCard
            title="Active Students"
            value={totalStudents.toString()}
            icon={<BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
            gradient="purple"
          />
        </div>
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Quick Metrics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <StatCard
            title={pendingUsers > 0 ? "⚠️ Pending Approvals" : "Pending Approvals"}
            value={pendingUsers.toString()}
            icon={<TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
            gradient={pendingUsers > 0 ? "amber" : "slate"}
            isAlert={pendingUsers > 0}
          >
            <p className="text-xs text-muted-foreground pt-1">Users awaiting approval</p>
          </StatCard>
          <Link href="/admin/contact-submissions" className="no-underline">
            <StatCard
              title="Contact Submissions"
              value={contactStats.recentSubmissions.toString()}
              icon={<Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
              gradient="indigo"
            >
              <p className="text-xs text-muted-foreground pt-1">{contactStats.totalSubmissions} total submissions</p>
            </StatCard>
          </Link>
        </div>
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users" className="no-underline">
            <Card className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Manage Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View and manage all user accounts</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/courses" className="no-underline">
            <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Manage Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Oversee course content and enrollment</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/commissions" className="no-underline">
            <Card className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Commission Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Configure commission percentages</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/announcements" className="no-underline">
            <Card className="bg-gradient-to-br from-amber-50 dark:from-amber-900/20 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span>Announcements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Broadcast messages to users</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      {/* Revenue Analytics Section */}
      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Revenue Analytics</h2>
        <AdminRevenueCard />
      </div>
        </div>
      </div>
    </div>
  );
}