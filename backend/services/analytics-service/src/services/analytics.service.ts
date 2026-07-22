import { DashboardMetric, CustomReport, AnalyticsEvent, DataCache } from '../models';
import { Types } from 'mongoose';

export class AnalyticsService {
  async getDashboard(tenantId: string, dateRange: { startDate: Date; endDate: Date }): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const [attendanceMetric, gradeMetric, enrollmentMetric, engagementMetric] = await Promise.all([
      DashboardMetric.findOne({
        tenantId: tenantObjectId,
        metricKey: 'attendance_rate',
        'dateRange.startDate': { $gte: dateRange.startDate },
      }).sort({ createdAt: -1 }),
      DashboardMetric.findOne({
        tenantId: tenantObjectId,
        metricKey: 'grade_distribution',
        'dateRange.startDate': { $gte: dateRange.startDate },
      }).sort({ createdAt: -1 }),
      DashboardMetric.findOne({
        tenantId: tenantObjectId,
        metricKey: 'enrollment_trend',
        'dateRange.startDate': { $gte: dateRange.startDate },
      }).sort({ createdAt: -1 }),
      DashboardMetric.findOne({
        tenantId: tenantObjectId,
        metricKey: 'student_engagement',
        'dateRange.startDate': { $gte: dateRange.startDate },
      }).sort({ createdAt: -1 }),
    ]);

    return {
      dashboard: { attendance: attendanceMetric, grades: gradeMetric, enrollment: enrollmentMetric, engagement: engagementMetric },
      lastUpdated: new Date(),
    };
  }

  async getMetricsByCategory(tenantId: string, category: 'academic' | 'attendance' | 'finance' | 'engagement' | 'operations', limit: number = 10): Promise<any[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    return DashboardMetric.find({ tenantId: tenantObjectId, category }).sort({ createdAt: -1 }).limit(limit);
  }

  async getMetricTrends(tenantId: string, metricKey: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly', limit: number = 12): Promise<any[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    return DashboardMetric.find({ tenantId: tenantObjectId, metricKey, 'dateRange.period': period }).sort({ 'dateRange.startDate': -1 }).limit(limit);
  }

  async upsertMetric(tenantId: string, metricData: any): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    return DashboardMetric.findOneAndUpdate(
      { tenantId: tenantObjectId, metricKey: metricData.metricKey, 'dateRange.startDate': metricData.dateRange.startDate },
      { ...metricData, tenantId: tenantObjectId },
      { upsert: true, new: true }
    );
  }

  async getCustomReports(tenantId: string, filter?: { reportType?: string; createdBy?: string }): Promise<any[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const query: any = { tenantId: tenantObjectId };
    if (filter?.reportType) query.reportType = filter.reportType;
    if (filter?.createdBy) query.createdBy = new Types.ObjectId(filter.createdBy);
    return CustomReport.find(query).sort({ createdAt: -1 });
  }

  async createCustomReport(tenantId: string, reportData: any): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const report = new CustomReport({ ...reportData, tenantId: tenantObjectId, generationCount: 0 });
    return report.save();
  }

  async updateCustomReport(reportId: string, updates: any): Promise<any> {
    return CustomReport.findByIdAndUpdate(reportId, updates, { new: true });
  }

  async deleteCustomReport(reportId: string): Promise<any> {
    return CustomReport.findByIdAndDelete(reportId);
  }

  async logEvent(tenantId: string, eventData: any): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const event = new AnalyticsEvent({ ...eventData, tenantId: tenantObjectId, timestamp: new Date() });
    return event.save();
  }

  async getEventAnalytics(tenantId: string, eventType?: string, dateRange?: { startDate: Date; endDate: Date }): Promise<any[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const query: any = { tenantId: tenantObjectId };
    if (eventType) query.eventType = eventType;
    if (dateRange) {
      query.timestamp = { $gte: dateRange.startDate, $lte: dateRange.endDate };
    }
    return AnalyticsEvent.find(query).sort({ timestamp: -1 }).limit(100);
  }

  async getOrComputeMetric(tenantId: string, cacheKey: string, computeFn: () => Promise<any>, ttlMinutes: number = 60): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const cached = await DataCache.findOne({ tenantId: tenantObjectId, cacheKey, expiresAt: { $gt: new Date() } });
    if (cached) {
      cached.hitCount += 1;
      cached.lastAccessedAt = new Date();
      await cached.save();
      return cached.data;
    }

    const data = await computeFn();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);
    await DataCache.create({ tenantId: tenantObjectId, cacheKey, cacheType: 'metric', data, expiresAt, hitCount: 0 });
    return data;
  }

  async invalidateCache(tenantId: string, cacheKey?: string): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    if (cacheKey) {
      return DataCache.deleteOne({ tenantId: tenantObjectId, cacheKey });
    }
    return DataCache.deleteMany({ tenantId: tenantObjectId });
  }

  async generateReport(reportId: string): Promise<any> {
    const report = await CustomReport.findByIdAndUpdate(reportId, { lastGeneratedAt: new Date(), $inc: { generationCount: 1 } }, { new: true });
    if (!report) throw new Error('Report not found');
    return { reportId: report._id, reportName: report.reportName, reportType: report.reportType, generatedAt: new Date(), data: [] };
  }

  async getSummaryStats(tenantId: string): Promise<any> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const [metricsCount, reportsCount, eventsCount] = await Promise.all([
      DashboardMetric.countDocuments({ tenantId: tenantObjectId }),
      CustomReport.countDocuments({ tenantId: tenantObjectId }),
      AnalyticsEvent.countDocuments({ tenantId: tenantObjectId }),
    ]);
    return { metricsCount, reportsCount, eventsCount, cacheStatus: 'active', lastUpdated: new Date() };
  }
}

export default new AnalyticsService();
