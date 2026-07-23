/**
 * Phase 4 — Communication Hub Types
 */

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum AudienceType {
  ALL_PARENTS = 'all_parents',
  ALL_STAFF = 'all_staff',
  ALL_STUDENTS = 'all_students',
  SPECIFIC_CLASS = 'specific_class',
  SPECIFIC_GRADE = 'specific_grade',
  SPECIFIC_ROLES = 'specific_roles',
  CUSTOM = 'custom',
}

export enum MessageStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
  BOUNCED = 'bounced',
}

export enum BroadcastType {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export interface IMessage {
  school_id: string
  title: string
  body: string
  channels: NotificationChannel[]
  audience: {
    type: AudienceType
    classIds?: string[]
    gradeIds?: string[]
    roles?: string[]
    userIds?: string[]
  }
  status: MessageStatus
  scheduledFor?: Date
  sendAt?: Date
  templateId?: string
  createdBy: string // user_id of admin
  tags?: string[]
  metadata?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

export interface IMessageTemplate {
  school_id: string
  name: string
  description: string
  title: string
  body: string
  channels: NotificationChannel[]
  variables?: string[] // e.g. ['student_name', 'date']
  createdBy: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IDeliveryStatus {
  school_id: string
  messageId: string
  recipientId: string
  recipientEmail?: string
  recipientPhone?: string
  channel: NotificationChannel
  status: DeliveryStatus
  externalId?: string // provider's message ID (Twilio, SendGrid, etc.)
  attempts: number
  error?: string
  readAt?: Date
  deliveredAt?: Date
  sentAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IParentMessage {
  school_id: string
  threadId: string
  parentId: string
  teacherId: string
  studentId: string
  senderRole: 'parent' | 'teacher' | 'admin'
  message: string
  attachments?: string[] // file paths
  isModerated: boolean
  isArchived: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IMessageThread {
  school_id: string
  parentId: string
  teacherId: string
  studentId: string
  subject?: string
  isActive: boolean
  messages?: IParentMessage[]
  lastMessageAt: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IEmergencyBroadcast {
  school_id: string
  title: string
  body: string
  priority: BroadcastType
  channels: NotificationChannel[]
  requiresReadReceipt: boolean
  createdBy: string
  confirmedReadBy?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface SendNotificationPayload {
  title: string
  body: string
  channels: NotificationChannel[]
  audience: {
    type: AudienceType
    classIds?: string[]
    gradeIds?: string[]
    roles?: string[]
    userIds?: string[]
  }
  scheduledFor?: Date
  templateId?: string
}

export interface SendMessagePayload {
  threadId: string
  message: string
  attachments?: string[]
}
