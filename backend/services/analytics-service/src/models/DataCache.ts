import { Schema, model, Document, Types } from 'mongoose';

interface IDataCache extends Document {
  tenantId: Types.ObjectId;
  cacheKey: string;
  cacheType: 'metric' | 'report' | 'query' | 'export';
  data: Record<string, any>;
  expiresAt: Date;
  hitCount: number;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dataCacheSchema = new Schema<IDataCache>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cacheType: {
      type: String,
      enum: ['metric', 'report', 'query', 'export'],
      required: true,
    },
    data: Schema.Types.Mixed,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    hitCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

// Auto-delete expired cache entries
dataCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DataCache = model<IDataCache>('DataCache', dataCacheSchema);
