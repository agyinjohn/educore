'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/lib/services/analytics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, CalendarCheck, DollarSign, FileBarChart, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  { href: '/dashboard/analytics/students', label: 'Students', desc: 'Enrollment & engagement', icon: Users },
  { href: '/dashboard/analytics/academic', label: 'Academic', desc: 'Grades & class performance', icon: GraduationCap },
  { href: '/dashboard/analytics/attendance', label: 'Attendance', desc: 'Attendance trends by class', icon: CalendarCheck },
  { href: '/dashboard/analytics/revenue', label: 'Revenue', desc: 'Collections & outstanding balances', icon: DollarSign },
  { href: '/dashboard/analytics/custom-reports', label: 'Custom Reports', desc: 'Build & save your own reports', icon: FileBarChart },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getSummaryStats()
      .then((res) => setStats(res.data))
      .catch(() => {
        setStats(null);
        toast.error('Could not reach the analytics service');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Monitor your institution&apos;s performance and trends</p>
      </div>

      {/* Summary stats — whatever the analytics service has recorded so far */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : stats && Object.keys(stats).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 truncate">{key}</p>
                  <p className="text-lg font-bold text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No analytics events have been recorded for this school yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
