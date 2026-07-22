'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  description?: string;
  onClick?: () => void;
}

export default function KPICard({
  title,
  value,
  change,
  icon: Icon,
  description,
  onClick,
}: KPICardProps) {
  return (
    <Card
      onClick={onClick}
      className={onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>

        {change && (
          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.isPositive ? '+' : '-'}{change.percentage}%
            </span>
            <span className="text-xs text-gray-500">
              {change.value} {change.isPositive ? 'increase' : 'decrease'}
            </span>
          </div>
        )}

        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
