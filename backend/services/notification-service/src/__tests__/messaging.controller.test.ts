import { messagingController } from '../controllers/messaging.controller'
import { messagingService } from '../services/messaging.service'
import { Request, Response } from 'express'

jest.mock('../services/messaging.service')

describe('Messaging Controller', () => {
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

  describe('getOrCreateThread', () => {
    it('should create a new message thread', async () => {
      const mockThread = {
        _id: 'thread123',
        school_id: 'school123',
        parentId: 'parent123',
        teacherId: 'teacher123',
        studentId: 'student123',
        isActive: true,
      }

      ;(messagingService.getOrCreateThread as jest.Mock).mockResolvedValue(mockThread)

      mockRequest = {
        body: {
          schoolId: 'school123',
          parentId: 'parent123',
          teacherId: 'teacher123',
          studentId: 'student123',
        },
      }

      await messagingController.getOrCreateThread(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockThread,
      })
    })
  })

  describe('sendMessage', () => {
    it('should send a message in a thread', async () => {
      const mockMessage = {
        _id: 'msg123',
        school_id: 'school123',
        threadId: 'thread123',
        parentId: 'parent123',
        teacherId: 'teacher123',
        studentId: 'student123',
        message: 'Hello teacher',
        senderRole: 'parent',
      }

      ;(messagingService.sendMessage as jest.Mock).mockResolvedValue(mockMessage)

      mockRequest = {
        params: { threadId: 'thread123' },
        body: {
          schoolId: 'school123',
          message: 'Hello teacher',
        },
        userId: 'parent123',
        userRole: 'PARENT',
      }

      await messagingController.sendMessage(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMessage,
      })
    })
  })

  describe('getThreadMessages', () => {
    it('should return messages in a thread', async () => {
      const mockMessages = [
        {
          _id: 'msg1',
          threadId: 'thread123',
          message: 'Hello',
          senderRole: 'parent',
        },
        {
          _id: 'msg2',
          threadId: 'thread123',
          message: 'Hi there',
          senderRole: 'teacher',
        },
      ]

      ;(messagingService.getThreadMessages as jest.Mock).mockResolvedValue(mockMessages)

      mockRequest = {
        params: { threadId: 'thread123' },
        query: { schoolId: 'school123', limit: '50', offset: '0' },
      }

      await messagingController.getThreadMessages(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMessages,
      })
    })
  })

  describe('getParentThreads', () => {
    it('should return threads for parent', async () => {
      const mockThreads = [
        {
          _id: 'thread1',
          parentId: 'parent123',
          teacherId: 'teacher123',
          studentId: 'student123',
          isActive: true,
          lastMessageAt: new Date(),
        },
      ]

      ;(messagingService.getParentThreads as jest.Mock).mockResolvedValue(mockThreads)

      mockRequest = {
        params: { parentId: 'parent123' },
        query: { schoolId: 'school123' },
        userId: 'parent123',
      }

      await messagingController.getParentThreads(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockThreads,
      })
    })

    it('should prevent access to other parents threads', async () => {
      mockRequest = {
        params: { parentId: 'other_parent' },
        query: { schoolId: 'school123' },
        userId: 'parent123',
      }

      await messagingController.getParentThreads(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(statusMock).toHaveBeenCalledWith(403)
    })
  })

  describe('searchMessages', () => {
    it('should search messages in thread', async () => {
      const mockMessages = [
        {
          _id: 'msg1',
          threadId: 'thread123',
          message: 'urgent matter',
        },
      ]

      ;(messagingService.searchMessages as jest.Mock).mockResolvedValue(mockMessages)

      mockRequest = {
        params: { threadId: 'thread123' },
        query: { schoolId: 'school123', q: 'urgent' },
      }

      await messagingController.searchMessages(
        mockRequest as Request,
        mockResponse as Response
      )

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockMessages,
      })
    })
  })
})
