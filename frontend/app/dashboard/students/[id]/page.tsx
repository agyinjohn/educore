'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { studentService, Student } from '@/lib/services/student.service';
import { academicService, AttendanceStats } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, User, Phone, Mail, TrendingUp } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
  withdrawn: 'bg-orange-100 text-orange-700',
};

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stuRes = await studentService.getStudent(id);
        setStudent(stuRes.data);
        // Attendance lives in the academic service, not the student service.
        try {
          const attRes = await academicService.getAttendanceStats(id);
          setAttendanceStats(attRes.data);
        } catch {
          setAttendanceStats(null);
        }
      } catch {
        setStudent(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!student) return <div className="text-center py-12 text-gray-500">Student not found</div>;

  const guardian = student.guardians?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/students">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-500 text-sm">Admission #: {student.admissionNumber || '—'}</p>
          </div>
        </div>
        <Link href={`/dashboard/students/${id}/edit`}>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {student.firstName} {student.lastName}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[student.status]}`}>
                {student.status}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {student.email && <InfoRow icon={Mail} label="Email" value={student.email} />}
              {student.phone && <InfoRow icon={Phone} label="Phone" value={student.phone} />}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Detail label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—'} />
              <Detail label="Gender" value={student.gender || '—'} />
              <Detail label="Admission Number" value={student.admissionNumber || '—'} />
              <Detail label="Enrolment Date" value={student.enrolmentDate ? new Date(student.enrolmentDate).toLocaleDateString() : '—'} />
              <Detail label="Class" value={student.class_id ? student.class_id : 'Not assigned'} span />
            </CardContent>
          </Card>

          {/* Parent */}
          {guardian && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parent / Guardian</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Detail label="Name" value={guardian.name} />
                <Detail label="Relationship" value={guardian.relationship} />
                <Detail label="Email" value={guardian.email || '—'} />
                <Detail label="Phone" value={guardian.phone || '—'} />
              </CardContent>
            </Card>
          )}

          {/* Attendance */}
          {attendanceStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <StatBlock label="Total Days" value={attendanceStats.totalDays} />
                  <StatBlock label="Present" value={attendanceStats.presentDays} color="text-green-600" />
                  <StatBlock label="Absent" value={attendanceStats.absentDays} color="text-red-600" />
                  <StatBlock label="Late" value={attendanceStats.lateDays} color="text-yellow-600" />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Attendance Rate</span>
                    <span className="font-semibold">{attendanceStats.attendancePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                      style={{ width: `${attendanceStats.attendancePercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-900 font-medium truncate">{value}</span>
    </div>
  );
}

function Detail({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
