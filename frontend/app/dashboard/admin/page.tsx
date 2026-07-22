'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ChevronRight, Users, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-600 mt-1">Institution-wide configuration</p>
      </div>

      <Link href="/dashboard/settings/school">
        <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">School Settings</p>
                  <p className="text-sm text-gray-500 mt-0.5">Edit institution details</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </Link>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <ShieldAlert className="h-4 w-4" />
            User &amp; role management isn&apos;t available yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-900 flex items-start gap-2">
            <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
            The auth service currently only supports registration, login, and password
            management for the account that signs up — there&apos;s no backend endpoint yet to list
            users, assign roles, or manage permissions for a school. This page will grow once
            that API exists rather than shipping a management screen with nothing real behind it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
