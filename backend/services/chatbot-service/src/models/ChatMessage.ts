import mongoose, { Document, Schema } from 'mongoose';

/**
 * Chat Message Model
 * Stores individual messages within conversations with intent recognition
 */

export interface IChatMessage extends Document {
  tenantId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  sender: 'USER' | 'CHATBOT';
  messageType: 'TEXT' | 'QUESTION' | 'FEEDBACK' | 'INTENT';
  content: string;
  intent?: {
    type: string; // e.g., 'ACADEMIC_HELP', 'ENROLLMENT', 'SCHEDULE', 'PAYMENT'
    confidence: number; // 0-1
    extractedEntities?: Record<string, any>;
  };
  response?: string;
  responseTime?: number; // In milliseconds
  sourceType?: 'FAQ' | 'SERVICE_INTEGRATION' | 'GENERATED'; // How response was generated
  sourceId?: string; // Reference to FAQ or service
  timestamp: Date;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ConversationSession',
      index: true,
    },
    sender: {
      type: String,
      enum: ['USER', 'CHATBOT'],
      required: true,
    },
    messageType: {
      type: String,
      enum: ['TEXT', 'QUESTION', 'FEEDBACK', 'INTENT'],
      default: 'TEXT',
    },
    content: {
      type: String,
      required: true,
    },
    intent: {
      type: {
        type: String,
      },
      confidence: Number,
      extractedEntities: mongoose.Schema.Types.Mixed,
    },
    response: String,
    responseTime: Number,
    sourceType: {
      type: String,
      enum: ['FAQ', 'SERVICE_INTEGRATION', 'GENERATED'],
    },
    sourceId: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
chatMessageSchema.index({ tenantId: 1, conversationId: 1 });
chatMessageSchema.index({ tenantId: 1, sender: 1 });
chatMessageSchema.index({ timestamp: -1 });
chatMessageSchema.index({ tenantId: 1, 'intent.type': 1 });
chatMessageSchema.index({ isFlagged: 1, tenantId: 1 });

export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
