'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { academicService, Attendance, AttendanceStatus, MarkAttendanceRequest } from '@/lib/services/academic.service';
import { studentService, Student } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  present: 'bg-green-600 text-white border-green-600',
  absent: 'bg-red-600 text-white border-red-600',
  late: 'bg-yellow-500 text-white border-yellow-500',
  excused: 'bg-blue-600 text-white border-blue-600',
};

export default function ClassAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const [roster, setRoster] = useState<Student[]>([]);
  const [existing, setExisting] = useState<Record<string, Attendance>>({});
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const rosterRes = await studentService.getStudents({ class_id: id, limit: 100 });
      const students: Student[] = rosterRes.data;
      setRoster(students);

      const attRes = await academicService.getClassAttendance(id, date);
      const map: Record<string, Attendance> = {};
      attRes.data.filter((a) => a.period === period).forEach((a) => { map[a.student_id] = a; });
      setExisting(map);
      setMarks({});
    } catch {
      toast.error('Could not load roster or attendance');
    } finally {
      setIsLoading(false);
    }
  }, [id, date, period]);

  useEffect(() => { load(); }, [load]);

  const setMark = (studentId: string, status: AttendanceStatus) => {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAll = async () => {
    const records: MarkAttendanceRequest[] = roster
      .filter((s) => marks[s.id])
      .map((s) => ({
        student_id: s.id,
        class_id: id,
        date,
        period,
        status: marks[s.id],
      }));
    if (records.length === 0) {
      toast.error('Mark at least one student first');
      return;
    }
    setSaving(true);
    try {
      await academicService.markBulkAttendance(records);
      toast.success(`Saved attendance for ${records.length} student${records.length === 1 ? '' : 's'}`);
      load();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/classes/${id}`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-600 text-sm">Mark attendance for this class</p>
          </div>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Attendance
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Period</Label>
            <Input type="number" min={1} value={period} onChange={(e) => setPeriod(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Roster — {date}, period {period}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : roster.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No students assigned to this class yet.</p>
          ) : (
            <div className="divide-y">
              {roster.map((s) => {
                const current = marks[s.id] ?? existing[s.id]?.status;
                return (
                  <div key={s.id} className="flex items-center justify-between py-3">
                    <span className="font-medium text-gray-900">{s.firstName} {s.lastName}</span>
                    <div className="flex items-center gap-2">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          onClick={() => setMark(s.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                            current === status ? STATUS_STYLES[status] : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
