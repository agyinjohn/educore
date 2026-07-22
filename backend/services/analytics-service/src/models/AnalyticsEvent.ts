import { Schema, model, Document, Types } from 'mongoose';

interface IAnalyticsEvent extends Document {
  tenantId: Types.ObjectId;
  eventType: string; // e.g., "attendance_marked", "grade_published", "payment_received", "user_created"
  entityType: 'student' | 'staff' | 'parent' | 'class' | 'course' | 'system';
  entityId?: Types.ObjectId;
  userId: Types.ObjectId;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    source?: string;
  };
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['student', 'staff', 'parent', 'class', 'course', 'system'],
      required: true,
      index: true,
    },
    entityId: Schema.Types.ObjectId,
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    data: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      source: String,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
analyticsEventSchema.index({ tenantId: 1, eventType: 1 });
analyticsEventSchema.index({ tenantId: 1, timestamp: -1 });
analyticsEventSchema.index({ tenantId: 1, entityType: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 }); // TTL: expire old events

export const AnalyticsEvent = model<IAnalyticsEvent>(
  'AnalyticsEvent',
  analyticsEventSchema
);
