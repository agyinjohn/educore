import { notificationController } from '../controllers/notification.controller'
import { notificationService } from '../services/notification.service'
import { Request, Response } from 'express'

jest.mock('../services/notification.service')

describe('Notification Controller', () => {
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

  describe('sendBulkNotification', () => {
    it('should send a bulk notification', async () => {
      const mockMessage = {
        _id: 'msg123',
        school_id: 'school123',
        title: 'Test Notification',
        body: 'This is a test',
        channels: ['email'],
        audience: { type: 'all_parents' },
        status: 'sending',
        createdBy: 'user123',
      }

      ;(notificationService.sendBulkNotification as jest.Mock).mockResolvedValue(mockMessage)

      mockRequest = {
        body: {
          schoolId: 'school123',
          title: 'Test Notification',
          body: 'This is a test',
          channels: ['email'],
          audience: { type: 'all_parents' },
        },
        userId: 'user123',
      }

      await notificationController.sendBulkNotification(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMessage,
        message: 'Notification queued for sending',
      })
    })

    it('should return 400 for missing required fields', async () => {
      mockRequest = {
        body: {
          schoolId: 'school123',
          // missing title, body
        },
      }

      await notificationController.sendBulkNotification(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalled()
    })
  })

  describe('getTemplates', () => {
    it('should return message templates', async () => {
      const mockTemplates = [
        {
          _id: 'tpl123',
          school_id: 'school123',
          name: 'Welcome Email',
          title: 'Welcome',
          body: 'Welcome to our school',
          channels: ['email'],
        },
      ]

      ;(notificationService.getTemplates as jest.Mock).mockResolvedValue(mockTemplates)

      mockRequest = {
        query: { schoolId: 'school123' },
      }

      await notificationController.getTemplates(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockTemplates,
      })
    })
  })

  describe('getDeliveryStatus', () => {
    it('should return delivery status for a message', async () => {
      const mockDeliveries = [
        {
          _id: 'del123',
          messageId: 'msg123',
          recipientId: 'user123',
          channel: 'email',
          status: 'delivered',
        },
      ]

      ;(notificationService.getDeliveryStatus as jest.Mock).mockResolvedValue(mockDeliveries)
      ;(notificationService.getDeliveryStats as jest.Mock).mockResolvedValue([
        { _id: 'delivered', count: 1 },
      ])

      mockRequest = {
        params: { messageId: 'msg123' },
        query: { schoolId: 'school123' },
      }

      await notificationController.getDeliveryStatus(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          deliveries: mockDeliveries,
          stats: { delivered: 1 },
        },
      })
    })
  })

  describe('getNotificationsForRecipient', () => {
    it('should return notifications for recipient', async () => {
      const mockNotifications = [
        {
          delivery: {
            _id: 'del123',
            messageId: 'msg123',
            recipientId: 'user123',
            status: 'delivered',
          },
          message: {
            _id: 'msg123',
            title: 'Test',
            body: 'Test message',
          },
        },
      ]

      ;(notificationService.getNotificationsForRecipient as jest.Mock).mockResolvedValue(
        mockNotifications
      )

      mockRequest = {
        params: { recipientId: 'user123' },
        query: { schoolId: 'school123', limit: '20' },
        userId: 'user123',
        userRole: 'PARENT',
      }

      await notificationController.getNotificationsForRecipient(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockNotifications,
      })
    })

    it('should prevent access to other users notifications', async () => {
      mockRequest = {
        params: { recipientId: 'other_user' },
        query: { schoolId: 'school123' },
        userId: 'user123',
        userRole: 'PARENT',
      }

      await notificationController.getNotificationsForRecipient(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(403)
    })
  })
})
