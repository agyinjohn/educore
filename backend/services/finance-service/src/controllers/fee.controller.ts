import { Request, Response } from 'express'
import * as feeService from '../services/fee.service'
import { createFeeSchema, updateFeeSchema, paginationSchema } from '../types/schemas'

export async function createFee(req: Request, res: Response): Promise<void> {
  try {
    const validated = createFeeSchema.parse(req.body)
    const fee = await feeService.createFee(validated.schoolId, validated)
    res.status(201).json({ success: true, data: fee })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create fee' })
  }
}

export async function getFeeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { schoolId } = req.query

    if (!schoolId || typeof schoolId !== 'string') {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    const fee = await feeService.getFeeById(id, schoolId)

    if (!fee) {
      res.status(404).json({ success: false, message: 'Fee not found' })
      return
    }

    res.json({ success: true, data: fee })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch fee' })
  }
}

export async function listFees(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId, academicYear, feeType, isActive } = req.query
    const pagination = paginationSchema.parse(req.query)

    if (!schoolId || typeof schoolId !== 'string') {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    const fees = await feeService.listFees(schoolId, {
      academicYear: academicYear as string | undefined,
      feeType: feeType as string | undefined,
      isActive: isActive === 'true',
      page: pagination.page,
      limit: pagination.limit,
    })

    res.json({ success: true, data: fees })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to list fees' })
  }
}

export async function updateFee(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { schoolId } = req.body

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    const validated = updateFeeSchema.parse(req.body)
    const fee = await feeService.updateFee(id, schoolId, validated)

    if (!fee) {
      res.status(404).json({ success: false, message: 'Fee not found' })
      return
    }

    res.json({ success: true, data: fee })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update fee' })
  }
}

export async function deleteFee(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { schoolId } = req.query

    if (!schoolId || typeof schoolId !== 'string') {
      res.status(400).json({ success: false, message: 'schoolId is required' })
      return
    }

    const result = await feeService.deleteFee(id, schoolId)

    if (!result) {
      res.status(404).json({ success: false, message: 'Fee not found' })
      return
    }

    res.json({ success: true, message: 'Fee deleted successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to delete fee' })
  }
}

export async function getFeesByType(req: Request, res: Response): Promise<void> {
  try {
    const { schoolId, feeType, academicYear } = req.params
    const fees = await feeService.getFeesByType(schoolId, feeType as any, academicYear)
    res.json({ success: true, data: fees })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to fetch fees' })
  }
}
