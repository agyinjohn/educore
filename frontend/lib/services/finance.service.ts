// Finance Service API Client
// Matches backend/services/finance-service exactly (mounted at /finance
// behind the API gateway).

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces (mirror the backend Mongoose models)
// ============================================================================

export type FeeType = 'tuition' | 'transport' | 'meal' | 'sports' | 'other';
export type FeeFrequency = 'once' | 'monthly' | 'quarterly' | 'annually';

export interface Fee {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  feeType: FeeType;
  applicableGrades?: string[];
  frequency: FeeFrequency;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeRequest {
  schoolId: string;
  name: string;
  description?: string;
  amount: number;
  feeType: FeeType;
  applicableGrades?: string[];
  frequency: FeeFrequency;
  academicYear: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'cash';

export interface Payment {
  id: string;
  schoolId: string;
  studentId: string;
  feeIds: string[];
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  referenceNumber: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  paidAt?: string;
  createdAt: string;
}

export interface RecordPaymentRequest {
  schoolId: string;
  studentId: string;
  feeIds: string[];
  amount: number;
  paymentMethod: PaymentMethod;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLine {
  feeId: string;
  name: string;
  amount: number;
  quantity?: number;
}

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceNumber: string;
  fees: InvoiceLine[];
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  amountPaid: number;
  outstandingAmount: number;
  notes?: string;
}

// The backend looks up each fee by ID server-side and builds line items —
// it does not accept client-supplied names/amounts.
export interface GenerateInvoiceRequest {
  schoolId: string;
  studentId: string;
  feeIds: string[];
  dueDate: string;
  notes?: string;
}

// ============================================================================
// Finance Service Class
// ============================================================================

export class FinanceService {
  // ==================== Fees ====================

  async createFee(request: CreateFeeRequest): Promise<ApiResponse<Fee>> {
    return apiClient.post<Fee>('/finance/fees/create', request);
  }

  async getFee(id: string, schoolId: string): Promise<ApiResponse<Fee>> {
    return apiClient.get<Fee>(`/finance/fees/${id}?schoolId=${encodeURIComponent(schoolId)}`);
  }

  async listFees(schoolId: string, params?: { academicYear?: string; feeType?: string }): Promise<ApiResponse<Fee[]>> {
    const query = new URLSearchParams({ schoolId, ...params } as Record<string, string>).toString();
    return apiClient.get<Fee[]>(`/finance/fees?${query}`);
  }

  async updateFee(id: string, request: Partial<CreateFeeRequest>): Promise<ApiResponse<Fee>> {
    return apiClient.patch<Fee>(`/finance/fees/${id}`, request);
  }

  async deleteFee(id: string, schoolId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/finance/fees/${id}?schoolId=${encodeURIComponent(schoolId)}`);
  }

  // ==================== Payments ====================

  async recordPayment(request: RecordPaymentRequest): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>('/finance/payments/record', request);
  }

  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`/finance/payments/${id}`);
  }

  async getStudentPayments(studentId: string, schoolId: string): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(`/finance/payments/student/${studentId}/${schoolId}`);
  }

  async getOutstandingPayments(schoolId: string): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(`/finance/payments/outstanding/${schoolId}`);
  }

  async refundPayment(id: string, reason: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`/finance/payments/${id}/refund`, { reason });
  }

  // ==================== Invoices ====================

  async generateInvoice(request: GenerateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return apiClient.post<Invoice>('/finance/invoices/generate', request);
  }

  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`/finance/invoices/${id}`);
  }

  async listInvoices(params?: { studentId?: string; status?: string }): Promise<ApiResponse<Invoice[]>> {
    const query = params
      ? `?${Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&')}`
      : '';
    return apiClient.get<Invoice[]>(`/finance/invoices${query}`);
  }

  async sendInvoice(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/finance/invoices/${id}/send`, {});
  }

  async getOverdueInvoices(schoolId: string): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(`/finance/invoices/overdue/${schoolId}`);
  }
}

// ============================================================================
// Default Finance Service Instance
// ============================================================================

export const financeService = new FinanceService();

export default financeService;
