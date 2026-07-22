'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentService, CreateStudentRequest, Student } from '@/lib/services/student.service';
import { academicService, Class } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface StudentFormProps {
  student?: Student;
}

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1; // Aug–Jul school year
  return `${startYear}-${startYear + 1}`;
})();

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'Other';
  admissionNumber: string;
  class_id: string;
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  guardianEmail: string;
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'M',
  admissionNumber: '',
  class_id: '',
  guardianName: '',
  guardianRelationship: '',
  guardianPhone: '',
  guardianEmail: '',
};

export default function StudentForm({ student }: StudentFormProps) {
  const router = useRouter();
  const isEdit = !!student;
  const guardian = student?.guardians?.[0];

  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL,
    ...(student
      ? {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email || '',
          phone: student.phone || '',
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
          gender: student.gender || 'M',
          admissionNumber: student.admissionNumber || '',
          class_id: student.class_id || '',
          guardianName: guardian?.name || '',
          guardianRelationship: guardian?.relationship || '',
          guardianPhone: guardian?.phone || '',
          guardianEmail: guardian?.email || '',
        }
      : {}),
  }));

  const [classes, setClasses] = useState<Class[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    academicService
      .getClasses(CURRENT_ACADEMIC_YEAR)
      .then((res) => setClasses(res.data))
      .catch(() => setClasses([]));
  }, []);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.dateOfBirth) e.dateOfBirth = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const guardians = form.guardianName.trim()
        ? [
            {
              name: form.guardianName,
              relationship: form.guardianRelationship || 'Guardian',
              phone: form.guardianPhone || undefined,
              email: form.guardianEmail || undefined,
            },
          ]
        : undefined;

      if (isEdit) {
        // class_id and status can only be changed via update, not create
        await studentService.updateStudent(student!.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          class_id: form.class_id || undefined,
        });
        toast.success('Student updated successfully');
      } else {
        const payload: CreateStudentRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phone: form.phone || undefined,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          admissionNumber: form.admissionNumber || undefined,
          guardians,
        };
        const res = await studentService.createStudent(payload);
        // Class assignment happens as a follow-up update — the create
        // endpoint doesn't accept class_id.
        if (form.class_id) {
          await studentService.updateStudent(res.data.id, { class_id: form.class_id });
        }
        toast.success('Student created successfully');
      }
      router.push('/dashboard/students');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save student');
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    id: keyof FormState,
    label: string,
    type = 'text',
    placeholder = '',
    required = false,
    disabled = false
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        disabled={isLoading || disabled}
        className={errors[id] ? 'border-red-500' : ''}
      />
      {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Student' : 'New Student'}
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {isEdit ? 'Update student information' : 'Enroll a new student'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('firstName', 'First Name', 'text', 'John', true)}
            {field('lastName', 'Last Name', 'text', 'Doe', true)}
            {field('email', 'Email Address', 'email', 'student@example.com', false, isEdit)}
            {field('dateOfBirth', 'Date of Birth', 'date', '', true, isEdit)}
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                disabled={isLoading || isEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {field('phone', 'Phone Number', 'tel', '+1 (555) 000-0000', false, isEdit)}
            {field('admissionNumber', 'Admission Number', 'text', 'ADM-2025-001', false, isEdit)}
          </CardContent>
        </Card>

        {/* Class Assignment (enrollment) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="class_id" className="text-sm font-medium">Class</Label>
              <select
                id="class_id"
                value={form.class_id}
                onChange={(e) => set('class_id', e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Not assigned</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.section ? ` - ${c.section}` : ''} ({c.academicYear})
                  </option>
                ))}
              </select>
              {classes.length === 0 && (
                <p className="text-xs text-gray-400">
                  No classes found for {CURRENT_ACADEMIC_YEAR}. <Link href="/dashboard/classes/new" className="text-blue-600 hover:underline">Create one</Link> first.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Parent / Guardian */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent / Guardian</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('guardianName', 'Full Name', 'text', 'Jane Doe', false, isEdit)}
            {field('guardianRelationship', 'Relationship', 'text', 'Mother', false, isEdit)}
            {field('guardianEmail', 'Email Address', 'email', 'parent@example.com', false, isEdit)}
            {field('guardianPhone', 'Phone Number', 'tel', '+1 (555) 000-0001', false, isEdit)}
            {isEdit && (
              <p className="md:col-span-2 text-xs text-gray-400">
                Guardian details can only be set when the student is created.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/students">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              'Update Student'
            ) : (
              'Create Student'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
