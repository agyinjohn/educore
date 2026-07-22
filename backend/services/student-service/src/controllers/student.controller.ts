import { Request, Response } from 'express'
import { studentService } from '../services/student.service'

export const createStudent = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const student = await studentService.createStudent(schoolId, req.body)
    res.status(201).json({ success: true, data: student })
  } catch (error) {
    console.error('createStudent error:', error)
    res.status(500).json({ success: false, message: 'Failed to create student' })
  }
}

export const listStudents = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const result = await studentService.listStudents(schoolId, {
      class_id: req.query.class_id as string,
      status: req.query.status as string,
      limit: parseInt(req.query.limit as string) || 20,
      cursor: req.query.cursor as string,
    })
    res.status(200).json({ success: true, ...result })
  } catch (error) {
    console.error('listStudents error:', error)
    res.status(500).json({ success: false, message: 'Failed to list students' })
  }
}

export const getStudent = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const student = await studentService.getStudentById(schoolId, req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    res.status(200).json({ success: true, data: student })
  } catch (error) {
    console.error('getStudent error:', error)
    res.status(500).json({ success: false, message: 'Failed to get student' })
  }
}

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const student = await studentService.updateStudent(schoolId, req.params.id, req.body)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    res.status(200).json({ success: true, data: student })
  } catch (error) {
    console.error('updateStudent error:', error)
    res.status(500).json({ success: false, message: 'Failed to update student' })
  }
}

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const student = await studentService.deleteStudent(schoolId, req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    res.status(200).json({ success: true, message: 'Student deleted', data: student })
  } catch (error) {
    console.error('deleteStudent error:', error)
    res.status(500).json({ success: false, message: 'Failed to delete student' })
  }
}

export const bulkImportStudents = async (req: Request, res: Response) => {
  try {
    const schoolId = req.user?.school_id
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'school_id required' })
    }
    const { students } = req.body
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid students array' })
    }
    const result = await studentService.bulkImportStudents(schoolId, students)
    res.status(201).json({ success: true, count: result.length, data: result })
  } catch (error) {
    console.error('bulkImportStudents error:', error)
    res.status(500).json({ success: false, message: 'Failed to import students' })
  }
}
