'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { academicService, Class } from '@/lib/services/academic.service';
import MetricCategoryPanel from '@/components/analytics/MetricCategoryPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

export default function AcademicAnalyticsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [averages, setAverages] = useState<any>(null);
  const [distribution, setDistribution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    academicService.getClasses(CURRENT_ACADEMIC_YEAR).then((res) => setClasses(res.data)).catch(() => setClasses([]));
  }, []);

  const load = useCallback(async () => {
    if (!classId) return;
    setIsLoading(true);
    try {
      const [avgRes, distRes] = await Promise.all([
        academicService.getTermAverageGrades(classId, term),
        academicService.getGradeDistribution(classId, term),
      ]);
      setAverages(avgRes.data);
      setDistribution(distRes.data);
    } catch {
      toast.error('Could not load grade analytics for this class');
      setAverages(null);
      setDistribution(null);
    } finally {
      setIsLoading(false);
    }
  }, [classId, term]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/analytics">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Analytics</h1>
          <p className="text-gray-600 text-sm">Class term averages and grade distribution</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Class</Label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Term</Label>
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Term 1" />
          </div>
        </CardContent>
      </Card>

      {classId && (
        isLoading ? (
          <Skeleton className="h-40" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Term Averages</CardTitle></CardHeader>
              <CardContent>
                {averages ? (
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(averages, null, 2)}</pre>
                ) : (
                  <p className="text-sm text-gray-400 py-4">No published grades for this class/term yet.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Grade Distribution</CardTitle></CardHeader>
              <CardContent>
                {distribution ? (
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(distribution, null, 2)}</pre>
                ) : (
                  <p className="text-sm text-gray-400 py-4">No published grades for this class/term yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )
      )}

      <MetricCategoryPanel category="academic" title="Academic Metrics" />
    </div>
  );
}
