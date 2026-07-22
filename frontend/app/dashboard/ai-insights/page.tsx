'use client';

import React, { useEffect, useState } from 'react';
import { aiService } from '@/lib/services/ai.service';
import { studentService, Student } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldAlert, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AiInsightsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [attendanceRate, setAttendanceRate] = useState('90');
  const [averageGrade, setAverageGrade] = useState('75');
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ label: string; data: any } | null>(null);

  useEffect(() => {
    studentService.getStudents({ limit: 100 }).then((res) => setStudents(res.data)).catch(() => setStudents([]));
  }, []);

  const metrics = { attendanceRate: Number(attendanceRate), averageGrade: Number(averageGrade) };

  const runAssessRisk = async () => {
    if (!studentId) { toast.error('Select a student first'); return; }
    setBusy('risk');
    try {
      const res = await aiService.assessRisk(studentId, metrics);
      setResult({ label: 'Risk Assessment', data: res.data });
    } catch {
      toast.error('Failed to assess risk');
    } finally {
      setBusy(null);
    }
  };

  const runDetectAnomalies = async () => {
    if (!studentId) { toast.error('Select a student first'); return; }
    setBusy('anomalies');
    try {
      const res = await aiService.detectAnomalies(studentId, metrics);
      setResult({ label: 'Anomaly Detection', data: res.data });
    } catch {
      toast.error('Failed to detect anomalies');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-blue-600" />
          AI Insights
        </h1>
        <p className="text-gray-600 mt-1">Risk assessment and anomaly detection from student metrics</p>
        <p className="text-xs text-gray-400 mt-1">
          The backend accepts arbitrary metrics and returns model output as-is — results are shown raw rather
          than forced into a specific chart the API doesn&apos;t promise.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Student</Label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Attendance Rate (%)</Label>
            <Input type="number" min={0} max={100} value={attendanceRate} onChange={(e) => setAttendanceRate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Average Grade (%)</Label>
            <Input type="number" min={0} max={100} value={averageGrade} onChange={(e) => setAverageGrade(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={runAssessRisk} disabled={busy !== null} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          {busy === 'risk' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          Assess Risk
        </Button>
        <Button onClick={runDetectAnomalies} disabled={busy !== null} variant="outline" className="flex items-center gap-2">
          {busy === 'anomalies' ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          Detect Anomalies
        </Button>
      </div>

      {result && (
        <Card>
          <CardHeader><CardTitle className="text-base">{result.label}</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
