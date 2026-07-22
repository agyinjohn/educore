'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { studentService, CreateStudentRequest } from '@/lib/services/student.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Upload, Loader2, FileWarning } from 'lucide-react';
import { toast } from 'sonner';

const REQUIRED_COLUMNS = ['firstName', 'lastName', 'dateOfBirth'];
const OPTIONAL_COLUMNS = ['email', 'phone', 'gender', 'admissionNumber'];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
}

export default function ImportStudentsPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length === 0) {
      setError('No rows found — make sure the first line is a header row.');
      setRows([]);
      return;
    }
    const headers = Object.keys(parsed[0]);
    const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
    if (missing.length > 0) {
      setError(`Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
      setRows([]);
      return;
    }
    setRows(parsed);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    try {
      const students: CreateStudentRequest[] = rows.map((r) => ({
        firstName: r.firstName,
        lastName: r.lastName,
        dateOfBirth: r.dateOfBirth,
        email: r.email || undefined,
        phone: r.phone || undefined,
        gender: (r.gender as CreateStudentRequest['gender']) || undefined,
        admissionNumber: r.admissionNumber || undefined,
      }));
      const res = await studentService.bulkImportStudents(students);
      toast.success(`Imported ${res.data.count ?? rows.length} students`);
      router.push('/dashboard/students');
    } catch {
      toast.error('Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Students</h1>
          <p className="text-gray-600 text-sm">Upload a CSV to create multiple students at once</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">CSV Format</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>Required columns: <span className="font-mono text-xs">{REQUIRED_COLUMNS.join(', ')}</span></p>
          <p>Optional columns: <span className="font-mono text-xs">{OPTIONAL_COLUMNS.join(', ')}</span></p>
          <p className="text-xs text-gray-400">
            Class assignment isn&apos;t supported by bulk import — assign each student&apos;s class afterward from
            their edit page.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-10 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">{fileName || 'Click to choose a CSV file'}</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <FileWarning className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {rows.length > 0 && (
            <>
              <p className="text-sm text-gray-600">{rows.length} row{rows.length === 1 ? '' : 's'} ready to import.</p>
              <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {Object.keys(rows[0]).map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {Object.keys(rows[0]).map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-700">{r[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleImport} disabled={isImporting} className="bg-blue-600 hover:bg-blue-700 min-w-[140px]">
                  {isImporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Importing...</> : `Import ${rows.length} Students`}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
