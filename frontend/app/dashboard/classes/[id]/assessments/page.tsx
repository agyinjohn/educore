'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { academicService, Assessment, AssessmentType } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, X, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const TYPES: AssessmentType[] = ['quiz', 'test', 'exam', 'project', 'assignment', 'classwork'];

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

const INITIAL_FORM = {
  subject_id: '', name: '', type: 'test' as AssessmentType, maxScore: 100, weight: 1,
  date: new Date().toISOString().slice(0, 10), description: '',
};

export default function ClassAssessmentsPage() {
  const { id } = useParams<{ id: string }>();
  const [term, setTerm] = useState('Term 1');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await academicService.listAssessments(id, term);
      setAssessments(res.data);
    } catch {
      setAssessments([]);
      toast.error('Could not load assessments');
    } finally {
      setIsLoading(false);
    }
  }, [id, term]);

  useEffect(() => { load(); }, [load]);

  const set = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject_id.trim() || !form.name.trim()) {
      toast.error('Subject and name are required');
      return;
    }
    setSaving(true);
    try {
      await academicService.createAssessment({
        class_id: id,
        subject_id: form.subject_id,
        name: form.name,
        type: form.type,
        maxScore: Number(form.maxScore),
        weight: Number(form.weight),
        date: new Date(form.date).toISOString(),
        term,
        academicYear: CURRENT_ACADEMIC_YEAR,
        description: form.description || undefined,
      });
      toast.success('Assessment created');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch {
      toast.error('Failed to create assessment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/classes/${id}`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
            <p className="text-gray-600 text-sm">Quizzes, tests, and assignments for this class</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Assessment
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 max-w-xs">
          <div className="space-y-1.5">
            <Label className="text-sm">Term</Label>
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Term 1" />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Assessment</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Subject <span className="text-red-500">*</span></Label>
                <Input value={form.subject_id} onChange={(e) => set('subject_id', e.target.value)} placeholder="Mathematics" disabled={saving} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Unit 3 Quiz" disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Max Score</Label>
                <Input type="number" min={1} value={form.maxScore} onChange={(e) => set('maxScore', Number(e.target.value))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Weight</Label>
                <Input type="number" min={0} step={0.1} value={form.weight} onChange={(e) => set('weight', Number(e.target.value))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Date</Label>
                <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-sm">Description</Label>
                <Input value={form.description} onChange={(e) => set('description', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Create Assessment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : assessments.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No assessments for {term} yet.</p>
          ) : (
            <div className="space-y-2">
              {assessments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <ClipboardList className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{a.subject_id} · {a.type} · out of {a.maxScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
