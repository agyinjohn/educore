'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { academicService, Class } from '@/lib/services/academic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Users2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await academicService.getClasses(academicYear);
      setClasses(res.data);
    } catch {
      setClasses([]);
      toast.error('Could not reach the academic service');
    } finally {
      setIsLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">Manage classes, rosters, and grades</p>
        </div>
        <Link href="/dashboard/classes/new">
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Class
          </Button>
        </Link>
      </div>

      {/* Academic Year filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 max-w-xs">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Academic Year</label>
            <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2025-2026" />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No classes for {academicYear}</p>
          <p className="text-gray-400 text-sm mt-1">Create one to start building rosters and recording grades</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base leading-tight">
                  {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400">Academic Year:</span> {cls.academicYear}</p>
                  {cls.gradeLevel && <p><span className="text-gray-400">Grade Level:</span> {cls.gradeLevel}</p>}
                  {cls.capacity != null && <p><span className="text-gray-400">Capacity:</span> {cls.capacity}</p>}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link href={`/dashboard/classes/${cls.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      View Roster
                    </Button>
                  </Link>
                  <Link href={`/dashboard/classes/${cls.id}/grades`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Users2 className="h-3.5 w-3.5" />
                      Grades
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
