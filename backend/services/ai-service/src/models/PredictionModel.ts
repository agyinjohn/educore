import { Schema, model, Document, Types } from 'mongoose';

export interface IPredictionModel extends Document {
  tenantId: Types.ObjectId;
  name: string;
  modelType: 'PERFORMANCE' | 'ENROLLMENT' | 'DROPOUT' | 'ENGAGEMENT';
  version: string;
  status: 'TRAINING' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';
  description?: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastEvaluated: Date;
  };
  hyperparameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
    validationSplit: number;
  };
  trainingData: {
    recordsUsed: number;
    featureCount: number;
    targetVariable: string;
  };
  modelPath?: string; // Path to saved model files
  isProduction: boolean;
  createdBy: Types.ObjectId;
  lastTrainedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const predictionModelSchema = new Schema<IPredictionModel>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    name: { type: String, required: true, trim: true },
    modelType: {
      type: String,
      enum: ['PERFORMANCE', 'ENROLLMENT', 'DROPOUT', 'ENGAGEMENT'],
      required: true,
    },
    version: { type: String, required: true },
    status: {
      type: String,
      enum: ['TRAINING', 'ACTIVE', 'DEPRECATED', 'ARCHIVED'],
      default: 'TRAINING',
    },
    description: String,
    metrics: {
      accuracy: { type: Number, min: 0, max: 1 },
      precision: { type: Number, min: 0, max: 1 },
      recall: { type: Number, min: 0, max: 1 },
      f1Score: { type: Number, min: 0, max: 1 },
      lastEvaluated: Date,
    },
    hyperparameters: {
      learningRate: { type: Number, required: true },
      epochs: { type: Number, required: true },
      batchSize: { type: Number, required: true },
      validationSplit: { type: Number, required: true },
    },
    trainingData: {
      recordsUsed: { type: Number, required: true },
      featureCount: { type: Number, required: true },
      targetVariable: { type: String, required: true },
    },
    modelPath: String,
    isProduction: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    lastTrainedAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient querying
predictionModelSchema.index({ tenantId: 1, modelType: 1 });
predictionModelSchema.index({ tenantId: 1, status: 1 });
predictionModelSchema.index({ tenantId: 1, isProduction: 1 });
predictionModelSchema.index({ createdAt: -1 });

export default model<IPredictionModel>('PredictionModel', predictionModelSchema);
