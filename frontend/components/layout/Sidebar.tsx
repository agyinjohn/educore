'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  Bell,
  MessageSquare,
  Sparkles,
  MessageCircleQuestion,
  Menu,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Role values must match the backend's Role enum (@educore/shared) exactly —
// the JWT carries roles like 'SCHOOL_ADMIN', not 'admin'.
const ADMIN_ROLES = ['SUPER_ADMIN', 'SCHOOL_OWNER', 'SCHOOL_ADMIN'];
const STAFF_ROLES = [...ADMIN_ROLES, 'ACADEMIC_HEAD', 'TEACHER'];
// Matches the gateway's Resource.REPORT permission grants (@educore/shared) — TEACHER isn't included.
const REPORT_ROLES = [...ADMIN_ROLES, 'ACADEMIC_HEAD', 'ACCOUNTANT', 'HR_MANAGER'];
const EVERYONE = [...STAFF_ROLES, 'ACCOUNTANT', 'HR_MANAGER', 'LIBRARIAN', 'TRANSPORT_COORDINATOR', 'WARDEN', 'STUDENT', 'PARENT'];

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: EVERYONE,
  },
  {
    name: 'Students',
    href: '/dashboard/students',
    icon: Users,
    roles: STAFF_ROLES,
  },
  {
    name: 'Classes',
    href: '/dashboard/classes',
    icon: BookOpen,
    roles: STAFF_ROLES,
  },
  {
    name: 'Finance',
    href: '/dashboard/finance',
    icon: DollarSign,
    roles: [...ADMIN_ROLES, 'ACCOUNTANT'],
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    roles: STAFF_ROLES,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    roles: EVERYONE,
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    roles: [...STAFF_ROLES, 'PARENT'],
  },
  {
    name: 'AI Insights',
    href: '/dashboard/ai-insights',
    icon: Sparkles,
    roles: STAFF_ROLES,
  },
  {
    name: 'Chatbot',
    href: '/dashboard/chatbot',
    icon: MessageCircleQuestion,
    roles: STAFF_ROLES,
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    roles: REPORT_ROLES,
  },
  {
    name: 'Admin',
    href: '/dashboard/admin',
    icon: ShieldCheck,
    roles: ADMIN_ROLES,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: EVERYONE,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 h-screen w-64 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="font-bold">EduCore</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
