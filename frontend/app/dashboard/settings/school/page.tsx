'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { tenantService, School } from '@/lib/services/tenant.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchoolSettingsPage() {
  const { schoolId } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', website: '' });

  useEffect(() => {
    if (!schoolId) return;
    tenantService.getSchool(schoolId)
      .then((res) => {
        setSchool(res.data);
        setForm({
          name: res.data.name || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          website: res.data.website || '',
        });
      })
      .catch(() => toast.error('Could not load school details'))
      .finally(() => setIsLoading(false));
  }, [schoolId]);

  const set = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    setSaving(true);
    try {
      await tenantService.updateSchool(schoolId, form);
      toast.success('School details updated');
    } catch {
      toast.error('Failed to update school details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School</h1>
          <p className="text-gray-600 text-sm">Institution details</p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !school ? (
        <p className="text-sm text-gray-500">Could not load school details.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{school.name}</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              {school.subdomain}.educore.app · {school.subscriptionTier} · {school.status}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Name</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Phone</Label>
                <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Website</Label>
                <Input value={form.website} onChange={(e) => set('website', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-sm">Address</Label>
                <Input value={form.address} onChange={(e) => set('address', e.target.value)} disabled={saving} />
              </div>
              <div className="sm:col-span-2 flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
