'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { notificationService, MessageThread } from '@/lib/services/notification.service';
import { studentService, Student } from '@/lib/services/student.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, X, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const TEACHER_ROLES = ['TEACHER', 'ACADEMIC_HEAD'];

export default function MessagesPage() {
  const { user, schoolId } = useAuth();
  const isTeacher = !!user && TEACHER_ROLES.includes(user.role);
  const isParent = user?.role === 'PARENT';

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: '', otherPartyId: '' });

  const load = useCallback(async () => {
    if (!schoolId || !user) return;
    setIsLoading(true);
    try {
      const res = isTeacher
        ? await notificationService.getTeacherThreads(user.id, schoolId)
        : await notificationService.getParentThreads(user.id, schoolId);
      setThreads(res.data);
      if (isTeacher) {
        const stuRes = await studentService.getStudents({ limit: 100 });
        setStudents(stuRes.data);
      }
    } catch {
      toast.error('Could not reach the messaging service');
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, user, isTeacher]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !user) return;
    if (!form.studentId || !form.otherPartyId.trim()) {
      toast.error('Select a student and enter the other party’s user ID');
      return;
    }
    setSaving(true);
    try {
      const parentId = isTeacher ? form.otherPartyId : user.id;
      const teacherId = isTeacher ? user.id : form.otherPartyId;
      await notificationService.getOrCreateThread(schoolId, parentId, teacherId, form.studentId);
      toast.success('Thread ready');
      setShowForm(false);
      setForm({ studentId: '', otherPartyId: '' });
      load();
    } catch {
      toast.error('Failed to start thread');
    } finally {
      setSaving(false);
    }
  };

  if (!isTeacher && !isParent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Parent-teacher messaging</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-sm text-gray-500">
            Messaging is only available to parent and teacher accounts.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Conversations about your students</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Thread
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Start a Conversation</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Student</Label>
                {isTeacher ? (
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select student</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                ) : (
                  <Input value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} placeholder="Student ID" disabled={saving} />
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{isTeacher ? 'Parent User ID' : 'Teacher User ID'}</Label>
                <Input value={form.otherPartyId} onChange={(e) => setForm((p) => ({ ...p, otherPartyId: e.target.value }))} disabled={saving} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Thread'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : threads.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No conversations yet.</p>
          ) : (
            <div className="space-y-2">
              {threads.map((t) => (
                <Link key={t.id} href={`/dashboard/messages/${t.id}`}>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Student {t.studentId}</p>
                        <p className="text-xs text-gray-500">
                          {isTeacher ? `Parent ${t.parentId}` : `Teacher ${t.teacherId}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{t.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
