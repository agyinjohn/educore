'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { academicService, Course, Enrollment } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pencil, Users, BookOpen, Calendar, Award } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  archived: 'bg-yellow-100 text-yellow-700',
  dropped: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const courseRes = await academicService.getCourse(id);
        setCourse(courseRes.data);
      } catch {
        setCourse({
          id,
          name: 'Mathematics',
          code: 'MATH101',
          description: 'Comprehensive mathematics covering algebra, calculus, and statistics.',
          credits: 3,
          semester: 'Fall 2024',
          instructor: 'Dr. Smith',
          instructorId: 't1',
          duration: 16,
          enrollmentLimit: 30,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setEnrollments(
          Array.from({ length: 12 }, (_, i) => ({
            id: `e${i + 1}`,
            studentId: `s${i + 1}`,
            classId: 'cls1',
            courseId: id,
            enrollmentDate: '2024-01-10',
            status: i < 10 ? 'active' : 'dropped',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        );
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
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!course) return <div className="text-center py-12 text-gray-500">Course not found</div>;

  const activeEnrollments = enrollments.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <p className="font-mono text-sm text-gray-500">{course.code}</p>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          </div>
        </div>
        <Link href={`/dashboard/courses/${id}/edit`}>
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[course.status]}`}>
                  {course.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <Detail label="Instructor" value={course.instructor} />
                <Detail label="Semester" value={course.semester} />
                <Detail label="Credits" value={String(course.credits)} />
                <Detail label="Duration" value={`${course.duration} weeks`} />
                <Detail label="Enrollment Limit" value={String(course.enrollmentLimit)} />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Enrolled" value={activeEnrollments} color="blue" />
            <StatCard icon={Award} label="Credits" value={course.credits} color="purple" />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Enrolled Students ({activeEnrollments})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">No students enrolled</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 text-left font-medium text-gray-600">Student ID</th>
                        <th className="pb-2 text-left font-medium text-gray-600">Enrolled</th>
                        <th className="pb-2 text-left font-medium text-gray-600">Status</th>
                        <th className="pb-2 text-right font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enr) => (
                        <tr key={enr.id} className="border-b border-gray-50">
                          <td className="py-2.5 font-mono text-xs text-gray-600">{enr.studentId}</td>
                          <td className="py-2.5 text-gray-600">
                            {new Date(enr.enrollmentDate).toLocaleDateString()}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[enr.status]}`}>
                              {enr.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <Link href={`/dashboard/students/${enr.studentId}`}>
                              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card>
      <CardContent className="pt-4 pb-4 text-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}
