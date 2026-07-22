'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/lib/components/protected-route';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Mobile Navigation */}
          <MobileNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Breadcrumb />
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
