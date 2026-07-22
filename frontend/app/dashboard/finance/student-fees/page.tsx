'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { financeService, Payment, Invoice } from '@/lib/services/finance.service';
import { studentService, Student } from '@/lib/services/student.service';
import { useAuth } from '@/lib/contexts/auth.context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function StudentFeesPage() {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    studentService.getStudents({ limit: 100 }).then((res) => {
      const body = res.data as any;
      setStudents(body.data ?? body.students ?? []);
    }).catch(() => setStudents([])).finally(() => setIsLoadingStudents(false));
  }, []);

  const loadDetail = useCallback(async (studentId: string) => {
    if (!schoolId || !studentId) return;
    setIsLoadingDetail(true);
    try {
      const [payRes, invRes] = await Promise.all([
        financeService.getStudentPayments(studentId, schoolId),
        financeService.listInvoices(schoolId, { studentId }),
      ]);
      setPayments(payRes.data);
      setInvoices(invRes.data);
    } catch {
      toast.error('Could not load this student’s financial history');
      setPayments([]);
      setInvoices([]);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [schoolId]);

  const selectStudent = (id: string) => {
    setSelectedId(id);
    loadDetail(id);
  };

  const student = students.find((s) => s.id === selectedId);
  const totalPaid = payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/finance">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Fees</h1>
          <p className="text-gray-600 text-sm">Look up a student&apos;s payment and invoice history</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            {isLoadingStudents ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                value={selectedId}
                onChange={(e) => selectStudent(e.target.value)}
                className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} {s.admissionNumber ? `(${s.admissionNumber})` : ''}</option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedId && (
        isLoadingDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{student ? `${student.firstName} ${student.lastName}` : '—'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-lg font-bold text-green-600 mt-1">{fmt(totalPaid)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-gray-500">Outstanding</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{fmt(totalOutstanding)}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No payments recorded.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-2 pr-4 text-left font-medium text-gray-600">Reference</th>
                          <th className="pb-2 pr-4 text-left font-medium text-gray-600">Method</th>
                          <th className="pb-2 pr-4 text-right font-medium text-gray-600">Amount</th>
                          <th className="pb-2 text-left font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-mono text-xs">{p.referenceNumber}</td>
                            <td className="py-2 pr-4 capitalize text-gray-600">{p.paymentMethod.replace('_', ' ')}</td>
                            <td className="py-2 pr-4 text-right font-medium">{fmt(p.amount)}</td>
                            <td className="py-2 text-gray-600">{p.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No invoices for this student.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-2 pr-4 text-left font-medium text-gray-600">Invoice #</th>
                          <th className="pb-2 pr-4 text-left font-medium text-gray-600">Due</th>
                          <th className="pb-2 pr-4 text-right font-medium text-gray-600">Total</th>
                          <th className="pb-2 text-left font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((i) => (
                          <tr key={i.id} className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-mono text-xs">{i.invoiceNumber}</td>
                            <td className="py-2 pr-4 text-gray-600">{new Date(i.dueDate).toLocaleDateString()}</td>
                            <td className="py-2 pr-4 text-right font-medium">{fmt(i.totalAmount)}</td>
                            <td className="py-2 text-gray-600">{i.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}
