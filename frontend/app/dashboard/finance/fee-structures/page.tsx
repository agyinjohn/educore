'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { financeService, Fee, FeeType, FeeFrequency } from '@/lib/services/finance.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, X, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const FEE_TYPES: FeeType[] = ['tuition', 'transport', 'meal', 'sports', 'other'];
const FREQUENCIES: FeeFrequency[] = ['once', 'monthly', 'quarterly', 'annually'];

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
})();

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const INITIAL_FORM = {
  name: '', description: '', amount: 0,
  feeType: 'tuition' as FeeType, frequency: 'annually' as FeeFrequency,
  academicYear: CURRENT_ACADEMIC_YEAR,
};

export default function FeesPage() {
  const { schoolId } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchFees = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const res = await financeService.listFees(schoolId, { academicYear: form.academicYear });
      setFees(res.data);
    } catch {
      toast.error('Could not reach the finance service');
      setFees([]);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, form.academicYear]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    setSaving(true);
    try {
      await financeService.createFee({ schoolId, ...form });
      toast.success('Fee created');
      setShowForm(false);
      fetchFees();
    } catch {
      toast.error('Failed to save fee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!schoolId || !confirm('Delete this fee?')) return;
    try {
      await financeService.deleteFee(id, schoolId);
      toast.success('Fee deleted');
      fetchFees();
    } catch {
      toast.error('Failed to delete fee');
    }
  };

  const set = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

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
            <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
            <p className="text-gray-600 text-sm">Manage the fee catalog for {form.academicYear}</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Fee
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Fee</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                <Input placeholder="Tuition Fee" value={form.name} onChange={(e) => set('name', e.target.value)} required disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Amount <span className="text-red-500">*</span></Label>
                <Input type="number" min={0} value={form.amount} onChange={(e) => set('amount', Number(e.target.value))} required disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Fee Type</Label>
                <select
                  value={form.feeType}
                  onChange={(e) => set('feeType', e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FEE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Frequency</Label>
                <select
                  value={form.frequency}
                  onChange={(e) => set('frequency', e.target.value)}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Academic Year</Label>
                <Input value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                <Label className="text-sm">Description</Label>
                <Input value={form.description} onChange={(e) => set('description', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : fees.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No fees yet for {form.academicYear}. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fees.map((fee) => (
            <Card key={fee.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{fee.name}</CardTitle>
                    <p className="text-sm text-gray-500 capitalize">{fee.feeType} · {fee.frequency}</p>
                  </div>
                  <button onClick={() => handleDelete(fee.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {fee.description && <p className="text-sm text-gray-500 mb-2">{fee.description}</p>}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{fee.isActive ? 'Active' : 'Inactive'}</span>
                  <p className="text-lg font-bold text-gray-900">{fmt(fee.amount)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
