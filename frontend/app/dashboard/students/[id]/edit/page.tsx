'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { studentService, Student } from '@/lib/services/student.service';
import StudentForm from '@/components/students/StudentForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    studentService
      .getStudent(id)
      .then((res) => setStudent(res.data))
      .catch(() => {
        // mock fallback — StudentForm handles null gracefully
        setStudent(null);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    );
  }

  return <StudentForm student={student ?? undefined} />;
}
