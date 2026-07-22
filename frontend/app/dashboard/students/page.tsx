'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { studentService, Student } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
  withdrawn: 'bg-orange-100 text-orange-700',
};

const STATUSES = ['', 'active', 'inactive', 'suspended', 'graduated', 'withdrawn'];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  // Backend pagination is cursor-based (no free-text search, no total count).
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  const fetchStudents = useCallback(async (cursor: string | null) => {
    setIsLoading(true);
    try {
      const res = await studentService.getStudents({
        limit,
        cursor: cursor || undefined,
        status: statusFilter || undefined,
      });
      setStudents(res.data);
      setNextCursor(res.data.cursor ?? null);
      setHasMore(!!res.data.hasMore);
    } catch {
      setStudents([]);
      setNextCursor(null);
      setHasMore(false);
      toast.error('Could not reach the student service');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStudents(cursorStack[pageIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStudents, pageIndex]);

  const changeStatusFilter = (s: string) => {
    setStatusFilter(s);
    setCursorStack([null]);
    setPageIndex(0);
  };

  const goNext = () => {
    if (!hasMore || !nextCursor) return;
    setCursorStack((prev) => [...prev.slice(0, pageIndex + 1), nextCursor]);
    setPageIndex((p) => p + 1);
  };

  const goPrev = () => {
    if (pageIndex === 0) return;
    setPageIndex((p) => p - 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student? This action cannot be undone.')) return;
    try {
      await studentService.deleteStudent(id);
      toast.success('Student deleted');
      fetchStudents(cursorStack[pageIndex]);
    } catch {
      toast.error('Failed to delete student');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student enrollments and profiles</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/students/import">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </Link>
          <Link href="/dashboard/students/new">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatusFilter(s)}
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">
            {isLoading ? 'Loading…' : `${students.length} student${students.length === 1 ? '' : 's'} on this page`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600">Name</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600 hidden md:table-cell">Admission #</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600 hidden lg:table-cell">Enrolled</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600">Status</th>
                  <th className="pb-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : students.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                          {student.email && <div className="text-xs text-gray-500">{student.email}</div>}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 hidden md:table-cell font-mono text-xs">
                          {student.admissionNumber || '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 hidden lg:table-cell">
                          {student.enrolmentDate ? new Date(student.enrolmentDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[student.status]}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/dashboard/students/${student.id}`}>
                              <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                            </Link>
                            <Link href={`/dashboard/students/${student.id}/edit`}>
                              <button className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && students.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm mt-1">Try a different status filter, or add a student</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100 gap-1">
            <button
              onClick={goPrev}
              disabled={pageIndex === 0 || isLoading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm px-2">Page {pageIndex + 1}</span>
            <button
              onClick={goNext}
              disabled={!hasMore || isLoading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
