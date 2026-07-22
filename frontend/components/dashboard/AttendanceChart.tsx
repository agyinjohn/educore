'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AttendanceChart() {
  const data = [
    { class: '10-A', rate: 95 },
    { class: '10-B', rate: 88 },
    { class: '9-A', rate: 92 },
    { class: '9-B', rate: 85 },
    { class: '8-A', rate: 98 },
    { class: '8-B', rate: 91 },
  ];

  const avgAttendance =
    Math.round((data.reduce((sum, d) => sum + d.rate, 0) / data.length) * 10) /
    10;

  const getColor = (rate: number) => {
    if (rate >= 95) return 'from-green-500 to-green-400';
    if (rate >= 90) return 'from-blue-500 to-blue-400';
    if (rate >= 85) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance by Class</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.class} className="flex items-center gap-4">
              <div className="w-16">
                <p className="text-sm font-medium text-gray-700">{item.class}</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getColor(item.rate)} transition-all`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right">
                <p className="text-sm font-bold text-gray-900">{item.rate}%</p>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t mt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Attendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {avgAttendance}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
