'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { studentService, Student } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
};

const PAGE_SIZES = [10, 25, 50];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentService.getStudents({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch {
      // Mock data when API unavailable
      const mock: Student[] = Array.from({ length: limit }, (_, i) => ({
        id: `s${i + 1 + (page - 1) * limit}`,
        userId: `u${i + 1}`,
        enrollmentNumber: `EN${String(2024000 + i + 1 + (page - 1) * limit).slice(-5)}`,
        dateOfBirth: '2005-03-15',
        gender: 'male',
        phoneNumber: '+1-555-0100',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA',
        parentName: 'Parent Name',
        parentPhoneNumber: '+1-555-0200',
        parentEmail: 'parent@example.com',
        enrollmentDate: '2024-01-10',
        status: ['active', 'active', 'active', 'inactive', 'graduated'][i % 5] as any,
        currentClass: `Class ${(i % 5) + 8}`,
        section: ['A', 'B', 'C'][i % 3],
        rollNumber: i + 1,
        admissionType: 'regular',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setStudents(mock);
      setTotal(48);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student? This action cannot be undone.')) return;
    try {
      await studentService.deleteStudent(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(selected.size === students.length ? new Set() : new Set(students.map((s) => s.id)));
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student enrollments and profiles</p>
        </div>
        <Link href="/dashboard/students/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Student
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
                placeholder="Search by name, email, or enrollment number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['', 'active', 'inactive', 'graduated', 'suspended'].map((s) => (
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

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {isLoading ? '...' : `${total} Students`}
            </CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 pr-4 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === students.length && students.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600">Roll #</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600">Name</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600 hidden md:table-cell">Enrollment #</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600 hidden lg:table-cell">Class</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600 hidden lg:table-cell">Enrolled</th>
                  <th className="pb-3 pr-4 text-left font-medium text-gray-600">Status</th>
                  <th className="pb-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: limit }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="py-3 pr-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : students.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <input
                            type="checkbox"
                            checked={selected.has(student.id)}
                            onChange={() => toggleSelect(student.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{student.rollNumber}</td>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">
                            {student.parentName.split(' ')[0]} {/* placeholder until name */}
                          </div>
                          <div className="text-xs text-gray-500">{student.parentEmail}</div>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 hidden md:table-cell font-mono text-xs">
                          {student.enrollmentNumber}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 hidden lg:table-cell">
                          {student.currentClass} - {student.section}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 hidden lg:table-cell">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
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
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="ml-2">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm px-2">{page} / {totalPages || 1}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
