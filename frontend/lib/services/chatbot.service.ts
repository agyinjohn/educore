// Chatbot Service API Client
// Matches backend/services/chatbot-service exactly (mounted at /chatbot
// behind the gateway). Unlike every other service, chatbot-service returns
// raw JSON bodies with no {success, data} envelope — apiClient's
// unwrapping interceptor leaves these untouched, so res.data here is
// already the object/array itself.

import { apiClient, ApiResponse } from '../api-client';

export interface ChatConversation {
  id: string;
  studentId: string;
  studentName?: string;
  status: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'student' | 'bot' | 'staff';
  messageType?: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  priority?: number;
  tags?: string[];
  helpfulCount?: number;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  priority?: number;
  tags?: string[];
}

export class ChatbotService {
  // ==================== Conversations ====================

  async startConversation(studentId: string, studentName?: string): Promise<ApiResponse<ChatConversation>> {
    return apiClient.post<ChatConversation>('/chatbot/conversations', { studentId, studentName });
  }

  async sendMessage(conversationId: string, content: string, sender: 'student' | 'bot' | 'staff'): Promise<ApiResponse<ChatMessage>> {
    return apiClient.post<ChatMessage>(`/chatbot/conversations/${conversationId}/messages`, { content, sender });
  }

  async getConversationHistory(conversationId: string): Promise<ApiResponse<ChatMessage[]>> {
    return apiClient.get<ChatMessage[]>(`/chatbot/conversations/${conversationId}`);
  }

  async endConversation(conversationId: string, satisfaction?: number): Promise<ApiResponse<ChatConversation>> {
    return apiClient.put<ChatConversation>(`/chatbot/conversations/${conversationId}`, { satisfaction });
  }

  async getStudentConversations(studentId: string): Promise<ApiResponse<ChatConversation[]>> {
    return apiClient.get<ChatConversation[]>(`/chatbot/students/${studentId}/conversations`);
  }

  // ==================== FAQs ====================

  async getFAQs(category?: string): Promise<ApiResponse<FAQ[]>> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiClient.get<FAQ[]>(`/chatbot/faqs${query}`);
  }

  async createFAQ(request: CreateFAQRequest): Promise<ApiResponse<FAQ>> {
    return apiClient.post<FAQ>('/chatbot/faqs', request);
  }

  async updateFAQ(faqId: string, request: Partial<CreateFAQRequest>): Promise<ApiResponse<FAQ>> {
    return apiClient.put<FAQ>(`/chatbot/faqs/${faqId}`, request);
  }

  async deleteFAQ(faqId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/chatbot/faqs/${faqId}`);
  }

  async searchFAQs(keyword: string): Promise<ApiResponse<FAQ[]>> {
    return apiClient.get<FAQ[]>(`/chatbot/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async rateFAQ(faqId: string, helpful: boolean): Promise<ApiResponse<FAQ>> {
    return apiClient.post<FAQ>(`/chatbot/faqs/${faqId}/rate`, { helpful });
  }
}

export const chatbotService = new ChatbotService();

export default chatbotService;
