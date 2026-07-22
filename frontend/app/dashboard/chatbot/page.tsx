'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { chatbotService, FAQ } from '@/lib/services/chatbot.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, X, Loader2, Trash2, MessageCircleQuestion, Search } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_FORM = { question: '', answer: '', category: 'general', keywords: '' };

export default function ChatbotPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await chatbotService.getFAQs();
      setFaqs(res.data);
    } catch {
      setFaqs([]);
      toast.error('Could not reach the chatbot service');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = async () => {
    if (!search.trim()) { load(); return; }
    setIsLoading(true);
    try {
      const res = await chatbotService.searchFAQs(search);
      setFaqs(res.data);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim() || !form.keywords.trim()) {
      toast.error('Question, answer, and keywords are required');
      return;
    }
    setSaving(true);
    try {
      await chatbotService.createFAQ({
        question: form.question,
        answer: form.answer,
        category: form.category,
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      });
      toast.success('FAQ created');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch {
      toast.error('Failed to create FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await chatbotService.deleteFAQ(id);
      toast.success('FAQ deleted');
      load();
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot FAQs</h1>
          <p className="text-gray-600 mt-1">Manage the knowledge base the student chatbot draws from</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New FAQ
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQs by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New FAQ</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Question <span className="text-red-500">*</span></Label>
                <Input value={form.question} onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Answer <span className="text-red-500">*</span></Label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
                  disabled={saving}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Category</Label>
                  <Input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} disabled={saving} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Keywords (comma separated) <span className="text-red-500">*</span></Label>
                  <Input value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} placeholder="fees, payment, due date" disabled={saving} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create FAQ'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : faqs.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No FAQs yet.</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.id} className="p-3 border border-gray-200 rounded-lg flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                      <MessageCircleQuestion className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{f.question}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{f.answer}</p>
                      <p className="text-xs text-gray-400 mt-1">{f.category} · {f.keywords?.join(', ')}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
