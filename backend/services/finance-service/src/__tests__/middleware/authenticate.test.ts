import jwt from 'jsonwebtoken'
import { authenticate, tenantIsolation, AuthenticatedRequest } from '../../middleware/authenticate'
import { config } from '../../config'

function mockRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function signToken(payload: object) {
  return jwt.sign(payload, config.jwt.accessSecret)
}

describe('finance-service authenticate middleware', () => {
  it('rejects requests with no Authorization header', () => {
    const req = { headers: {} } as AuthenticatedRequest
    const res = mockRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rejects an invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as AuthenticatedRequest
    const res = mockRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('accepts a valid token and attaches req.user', () => {
    const token = signToken({ sub: 'user-1', schoolId: 'school-123', role: 'SCHOOL_ADMIN', email: 'a@b.com' })
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest
    const res = mockRes()
    const next = jest.fn()

    authenticate(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user?.schoolId).toBe('school-123')
  })
})

describe('finance-service tenantIsolation middleware', () => {
  it('rejects a claimed schoolId that does not match the caller\'s own', () => {
    const req = {
      user: { sub: 'u1', schoolId: 'school-123', role: 'SCHOOL_ADMIN', email: 'a@b.com' },
      body: { schoolId: 'someone-elses-school' },
      query: {},
      params: {},
    } as unknown as AuthenticatedRequest
    const res = mockRes()
    const next = jest.fn()

    tenantIsolation(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('auto-fills body.schoolId from the token when omitted', () => {
    const req = {
      user: { sub: 'u1', schoolId: 'school-123', role: 'SCHOOL_ADMIN', email: 'a@b.com' },
      body: {},
      query: {},
      params: {},
    } as unknown as AuthenticatedRequest
    const res = mockRes()
    const next = jest.fn()

    tenantIsolation(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.body.schoolId).toBe('school-123')
  })

  it('allows a claimed schoolId that matches the caller\'s own', () => {
    const req = {
      user: { sub: 'u1', schoolId: 'school-123', role: 'SCHOOL_ADMIN', email: 'a@b.com' },
      body: {},
      query: { schoolId: 'school-123' },
      params: {},
    } as unknown as AuthenticatedRequest
    const res = mockRes()
    const next = jest.fn()

    tenantIsolation(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
