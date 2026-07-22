'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/auth.context';
import { analyticsService } from '@/lib/services';
import KPICard from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await analyticsService.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Use mock data for demo
        setMetrics({
          totalStudents: 1234,
          totalCourses: 45,
          totalRevenue: 125000,
          attendanceRate: 92.5,
          studentGrowth: { value: 156, percentage: 12.5, isPositive: true },
          courseGrowth: { value: 5, percentage: 11.1, isPositive: true },
          revenueGrowth: { value: 15000, percentage: 13.6, isPositive: true },
          attendanceChange: { value: 2.3, percentage: 2.5, isPositive: true },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Enroll a new student',
      href: '/dashboard/students/new',
      icon: Users,
    },
    {
      title: 'New Course',
      description: 'Create a new course',
      href: '/dashboard/courses/new',
      icon: BookOpen,
    },
    {
      title: 'View Reports',
      description: 'Check latest reports',
      href: '/dashboard/reports',
      icon: FileText,
    },
    {
      title: 'Financial Report',
      description: 'View finance summary',
      href: '/dashboard/finance',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening at your institution today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </>
        ) : (
          <>
            <KPICard
              title="Total Students"
              value={metrics?.totalStudents || 0}
              change={metrics?.studentGrowth}
              icon={Users}
              description="Enrolled this month"
              onClick={() => {}}
            />
            <KPICard
              title="Active Courses"
              value={metrics?.totalCourses || 0}
              change={metrics?.courseGrowth}
              icon={BookOpen}
              description="Ongoing courses"
              onClick={() => {}}
            />
            <KPICard
              title="Revenue"
              value={`$${(metrics?.totalRevenue / 1000).toFixed(1)}k`}
              change={metrics?.revenueGrowth}
              icon={DollarSign}
              description="This month"
              onClick={() => {}}
            />
            <KPICard
              title="Attendance Rate"
              value={`${metrics?.attendanceRate || 0}%`}
              change={metrics?.attendanceChange}
              icon={TrendingUp}
              description="Average attendance"
              onClick={() => {}}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Icon className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Activity item {i}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(Date.now() - i * 3600000).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Get Started */}
      {user?.role === 'admin' && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Getting Started Guide
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Learn how to manage your institution effectively
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                View Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
