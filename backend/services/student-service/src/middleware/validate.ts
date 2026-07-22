import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      req.body = data.body || req.body
      req.query = data.query || req.query
      req.params = data.params || req.params
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        })
      }
      return res.status(400).json({ success: false, message: 'Invalid request' })
    }
  }
}
