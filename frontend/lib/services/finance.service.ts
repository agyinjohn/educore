// Finance Service API Client
// Handles fees, payments, invoices, and financial transactions

import { apiClient, ApiResponse } from '../api-client';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FeeStructure {
  id: string;
  classId: string;
  academicYear: string;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  activityFee: number;
  otherFees: Record<string, number>;
  totalFee: number;
  dueDate: string;
  penalties?: Penalty[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentFee {
  id: string;
  studentId: string;
  feeStructureId: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  studentFeeId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'cash';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  reference: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentFeeId: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  issueDate: string;
  status: 'draft' | 'issued' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Penalty {
  id: string;
  type: string;
  percentage: number;
  amount: number;
  appliedAfterDays: number;
  description: string;
}

export interface FinancialReport {
  totalFees: number;
  totalCollected: number;
  pendingAmount: number;
  overdueAmount: number;
  collectionPercentage: number;
  period: string;
}

// ============================================================================
// Finance Service Class
// ============================================================================

export class FinanceService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL =
      baseURL || process.env.NEXT_PUBLIC_FINANCE_API_URL || 'http://localhost:4003';
  }

  // ==================== Fee Structure ====================

  // Get fee structure
  async getFeeStructure(id: string): Promise<ApiResponse<FeeStructure>> {
    return apiClient.get<FeeStructure>(`${this.baseURL}/fee-structures/${id}`);
  }

  // Get all fee structures
  async getFeeStructures(params?: { classId?: string; academicYear?: string }): Promise<
    ApiResponse<FeeStructure[]>
  > {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<FeeStructure[]>(`${this.baseURL}/fee-structures${query}`);
  }

  // Create fee structure
  async createFeeStructure(request: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<
    ApiResponse<FeeStructure>
  > {
    return apiClient.post<FeeStructure>(`${this.baseURL}/fee-structures`, request);
  }

  // Update fee structure
  async updateFeeStructure(
    id: string,
    request: Partial<Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<FeeStructure>> {
    return apiClient.put<FeeStructure>(`${this.baseURL}/fee-structures/${id}`, request);
  }

  // ==================== Student Fees ====================

  // Get student fees
  async getStudentFees(studentId: string): Promise<ApiResponse<StudentFee[]>> {
    return apiClient.get<StudentFee[]>(`${this.baseURL}/students/${studentId}/fees`);
  }

  // Get student fee details
  async getStudentFeeDetail(studentFeeId: string): Promise<ApiResponse<StudentFee>> {
    return apiClient.get<StudentFee>(`${this.baseURL}/student-fees/${studentFeeId}`);
  }

  // Create student fee
  async createStudentFee(request: Omit<StudentFee, 'id' | 'paidAmount' | 'status' | 'createdAt' | 'updatedAt'>): Promise<
    ApiResponse<StudentFee>
  > {
    return apiClient.post<StudentFee>(`${this.baseURL}/student-fees`, request);
  }

  // ==================== Payments ====================

  // Get payments for student fee
  async getPayments(studentFeeId: string): Promise<ApiResponse<Payment[]>> {
    return apiClient.get<Payment[]>(`${this.baseURL}/student-fees/${studentFeeId}/payments`);
  }

  // Record payment
  async recordPayment(request: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<
    ApiResponse<Payment>
  > {
    return apiClient.post<Payment>(`${this.baseURL}/payments`, request);
  }

  // Get payment details
  async getPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`${this.baseURL}/payments/${paymentId}`);
  }

  // Refund payment
  async refundPayment(paymentId: string, reason: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`${this.baseURL}/payments/${paymentId}/refund`, { reason });
  }

  // ==================== Invoices ====================

  // Get student invoices
  async getStudentInvoices(studentId: string): Promise<ApiResponse<Invoice[]>> {
    return apiClient.get<Invoice[]>(`${this.baseURL}/students/${studentId}/invoices`);
  }

  // Get invoice
  async getInvoice(invoiceId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get<Invoice>(`${this.baseURL}/invoices/${invoiceId}`);
  }

  // Create invoice
  async createInvoice(request: Omit<Invoice, 'id' | 'status' | 'paidAmount' | 'createdAt' | 'updatedAt'>): Promise<
    ApiResponse<Invoice>
  > {
    return apiClient.post<Invoice>(`${this.baseURL}/invoices`, request);
  }

  // Send invoice
  async sendInvoice(invoiceId: string, email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`${this.baseURL}/invoices/${invoiceId}/send`, { email });
  }

  // Generate invoice PDF
  async generateInvoicePDF(invoiceId: string): Promise<Blob> {
    const response = await apiClient.get<any>(`${this.baseURL}/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
    return response.data as unknown as Blob;
  }

  // ==================== Reports ====================

  // Get financial report
  async getFinancialReport(params?: {
    startDate?: string;
    endDate?: string;
    classId?: string;
  }): Promise<ApiResponse<FinancialReport>> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<FinancialReport>(`${this.baseURL}/reports/financial${query}`);
  }

  // Get payment summary
  async getPaymentSummary(params?: {
    startDate?: string;
    endDate?: string;
    method?: string;
  }): Promise<
    ApiResponse<{
      totalPayments: number;
      paymentsByMethod: Record<string, number>;
      dailyPayments: Array<{ date: string; amount: number }>;
    }>
  > {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    return apiClient.get<any>(`${this.baseURL}/reports/payments${query}`);
  }

  // Export financial data
  async exportFinancialData(format: 'csv' | 'excel', params?: Record<string, any>): Promise<Blob> {
    const query = params
      ? `?${Object.entries(params)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')}`
      : '';
    const response = await apiClient.get<any>(
      `${this.baseURL}/reports/export?format=${format}${query ? `&${query}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response.data as unknown as Blob;
  }
}

// ============================================================================
// Default Finance Service Instance
// ============================================================================

export const financeService = new FinanceService();

export default financeService;
