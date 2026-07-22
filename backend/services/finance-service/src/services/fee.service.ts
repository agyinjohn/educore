import { Fee, IFee } from '../models/Fee'
import { CreateFeeInput, UpdateFeeInput } from '../types/schemas'

export async function createFee(schoolId: string, data: CreateFeeInput): Promise<IFee> {
  const fee = await Fee.create({
    ...data,
    schoolId,
  })

  return fee
}

export async function getFeeById(feeId: string, schoolId: string): Promise<IFee | null> {
  return Fee.findOne({ _id: feeId, schoolId })
}

export async function listFees(
  schoolId: string,
  filters: {
    academicYear?: string
    feeType?: string
    isActive?: boolean
    page?: number
    limit?: number
  } = {}
): Promise<{ data: IFee[]; total: number }> {
  const page = filters.page || 1
  const limit = filters.limit || 20
  const skip = (page - 1) * limit

  const query: any = { schoolId }

  if (filters.academicYear) query.academicYear = filters.academicYear
  if (filters.feeType) query.feeType = filters.feeType
  if (filters.isActive !== undefined) query.isActive = filters.isActive

  const [data, total] = await Promise.all([
    Fee.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Fee.countDocuments(query),
  ])

  return { data, total }
}

export async function updateFee(feeId: string, schoolId: string, data: UpdateFeeInput): Promise<IFee | null> {
  return Fee.findOneAndUpdate({ _id: feeId, schoolId }, data, { new: true })
}

export async function deleteFee(feeId: string, schoolId: string): Promise<{ deletedCount: number }> {
  const result = await Fee.deleteOne({ _id: feeId, schoolId })
  return { deletedCount: result.deletedCount }
}

export async function getFeesByType(
  schoolId: string,
  feeType: 'tuition' | 'transport' | 'meal' | 'sports' | 'other',
  academicYear: string
): Promise<IFee[]> {
  return Fee.find({ schoolId, feeType, academicYear, isActive: true })
}
