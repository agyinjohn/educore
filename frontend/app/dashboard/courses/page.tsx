'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { academicService, Course } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Eye, Pencil, Trash2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  archived: 'bg-yellow-100 text-yellow-700',
};

const MOCK_COURSES: Course[] = Array.from({ length: 8 }, (_, i) => ({
  id: `c${i + 1}`,
  name: ['Mathematics', 'Physics', 'English Literature', 'Chemistry', 'Computer Science', 'History', 'Biology', 'Economics'][i],
  code: ['MATH101', 'PHYS101', 'ENG201', 'CHEM101', 'CS101', 'HIST201', 'BIO101', 'ECON201'][i],
  description: 'Comprehensive course covering core fundamentals',
  credits: [3, 4, 3, 4, 3, 2, 4, 3][i],
  semester: ['Fall 2024', 'Spring 2024', 'Fall 2024', 'Spring 2024', 'Fall 2024', 'Spring 2024', 'Fall 2024', 'Spring 2024'][i],
  instructor: ['Dr. Smith', 'Dr. Johnson', 'Prof. Williams', 'Dr. Brown', 'Prof. Davis', 'Dr. Miller', 'Dr. Wilson', 'Prof. Moore'][i],
  instructorId: `t${i + 1}`,
  duration: 16,
  enrollmentLimit: [30, 25, 35, 25, 30, 40, 25, 35][i],
  status: i < 6 ? 'active' : i === 6 ? 'inactive' : 'archived',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await academicService.getCourses({ page, limit, search: search || undefined });
      setCourses(res.data.courses);
      setTotal(res.data.total);
    } catch {
      const filtered = MOCK_COURSES.filter(
        (c) =>
          (!statusFilter || c.status === statusFilter) &&
          (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
      );
      setCourses(filtered);
      setTotal(filtered.length);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await academicService.deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage academic courses and curriculum</p>
        </div>
        <Link href="/dashboard/courses/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses by name or code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['', 'active', 'inactive', 'archived'].map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-500 mb-1">{course.code}</p>
                    <CardTitle className="text-base leading-tight">{course.name}</CardTitle>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[course.status]}`}>
                    {course.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400">Instructor:</span> {course.instructor}</p>
                  <p><span className="text-gray-400">Semester:</span> {course.semester}</p>
                  <p><span className="text-gray-400">Credits:</span> {course.credits} | <span className="text-gray-400">Limit:</span> {course.enrollmentLimit}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
