import { Schema, model, Document, Types } from 'mongoose';

export interface IScheduledReport extends Document {
  tenantId: Types.ObjectId;
  templateId: Types.ObjectId;
  name: string;
  description?: string;
  schedule: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:mm format
    timezone: string;
  };
  format: 'PDF' | 'EXCEL' | 'JSON' | 'CSV';
  recipients: Array<{
    email: string;
    type: 'TO' | 'CC' | 'BCC';
  }>;
  filters?: Record<string, any>;
  isActive: boolean;
  lastGeneratedAt?: Date;
  nextGenerationAt: Date;
  failureCount: number;
  lastFailureReason?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledReportSchema = new Schema<IScheduledReport>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    templateId: { type: Schema.Types.ObjectId, required: true, ref: 'ReportTemplate' },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    schedule: {
      frequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'],
        required: true,
      },
      dayOfWeek: Number,
      dayOfMonth: Number,
      time: { type: String, required: true },
      timezone: { type: String, default: 'UTC' },
    },
    format: {
      type: String,
      enum: ['PDF', 'EXCEL', 'JSON', 'CSV'],
      required: true,
    },
    recipients: [
      {
        email: { type: String, required: true, lowercase: true },
        type: { type: String, enum: ['TO', 'CC', 'BCC'], default: 'TO' },
      },
    ],
    filters: Schema.Types.Mixed,
    isActive: { type: Boolean, default: true },
    lastGeneratedAt: Date,
    nextGenerationAt: { type: Date, required: true },
    failureCount: { type: Number, default: 0 },
    lastFailureReason: String,
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes for efficient querying
scheduledReportSchema.index({ tenantId: 1, isActive: 1 });
scheduledReportSchema.index({ tenantId: 1, createdBy: 1 });
scheduledReportSchema.index({ nextGenerationAt: 1 }); // For scheduler queries
scheduledReportSchema.index({ tenantId: 1, nextGenerationAt: 1 });
scheduledReportSchema.index({ createdAt: -1 });

export default model<IScheduledReport>('ScheduledReport', scheduledReportSchema);
