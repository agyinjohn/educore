'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { financeService, Payment, Fee, PaymentMethod, PaymentStatus } from '@/lib/services/finance.service';
import { studentService, Student } from '@/lib/services/student.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Plus, X, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const METHODS: PaymentMethod[] = ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi'];

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const INITIAL_FORM = {
  studentId: '', feeIds: [] as string[], paymentMethod: 'cash' as PaymentMethod,
  payerName: '', payerEmail: '', payerPhone: '',
};

export default function PaymentsPage() {
  const { schoolId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const [payRes, feeRes, stuRes] = await Promise.all([
        financeService.getOutstandingPayments(schoolId),
        financeService.listFees(schoolId),
        studentService.getStudents({ limit: 100 }),
      ]);
      setPayments(payRes.data);
      setFees(feeRes.data);
      setStudents(stuRes.data);
    } catch {
      toast.error('Could not reach the finance service');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  const selectedTotal = fees.filter((f) => form.feeIds.includes(f.id)).reduce((sum, f) => sum + f.amount, 0);

  const toggleFee = (id: string) => {
    setForm((prev) => ({
      ...prev,
      feeIds: prev.feeIds.includes(id) ? prev.feeIds.filter((f) => f !== id) : [...prev.feeIds, id],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    if (!form.studentId || form.feeIds.length === 0) {
      toast.error('Select a student and at least one fee');
      return;
    }
    setSaving(true);
    try {
      await financeService.recordPayment({
        schoolId,
        studentId: form.studentId,
        feeIds: form.feeIds,
        amount: selectedTotal,
        paymentMethod: form.paymentMethod,
        payerName: form.payerName,
        payerEmail: form.payerEmail,
        payerPhone: form.payerPhone || undefined,
      });
      toast.success('Payment recorded');
      setShowForm(false);
      setForm(INITIAL_FORM);
      load();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async (id: string) => {
    if (!schoolId || !confirm('Refund this payment?')) return;
    try {
      await financeService.refundPayment(id, schoolId);
      toast.success('Payment refunded');
      load();
    } catch {
      toast.error('Failed to refund payment');
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
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 text-sm">Record payments and track outstanding balances</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Record Payment</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
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
                  <Label className="text-sm">Payment Method</Label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => set('paymentMethod', e.target.value)}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                  </select>
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
                <p className="text-sm font-medium text-gray-700">Total: {fmt(selectedTotal)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Payer Name <span className="text-red-500">*</span></Label>
                  <Input value={form.payerName} onChange={(e) => set('payerName', e.target.value)} required disabled={saving} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Payer Email <span className="text-red-500">*</span></Label>
                  <Input type="email" value={form.payerEmail} onChange={(e) => set('payerEmail', e.target.value)} required disabled={saving} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Payer Phone</Label>
                  <Input value={form.payerPhone} onChange={(e) => set('payerPhone', e.target.value)} disabled={saving} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Record Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outstanding Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No outstanding payments.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Payer</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Reference</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Method</th>
                    <th className="pb-3 pr-4 text-right font-medium text-gray-600">Amount</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Status</th>
                    <th className="pb-3 text-right font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-900">{p.payerName}</div>
                        <div className="text-xs text-gray-500">{p.payerEmail}</div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-gray-600">{p.referenceNumber}</td>
                      <td className="py-3 pr-4 text-gray-600 capitalize">{p.paymentMethod.replace('_', ' ')}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-gray-900">{fmt(p.amount)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        {p.status === 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => handleRefund(p.id)} className="flex items-center gap-1 text-red-600 hover:text-red-700">
                            <RotateCcw className="h-3.5 w-3.5" />
                            Refund
                          </Button>
                        )}
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
