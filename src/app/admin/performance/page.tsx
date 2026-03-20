import PerformanceMetricsDashboard from '@/components/admin/PerformanceMetricsDashboard';

export const metadata = {
  title: 'Performance & Core Web Vitals Dashboard | Admin',
  description: 'Monitor Core Web Vitals, performance metrics, and SEO rankings',
  robots: 'noindex, nofollow' // Don't index admin pages
};

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <PerformanceMetricsDashboard />
    </div>
  );
}
