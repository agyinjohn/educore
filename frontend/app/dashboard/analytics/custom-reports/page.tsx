'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { analyticsService, CustomReport } from '@/lib/services/analytics.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const METRIC_OPTIONS = ['attendance_rate', 'grade_distribution', 'enrollment_trend', 'student_engagement'];

export default function CustomReportsPage() {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [metrics, setMetrics] = useState<string[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await analyticsService.getCustomReports();
      setReports(res.data);
    } catch {
      toast.error('Could not reach the analytics service');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleMetric = (m: string) => {
    setMetrics((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || metrics.length === 0) {
      toast.error('Give the report a name and pick at least one metric');
      return;
    }
    setSaving(true);
    try {
      await analyticsService.createCustomReport({ name, metrics });
      toast.success('Custom report saved');
      setShowForm(false);
      setName('');
      setMetrics([]);
      load();
    } catch {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return;
    try {
      await analyticsService.deleteCustomReport(id);
      toast.success('Report deleted');
      load();
    } catch {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/analytics">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Reports</h1>
            <p className="text-gray-600 text-sm">Save a set of metrics to revisit later</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Custom Report</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Report Name <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Term 1 Overview" disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Metrics <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {METRIC_OPTIONS.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => toggleMetric(m)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        metrics.includes(m) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No custom reports saved yet.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4 pb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.metrics.join(', ')}</p>
                </div>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
