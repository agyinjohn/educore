import { emergencyBroadcastController } from '../controllers/emergency.controller'
import { emergencyBroadcastService } from '../services/emergency.service'
import { Request, Response } from 'express'

jest.mock('../services/emergency.service')

describe('Emergency Broadcast Controller', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: jest.Mock
  let statusMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnValue({})
    statusMock = jest.fn().mockReturnValue({ json: jsonMock })

    mockResponse = {
      json: jsonMock,
      status: statusMock,
    }
  })

  describe('sendEmergencyBroadcast', () => {
    it('should send an emergency broadcast', async () => {
      const mockBroadcast = {
        _id: 'bcast123',
        school_id: 'school123',
        title: 'School Closure',
        body: 'School is closed today',
        priority: 'emergency',
        channels: ['push', 'sms', 'email'],
        requiresReadReceipt: true,
        createdBy: 'admin123',
      }

      ;(emergencyBroadcastService.sendEmergencyBroadcast as jest.Mock).mockResolvedValue(
        mockBroadcast
      )

      mockRequest = {
        body: {
          schoolId: 'school123',
          title: 'School Closure',
          body: 'School is closed today',
          priority: 'emergency',
          channels: ['push', 'sms', 'email'],
        },
        userId: 'admin123',
      }

      await emergencyBroadcastController.sendEmergencyBroadcast(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockBroadcast,
        message: 'Emergency broadcast sent with read receipt tracking',
      })
    })

    it('should return 400 for missing required fields', async () => {
      mockRequest = {
        body: {
          schoolId: 'school123',
          title: 'Test',
          // missing body and channels
        },
      }

      await emergencyBroadcastController.sendEmergencyBroadcast(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(400)
    })
  })

  describe('confirmReadReceipt', () => {
    it('should confirm read receipt', async () => {
      const mockBroadcast = {
        _id: 'bcast123',
        school_id: 'school123',
        title: 'Emergency',
        body: 'Alert',
        confirmedReadBy: ['user1', 'user2'],
      }

      ;(emergencyBroadcastService.confirmReadReceipt as jest.Mock).mockResolvedValue(
        mockBroadcast
      )

      mockRequest = {
        params: { broadcastId: 'bcast123' },
        body: { schoolId: 'school123' },
        userId: 'user2',
      }

      await emergencyBroadcastController.confirmReadReceipt(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockBroadcast,
        message: 'Read receipt confirmed',
      })
    })
  })

  describe('getReadReceipts', () => {
    it('should return read receipt status', async () => {
      const mockReceipts = {
        broadcastId: 'bcast123',
        confirmed: 45,
        pending: 5,
        confirmedBy: ['user1', 'user2'],
      }

      ;(emergencyBroadcastService.getUnconfirmedReceipts as jest.Mock).mockResolvedValue(
        mockReceipts
      )

      mockRequest = {
        params: { broadcastId: 'bcast123' },
        query: { schoolId: 'school123' },
      }

      await emergencyBroadcastController.getReadReceipts(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockReceipts,
      })
    })
  })
})
