'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { financeService, Invoice, Fee, InvoiceStatus } from '@/lib/services/finance.service';
import { studentService, Student } from '@/lib/services/student.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, X, Loader2, Send, Check } from 'lucide-react';
import { toast } from 'sonner';

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-500',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const INITIAL_FORM = { studentId: '', feeIds: [] as string[], dueDate: '', notes: '' };

export default function InvoicesPage() {
  const { schoolId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(INITIAL_FORM);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const [invRes, feeRes, stuRes] = await Promise.all([
        financeService.listInvoices(schoolId, { status: statusFilter || undefined }),
        financeService.listFees(schoolId),
        studentService.getStudents({ limit: 100 }),
      ]);
      setInvoices(invRes.data);
      setFees(feeRes.data);
      const body = stuRes.data as any;
      setStudents(body.data ?? body.students ?? []);
    } catch {
      toast.error('Could not reach the finance service');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleFee = (id: string) => {
    setForm((prev) => ({
      ...prev,
      feeIds: prev.feeIds.includes(id) ? prev.feeIds.filter((f) => f !== id) : [...prev.feeIds, id],
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    if (!form.studentId || form.feeIds.length === 0 || !form.dueDate) {
      toast.error('Select a student, at least one fee, and a due date');
      return;
    }
    setSaving(true);
    try {
      await financeService.generateInvoice({
        schoolId,
        studentId: form.studentId,
        feeIds: form.feeIds,
        dueDate: new Date(form.dueDate).toISOString(),
        notes: form.notes || undefined,
      });
      toast.success('Invoice generated');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (invoice: Invoice) => {
    const email = prompt('Send invoice to which email?');
    if (!email) return;
    setSendingId(invoice.id);
    try {
      await financeService.sendInvoice(invoice.id, email);
      toast.success('Invoice sent');
      load();
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setSendingId(null);
    }
  };

  const markPaid = async (invoice: Invoice) => {
    try {
      await financeService.updateInvoiceStatus(invoice.id, 'paid');
      toast.success('Invoice marked as paid');
      load();
    } catch {
      toast.error('Failed to update invoice');
    }
  };

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/finance">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 text-sm">Generate, send, and track student invoices</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generate Invoice</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Student <span className="text-red-500">*</span></Label>
                  <select
                    value={form.studentId}
                    onChange={(e) => set('studentId', e.target.value)}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Due Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} disabled={saving} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Fees <span className="text-red-500">*</span></Label>
                {fees.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No fees in the catalog yet. <Link href="/dashboard/finance/fee-structures" className="text-blue-600 hover:underline">Create one</Link> first.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
                    {fees.map((f) => (
                      <label key={f.id} className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                        <span className="flex items-center gap-2">
                          <input type="checkbox" checked={form.feeIds.includes(f.id)} onChange={() => toggleFee(f.id)} />
                          {f.name}
                        </span>
                        <span className="text-gray-500">{fmt(f.amount)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Notes</Label>
                <Input value={form.notes} onChange={(e) => set('notes', e.target.value)} disabled={saving} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generate Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {['', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Invoice #</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Due Date</th>
                    <th className="pb-3 pr-4 text-right font-medium text-gray-600">Total</th>
                    <th className="pb-3 pr-4 text-right font-medium text-gray-600">Outstanding</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Status</th>
                    <th className="pb-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-700">{inv.invoiceNumber}</td>
                      <td className="py-3 pr-4 text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-gray-900">{fmt(inv.totalAmount)}</td>
                      <td className="py-3 pr-4 text-right text-gray-600">{fmt(inv.outstandingAmount)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" disabled={sendingId === inv.id} onClick={() => handleSend(inv)} className="flex items-center gap-1">
                            <Send className="h-3.5 w-3.5" />
                            Send
                          </Button>
                          {inv.status !== 'paid' && (
                            <Button size="sm" variant="outline" onClick={() => markPaid(inv)} className="flex items-center gap-1 text-green-600 hover:text-green-700">
                              <Check className="h-3.5 w-3.5" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
