'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  ChevronRight,
  Clock,
} from 'lucide-react';

// The finance service has no aggregate reporting endpoint yet — this is a
// static preview until backend reporting is built.
interface FinancialReport {
  totalFees: number;
  totalCollected: number;
  pendingAmount: number;
  overdueAmount: number;
  collectionPercentage: number;
  period: string;
}

const MOCK_REPORT: FinancialReport = {
  totalFees: 250000,
  totalCollected: 187500,
  pendingAmount: 45000,
  overdueAmount: 17500,
  collectionPercentage: 75,
  period: 'Fall 2024',
};

const MOCK_TRANSACTIONS = [
  { id: 't1', student: 'Alice Johnson', amount: 2500, method: 'credit_card', date: '2024-05-20', status: 'completed' },
  { id: 't2', student: 'Bob Smith', amount: 1800, method: 'bank_transfer', date: '2024-05-19', status: 'completed' },
  { id: 't3', student: 'Carol Davis', amount: 3200, method: 'cash', date: '2024-05-19', status: 'completed' },
  { id: 't4', student: 'David Wilson', amount: 950, method: 'check', date: '2024-05-18', status: 'pending' },
  { id: 't5', student: 'Eva Martinez', amount: 2100, method: 'debit_card', date: '2024-05-18', status: 'completed' },
];

const METHOD_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  check: 'Check',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-green-600 bg-green-50',
  pending: 'text-yellow-600 bg-yellow-50',
  failed: 'text-red-600 bg-red-50',
  refunded: 'text-gray-600 bg-gray-50',
};

export default function FinancePage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setReport(MOCK_REPORT);
    setIsLoading(false);
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600 mt-1">Track fees, payments, and revenue</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <FinanceKPI
              title="Total Revenue"
              value={fmt(report!.totalCollected)}
              sub={`of ${fmt(report!.totalFees)} billed`}
              icon={DollarSign}
              color="blue"
            />
            <FinanceKPI
              title="Collection Rate"
              value={`${report!.collectionPercentage}%`}
              sub="Fees collected"
              icon={TrendingUp}
              color="green"
            />
            <FinanceKPI
              title="Pending"
              value={fmt(report!.pendingAmount)}
              sub="Awaiting payment"
              icon={Clock}
              color="yellow"
            />
            <FinanceKPI
              title="Overdue"
              value={fmt(report!.overdueAmount)}
              sub="Past due date"
              icon={AlertTriangle}
              color="red"
            />
          </>
        )}
      </div>

      {/* Collection Progress */}
      {!isLoading && report && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Collection Progress — {report.period}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
                style={{ width: `${report.collectionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Collected: <strong className="text-gray-900">{fmt(report.totalCollected)}</strong></span>
              <span>Remaining: <strong className="text-gray-900">{fmt(report.totalFees - report.totalCollected)}</strong></span>
              <span>Total: <strong className="text-gray-900">{fmt(report.totalFees)}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/finance/fee-structures', label: 'Fee Structures', desc: 'Manage fee plans by class' },
          { href: '/dashboard/finance/payments', label: 'Payments', desc: 'Record & view all payments' },
          { href: '/dashboard/finance/invoices', label: 'Invoices', desc: 'Generate & send invoices' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Link href="/dashboard/finance/payments">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left font-medium text-gray-600">Student</th>
                  <th className="pb-2 text-left font-medium text-gray-600 hidden md:table-cell">Method</th>
                  <th className="pb-2 text-left font-medium text-gray-600 hidden sm:table-cell">Date</th>
                  <th className="pb-2 text-right font-medium text-gray-600">Amount</th>
                  <th className="pb-2 text-right font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{txn.student}</td>
                    <td className="py-3 text-gray-600 hidden md:table-cell">{METHOD_LABELS[txn.method]}</td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right font-semibold text-gray-900">
                      {fmt(txn.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[txn.status]}`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceKPI({
  title,
  value,
  sub,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
