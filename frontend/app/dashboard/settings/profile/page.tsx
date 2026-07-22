'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      toast.error('Fill in both password fields');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success('Password changed — please sign in again');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm">Your account details</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Email</p>
            <p className="text-gray-900 font-medium">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Role</p>
            <p className="text-gray-900 font-medium">{user?.role || '—'}</p>
          </div>
          <p className="sm:col-span-2 text-xs text-gray-400">
            The auth service doesn&apos;t yet expose an endpoint to edit name or other profile fields —
            only password changes are supported today.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Current Password</Label>
              <Input type="password" value={form.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">New Password</Label>
              <Input type="password" value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Confirm New Password</Label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} disabled={isLoading} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
