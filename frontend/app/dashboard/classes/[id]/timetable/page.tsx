'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { academicService, TimetableSlot } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

const INITIAL_FORM = {
  subject: '', teacher_id: '', dayOfWeek: 'Monday', period: 1, startTime: '09:00', endTime: '10:00',
};

export default function ClassTimetablePage() {
  const { id } = useParams<{ id: string }>();
  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [term, setTerm] = useState('Term 1');
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await academicService.getTimetableForClass(id, academicYear, term);
      setSlots(res.data);
    } catch {
      setSlots([]);
      toast.error('Could not load timetable');
    } finally {
      setIsLoading(false);
    }
  }, [id, academicYear, term]);

  useEffect(() => { load(); }, [load]);

  const set = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.teacher_id.trim()) {
      toast.error('Subject and teacher are required');
      return;
    }
    setSaving(true);
    try {
      await academicService.createTimetableSlot({
        class_id: id,
        teacher_id: form.teacher_id,
        subject: form.subject,
        dayOfWeek: form.dayOfWeek,
        period: Number(form.period),
        startTime: form.startTime,
        endTime: form.endTime,
        academicYear,
        term,
      });
      toast.success('Slot added');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add slot — check for a scheduling conflict');
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
            <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
            <p className="text-gray-600 text-sm">Weekly schedule for this class</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Slot
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Academic Year</Label>
            <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Term</Label>
            <Input value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Add Timetable Slot</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Subject <span className="text-red-500">*</span></Label>
                <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Mathematics" disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Teacher ID <span className="text-red-500">*</span></Label>
                <Input value={form.teacher_id} onChange={(e) => set('teacher_id', e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Day</Label>
                <select
                  value={form.dayOfWeek}
                  onChange={(e) => set('dayOfWeek', e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Period</Label>
                <Input type="number" min={1} value={form.period} onChange={(e) => set('period', Number(e.target.value))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Start Time</Label>
                <Input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">End Time</Label>
                <Input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Add Slot'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No timetable slots for {term}, {academicYear} yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Day</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Period</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Time</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Subject</th>
                    <th className="pb-2 text-left font-medium text-gray-600">Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {slots
                    .slice()
                    .sort((a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek) || a.period - b.period)
                    .map((s) => (
                      <tr key={s.id} className="border-b border-gray-100">
                        <td className="py-2 pr-4 font-medium text-gray-900">{s.dayOfWeek}</td>
                        <td className="py-2 pr-4 text-gray-600">{s.period}</td>
                        <td className="py-2 pr-4 text-gray-600">{s.startTime}–{s.endTime}</td>
                        <td className="py-2 pr-4 text-gray-600">{s.subject}</td>
                        <td className="py-2 text-gray-600 font-mono text-xs">{s.teacher_id}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
