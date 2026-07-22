import { Schema, model, Document, Types } from 'mongoose';

export interface IReportTemplate extends Document {
  tenantId: Types.ObjectId;
  name: string;
  description?: string;
  reportType: 'ACADEMIC' | 'FINANCIAL' | 'ATTENDANCE' | 'CUSTOM';
  sections: Array<{
    sectionId: string;
    title: string;
    type: 'HEADER' | 'CHART' | 'TABLE' | 'SUMMARY' | 'FOOTER';
    config?: Record<string, any>;
  }>;
  filters?: Array<{
    field: string;
    label: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  settings: {
    includeCharts: boolean;
    includeSummary: boolean;
    pageSize: 'A4' | 'LETTER';
    orientation: 'PORTRAIT' | 'LANDSCAPE';
  };
  isActive: boolean;
  createdBy: Types.ObjectId;
  lastModifiedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportTemplateSchema = new Schema<IReportTemplate>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    reportType: {
      type: String,
      enum: ['ACADEMIC', 'FINANCIAL', 'ATTENDANCE', 'CUSTOM'],
      required: true,
    },
    sections: [
      {
        sectionId: { type: String, required: true },
        title: { type: String, required: true },
        type: {
          type: String,
          enum: ['HEADER', 'CHART', 'TABLE', 'SUMMARY', 'FOOTER'],
          required: true,
        },
        config: Schema.Types.Mixed,
      },
    ],
    filters: [
      {
        field: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean, default: false },
        defaultValue: Schema.Types.Mixed,
      },
    ],
    settings: {
      includeCharts: { type: Boolean, default: true },
      includeSummary: { type: Boolean, default: true },
      pageSize: { type: String, enum: ['A4', 'LETTER'], default: 'A4' },
      orientation: { type: String, enum: ['PORTRAIT', 'LANDSCAPE'], default: 'PORTRAIT' },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Indexes for efficient querying
reportTemplateSchema.index({ tenantId: 1, reportType: 1 });
reportTemplateSchema.index({ tenantId: 1, isActive: 1 });
reportTemplateSchema.index({ tenantId: 1, createdBy: 1 });
reportTemplateSchema.index({ createdAt: -1 });

export default model<IReportTemplate>('ReportTemplate', reportTemplateSchema);
