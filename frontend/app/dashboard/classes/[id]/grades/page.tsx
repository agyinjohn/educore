'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { academicService, Grade } from '@/lib/services/academic.service';
import { studentService, Student } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
};

export default function ClassGradesPage() {
  const { id } = useParams<{ id: string }>();
  const [roster, setRoster] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, Grade | undefined>>({});
  const [scores, setScores] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [term, setTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [subject, setSubject] = useState('');
  const [maxScore, setMaxScore] = useState('100');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rosterRes = await studentService.getStudents({ class_id: id, limit: 100 });
      const students: Student[] = rosterRes.data;
      setRoster(students);

      // No "grades by class" endpoint exists on the backend — fetch per student.
      const results = await Promise.all(
        students.map((s) =>
          academicService
            .getStudentGrades(s.id, term)
            .then((res) => ({ id: s.id, grade: res.data.find((g) => g.subject_id === subject) }))
            .catch(() => ({ id: s.id, grade: undefined }))
        )
      );
      const map: Record<string, Grade | undefined> = {};
      results.forEach((r) => { map[r.id] = r.grade; });
      setGrades(map);
    } catch {
      toast.error('Could not load roster or grades');
    } finally {
      setIsLoading(false);
    }
  }, [id, term, subject]);

  useEffect(() => {
    load();
  }, [load]);

  const saveGrade = async (studentId: string) => {
    const raw = scores[studentId];
    if (!subject.trim()) { toast.error('Enter a subject first'); return; }
    if (!raw || isNaN(Number(raw))) { toast.error('Enter a valid score'); return; }
    setSavingId(studentId);
    try {
      await academicService.recordGrade({
        student_id: studentId,
        subject_id: subject,
        score: Number(raw),
        maxScore: Number(maxScore) || 100,
        term,
        academicYear,
      });
      toast.success('Grade saved as draft');
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save grade');
    } finally {
      setSavingId(null);
    }
  };

  const submitForApproval = async () => {
    setBusy(true);
    try {
      await academicService.submitGrades(term, academicYear);
      toast.success(`Draft grades for ${term}, ${academicYear} submitted for approval`);
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit grades');
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    setBusy(true);
    try {
      await academicService.publishGrades(term, academicYear);
      toast.success(`Submitted grades for ${term}, ${academicYear} published`);
      load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish grades');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/classes/${id}`}>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 text-sm mt-0.5">Record and manage grades for this class</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Term</Label>
            <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Term 1" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Academic Year</Label>
            <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2025-2026" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Max Score</Label>
            <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} placeholder="100" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={submitForApproval} disabled={busy} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          Submit draft grades for approval
        </Button>
        <Button variant="outline" onClick={publish} disabled={busy} className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Publish submitted grades
        </Button>
        <p className="text-xs text-gray-400">
          Applies to all of the school&apos;s grades for {term}, {academicYear} — the backend does not scope draft submission or publishing to a single class.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roster — {subject || 'no subject selected'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : roster.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No students assigned to this class yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Student</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Current Grade</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Score</th>
                    <th className="pb-3 text-right font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => {
                    const existing = grades[s.id];
                    return (
                      <tr key={s.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                        <td className="py-3 pr-4">
                          {existing ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[existing.status]}`}>
                              {existing.score}/{existing.maxScore ?? 100} · {existing.status}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not recorded</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Input
                            type="number"
                            min={0}
                            className="w-24"
                            placeholder={existing ? String(existing.score) : '0'}
                            value={scores[s.id] ?? ''}
                            onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          />
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={savingId === s.id}
                            onClick={() => saveGrade(s.id)}
                            className="flex items-center gap-1"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
