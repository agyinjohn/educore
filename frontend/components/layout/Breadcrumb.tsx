'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Students',
  classes: 'Classes',
  finance: 'Finance',
  analytics: 'Analytics',
  reports: 'Reports',
  settings: 'Settings',
  admin: 'Admin',
  new: 'New',
  edit: 'Edit',
  import: 'Import',
  grades: 'Grades',
  attendance: 'Attendance',
  assessments: 'Assessments',
  timetable: 'Timetable',
  profile: 'Profile',
  school: 'School',
  'fee-structures': 'Fees',
  'student-fees': 'Student Fees',
  payments: 'Payments',
  invoices: 'Invoices',
  academic: 'Academic',
  revenue: 'Revenue',
  'custom-reports': 'Custom Reports',
};

// Mongo ObjectIds and similar opaque IDs shouldn't be shown raw in the trail.
const ID_PATTERN = /^[a-f0-9]{20,}$|^[a-zA-Z0-9_-]{10,}$/;

function labelFor(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (ID_PATTERN.test(segment)) return 'Details';
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  let href = '';
  const crumbs = segments.map((segment, i) => {
    href += `/${segment}`;
    return { href, label: labelFor(segment), isLast: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 flex-wrap">
      <Link href="/dashboard" className="flex items-center hover:text-gray-700">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c) => (
        <React.Fragment key={c.href}>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          {c.isLast ? (
            <span className="text-gray-900 font-medium">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-gray-700">{c.label}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
