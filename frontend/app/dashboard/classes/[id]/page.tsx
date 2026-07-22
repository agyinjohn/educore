'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { academicService, Class, AtRiskStudent } from '@/lib/services/academic.service';
import { studentService, Student } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap, CalendarClock, CalendarCheck, ClipboardList, AlertTriangle, Users2 } from 'lucide-react';
import { toast } from 'sonner';

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<Class | null>(null);
  const [roster, setRoster] = useState<Student[]>([]);
  const [atRisk, setAtRisk] = useState<AtRiskStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // No "get class by id" endpoint exists — find it in the year's class list.
      const classesRes = await academicService.getClasses(CURRENT_ACADEMIC_YEAR);
      const found = classesRes.data.find((c) => c.id === id) || null;
      setCls(found);

      const rosterRes = await studentService.getStudents({ class_id: id, limit: 100 });
      setRoster(rosterRes.data);
    } catch {
      toast.error('Could not load class details');
    } finally {
      setIsLoading(false);
    }

    try {
      const riskRes = await academicService.getAtRiskStudents(id);
      setAtRisk(riskRes.data);
    } catch {
      setAtRisk([]);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/classes">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {cls ? `${cls.name}${cls.section ? ` - ${cls.section}` : ''}` : 'Class'}
            </h1>
            <p className="text-gray-500 text-sm">{cls?.academicYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/dashboard/classes/${id}/attendance`}>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Attendance
            </Button>
          </Link>
          <Link href={`/dashboard/classes/${id}/assessments`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Assessments
            </Button>
          </Link>
          <Link href={`/dashboard/classes/${id}/timetable`}>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Timetable
            </Button>
          </Link>
          <Link href={`/dashboard/classes/${id}/grades`}>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Grades
            </Button>
          </Link>
        </div>
      </div>

      {cls && (
        <Card>
          <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Grade Level</p>
              <p className="font-medium text-gray-900">{cls.gradeLevel || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Capacity</p>
              <p className="font-medium text-gray-900">{cls.capacity ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Enrolled</p>
              <p className="font-medium text-gray-900">{roster.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Teacher ID</p>
              <p className="font-medium text-gray-900 truncate">{cls.teacher_id || 'Unassigned'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {atRisk.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              {atRisk.length} student{atRisk.length === 1 ? '' : 's'} at risk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {atRisk.map((s) => (
              <div key={s.student_id} className="text-sm text-amber-900 flex flex-wrap gap-x-4">
                <span className="font-medium">{s.student_id}</span>
                <span>Attendance: {s.attendancePercentage}%</span>
                <span>Avg. grade: {s.averageGrade}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users2 className="h-4 w-4 text-blue-600" />
            Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roster.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No students assigned to this class yet.{' '}
              <Link href="/dashboard/students/new" className="text-blue-600 hover:underline">Enroll a student</Link>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Name</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Admission #</th>
                    <th className="pb-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        <Link href={`/dashboard/students/${s.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                          {s.firstName} {s.lastName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-gray-600">{s.admissionNumber || '—'}</td>
                      <td className="py-3 text-gray-600">{s.status}</td>
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
