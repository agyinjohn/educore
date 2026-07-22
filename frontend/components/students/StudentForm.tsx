'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { studentService, CreateStudentRequest, Student } from '@/lib/services/student.service';
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

const INITIAL: CreateStudentRequest = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  gender: 'male',
  phoneNumber: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  parentName: '',
  parentPhoneNumber: '',
  parentEmail: '',
  enrollmentType: 'regular',
  currentClass: '',
  section: '',
  admissionType: 'regular',
};

export default function StudentForm({ student }: StudentFormProps) {
  const router = useRouter();
  const isEdit = !!student;

  const [form, setForm] = useState<CreateStudentRequest>(() => ({
    ...INITIAL,
    ...(student
      ? {
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          phoneNumber: student.phoneNumber,
          address: student.address,
          city: student.city,
          state: student.state,
          zipCode: student.zipCode,
          country: student.country,
          parentName: student.parentName,
          parentPhoneNumber: student.parentPhoneNumber,
          parentEmail: student.parentEmail,
          currentClass: student.currentClass,
          section: student.section,
          admissionType: student.admissionType,
          enrollmentType: 'regular',
          // split name fields not in Student type — leave blank
          firstName: '',
          lastName: '',
          email: student.parentEmail,
        }
      : {}),
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof CreateStudentRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: keyof CreateStudentRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.dateOfBirth) e.dateOfBirth = 'Required';
    if (!form.currentClass.trim()) e.currentClass = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      if (isEdit) {
        await studentService.updateStudent(student!.id, form);
        toast.success('Student updated successfully');
      } else {
        await studentService.createStudent(form);
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
    id: keyof CreateStudentRequest,
    label: string,
    type = 'text',
    placeholder = '',
    required = false
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id] as string}
        onChange={(e) => set(id, e.target.value)}
        disabled={isLoading}
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
            {field('email', 'Email Address', 'email', 'student@example.com', true)}
            {field('dateOfBirth', 'Date of Birth', 'date', '', true)}
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
              <select
                id="gender"
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {field('phoneNumber', 'Phone Number', 'tel', '+1 (555) 000-0000')}
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">{field('address', 'Street Address', 'text', '123 Main St')}</div>
            {field('city', 'City', 'text', 'Springfield')}
            {field('state', 'State', 'text', 'IL')}
            {field('zipCode', 'ZIP Code', 'text', '62701')}
            {field('country', 'Country', 'text', 'USA')}
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('currentClass', 'Class', 'text', 'Class 10', true)}
            {field('section', 'Section', 'text', 'A')}
            <div className="space-y-1.5">
              <Label htmlFor="admissionType" className="text-sm font-medium">Admission Type</Label>
              <select
                id="admissionType"
                value={form.admissionType}
                onChange={(e) => set('admissionType', e.target.value)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="regular">Regular</option>
                <option value="transfer">Transfer</option>
                <option value="scholarship">Scholarship</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Parent / Guardian */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parent / Guardian</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('parentName', 'Full Name', 'text', 'Jane Doe')}
            {field('parentEmail', 'Email Address', 'email', 'parent@example.com')}
            {field('parentPhoneNumber', 'Phone Number', 'tel', '+1 (555) 000-0001')}
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
