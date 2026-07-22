'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { academicService, CreateCourseRequest } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL: CreateCourseRequest = {
  name: '',
  code: '',
  description: '',
  credits: 3,
  semester: '',
  instructorId: '',
  duration: 16,
  enrollmentLimit: 30,
};

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCourseRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: keyof CreateCourseRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    if (!form.semester.trim()) e.semester = 'Required';
    if (!form.instructorId.trim()) e.instructorId = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await academicService.createCourse(form);
      toast.success('Course created successfully');
      router.push('/dashboard/courses');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/courses">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Course</h1>
          <p className="text-gray-600 text-sm mt-0.5">Create a new academic course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="name" label="Course Name" required error={errors.name}>
              <Input
                id="name"
                placeholder="Mathematics"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                disabled={isLoading}
                className={errors.name ? 'border-red-500' : ''}
              />
            </Field>
            <Field id="code" label="Course Code" required error={errors.code}>
              <Input
                id="code"
                placeholder="MATH101"
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase())}
                disabled={isLoading}
                className={errors.code ? 'border-red-500' : ''}
              />
            </Field>
            <div className="md:col-span-2">
              <Field id="description" label="Description">
                <textarea
                  id="description"
                  placeholder="Course description..."
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </Field>
            </div>
            <Field id="semester" label="Semester" required error={errors.semester}>
              <Input
                id="semester"
                placeholder="Fall 2024"
                value={form.semester}
                onChange={(e) => set('semester', e.target.value)}
                disabled={isLoading}
                className={errors.semester ? 'border-red-500' : ''}
              />
            </Field>
            <Field id="instructorId" label="Instructor ID" required error={errors.instructorId}>
              <Input
                id="instructorId"
                placeholder="Teacher ID"
                value={form.instructorId}
                onChange={(e) => set('instructorId', e.target.value)}
                disabled={isLoading}
                className={errors.instructorId ? 'border-red-500' : ''}
              />
            </Field>
            <Field id="credits" label="Credits">
              <Input
                id="credits"
                type="number"
                min={1}
                max={6}
                value={form.credits}
                onChange={(e) => set('credits', Number(e.target.value))}
                disabled={isLoading}
              />
            </Field>
            <Field id="enrollmentLimit" label="Enrollment Limit">
              <Input
                id="enrollmentLimit"
                type="number"
                min={1}
                value={form.enrollmentLimit}
                onChange={(e) => set('enrollmentLimit', Number(e.target.value))}
                disabled={isLoading}
              />
            </Field>
            <Field id="duration" label="Duration (weeks)">
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => set('duration', Number(e.target.value))}
                disabled={isLoading}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/courses">
            <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[130px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, required, error, children }: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
