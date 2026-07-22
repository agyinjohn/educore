'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notificationService, ThreadMessage } from '@/lib/services/notification.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user, schoolId } = useAuth();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const res = await notificationService.getThreadMessages(threadId, schoolId);
      setMessages(res.data);
    } catch {
      toast.error('Could not load messages');
    } finally {
      setIsLoading(false);
    }
  }, [threadId, schoolId]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !draft.trim()) return;
    setSending(true);
    try {
      await notificationService.sendMessage(threadId, schoolId, draft);
      setDraft('');
      load();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/messages">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Conversation</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-2/3" />)}</div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No messages yet — say hello.</p>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <p>{m.message}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                      {m.senderRole} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" disabled={sending || !draft.trim()} className="bg-blue-600 hover:bg-blue-700">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
