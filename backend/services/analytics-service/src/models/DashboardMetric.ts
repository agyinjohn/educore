import { Schema, model, Document, Types } from 'mongoose';

interface IDashboardMetric extends Document {
  tenantId: Types.ObjectId;
  metricKey: string; // e.g., "attendance_rate", "grade_distribution", "enrollment_trend"
  metricName: string;
  metricValue: number;
  metricUnit?: string; // e.g., "%", "students", "currency"
  previousValue?: number;
  percentageChange?: number;
  category: 'academic' | 'attendance' | 'finance' | 'engagement' | 'operations';
  dateRange: {
    startDate: Date;
    endDate: Date;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  metadata?: Record<string, any>;
  breakdown?: Array<{
    label: string;
    value: number;
    percentage?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const dashboardMetricSchema = new Schema<IDashboardMetric>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    metricKey: {
      type: String,
      required: true,
      lowercase: true,
    },
    metricName: {
      type: String,
      required: true,
    },
    metricValue: {
      type: Number,
      required: true,
    },
    metricUnit: {
      type: String,
      default: null,
    },
    previousValue: {
      type: Number,
      default: null,
    },
    percentageChange: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      enum: ['academic', 'attendance', 'finance', 'engagement', 'operations'],
      required: true,
      index: true,
    },
    dateRange: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true,
      },
    },
    metadata: Schema.Types.Mixed,
    breakdown: [
      {
        label: String,
        value: Number,
        percentage: Number,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for optimal query performance
dashboardMetricSchema.index({ tenantId: 1, metricKey: 1 });
dashboardMetricSchema.index({ tenantId: 1, category: 1 });
dashboardMetricSchema.index({ tenantId: 1, 'dateRange.startDate': 1 });
dashboardMetricSchema.index({ createdAt: -1 });

export const DashboardMetric = model<IDashboardMetric>(
  'DashboardMetric',
  dashboardMetricSchema
);
