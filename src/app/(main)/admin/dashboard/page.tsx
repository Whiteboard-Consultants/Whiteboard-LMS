'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, UserCheck, DollarSign, Mail, Bell, TrendingUp, Compass } from 'lucide-react';

import type { User } from '@/types';
import { getContactSubmissionStats } from '../contact-submissions/actions';
import { getRiasecAssessmentStats } from '../riasec/actions';
import { getDashboardStats } from './actions';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { AdminRevenueCard } from '@/components/admin-revenue-card';
import { StatCard } from '@/components/stat-card';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hasPermission, isAdminRole } from '@/lib/permissions';

export default function AdminDashboardPage() {
  const { user, userData } = useAuth();
  const isAdmin = isAdminRole(userData?.role);
  const canUsers = isAdmin;
  const canContact = hasPermission(userData, 'contact_forms');
  const canRiasec = hasPermission(userData, 'riasec');
  const canCourses = hasPermission(userData, 'courses');
  const canCommissions = hasPermission(userData, 'commissions');
  const canAnnouncements = hasPermission(userData, 'announcements');
  const canReports = hasPermission(userData, 'reports');
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
  const [riasecStats, setRiasecStats] = useState<{
    totalLeads: number;
    recentLeads: number;
    completedAssessments: number;
  }>({ totalLeads: 0, recentLeads: 0, completedAssessments: 0 });

  useEffect(() => {
    if (!user || !userData) {
        setLoading(false);
        return;
    }

    const fetchDashboardData = async () => {
      try {
        if (isAdminRole(userData.role)) {
          const statsResult = await getDashboardStats();
          
          if (statsResult.success && statsResult.data) {
            setTotalUsers(statsResult.data.totalUsers);
            setTotalInstructors(statsResult.data.totalInstructors);
            setTotalStudents(statsResult.data.totalStudents);
            setPendingUsers(statsResult.data.pendingApprovals);
            setUsers(statsResult.data.users);
          } else {
            console.error('Failed to load dashboard stats:', statsResult.error);
          }
        }

        if (hasPermission(userData, 'contact_forms')) {
          const contactStatsResult = await getContactSubmissionStats(userData);
          if (contactStatsResult.success && contactStatsResult.data) {
            setContactStats({
              totalSubmissions: contactStatsResult.data.totalSubmissions,
              recentSubmissions: contactStatsResult.data.recentSubmissions
            });
          }
        }

        if (hasPermission(userData, 'riasec')) {
          const riasecStatsResult = await getRiasecAssessmentStats(userData);
          if (riasecStatsResult.success && riasecStatsResult.data) {
            setRiasecStats({
              totalLeads: riasecStatsResult.data.totalLeads,
              recentLeads: riasecStatsResult.data.recentLeads,
              completedAssessments: riasecStatsResult.data.completedAssessments,
            });
          }
        }
      } catch (error) {
        console.warn("Dashboard data unavailable - database not fully set up:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 p-8">
            <PageHeader
              title="Loading Dashboard..."
              description="Please wait while we load your dashboard."
              showGradient={false}
              className="text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-white/30 dark:bg-slate-900/30" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="space-y-8">
        {/* Glass Header */}
        <div className="rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 p-8 mb-8 shadow-xl">
          <PageHeader
            title={`Welcome back, ${userData?.name || 'Admin'}!`}
            description="Monitor platform performance and manage system operations."
            showGradient={false}
            className="text-slate-900 dark:text-white"
          />
        </div>
        
        <div className="px-4 md:px-0">
          <AnnouncementBanner />
      
      <div className="space-y-6">
        {canUsers && (
          <>
        <h2 className="text-2xl font-bold tracking-tight font-headline text-slate-900 dark:text-white">System Statistics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/users" className="no-underline">
            <StatCard
              title="Total Users"
              value={totalUsers.toString()}
              icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
              gradient="blue"
              className="h-full cursor-pointer transition-transform hover:-translate-y-0.5"
            />
          </Link>
          <Link href="/admin/users?role=instructor" className="no-underline">
            <StatCard
              title="Active Instructors"
              value={totalInstructors.toString()}
              icon={<UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />}
              gradient="green"
              className="h-full cursor-pointer transition-transform hover:-translate-y-0.5"
            />
          </Link>
          <Link href="/admin/users?role=student" className="no-underline">
            <StatCard
              title="Active Students"
              value={totalStudents.toString()}
              icon={<BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
              gradient="purple"
              className="h-full cursor-pointer transition-transform hover:-translate-y-0.5"
            />
          </Link>
        </div>
          </>
        )}
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline text-slate-900 dark:text-white">Quick Metrics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {canUsers && (
          <Link href="/admin/users?tab=requests" className="no-underline">
            <StatCard
              title={pendingUsers > 0 ? "⚠️ Pending Approvals" : "Pending Approvals"}
              value={pendingUsers.toString()}
              icon={<TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
              gradient={pendingUsers > 0 ? "amber" : "slate"}
              isAlert={pendingUsers > 0}
              className="h-full cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <p className="text-xs text-foreground/60 dark:text-slate-300/60 pt-1">Users awaiting approval</p>
            </StatCard>
          </Link>
          )}
          {canContact && (
          <Link href="/admin/contact-submissions" className="no-underline">
            <StatCard
              title="Contact Submissions"
              value={contactStats.recentSubmissions.toString()}
              icon={<Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
              gradient="indigo"
            >
              <p className="text-xs text-foreground/60 dark:text-slate-300/60 pt-1">{contactStats.totalSubmissions} total submissions</p>
            </StatCard>
          </Link>
          )}
          {canRiasec && (
          <Link href="/admin/riasec" className="no-underline">
            <StatCard
              title="RIASEC Leads"
              value={riasecStats.recentLeads.toString()}
              icon={<Compass className="h-6 w-6 text-teal-600 dark:text-teal-400" />}
              gradient="green"
            >
              <p className="text-xs text-foreground/60 dark:text-slate-300/60 pt-1">
                {riasecStats.totalLeads} total · {riasecStats.completedAssessments} completed
              </p>
            </StatCard>
          </Link>
          )}
        </div>
      </div>

      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {canUsers && (
          <Link href="/admin/users" className="no-underline">
            <Card variant="blue" className="hover:bg-blue-100/50 dark:hover:bg-blue-900/30 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Manage Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/60 dark:text-slate-300/60">View and manage all user accounts</p>
              </CardContent>
            </Card>
          </Link>
          )}
          {canCourses && (
          <Link href="/admin/courses" className="no-underline">
            <Card variant="green" className="hover:bg-green-100/50 dark:hover:bg-green-900/30 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Manage Courses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/60 dark:text-slate-300/60">Oversee course content and enrollment</p>
              </CardContent>
            </Card>
          </Link>
          )}
          {canCommissions && (
          <Link href="/admin/commissions" className="no-underline">
            <Card variant="purple" className="hover:bg-purple-100/50 dark:hover:bg-purple-900/30 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Commission Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/60 dark:text-slate-300/60">Configure commission percentages</p>
              </CardContent>
            </Card>
          </Link>
          )}
          {canAnnouncements && (
          <Link href="/admin/announcements" className="no-underline">
            <Card variant="orange" className="hover:bg-orange-100/50 dark:hover:bg-orange-900/30 cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span>Announcements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/60 dark:text-slate-300/60">Broadcast messages to users</p>
              </CardContent>
            </Card>
          </Link>
          )}
        </div>
      </div>
      {/* Revenue Analytics Section */}
      {(canReports || canCommissions) && (
      <div className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline text-slate-900 dark:text-white">Revenue Analytics</h2>
        <AdminRevenueCard />
      </div>
      )}
        </div>
      </div>
    </div>
  );
}