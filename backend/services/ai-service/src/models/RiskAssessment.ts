import { Schema, model, Document, Types } from 'mongoose';

export interface IRiskAssessment extends Document {
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  overallRiskScore: number; // 0-100
  riskFactors: Array<{
    category: string;
    riskScore: number;
    description: string;
    isActive: boolean;
  }>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: {
    academicRisk: boolean;
    attendanceRisk: boolean;
    behavioralRisk: boolean;
    engagementRisk: boolean;
    financialRisk?: boolean;
  };
  interventions?: Array<{
    type: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  }>;
  lastAssessedAt: Date;
  nextReviewDate: Date;
  assessedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const riskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },
    overallRiskScore: { type: Number, required: true, min: 0, max: 100 },
    riskFactors: [
      {
        category: { type: String, required: true },
        riskScore: { type: Number, required: true, min: 0, max: 100 },
        description: String,
        isActive: { type: Boolean, default: true },
      },
    ],
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    indicators: {
      academicRisk: { type: Boolean, default: false },
      attendanceRisk: { type: Boolean, default: false },
      behavioralRisk: { type: Boolean, default: false },
      engagementRisk: { type: Boolean, default: false },
      financialRisk: Boolean,
    },
    interventions: [
      {
        type: String,
        description: String,
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        },
      },
    ],
    lastAssessedAt: { type: Date, required: true },
    nextReviewDate: { type: Date, required: true },
    assessedBy: Schema.Types.ObjectId,
    notes: String,
  },
  { timestamps: true }
);

// Indexes for efficient querying
riskAssessmentSchema.index({ tenantId: 1, studentId: 1 });
riskAssessmentSchema.index({ tenantId: 1, riskLevel: 1 });
riskAssessmentSchema.index({ tenantId: 1, 'indicators.academicRisk': 1 });
riskAssessmentSchema.index({ nextReviewDate: 1 });
riskAssessmentSchema.index({ lastAssessedAt: -1 });

export default model<IRiskAssessment>('RiskAssessment', riskAssessmentSchema);
