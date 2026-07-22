'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { academicService, CreateClassRequest } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

const INITIAL: CreateClassRequest = {
  name: '',
  section: '',
  academicYear: CURRENT_ACADEMIC_YEAR,
  teacher_id: '',
  capacity: undefined,
  gradeLevel: '',
};

export default function NewClassPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateClassRequest>(INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateClassRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.academicYear.trim()) {
      setError('Class name and academic year are required');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await academicService.createClass({
        name: form.name,
        section: form.section || undefined,
        academicYear: form.academicYear,
        teacher_id: form.teacher_id || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        gradeLevel: form.gradeLevel || undefined,
      });
      toast.success('Class created');
      router.push('/dashboard/classes');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create class');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/classes">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Class</h1>
          <p className="text-gray-600 text-sm mt-0.5">Create a class for this academic year</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input placeholder="Grade 10" value={form.name} onChange={(e) => set('name', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Input placeholder="A" value={form.section} onChange={(e) => set('section', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year <span className="text-red-500">*</span></Label>
              <Input placeholder="2025-2026" value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>Grade Level</Label>
              <Input placeholder="Grade 10" value={form.gradeLevel} onChange={(e) => set('gradeLevel', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input type="number" min={0} placeholder="40" value={form.capacity ?? ''} onChange={(e) => set('capacity', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label>Teacher ID</Label>
              <Input placeholder="Optional — assign later" value={form.teacher_id} onChange={(e) => set('teacher_id', e.target.value)} disabled={isLoading} />
            </div>

            {error && <p className="sm:col-span-2 text-sm text-red-500">{error}</p>}

            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <Link href="/dashboard/classes">
                <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Class'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
