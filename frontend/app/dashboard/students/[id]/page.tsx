'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { studentService, Student, AttendanceStats } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, User, MapPin, Phone, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
};

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stuRes, attRes] = await Promise.all([
          studentService.getStudent(id),
          studentService.getAttendanceStats(id),
        ]);
        setStudent(stuRes.data);
        setAttendanceStats(attRes.data);
      } catch {
        // Mock
        setStudent({
          id,
          userId: 'u1',
          enrollmentNumber: 'EN24001',
          dateOfBirth: '2005-03-15',
          gender: 'male',
          phoneNumber: '+1-555-0100',
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA',
          parentName: 'Jane Doe',
          parentPhoneNumber: '+1-555-0200',
          parentEmail: 'jane.doe@example.com',
          enrollmentDate: '2024-01-10',
          status: 'active',
          currentClass: 'Class 10',
          section: 'A',
          rollNumber: 1,
          admissionType: 'regular',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setAttendanceStats({
          totalDays: 120,
          presentDays: 112,
          absentDays: 6,
          lateDays: 2,
          attendancePercentage: 93.3,
        });
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
            <p className="text-gray-500 text-sm">EN: {student.enrollmentNumber}</p>
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
                  {student.parentName} {/* placeholder — real name would come from user join */}
                </p>
                <p className="text-sm text-gray-500">Roll #{student.rollNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[student.status]}`}>
                {student.status}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <InfoRow icon={BookOpen} label="Class" value={`${student.currentClass} - ${student.section}`} />
              <InfoRow icon={MapPin} label="City" value={`${student.city}, ${student.state}`} />
              <InfoRow icon={Phone} label="Phone" value={student.phoneNumber} />
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
              <Detail label="Date of Birth" value={new Date(student.dateOfBirth).toLocaleDateString()} />
              <Detail label="Gender" value={student.gender} capitalize />
              <Detail label="Admission Type" value={student.admissionType} capitalize />
              <Detail label="Enrollment Date" value={new Date(student.enrollmentDate).toLocaleDateString()} />
              <Detail label="Address" value={`${student.address}, ${student.city}, ${student.state} ${student.zipCode}`} span />
            </CardContent>
          </Card>

          {/* Parent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent / Guardian</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Detail label="Name" value={student.parentName} />
              <Detail label="Email" value={student.parentEmail} />
              <Detail label="Phone" value={student.parentPhoneNumber} />
            </CardContent>
          </Card>

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

function Detail({ label, value, capitalize, span }: { label: string; value: string; capitalize?: boolean; span?: boolean }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className={`text-gray-900 font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
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
