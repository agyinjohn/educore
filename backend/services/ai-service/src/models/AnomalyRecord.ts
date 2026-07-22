import { Schema, model, Document, Types } from 'mongoose';

export interface IAnomalyRecord extends Document {
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  anomalyType: 'ATTENDANCE' | 'PERFORMANCE' | 'BEHAVIOR' | 'ENGAGEMENT' | 'PATTERN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  metrics: {
    [key: string]: number | string;
  };
  baselineValue: number;
  observedValue: number;
  deviation: number; // Percentage deviation from baseline
  detectionMethod: string; // Algorithm or rule used
  detectedAt: Date;
  investigationStatus: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  investigationNotes?: string;
  recommendedActions?: string[];
  detectedBy?: {
    type: 'SYSTEM' | 'MANUAL';
    userId?: Types.ObjectId;
  };
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const anomalyRecordSchema = new Schema<IAnomalyRecord>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },
    anomalyType: {
      type: String,
      enum: ['ATTENDANCE', 'PERFORMANCE', 'BEHAVIOR', 'ENGAGEMENT', 'PATTERN'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    description: { type: String, required: true },
    metrics: { type: Schema.Types.Mixed, required: true },
    baselineValue: { type: Number, required: true },
    observedValue: { type: Number, required: true },
    deviation: { type: Number, required: true },
    detectionMethod: { type: String, required: true },
    detectedAt: { type: Date, required: true },
    investigationStatus: {
      type: String,
      enum: ['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'NEW',
    },
    investigationNotes: String,
    recommendedActions: [String],
    detectedBy: {
      type: { type: String, enum: ['SYSTEM', 'MANUAL'] },
      userId: Schema.Types.ObjectId,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient querying
anomalyRecordSchema.index({ tenantId: 1, studentId: 1 });
anomalyRecordSchema.index({ tenantId: 1, anomalyType: 1 });
anomalyRecordSchema.index({ tenantId: 1, severity: 1 });
anomalyRecordSchema.index({ tenantId: 1, investigationStatus: 1 });
anomalyRecordSchema.index({ detectedAt: -1 });

export default model<IAnomalyRecord>('AnomalyRecord', anomalyRecordSchema);
