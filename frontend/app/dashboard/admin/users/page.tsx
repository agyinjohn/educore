'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { authService, ManagedUser } from '@/lib/services/auth.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  'SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN', 'ACADEMIC_HEAD',
  'TEACHER', 'ACCOUNTANT', 'HR_MANAGER', 'LIBRARIAN',
  'TRANSPORT_COORDINATOR', 'STUDENT', 'PARENT', 'WARDEN',
];

export default function UsersAdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch {
      toast.error('Could not load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (u: ManagedUser, role: string) => {
    setSavingId(u.id);
    try {
      await authService.updateUser(u.id, { role });
      toast.success(`${u.email} is now ${role}`);
      load();
    } catch {
      toast.error('Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (u: ManagedUser) => {
    setSavingId(u.id);
    try {
      await authService.updateUser(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? `${u.email} deactivated` : `${u.email} reactivated`);
      load();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600 text-sm">Manage accounts in your school</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Email</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Role</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">MFA</th>
                    <th className="pb-3 pr-4 text-left font-medium text-gray-600">Status</th>
                    <th className="pb-3 text-right font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {u.email}
                        {u.id === currentUser?.id && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value)}
                          disabled={savingId === u.id || u.id === currentUser?.id}
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{u.mfaEnabled ? 'Enabled' : '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={savingId === u.id || u.id === currentUser?.id}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-300 flex items-center gap-1 ml-auto"
                        >
                          {savingId === u.id && <Loader2 className="h-3 w-3 animate-spin" />}
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
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
