'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { notificationService, NotificationChannel, AudienceType, MessageTemplate } from '@/lib/services/notification.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Loader2, Bell, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const CHANNELS: NotificationChannel[] = ['email', 'sms', 'push', 'in_app'];
const AUDIENCES: AudienceType[] = ['all_parents', 'all_staff', 'all_students', 'custom'];

const INITIAL_FORM = { title: '', body: '', channels: ['in_app'] as NotificationChannel[], audience: 'all_parents' as AudienceType };

export default function NotificationsPage() {
  const { user, schoolId } = useAuth();
  const canCompose = user?.role === 'SCHOOL_ADMIN';

  const [myNotifications, setMyNotifications] = useState<any[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const load = useCallback(async () => {
    if (!schoolId || !user) return;
    setIsLoading(true);
    try {
      const requests: Promise<any>[] = [notificationService.getNotificationsForRecipient(user.id, schoolId)];
      if (canCompose) requests.push(notificationService.getTemplates(schoolId));
      const results = await Promise.all(requests);
      setMyNotifications(results[0].data ?? []);
      if (canCompose) setTemplates(results[1]?.data ?? []);
    } catch {
      toast.error('Could not reach the notification service');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, user, canCompose]);

  useEffect(() => { load(); }, [load]);

  const toggleChannel = (c: NotificationChannel) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(c) ? prev.channels.filter((x) => x !== c) : [...prev.channels, c],
    }));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    if (!form.title.trim() || !form.body.trim() || form.channels.length === 0) {
      toast.error('Title, body, and at least one channel are required');
      return;
    }
    setSending(true);
    try {
      await notificationService.sendBulkNotification({
        schoolId,
        title: form.title,
        body: form.body,
        channels: form.channels,
        audience: { type: form.audience },
      });
      toast.success('Notification queued for sending');
      setForm(INITIAL_FORM);
      load();
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Bulk announcements and your inbox</p>
        </div>
        <Link href="/dashboard/notifications/broadcasts">
          <Button variant="outline" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Emergency Broadcasts
          </Button>
        </Link>
      </div>

      {canCompose && (
        <Card>
          <CardHeader><CardTitle className="text-base">Send Notification</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Title <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} disabled={sending} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Audience</Label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value as AudienceType }))}
                    disabled={sending}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AUDIENCES.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Message <span className="text-red-500">*</span></Label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
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
                        form.channels.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {c.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 min-w-[120px]">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {canCompose && templates.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="p-3 border border-gray-200 rounded-lg">
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.title}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" />My Notifications</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : myNotifications.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {myNotifications.map((n, i) => (
                <div key={n.id || i} className="p-3 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
