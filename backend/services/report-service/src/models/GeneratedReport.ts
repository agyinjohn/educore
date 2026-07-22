import { Schema, model, Document, Types } from 'mongoose';

export interface IGeneratedReport extends Document {
  tenantId: Types.ObjectId;
  templateId: Types.ObjectId;
  title: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  format: 'PDF' | 'EXCEL' | 'JSON' | 'CSV';
  fileSize?: number;
  fileUrl?: string;
  data: Record<string, any>;
  filters?: Record<string, any>;
  metadata: {
    pageCount?: number;
    rowCount?: number;
    generationTime?: number;
  };
  generatedBy: Types.ObjectId;
  generatedAt: Date;
  expiresAt: Date;
  error?: {
    code: string;
    message: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const generatedReportSchema = new Schema<IGeneratedReport>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    templateId: { type: Schema.Types.ObjectId, required: true, ref: 'ReportTemplate' },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    format: {
      type: String,
      enum: ['PDF', 'EXCEL', 'JSON', 'CSV'],
      required: true,
    },
    fileSize: { type: Number },
    fileUrl: { type: String },
    data: { type: Schema.Types.Mixed, required: true },
    filters: Schema.Types.Mixed,
    metadata: {
      pageCount: Number,
      rowCount: Number,
      generationTime: Number,
    },
    generatedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    generatedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    error: {
      code: String,
      message: String,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
generatedReportSchema.index({ tenantId: 1, status: 1 });
generatedReportSchema.index({ tenantId: 1, generatedBy: 1 });
generatedReportSchema.index({ tenantId: 1, format: 1 });
generatedReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
generatedReportSchema.index({ createdAt: -1 });

export default model<IGeneratedReport>('GeneratedReport', generatedReportSchema);
