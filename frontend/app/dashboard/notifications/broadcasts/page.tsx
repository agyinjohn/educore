'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { notificationService, NotificationChannel, BroadcastPriority, EmergencyBroadcast } from '@/lib/services/notification.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CHANNELS: NotificationChannel[] = ['email', 'sms', 'push', 'in_app'];
const PRIORITIES: BroadcastPriority[] = ['routine', 'urgent', 'emergency'];

const PRIORITY_COLORS: Record<BroadcastPriority, string> = {
  routine: 'bg-gray-100 text-gray-700',
  urgent: 'bg-amber-100 text-amber-700',
  emergency: 'bg-red-100 text-red-700',
};

export default function BroadcastsPage() {
  const { user, schoolId } = useAuth();
  const canSend = user?.role === 'SCHOOL_ADMIN';

  const [broadcasts, setBroadcasts] = useState<EmergencyBroadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<BroadcastPriority>('emergency');
  const [channels, setChannels] = useState<NotificationChannel[]>(['email', 'sms', 'in_app']);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const res = await notificationService.getEmergencyBroadcasts(schoolId);
      setBroadcasts(res.data);
    } catch {
      toast.error('Could not reach the notification service');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const toggleChannel = (c: NotificationChannel) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    if (!title.trim() || !body.trim() || channels.length === 0) {
      toast.error('Title, body, and at least one channel are required');
      return;
    }
    setSending(true);
    try {
      await notificationService.sendEmergencyBroadcast(schoolId, title, body, channels, priority);
      toast.success('Emergency broadcast sent');
      setTitle('');
      setBody('');
      load();
    } catch {
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleConfirmRead = async (id: string) => {
    if (!schoolId) return;
    setConfirmingId(id);
    try {
      await notificationService.confirmReadReceipt(id, schoolId);
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to confirm read receipt');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/notifications">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Broadcasts</h1>
          <p className="text-gray-600 text-sm">School-wide alerts with mandatory read receipts</p>
        </div>
      </div>

      {canSend && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-4 w-4" />
              Send Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Title <span className="text-red-500">*</span></Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={sending} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Priority</Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as BroadcastPriority)}
                    disabled={sending}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Message <span className="text-red-500">*</span></Label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={sending}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Channels</Label>
                <div className="flex gap-2 flex-wrap">
                  {CHANNELS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleChannel(c)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors uppercase ${
                        channels.includes(c) ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={sending} className="bg-red-600 hover:bg-red-700 min-w-[140px]">
                  {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Broadcast'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : broadcasts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No broadcasts sent yet.</p>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-3 border border-gray-200 rounded-lg flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{b.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[b.priority]}`}>{b.priority}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{b.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(b.createdAt).toLocaleString()}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={confirmingId === b.id}
                    onClick={() => handleConfirmRead(b.id)}
                    className="flex items-center gap-1 flex-shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Read
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
