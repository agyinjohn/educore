import { Student, IStudent, StudentStatus } from '../models/Student'

export class StudentService {
  async createStudent(schoolId: string, data: Partial<IStudent>) {
    const student = new Student({
      school_id: schoolId,
      ...data,
    })
    return await student.save()
  }

  async getStudentById(schoolId: string, studentId: string) {
    return await Student.findOne({ _id: studentId, school_id: schoolId })
  }

  async listStudents(
    schoolId: string,
    filters: { class_id?: string; status?: string; limit?: number; cursor?: string }
  ) {
    const { class_id, status, limit = 20, cursor } = filters
    const query: any = { school_id: schoolId, deletedAt: null }

    if (class_id) query.class_id = class_id
    if (status) query.status = status

    if (cursor) {
      query._id = { $lt: cursor }
    }

    const students = await Student.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)

    const hasMore = students.length > limit
    return {
      data: students.slice(0, limit),
      cursor: students.length > 0 ? students[limit - 1]?._id : null,
      hasMore,
    }
  }

  async updateStudent(schoolId: string, studentId: string, data: Partial<IStudent>) {
    return await Student.findOneAndUpdate(
      { _id: studentId, school_id: schoolId },
      { $set: data },
      { new: true }
    )
  }

  async deleteStudent(schoolId: string, studentId: string) {
    return await Student.findOneAndUpdate(
      { _id: studentId, school_id: schoolId },
      { $set: { deletedAt: new Date() } },
      { new: true }
    )
  }

  async bulkImportStudents(schoolId: string, students: Partial<IStudent>[]) {
    const validated = students.map((s) => ({
      school_id: schoolId,
      status: StudentStatus.ACTIVE,
      enrolmentDate: new Date(),
      ...s,
    }))
    return await Student.insertMany(validated)
  }
}

export const studentService = new StudentService()
