/**
 * Performance Metrics Dashboard
 *
 * Component to display Core Web Vitals progress against targets
 * Shows page-specific metrics and optimization recommendations
 *
 * Usage (admin page):
 * import { PerformanceMetricsDashboard } from '@/components/admin/PerformanceMetricsDashboard';
 * 
 * export default function PerformancePage() {
 *   return <PerformanceMetricsDashboard />;
 * }
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { PAGE_PERFORMANCE_TARGETS, WEB_VITALS_TARGETS, OPTIMIZATION_STRATEGIES, PERFORMANCE_COLORS } from '@/lib/web-vitals-config';
import type { PagePerformanceTarget, WebVitalsMetrics } from '@/lib/web-vitals-config';

interface MetricDisplay {
  name: string;
  value: number | string;
  unit: string;
  target: number;
  status: 'good' | 'needsImprovement' | 'poor';
  description: string;
}

export function PerformanceMetricsDashboard() {
  const [selectedPage, setSelectedPage] = useState<PagePerformanceTarget | null>(PAGE_PERFORMANCE_TARGETS[0]);
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);

  useEffect(() => {
    if (!selectedPage) return;

    // Map page metrics to display format
    const displayMetrics: MetricDisplay[] = [
      {
        name: 'LCP (Largest Contentful Paint)',
        value: selectedPage.metrics.lcp,
        unit: 'ms',
        target: WEB_VITALS_TARGETS.lcp.good,
        status: selectedPage.metrics.lcp <= WEB_VITALS_TARGETS.lcp.good ? 'good' : 'needsImprovement',
        description: 'Time when the largest element becomes visible. Represents when main content is loaded.'
      },
      {
        name: 'INP (Interaction to Next Paint)',
        value: selectedPage.metrics.inp,
        unit: 'ms',
        target: WEB_VITALS_TARGETS.inp.good,
        status: selectedPage.metrics.inp <= WEB_VITALS_TARGETS.inp.good ? 'good' : 'needsImprovement',
        description: 'Time from user interaction to visual response. Measures interactivity quality.'
      },
      {
        name: 'CLS (Cumulative Layout Shift)',
        value: selectedPage.metrics.cls.toFixed(3),
        unit: '',
        target: WEB_VITALS_TARGETS.cls.good,
        status: selectedPage.metrics.cls <= WEB_VITALS_TARGETS.cls.good ? 'good' : 'needsImprovement',
        description: 'Unexpected layout shifts during page load. Lower is better (< 0.1 is excellent).'
      },
      {
        name: 'TTFB (Time to First Byte)',
        value: selectedPage.metrics.ttfb,
        unit: 'ms',
        target: WEB_VITALS_TARGETS.ttfb.good,
        status: selectedPage.metrics.ttfb <= WEB_VITALS_TARGETS.ttfb.good ? 'good' : 'needsImprovement',
        description: 'Time from request start to first byte received. Server performance indicator.'
      }
    ];

    setMetrics(displayMetrics);
  }, [selectedPage]);

  if (!selectedPage) {
    return <div>Loading dashboard...</div>;
  }

  const passedCount = metrics.filter(m => m.status === 'good').length;
  const overallHealth = passedCount === 4 ? 'Excellent' : passedCount >= 3 ? 'Good' : passedCount >= 2 ? 'Needs Work' : 'Poor';

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Core Web Vitals Dashboard</h1>
        <p className="text-muted-foreground">Monitor performance against Google's Core Web Vitals targets. All metrics must be "Good" for optimal SEO ranking.</p>
      </div>

      {/* Page Selector */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Select Page</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PAGE_PERFORMANCE_TARGETS.map((page) => (
            <button
              key={page.path}
              onClick={() => setSelectedPage(page)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedPage.path === page.path
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-sm">{page.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{page.path}</div>
              <div className={`text-xs font-bold mt-2 ${
                page.priority === 'critical' ? 'text-red-600' : page.priority === 'high' ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {page.priority.toUpperCase()}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Overall Health */}
      <Card className="p-6 border-2" style={{ borderColor: overallHealth === 'Excellent' ? PERFORMANCE_COLORS.good : overallHealth === 'Good' ? PERFORMANCE_COLORS.good : PERFORMANCE_COLORS.poor }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Overall Health</h2>
            <p className="text-muted-foreground">{passedCount}/4 metrics passing</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold" style={{ color: overallHealth === 'Excellent' ? PERFORMANCE_COLORS.good : overallHealth === 'Good' ? PERFORMANCE_COLORS.good : PERFORMANCE_COLORS.poor }}>
              {overallHealth}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on Core Web Vitals targets</p>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => (
          <Card
            key={metric.name}
            className="p-6 border-l-4"
            style={{
              borderLeftColor: metric.status === 'good' ? PERFORMANCE_COLORS.good : metric.status === 'needsImprovement' ? PERFORMANCE_COLORS.needsImprovement : PERFORMANCE_COLORS.poor
            }}
          >
            <div className="mb-4">
              <h3 className="font-bold text-lg">{metric.name}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{metric.value}</span>
                <span className="text-lg text-muted-foreground">{metric.unit}</span>
                <span
                  className="ml-auto px-3 py-1 rounded text-white text-sm font-semibold"
                  style={{
                    backgroundColor: metric.status === 'good' ? PERFORMANCE_COLORS.good : metric.status === 'needsImprovement' ? PERFORMANCE_COLORS.needsImprovement : PERFORMANCE_COLORS.poor
                  }}
                >
                  {metric.status === 'good' ? '✓ Good' : metric.status === 'needsImprovement' ? '⚠ Needs Improvement' : '✗ Poor'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-2">Target: {metric.target}{metric.unit}</div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min((metric.value as number / metric.target) * 100, 100)}%`,
                    backgroundColor: metric.status === 'good' ? PERFORMANCE_COLORS.good : metric.status === 'needsImprovement' ? PERFORMANCE_COLORS.needsImprovement : PERFORMANCE_COLORS.poor
                  }}
                />
              </div>
            </div>

            {metric.status !== 'good' && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded text-sm border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Optimization Tips:</p>
                <ul className="list-disc pl-4 space-y-1 text-yellow-700 dark:text-yellow-300 text-xs">
                  {OPTIMIZATION_STRATEGIES[metric.name.split('(')[0].trim().toLowerCase() as keyof typeof OPTIMIZATION_STRATEGIES]?.slice(0, 3).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Page Notes */}
      {selectedPage.notes && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-lg mb-2">Page-Specific Notes</h3>
          <p className="text-foreground">{selectedPage.notes}</p>
        </Card>
      )}

      {/* Optimization Strategies */}
      <Card className="p-6">
        <h3 className="font-bold text-xl mb-4">Optimization Roadmap</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(OPTIMIZATION_STRATEGIES).map(([metric, strategies]) => (
            <div key={metric}>
              <h4 className="font-bold text-base mb-3 capitalize">{metric} (Largest Contentful Paint)</h4>
              <ul className="space-y-2">
                {strategies.slice(0, 4).map((strategy, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary font-bold">→</span>
                    <span className="text-muted-foreground">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Items */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
        <h3 className="font-bold text-xl mb-4">Next Steps</h3>
        <ol className="space-y-3 list-decimal pl-5">
          <li className="text-foreground"><strong>Image Optimization:</strong> Ensure all images use quality=85, have explicit dimensions, and implement lazy loading</li>
          <li className="text-foreground"><strong>JavaScript Audit:</strong> Analyze bundle size and implement code splitting by route</li>
          <li className="text-foreground"><strong>Database Queries:</strong> Profile slow queries and add caching/indexing as needed</li>
          <li className="text-foreground"><strong>Monitoring:</strong> Set up Google Analytics or Vercel Analytics to track real user metrics</li>
          <li className="text-foreground"><strong>Testing:</strong> Run PageSpeed Insights weekly to detect regressions</li>
        </ol>
      </Card>
    </div>
  );
}

export default PerformanceMetricsDashboard;
