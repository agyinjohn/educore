// Notification Service API Client
// Matches backend/services/notification-service exactly — three routers
// behind the gateway: /notifications (bulk + templates), /messages
// (parent-teacher threads), /broadcasts (emergency alerts).

import { apiClient, ApiResponse } from '../api-client';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type AudienceType =
  | 'all_parents' | 'all_staff' | 'all_students'
  | 'specific_class' | 'specific_grade' | 'specific_roles' | 'custom';
export type BroadcastPriority = 'routine' | 'urgent' | 'emergency';

export interface Audience {
  type: AudienceType;
  classIds?: string[];
  gradeIds?: string[];
  roles?: string[];
  userIds?: string[];
}

export interface Message {
  id: string;
  school_id: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  audience: Audience;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  createdBy: string;
  createdAt: string;
}

export interface SendBulkNotificationRequest {
  schoolId: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  audience: Audience;
  templateId?: string;
}

export interface MessageTemplate {
  id: string;
  school_id: string;
  name: string;
  description: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  variables?: string[];
  isActive: boolean;
}

export interface CreateTemplateRequest {
  schoolId: string;
  name: string;
  description?: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  variables?: string[];
}

export interface MessageThread {
  id: string;
  school_id: string;
  parentId: string;
  teacherId: string;
  studentId: string;
  status: string;
  lastMessageAt?: string;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: 'parent' | 'teacher' | 'admin';
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface EmergencyBroadcast {
  id: string;
  school_id: string;
  title: string;
  body: string;
  priority: BroadcastPriority;
  channels: NotificationChannel[];
  createdBy: string;
  createdAt: string;
}

export class NotificationService {
  // ==================== Bulk Notifications & Templates ====================

  async sendBulkNotification(request: SendBulkNotificationRequest): Promise<ApiResponse<Message>> {
    return apiClient.post<Message>('/notifications/bulk', request);
  }

  async getTemplates(schoolId: string): Promise<ApiResponse<MessageTemplate[]>> {
    return apiClient.get<MessageTemplate[]>(`/notifications/templates?schoolId=${encodeURIComponent(schoolId)}`);
  }

  async createTemplate(request: CreateTemplateRequest): Promise<ApiResponse<MessageTemplate>> {
    return apiClient.post<MessageTemplate>('/notifications/templates', request);
  }

  async getNotificationsForRecipient(recipientId: string, schoolId: string, limit = 20): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/notifications/recipient/${recipientId}?schoolId=${encodeURIComponent(schoolId)}&limit=${limit}`);
  }

  async markAsRead(messageId: string, schoolId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/notifications/${messageId}/read`, { schoolId });
  }

  async getDeliveryStatus(messageId: string, schoolId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/notifications/${messageId}/delivery-status?schoolId=${encodeURIComponent(schoolId)}`);
  }

  // ==================== Messaging (Parent-Teacher) ====================

  async getOrCreateThread(schoolId: string, parentId: string, teacherId: string, studentId: string): Promise<ApiResponse<MessageThread>> {
    return apiClient.post<MessageThread>('/messages/threads', { schoolId, parentId, teacherId, studentId });
  }

  async sendMessage(threadId: string, schoolId: string, message: string): Promise<ApiResponse<ThreadMessage>> {
    return apiClient.post<ThreadMessage>(`/messages/${threadId}`, { schoolId, message });
  }

  async getThreadMessages(threadId: string, schoolId: string, limit = 50, offset = 0): Promise<ApiResponse<ThreadMessage[]>> {
    return apiClient.get<ThreadMessage[]>(`/messages/${threadId}?schoolId=${encodeURIComponent(schoolId)}&limit=${limit}&offset=${offset}`);
  }

  async getParentThreads(parentId: string, schoolId: string): Promise<ApiResponse<MessageThread[]>> {
    return apiClient.get<MessageThread[]>(`/messages/threads/parent/${parentId}?schoolId=${encodeURIComponent(schoolId)}`);
  }

  async getTeacherThreads(teacherId: string, schoolId: string): Promise<ApiResponse<MessageThread[]>> {
    return apiClient.get<MessageThread[]>(`/messages/threads/teacher/${teacherId}?schoolId=${encodeURIComponent(schoolId)}`);
  }

  async archiveThread(threadId: string, schoolId: string): Promise<ApiResponse<MessageThread>> {
    return apiClient.post<MessageThread>(`/messages/${threadId}/archive`, { schoolId });
  }

  // ==================== Emergency Broadcasts ====================

  async sendEmergencyBroadcast(
    schoolId: string,
    title: string,
    body: string,
    channels: NotificationChannel[],
    priority: BroadcastPriority = 'emergency'
  ): Promise<ApiResponse<EmergencyBroadcast>> {
    return apiClient.post<EmergencyBroadcast>('/broadcasts/emergency', { schoolId, title, body, priority, channels });
  }

  async getEmergencyBroadcasts(schoolId: string, limit = 20): Promise<ApiResponse<EmergencyBroadcast[]>> {
    return apiClient.get<EmergencyBroadcast[]>(`/broadcasts/emergency?schoolId=${encodeURIComponent(schoolId)}&limit=${limit}`);
  }

  async confirmReadReceipt(broadcastId: string, schoolId: string): Promise<ApiResponse<EmergencyBroadcast>> {
    return apiClient.post<EmergencyBroadcast>(`/broadcasts/${broadcastId}/confirm-read`, { schoolId });
  }

  async getReadReceipts(broadcastId: string, schoolId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/broadcasts/${broadcastId}/receipts?schoolId=${encodeURIComponent(schoolId)}`);
  }
}

export const notificationService = new NotificationService();

export default notificationService;
