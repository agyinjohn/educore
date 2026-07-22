import request from 'supertest'
import express from 'express'

// Mock all models and services
jest.mock('../../models/Fee')
jest.mock('../../models/Payment')
jest.mock('../../models/Invoice')
jest.mock('../../services/fee.service')
jest.mock('../../services/payment.service')
jest.mock('../../services/invoice.service')

// Auth is a cross-cutting concern exercised by its own unit tests
// (see authenticate.test.ts) — these route tests stub it out so they can
// keep asserting on route/controller behavior against a fixed schoolId,
// same as every fixture in this file already uses ('school-123').
jest.mock('../../middleware/authenticate', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { sub: 'test-user', email: 'test@school.com', role: 'SCHOOL_ADMIN', schoolId: 'school-123' }
    next()
  },
  tenantIsolation: (req: any, _res: any, next: any) => {
    if (req.body && req.body.schoolId === undefined) req.body.schoolId = 'school-123'
    next()
  },
}))

describe('Finance Service Routes', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())

    // Import routes after mocks are set up
    const financeRoutes = require('../../routes/finance.routes').default
    app.use('/api/v1/finance', financeRoutes)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ===================== Fee Endpoints =====================

  describe('Fee Endpoints', () => {
    describe('POST /fees/create', () => {
      it('should successfully create a new fee', async () => {
        const feeData = {
          schoolId: 'school-123',
          name: 'Tuition Fee',
          amount: 5000,
          feeType: 'tuition',
          frequency: 'monthly',
          academicYear: '2024-2025',
        }

        const mockFeeService = require('../../services/fee.service')
        mockFeeService.createFee.mockResolvedValue({
          _id: 'fee-123',
          ...feeData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const response = await request(app)
          .post('/api/v1/finance/fees/create')
          .send(feeData)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data._id).toBe('fee-123')
        expect(mockFeeService.createFee).toHaveBeenCalledWith('school-123', expect.any(Object))
      })

      it('should fail with missing required fields', async () => {
        const feeData = {
          name: 'Tuition Fee',
          // missing required fields
        }

        const response = await request(app)
          .post('/api/v1/finance/fees/create')
          .send(feeData)

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
      })
    })

    describe('GET /fees/:id', () => {
      it('should retrieve a fee by ID', async () => {
        const feeData = {
          _id: 'fee-123',
          schoolId: 'school-123',
          name: 'Tuition Fee',
          amount: 5000,
          feeType: 'tuition',
          frequency: 'monthly',
          academicYear: '2024-2025',
        }

        const mockFeeService = require('../../services/fee.service')
        mockFeeService.getFeeById.mockResolvedValue(feeData)

        const response = await request(app)
          .get('/api/v1/finance/fees/fee-123?schoolId=school-123')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data._id).toBe('fee-123')
      })

      it('should return 404 if fee not found', async () => {
        const mockFeeService = require('../../services/fee.service')
        mockFeeService.getFeeById.mockResolvedValue(null)

        const response = await request(app)
          .get('/api/v1/finance/fees/fee-999?schoolId=school-123')

        expect(response.status).toBe(404)
        expect(response.body.success).toBe(false)
      })
    })

    describe('GET /fees', () => {
      it('should list fees with pagination', async () => {
        const mockFees = [
          { _id: 'fee-1', name: 'Tuition Fee', amount: 5000 },
          { _id: 'fee-2', name: 'Transport Fee', amount: 1000 },
        ]

        const mockFeeService = require('../../services/fee.service')
        mockFeeService.listFees.mockResolvedValue({
          data: mockFees,
          total: 2,
        })

        const response = await request(app)
          .get('/api/v1/finance/fees?schoolId=school-123&page=1&limit=10')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.data).toHaveLength(2)
      })
    })

    describe('PATCH /fees/:id', () => {
      it('should update a fee', async () => {
        const updatedFee = {
          _id: 'fee-123',
          name: 'Updated Tuition Fee',
          amount: 6000,
        }

        const mockFeeService = require('../../services/fee.service')
        mockFeeService.updateFee.mockResolvedValue(updatedFee)

        const response = await request(app)
          .patch('/api/v1/finance/fees/fee-123')
          .send({
            schoolId: 'school-123',
            name: 'Updated Tuition Fee',
            amount: 6000,
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.amount).toBe(6000)
      })
    })

    describe('DELETE /fees/:id', () => {
      it('should delete a fee', async () => {
        const mockFeeService = require('../../services/fee.service')
        mockFeeService.deleteFee.mockResolvedValue(true)

        const response = await request(app)
          .delete('/api/v1/finance/fees/fee-123?schoolId=school-123')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('Fee deleted successfully')
      })
    })
  })

  // ===================== Payment Endpoints =====================

  describe('Payment Endpoints', () => {
    describe('POST /payments/record', () => {
      it('should record a new payment', async () => {
        const paymentData = {
          schoolId: 'school-123',
          studentId: 'student-456',
          feeIds: ['fee-1', 'fee-2'],
          amount: 6000,
          paymentMethod: 'credit_card',
          payerName: 'John Doe',
          payerEmail: 'john@example.com',
        }

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.recordPayment.mockResolvedValue({
          _id: 'payment-123',
          ...paymentData,
          status: 'pending',
          referenceNumber: 'PAY-1234567-abc123',
          createdAt: new Date(),
        })

        const response = await request(app)
          .post('/api/v1/finance/payments/record')
          .send(paymentData)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.status).toBe('pending')
        expect(mockPaymentService.recordPayment).toHaveBeenCalledWith('school-123', expect.any(Object))
      })
    })

    describe('GET /payments/:id', () => {
      it('should retrieve a payment by ID', async () => {
        const paymentData = {
          _id: 'payment-123',
          schoolId: 'school-123',
          studentId: 'student-456',
          amount: 6000,
          status: 'completed',
        }

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.getPaymentById.mockResolvedValue(paymentData)

        const response = await request(app)
          .get('/api/v1/finance/payments/payment-123?schoolId=school-123')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data._id).toBe('payment-123')
      })
    })

    describe('GET /payments/student/:studentId/:schoolId', () => {
      it('should retrieve student payments', async () => {
        const payments = [
          { _id: 'payment-1', amount: 3000, status: 'completed' },
          { _id: 'payment-2', amount: 3000, status: 'pending' },
        ]

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.getStudentPayments.mockResolvedValue({
          data: payments,
          total: 2,
        })

        const response = await request(app)
          .get('/api/v1/finance/payments/student/student-456/school-123')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.data).toHaveLength(2)
      })
    })

    describe('PATCH /payments/:id/status', () => {
      it('should update payment status', async () => {
        const updatedPayment = {
          _id: 'payment-123',
          status: 'completed',
          paidAt: new Date(),
        }

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.updatePaymentStatus.mockResolvedValue(updatedPayment)

        const response = await request(app)
          .patch('/api/v1/finance/payments/payment-123/status')
          .send({
            schoolId: 'school-123',
            status: 'completed',
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.status).toBe('completed')
      })

      it('should reject invalid status', async () => {
        const response = await request(app)
          .patch('/api/v1/finance/payments/payment-123/status')
          .send({
            schoolId: 'school-123',
            status: 'invalid-status',
          })

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
      })
    })

    describe('GET /payments/status/:schoolId/:status', () => {
      it('should retrieve payments by status', async () => {
        const payments = [
          { _id: 'payment-1', status: 'completed' },
          { _id: 'payment-2', status: 'completed' },
        ]

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.getPaymentsByStatus.mockResolvedValue(payments)

        const response = await request(app)
          .get('/api/v1/finance/payments/status/school-123/completed?limit=20')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveLength(2)
      })
    })

    describe('GET /payments/outstanding/:schoolId', () => {
      it('should retrieve outstanding payments', async () => {
        const payments = [
          { _id: 'payment-1', status: 'pending', amount: 3000 },
          { _id: 'payment-2', status: 'failed', amount: 2000 },
        ]

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.getOutstandingPayments.mockResolvedValue(payments)

        const response = await request(app)
          .get('/api/v1/finance/payments/outstanding/school-123')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveLength(2)
      })
    })

    describe('POST /payments/:id/refund', () => {
      it('should refund a payment', async () => {
        const refundedPayment = {
          _id: 'payment-123',
          status: 'refunded',
        }

        const mockPaymentService = require('../../services/payment.service')
        mockPaymentService.refundPayment.mockResolvedValue(refundedPayment)

        const response = await request(app)
          .post('/api/v1/finance/payments/payment-123/refund')
          .send({
            schoolId: 'school-123',
          })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.status).toBe('refunded')
      })
    })
  })

  // ===================== Invoice Endpoints =====================

  describe('Invoice Endpoints', () => {
    describe('POST /invoices/generate', () => {
      it('should generate a new invoice', async () => {
        const invoiceData = {
          schoolId: 'school-123',
          studentId: 'student-456',
          feeIds: ['fee-1', 'fee-2'],
          dueDate: '2024-06-30T00:00:00Z',
        }

        const mockInvoiceService = require('../../services/invoice.service')
        mockInvoiceService.generateInvoice.mockResolvedValue({
          _id: 'invoice-123',
          ...invoiceData,
          invoiceNumber: 'INV-school-123-1234567-abc123',
          status: 'draft',
          totalAmount: 6000,
          createdAt: new Date(),
        })

        const response = await request(app)
          .post('/api/v1/finance/invoices/generate')
          .send(invoiceData)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.data.status).toBe('draft')
      })
    })

    describe('GET /invoices/:id', () => {
      it('should retrieve an invoice by ID', async () => {
        const invoiceData = {
          _id: 'invoice-123',
          invoiceNumber: 'INV-123',
          status: 'draft',
          totalAmount: 6000,
        }

        const mockInvoiceService = require('../../services/invoice.service')
        mockInvoiceService.getInvoiceById.mockResolvedValue(invoiceData)

        const response = await request(app)
          .get('/api/v1/finance/invoices/invoice-123')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data._id).toBe('invoice-123')
      })
    })

    describe('GET /invoices', () => {
      it('should list invoices', async () => {
        const invoices = [
          { _id: 'invoice-1', invoiceNumber: 'INV-1', status: 'draft' },
          { _id: 'invoice-2', invoiceNumber: 'INV-2', status: 'sent' },
        ]

        const mockInvoiceService = require('../../services/invoice.service')
        mockInvoiceService.listInvoices.mockResolvedValue(invoices)

        const response = await request(app)
          .get('/api/v1/finance/invoices?schoolId=school-123&page=1&limit=10')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveLength(2)
      })
    })

    describe('PATCH /invoices/:id/status', () => {
      it('should update invoice status', async () => {
        const updatedInvoice = {
          _id: 'invoice-123',
          status: 'sent',
        }

        const mockInvoiceService = require('../../services/invoice.service')
        mockInvoiceService.updateInvoiceStatus.mockResolvedValue(updatedInvoice)

        const response = await request(app)
          .patch('/api/v1/finance/invoices/invoice-123/status')
          .send({ status: 'sent' })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.status).toBe('sent')
      })

      it('should reject invalid invoice status', async () => {
        const response = await request(app)
          .patch('/api/v1/finance/invoices/invoice-123/status')
          .send({ status: 'invalid' })

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
      })
    })

    describe('POST /invoices/:id/send', () => {
      it('should send an invoice', async () => {
        const sentInvoice = {
          _id: 'invoice-123',
          status: 'sent',
        }

        const mockInvoiceService = require('../../services/invoice.service')
        mockInvoiceService.sendInvoice.mockResolvedValue(sentInvoice)

        const response = await request(app)
          .post('/api/v1/finance/invoices/invoice-123/send')
          .send({ recipientEmail: 'student@example.com' })

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe('Invoice sent successfully')
      })

      it('should fail without recipient email', async () => {
        const response = await request(app)
          .post('/api/v1/finance/invoices/invoice-123/send')
          .send({})

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
      })
    })

    describe('GET /invoices/overdue/:schoolId', () => {
      it('should retrieve overdue invoices', async () => {
        const overdueInvoices = [
          { _id: 'invoice-1', status: 'overdue', dueDate: '2024-01-01' },
          { _id: 'invoice-2', status: 'sent', dueDate: '2024-01-15' },
        ]

        const mockInvoiceService = require('../../services/invoice.service')
        mockInvoiceService.getOverdueInvoices.mockResolvedValue(overdueInvoices)

        const response = await request(app)
          .get('/api/v1/finance/invoices/overdue/school-123?page=1&limit=10')

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveLength(2)
      })
    })
  })
})
