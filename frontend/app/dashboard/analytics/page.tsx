'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnrollmentChart from '@/components/dashboard/EnrollmentChart';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { Download, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('month');

  const dateRanges = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor your institution's performance and trends
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">Date Range:</span>
            <div className="flex gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentChart />
        <RevenueChart />
      </div>

      <div>
        <AttendanceChart />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">87.5%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Students completing courses
                  </p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[87.5%] bg-gradient-to-r from-emerald-600 to-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">78.3</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Out of 100 points
                  </p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[78.3%] bg-gradient-to-r from-blue-600 to-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">1,245</p>
                  <p className="text-sm text-gray-600 mt-1">
                    This month
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-600 font-medium">
                ↑ 8.2% from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <span className="font-medium">Student enrollment</span> is up 12.5% this month, with highest growth in junior classes.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <span className="font-medium">Revenue growth</span> of 96% compared to January, driven by course registrations.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <span className="font-medium">Attendance rates</span> in Class 9-B (85%) need improvement. Consider targeted intervention.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
