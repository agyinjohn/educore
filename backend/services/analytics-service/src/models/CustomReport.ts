import { Schema, model, Document, Types } from 'mongoose';

interface ICustomReport extends Document {
  tenantId: Types.ObjectId;
  reportName: string;
  reportType: 'attendance' | 'academic' | 'financial' | 'operational' | 'custom';
  description?: string;
  createdBy: Types.ObjectId;
  filters: Record<string, any>;
  selectedMetrics: string[];
  chartTypes: Array<{
    metric: string;
    type: 'line' | 'bar' | 'pie' | 'table' | 'heatmap';
  }>;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';
    recipients: string[];
    enabled: boolean;
  };
  lastGeneratedAt?: Date;
  generationCount: number;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const customReportSchema = new Schema<ICustomReport>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reportName: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ['attendance', 'academic', 'financial', 'operational', 'custom'],
      required: true,
      index: true,
    },
    description: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    filters: Schema.Types.Mixed,
    selectedMetrics: [String],
    chartTypes: [
      {
        metric: String,
        type: {
          type: String,
          enum: ['line', 'bar', 'pie', 'table', 'heatmap'],
        },
      },
    ],
    dateRange: {
      startDate: Date,
      endDate: Date,
    },
    schedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'],
      },
      recipients: [String],
      enabled: {
        type: Boolean,
        default: false,
      },
    },
    lastGeneratedAt: Date,
    generationCount: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Indexes
customReportSchema.index({ tenantId: 1, reportType: 1 });
customReportSchema.index({ tenantId: 1, createdBy: 1 });
customReportSchema.index({ tenantId: 1, tags: 1 });

export const CustomReport = model<ICustomReport>(
  'CustomReport',
  customReportSchema
);
