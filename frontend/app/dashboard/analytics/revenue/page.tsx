'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { financeService } from '@/lib/services/finance.service';
import { useAuth } from '@/lib/contexts/auth.context';
import MetricCategoryPanel from '@/components/analytics/MetricCategoryPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function RevenueAnalyticsPage() {
  const { schoolId } = useAuth();
  const [totalCollected, setTotalCollected] = useState<number | null>(null);
  const [totalOutstanding, setTotalOutstanding] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;
    const load = async () => {
      try {
        const [completedRes, outstandingRes] = await Promise.all([
          financeService.getPaymentsByStatus(schoolId, 'completed', 100),
          financeService.getOutstandingPayments(schoolId),
        ]);
        setTotalCollected(completedRes.data.reduce((sum, p) => sum + p.amount, 0));
        setTotalOutstanding(outstandingRes.data.reduce((sum, p) => sum + p.amount, 0));
      } catch {
        toast.error('Could not reach the finance service');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [schoolId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/analytics">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 text-sm">Collections and outstanding balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-gray-500">Total Collected</p>
            {isLoading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <p className="text-2xl font-bold text-green-600 mt-1">{fmt(totalCollected ?? 0)}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Last 100 completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-sm text-gray-500">Outstanding</p>
            {isLoading ? <Skeleton className="h-8 w-32 mt-1" /> : (
              <p className="text-2xl font-bold text-red-600 mt-1">{fmt(totalOutstanding ?? 0)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <MetricCategoryPanel category="finance" title="Finance Metrics" />
    </div>
  );
}
