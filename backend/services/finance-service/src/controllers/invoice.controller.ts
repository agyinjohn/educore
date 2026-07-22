import { Request, Response } from 'express'
import { generateInvoiceSchema, paginationSchema } from '../types/schemas'

// Invoice service functions
const invoiceService = require('../services/invoice.service')

export async function generateInvoice(req: Request, res: Response): Promise<void> {
  try {
    const validated = generateInvoiceSchema.parse(req.body)
    const invoice = await invoiceService.generateInvoice(validated)
    res.status(201).json({ success: true, data: invoice })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to generate invoice' })
  }
}

export async function getInvoiceById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const invoice = await invoiceService.getInvoiceById(id)

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' })
      return
    }

    res.json({ success: true, data: invoice })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch invoice' })
  }
}

export async function listInvoices(req: Request, res: Response): Promise<void> {
  try {
    const pagination = paginationSchema.parse(req.query)
    const filters = {
      schoolId: req.query.schoolId as string,
      studentId: req.query.studentId as string | undefined,
      status: req.query.status as string | undefined,
    }

    const invoices = await invoiceService.listInvoices(filters, pagination)
    res.json({ success: true, data: invoices })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to list invoices' })
  }
}

export async function updateInvoiceStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['draft', 'sent', 'paid', 'overdue', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid invoice status' })
      return
    }

    const invoice = await invoiceService.updateInvoiceStatus(id, status)

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' })
      return
    }

    res.json({ success: true, data: invoice })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update invoice' })
  }
}

export async function sendInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { recipientEmail } = req.body

    if (!recipientEmail) {
      res.status(400).json({ success: false, message: 'Recipient email is required' })
      return
    }

    const invoice = await invoiceService.sendInvoice(id, recipientEmail)

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' })
      return
    }

    res.json({ success: true, data: invoice, message: 'Invoice sent successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to send invoice' })
  }
}

export async function getOverdueInvoices(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params
    const pagination = paginationSchema.parse(req.query)

    const invoices = await invoiceService.getOverdueInvoices(schoolId, pagination)
    res.json({ success: true, data: invoices })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch overdue invoices' })
  }
}
