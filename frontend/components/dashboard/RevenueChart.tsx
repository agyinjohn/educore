'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function RevenueChart() {
  const data = [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 12300 },
    { month: 'Mar', revenue: 9800 },
    { month: 'Apr', revenue: 15600 },
    { month: 'May', revenue: 18900 },
    { month: 'Jun', revenue: 16700 },
  ];

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = Math.round(totalRevenue / data.length);
  const growth = Math.round(
    ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue) * 100
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Monthly Revenue</span>
          <div className="flex items-center gap-2 text-sm font-normal text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>{growth}% growth</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Area chart visualization */}
          <div className="flex items-end justify-between h-64 gap-1">
            {data.map((item, index) => {
              const height = (item.revenue / maxRevenue) * 100;
              const isLast = index === data.length - 1;
              return (
                <div key={item.month} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex items-end justify-center h-48">
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-80 cursor-pointer ${
                        isLast
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-blue-600 to-blue-400'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${item.month}: $${item.revenue.toLocaleString()}`}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-2">
                    {item.month}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${(item.revenue / 1000).toFixed(1)}k
                  </p>
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                ${(totalRevenue / 1000).toFixed(1)}k
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Average Monthly</p>
              <p className="text-lg font-bold text-gray-900">
                ${(avgRevenue / 1000).toFixed(1)}k
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Peak Month</p>
              <p className="text-lg font-bold text-gray-900">
                {data.reduce((max, d) => (d.revenue > max.revenue ? d : max))
                  .month}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
