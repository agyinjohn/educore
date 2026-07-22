'use client';

import React, { useEffect, useState } from 'react';
import { analyticsService, DashboardMetric, MetricCategory } from '@/lib/services/analytics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

// Generic viewer for the analytics service's pre-aggregated metric documents.
// The backend has no per-student/per-course breakdown — only metric docs
// tagged by category (academic, attendance, finance, engagement, operations)
// — so this renders whatever has actually been recorded, honestly, rather
// than fabricating structure the API doesn't provide.
export default function MetricCategoryPanel({ category, title }: { category: MetricCategory; title: string }) {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [trend, setTrend] = useState<DashboardMetric[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    analyticsService
      .getMetricsByCategory(category, 20)
      .then((res) => setMetrics(res.data))
      .catch(() => setMetrics([]))
      .finally(() => setIsLoading(false));
  }, [category]);

  const viewTrend = (metricKey: string) => {
    setSelected(metricKey);
    setTrendLoading(true);
    analyticsService
      .getMetricTrends(metricKey, 'monthly', 12)
      .then((res) => setTrend(res.data))
      .catch(() => setTrend([]))
      .finally(() => setTrendLoading(false));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : metrics.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No {category} metrics have been recorded for this school yet.</p>
        ) : (
          <div className="space-y-2">
            {metrics.map((m) => (
              <button
                key={m.metricKey}
                onClick={() => viewTrend(m.metricKey)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                  selected === m.metricKey ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-900">{m.metricKey}</span>
                <span className="text-gray-600">{m.value}</span>
              </button>
            ))}

            {selected && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Trend — {selected}
                </p>
                {trendLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : trend.length === 0 ? (
                  <p className="text-xs text-gray-400">No trend data for this metric yet.</p>
                ) : (
                  <div className="flex items-end gap-1 h-24">
                    {trend.map((t, i) => {
                      const max = Math.max(...trend.map((x) => x.value), 1);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                            style={{ height: `${(t.value / max) * 100}%`, minHeight: 2 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
