import mongoose, { Document, Schema } from 'mongoose';

/**
 * Conversation Session Model
 * Stores chatbot conversation sessions with context and metadata
 */

export interface IConversationSession extends Document {
  tenantId: mongoose.Types.ObjectId;
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  messages: string[]; // Array of ChatMessage IDs
  context: {
    studentName?: string;
    studentGrade?: string;
    studentDepartment?: string;
    previousTopics?: string[];
    currentTopic?: string;
  };
  startTime: Date;
  endTime?: Date;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  messageCount: number;
  lastActivityTime: Date;
  sessionDuration?: number; // In seconds
  satisfaction?: number; // 1-5 rating
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSessionSchema = new Schema<IConversationSession>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ChatMessage',
      },
    ],
    context: {
      studentName: String,
      studentGrade: String,
      studentDepartment: String,
      previousTopics: [String],
      currentTopic: String,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastActivityTime: {
      type: Date,
      default: Date.now,
    },
    sessionDuration: Number,
    satisfaction: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
conversationSessionSchema.index({ tenantId: 1, studentId: 1 });
conversationSessionSchema.index({ tenantId: 1, status: 1 });
conversationSessionSchema.index({ tenantId: 1, startTime: -1 });
conversationSessionSchema.index({ lastActivityTime: -1 });
conversationSessionSchema.index({ tenantId: 1, sessionId: 1 });

export const ConversationSession =
  mongoose.models.ConversationSession ||
  mongoose.model<IConversationSession>(
    'ConversationSession',
    conversationSessionSchema
  );
