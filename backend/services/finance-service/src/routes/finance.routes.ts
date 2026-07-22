import express, { Router } from 'express'
import * as feeController from '../controllers/fee.controller'
import * as paymentController from '../controllers/payment.controller'
import * as invoiceController from '../controllers/invoice.controller'
import { authenticate, tenantIsolation } from '../middleware/authenticate'

const router: Router = express.Router()

// This service otherwise trusted whatever schoolId a caller claimed in
// the body/query/params with no verification at all.
router.use(authenticate)
router.use(tenantIsolation)

// Fee endpoints
router.post('/fees/create', feeController.createFee)
router.get('/fees/:id', feeController.getFeeById)
router.get('/fees', feeController.listFees)
router.patch('/fees/:id', feeController.updateFee)
router.delete('/fees/:id', feeController.deleteFee)
router.get('/fees/type/:schoolId/:feeType/:academicYear', feeController.getFeesByType)

// Payment endpoints
router.post('/payments/record', paymentController.recordPayment)
router.get('/payments/:id', paymentController.getPaymentById)
router.get('/payments/student/:studentId/:schoolId', paymentController.getStudentPayments)
router.patch('/payments/:id/status', paymentController.updatePaymentStatus)
router.get('/payments/status/:schoolId/:status', paymentController.getPaymentsByStatus)
router.get('/payments/outstanding/:schoolId', paymentController.getOutstandingPayments)
router.post('/payments/:id/refund', paymentController.refundPayment)

// Invoice endpoints
router.post('/invoices/generate', invoiceController.generateInvoice)
router.get('/invoices/:id', invoiceController.getInvoiceById)
router.get('/invoices', invoiceController.listInvoices)
router.patch('/invoices/:id/status', invoiceController.updateInvoiceStatus)
router.post('/invoices/:id/send', invoiceController.sendInvoice)
router.get('/invoices/overdue/:schoolId', invoiceController.getOverdueInvoices)

export default router
