'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { reportService, ReportTemplate, GeneratedReport, ReportType, ReportFormat, ScheduledReport, ScheduleFrequency } from '@/lib/services/report.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, X, Loader2, FileText, Trash2, Play, Download, Clock } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_TYPES: ReportType[] = ['ACADEMIC', 'FINANCIAL', 'ATTENDANCE', 'CUSTOM'];
const FORMATS: ReportFormat[] = ['PDF', 'EXCEL', 'JSON', 'CSV'];
const FREQUENCIES: ScheduleFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  GENERATING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

export default function ReportsPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generated, setGenerated] = useState<GeneratedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const [templateForm, setTemplateForm] = useState({ name: '', description: '', reportType: 'CUSTOM' as ReportType });
  const [formatByTemplate, setFormatByTemplate] = useState<Record<string, ReportFormat>>({});

  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    templateId: '', name: '', frequency: 'WEEKLY' as ScheduleFrequency, time: '08:00', format: 'PDF' as ReportFormat, recipientEmail: '',
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tRes, gRes, sRes] = await Promise.all([
        reportService.getTemplates(),
        reportService.getGeneratedReports({ limit: 20 }),
        reportService.getScheduledReports(),
      ]);
      setTemplates(tRes.data);
      setGenerated(gRes.data);
      setScheduled(sRes.data);
    } catch {
      toast.error('Could not reach the report service');
      setTemplates([]);
      setGenerated([]);
      setScheduled([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      await reportService.createTemplate(templateForm);
      toast.success('Template created');
      setShowTemplateForm(false);
      setTemplateForm({ name: '', description: '', reportType: 'CUSTOM' });
      load();
    } catch {
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await reportService.deleteTemplate(id);
      toast.success('Template deleted');
      load();
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const handleGenerate = async (templateId: string) => {
    setGeneratingId(templateId);
    try {
      await reportService.generateReport({ templateId, format: formatByTemplate[templateId] || 'PDF' });
      toast.success('Report generation started');
      load();
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteGenerated = async (id: string) => {
    if (!confirm('Delete this generated report?')) return;
    try {
      await reportService.deleteGeneratedReport(id);
      toast.success('Report deleted');
      load();
    } catch {
      toast.error('Failed to delete report');
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.templateId || !scheduleForm.name.trim() || !scheduleForm.recipientEmail.trim()) {
      toast.error('Template, name, and at least one recipient are required');
      return;
    }
    setSaving(true);
    try {
      await reportService.createScheduledReport({
        templateId: scheduleForm.templateId,
        name: scheduleForm.name,
        schedule: { frequency: scheduleForm.frequency, time: scheduleForm.time },
        format: scheduleForm.format,
        recipients: [{ email: scheduleForm.recipientEmail, type: 'TO' }],
      });
      toast.success('Report scheduled');
      setShowScheduleForm(false);
      setScheduleForm({ templateId: '', name: '', frequency: 'WEEKLY', time: '08:00', format: 'PDF', recipientEmail: '' });
      load();
    } catch {
      toast.error('Failed to schedule report');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await reportService.deleteScheduledReport(id);
      toast.success('Schedule deleted');
      load();
    } catch {
      toast.error('Failed to delete schedule');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Build report templates and generate exports</p>
        </div>
        <Button onClick={() => setShowTemplateForm(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {showTemplateForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Report Template</CardTitle>
              <button onClick={() => setShowTemplateForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTemplate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Type</Label>
                <select
                  value={templateForm.reportType}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, reportType: e.target.value as ReportType }))}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <Label className="text-sm">Description</Label>
                <Input value={templateForm.description} onChange={(e) => setTemplateForm((p) => ({ ...p, description: e.target.value }))} disabled={saving} />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTemplateForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Create Template'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No report templates yet. Create one to get started.</p>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.reportType}{t.description ? ` · ${t.description}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={formatByTemplate[t.id] || 'PDF'}
                      onChange={(e) => setFormatByTemplate((p) => ({ ...p, [t.id]: e.target.value as ReportFormat }))}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    >
                      {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <Button size="sm" variant="outline" disabled={generatingId === t.id} onClick={() => handleGenerate(t.id)} className="flex items-center gap-1">
                      <Play className="h-3.5 w-3.5" />
                      Generate
                    </Button>
                    <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Generated Reports</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : generated.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No reports generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Title</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Format</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Status</th>
                    <th className="pb-2 pr-4 text-left font-medium text-gray-600">Generated</th>
                    <th className="pb-2 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generated.map((g) => (
                    <tr key={g.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {g.title}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{g.format}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[g.status]}`}>{g.status}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{new Date(g.generatedAt).toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {g.fileUrl && (
                            <a href={g.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600">
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button onClick={() => handleDeleteGenerated(g.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Scheduled Reports
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowScheduleForm(true)} className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" />
              New Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showScheduleForm && (
            <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 border border-blue-200 rounded-lg">
              <div className="space-y-1.5">
                <Label className="text-sm">Template <span className="text-red-500">*</span></Label>
                <select
                  value={scheduleForm.templateId}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, templateId: e.target.value }))}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select template</option>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                <Input value={scheduleForm.name} onChange={(e) => setScheduleForm((p) => ({ ...p, name: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Recipient Email <span className="text-red-500">*</span></Label>
                <Input type="email" value={scheduleForm.recipientEmail} onChange={(e) => setScheduleForm((p) => ({ ...p, recipientEmail: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Frequency</Label>
                <select
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, frequency: e.target.value as ScheduleFrequency }))}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Time (UTC)</Label>
                <Input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm((p) => ({ ...p, time: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Format</Label>
                <select
                  value={scheduleForm.format}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, format: e.target.value as ReportFormat }))}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="sm:col-span-3 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Schedule'}
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : scheduled.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No scheduled reports yet.</p>
          ) : (
            <div className="space-y-2">
              {scheduled.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.schedule.frequency} at {s.schedule.time} · next run {new Date(s.nextGenerationAt).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteSchedule(s.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
