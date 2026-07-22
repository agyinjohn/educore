import { Request, Response } from 'express'
import * as paymentService from '../services/payment.service'
import { processPaymentSchema, paginationSchema } from '../types/schemas'

export async function recordPayment(req: Request, res: Response): Promise<void> {
  try {
    const validated = processPaymentSchema.parse(req.body)
    const payment = await paymentService.recordPayment(validated.schoolId, validated)
    res.status(201).json({ success: true, data: payment })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to record payment' })
  }
}

export async function getPaymentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { schoolId } = req.query

    if (!schoolId || typeof schoolId !== 'string') {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    const payment = await paymentService.getPaymentById(id, schoolId)

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' })
      return
    }

    res.json({ success: true, data: payment })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch payment' })
  }
}

export async function getStudentPayments(req: Request, res: Response): Promise<void> {
  try {
    const { studentId, schoolId } = req.params
    const pagination = paginationSchema.parse(req.query)

    const payments = await paymentService.getStudentPayments(studentId, schoolId, {
      page: pagination.page,
      limit: pagination.limit,
    })

    res.json({ success: true, data: payments })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch payments' })
  }
}

export async function updatePaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { schoolId, status, failureReason } = req.body

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    if (!status || !['pending', 'processing', 'completed', 'failed', 'refunded'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status provided' })
      return
    }

    const payment = await paymentService.updatePaymentStatus(id, schoolId, status, {
      failureReason,
    })

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' })
      return
    }

    res.json({ success: true, data: payment })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update payment' })
  }
}

export async function getPaymentsByStatus(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId, status } = req.params
    const { limit } = req.query

    if (!['pending', 'processing', 'completed', 'failed', 'refunded'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' })
      return
    }

    const payments = await paymentService.getPaymentsByStatus(
      schoolId,
      status as any,
      limit ? parseInt(limit as string) : undefined
    )

    res.json({ success: true, data: payments })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch payments' })
  }
}

export async function getOutstandingPayments(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId } = req.params
    const { studentId } = req.query

    const payments = await paymentService.getOutstandingPayments(
      schoolId,
      studentId as string | undefined
    )

    res.json({ success: true, data: payments })
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.message || 'Failed to fetch outstanding payments' })
  }
}

export async function refundPayment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { schoolId } = req.body

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    const payment = await paymentService.refundPayment(id, schoolId)

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' })
      return
    }

    res.json({ success: true, data: payment, message: 'Payment refunded successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to refund payment' })
  }
}
