import { Schema, model, Document, Types } from 'mongoose';

export interface IStudentPrediction extends Document {
  tenantId: Types.ObjectId;
  studentId: Types.ObjectId;
  modelId: Types.ObjectId;
  predictionType: 'PERFORMANCE' | 'ENROLLMENT' | 'DROPOUT' | 'ENGAGEMENT';
  prediction: {
    value: number; // Probability between 0-1 or score
    confidence: number; // 0-1 confidence level
    category?: string; // HIGH, MEDIUM, LOW or PASS, FAIL, etc
  };
  features: {
    [key: string]: any; // Input features used for prediction
  };
  explanations?: {
    topFeatures: Array<{
      name: string;
      importance: number;
      contribution: string;
    }>;
    summary?: string;
  };
  performanceActual?: {
    gpa?: number;
    attendanceRate?: number;
    engagementScore?: number;
    enrollmentStatus?: string;
  };
  accuracy?: number; // If prediction result is known
  predictedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentPredictionSchema = new Schema<IStudentPrediction>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    studentId: { type: Schema.Types.ObjectId, required: true, ref: 'Student' },
    modelId: { type: Schema.Types.ObjectId, required: true, ref: 'PredictionModel' },
    predictionType: {
      type: String,
      enum: ['PERFORMANCE', 'ENROLLMENT', 'DROPOUT', 'ENGAGEMENT'],
      required: true,
    },
    prediction: {
      value: { type: Number, required: true, min: 0, max: 1 },
      confidence: { type: Number, required: true, min: 0, max: 1 },
      category: String,
    },
    features: { type: Schema.Types.Mixed, required: true },
    explanations: {
      topFeatures: [
        {
          name: String,
          importance: Number,
          contribution: String,
        },
      ],
      summary: String,
    },
    performanceActual: {
      gpa: Number,
      attendanceRate: Number,
      engagementScore: Number,
      enrollmentStatus: String,
    },
    accuracy: Number,
    predictedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Indexes for efficient querying
studentPredictionSchema.index({ tenantId: 1, studentId: 1 });
studentPredictionSchema.index({ tenantId: 1, predictionType: 1 });
studentPredictionSchema.index({ tenantId: 1, 'prediction.category': 1 });
studentPredictionSchema.index({ predictedAt: -1 });
studentPredictionSchema.index({ tenantId: 1, modelId: 1 });

export default model<IStudentPrediction>('StudentPrediction', studentPredictionSchema);
