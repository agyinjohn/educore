'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { studentService, StudentStatus } from '@/lib/services/student.service';
import MetricCategoryPanel from '@/components/analytics/MetricCategoryPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: StudentStatus[] = ['active', 'inactive', 'suspended', 'graduated', 'withdrawn'];

export default function StudentAnalyticsPage() {
  const [counts, setCounts] = useState<Record<string, { count: number; hasMore: boolean }> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // The backend has no headcount-by-status endpoint — computed here
        // from one filtered request per status, capped at the page limit.
        const results = await Promise.all(
          STATUSES.map((status) =>
            studentService.getStudents({ limit: 100, status }).then((res) => {
              const body = res.data as any;
              const list = body.data ?? body.students ?? [];
              return { count: list.length, hasMore: !!body.hasMore };
            })
          )
        );
        const map: Record<string, { count: number; hasMore: boolean }> = {};
        STATUSES.forEach((s, i) => { map[s] = results[i]; });
        setCounts(map);
      } catch {
        toast.error('Could not reach the student service');
        setCounts(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/analytics">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Analytics</h1>
          <p className="text-gray-600 text-sm">Enrollment snapshot and engagement metrics</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-gray-400 mb-3">
            The student service paginates by cursor and doesn&apos;t expose an exact total, so counts
            past 100 per status show as &quot;100+&quot;.
          </p>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {STATUSES.map((s) => <Skeleton key={s} className="h-16" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {STATUSES.map((s) => (
                <div key={s} className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {counts?.[s]?.count ?? 0}{counts?.[s]?.hasMore ? '+' : ''}
                  </p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{s}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MetricCategoryPanel category="engagement" title="Engagement Metrics" />
    </div>
  );
}
