'use client';

import React, { useState, useEffect } from 'react';
import { financeService, FeeStructure } from '@/lib/services/finance.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const MOCK: FeeStructure[] = [
  {
    id: 'fs1', classId: 'Class 10', academicYear: '2024-25',
    tuitionFee: 1500, labFee: 200, libraryFee: 100, activityFee: 150,
    otherFees: { transportFee: 300 }, totalFee: 2250, dueDate: '2024-07-15',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'fs2', classId: 'Class 9', academicYear: '2024-25',
    tuitionFee: 1400, labFee: 180, libraryFee: 100, activityFee: 120,
    otherFees: {}, totalFee: 1800, dueDate: '2024-07-15',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function FeeStructuresPage() {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeeStructure | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    classId: '', academicYear: '',
    tuitionFee: 0, labFee: 0, libraryFee: 0, activityFee: 0, dueDate: '',
  });

  useEffect(() => {
    financeService.getFeeStructures()
      .then((res) => setStructures(res.data))
      .catch(() => setStructures(MOCK))
      .finally(() => setIsLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ classId: '', academicYear: '', tuitionFee: 0, labFee: 0, libraryFee: 0, activityFee: 0, dueDate: '' });
    setShowForm(true);
  };

  const openEdit = (fs: FeeStructure) => {
    setEditing(fs);
    setForm({
      classId: fs.classId, academicYear: fs.academicYear,
      tuitionFee: fs.tuitionFee, labFee: fs.labFee,
      libraryFee: fs.libraryFee, activityFee: fs.activityFee,
      dueDate: fs.dueDate,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const total = form.tuitionFee + form.labFee + form.libraryFee + form.activityFee;
      if (editing) {
        await financeService.updateFeeStructure(editing.id, { ...form, totalFee: total, otherFees: {} });
        toast.success('Fee structure updated');
        setStructures((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...form, totalFee: total } : s));
      } else {
        const res = await financeService.createFeeStructure({ ...form, totalFee: total, otherFees: {} });
        toast.success('Fee structure created');
        setStructures((prev) => [...prev, res.data]);
      }
      setShowForm(false);
    } catch {
      toast.error('Failed to save fee structure');
    } finally {
      setSaving(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>
            <p className="text-gray-600 text-sm">Manage fee plans by class and academic year</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Structure
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Edit' : 'New'} Fee Structure</CardTitle>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Class <span className="text-red-500">*</span></Label>
                <Input placeholder="Class 10" value={form.classId} onChange={(e) => set('classId', e.target.value)} required disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Academic Year <span className="text-red-500">*</span></Label>
                <Input placeholder="2024-25" value={form.academicYear} onChange={(e) => set('academicYear', e.target.value)} required disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} disabled={saving} />
              </div>
              {(['tuitionFee', 'labFee', 'libraryFee', 'activityFee'] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-sm capitalize">{key.replace('Fee', ' Fee')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(e) => set(key, Number(e.target.value))}
                    disabled={saving}
                  />
                </div>
              ))}
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
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : structures.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No fee structures yet. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {structures.map((fs) => (
            <Card key={fs.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{fs.classId}</CardTitle>
                    <p className="text-sm text-gray-500">{fs.academicYear}</p>
                  </div>
                  <button onClick={() => openEdit(fs)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <FeeRow label="Tuition" value={fmt(fs.tuitionFee)} />
                  <FeeRow label="Lab" value={fmt(fs.labFee)} />
                  <FeeRow label="Library" value={fmt(fs.libraryFee)} />
                  <FeeRow label="Activity" value={fmt(fs.activityFee)} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Total Fee</p>
                    <p className="text-lg font-bold text-gray-900">{fmt(fs.totalFee)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-medium text-gray-700">{new Date(fs.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
