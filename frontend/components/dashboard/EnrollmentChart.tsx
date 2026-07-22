'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EnrollmentChart() {
  const data = [
    { month: 'Jan', students: 120 },
    { month: 'Feb', students: 190 },
    { month: 'Mar', students: 150 },
    { month: 'Apr', students: 220 },
    { month: 'May', students: 280 },
    { month: 'Jun', students: 250 },
  ];

  const maxValue = Math.max(...data.map((d) => d.students));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Enrollment Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Simple bar chart visualization */}
          <div className="flex items-end justify-between h-64 gap-2">
            {data.map((item) => {
              const height = (item.students / maxValue) * 100;
              return (
                <div key={item.month} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex items-end justify-center h-48">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${item.month}: ${item.students} students`}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-2">
                    {item.month}
                  </p>
                  <p className="text-xs text-gray-500">{item.students}</p>
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-600">Total Enrolled</p>
              <p className="text-lg font-bold text-gray-900">
                {data.reduce((sum, d) => sum + d.students, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Average</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round(
                  data.reduce((sum, d) => sum + d.students, 0) / data.length
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Peak Month</p>
              <p className="text-lg font-bold text-gray-900">
                {
                  data.reduce((max, d) =>
                    d.students > max.students ? d : max
                  ).month
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
