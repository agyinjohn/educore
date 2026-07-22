import mongoose, { Document, Schema } from 'mongoose';

/**
 * FAQ Model
 * Stores Frequently Asked Questions with fuzzy matching support
 */

export interface IFAQ extends Document {
  tenantId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: string; // e.g., 'ACADEMIC', 'ENROLLMENT', 'FINANCE', 'SCHEDULE', 'GENERAL'
  keywords: string[];
  searchIndex: string; // Combined searchable text
  usageCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  relatedFAQs?: mongoose.Types.ObjectId[];
  isActive: boolean;
  priority: number; // For ranking in search results
  tags: string[];
  lastUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['ACADEMIC', 'ENROLLMENT', 'FINANCE', 'SCHEDULE', 'GENERAL', 'TECHNICAL'],
      index: true,
    },
    keywords: [String],
    searchIndex: {
      type: String,
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
    relatedFAQs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FAQ',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    tags: [String],
    lastUpdatedBy: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
faqSchema.index({ tenantId: 1, category: 1 });
faqSchema.index({ tenantId: 1, isActive: 1 });
faqSchema.index({ tenantId: 1, usageCount: -1 });
faqSchema.index({ tenantId: 1, priority: -1 });
faqSchema.index({ tenantId: 1, tags: 1 });

export const FAQ =
  mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', faqSchema);
