'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent } from '@/components/ui/card';
import { User, Building2, ChevronRight } from 'lucide-react';

const ADMIN_ROLES = ['SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN'];

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  const items = [
    { href: '/dashboard/settings/profile', label: 'Profile', desc: 'Account details and password', icon: User, show: true },
    { href: '/dashboard/settings/school', label: 'School', desc: 'Institution details and configuration', icon: Building2, show: isAdmin },
  ].filter((i) => i.show);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and school settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
