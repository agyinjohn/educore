import { Request, Response } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';
import ChatbotService from '../services';
import mongoose from 'mongoose';

jest.mock('../services');

describe('ChatbotController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    responseJson = jest.fn().mockReturnValue(undefined);
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {
      body: {},
      params: {},
      headers: { 'x-tenant-id': new mongoose.Types.ObjectId().toString() },
      query: {},
    };

    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
  });

  it('should return health status', async () => {
    await ChatbotController.health(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should start a new conversation successfully', async () => {
    const mockSession = { _id: new mongoose.Types.ObjectId(), sessionId: 'test_session' };
    mockRequest.body = { studentId: 'student123', studentName: 'John' };

    (ChatbotService as any).mockImplementation(() => ({
      startConversation: jest.fn().mockResolvedValue(mockSession),
    }));

    await ChatbotController.startConversation(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(201);
  });

  it('should return 400 for missing studentId', async () => {
    mockRequest.body = { studentName: 'John' };
    await ChatbotController.startConversation(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(400);
  });

  it('should send a message successfully', async () => {
    const mockMessage = { _id: new mongoose.Types.ObjectId(), content: 'Hello' };
    mockRequest.params = { conversationId: 'conv123' };
    mockRequest.body = { content: 'Hello', sender: 'USER', messageType: 'TEXT' };

    (ChatbotService as any).mockImplementation(() => ({
      sendMessage: jest.fn().mockResolvedValue(mockMessage),
    }));

    await ChatbotController.sendMessage(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(201);
  });

  it('should end conversation with satisfaction rating', async () => {
    const mockSession = { status: 'CLOSED', satisfaction: 5 };
    mockRequest.params = { conversationId: 'conv123' };
    mockRequest.body = { satisfaction: 5 };

    (ChatbotService as any).mockImplementation(() => ({
      endConversation: jest.fn().mockResolvedValue(mockSession),
    }));

    await ChatbotController.endConversation(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should retrieve conversation history', async () => {
    const mockHistory = { _id: new mongoose.Types.ObjectId(), messages: [] };
    mockRequest.params = { conversationId: 'conv123' };

    (ChatbotService as any).mockImplementation(() => ({
      getConversationHistory: jest.fn().mockResolvedValue(mockHistory),
    }));

    await ChatbotController.getConversationHistory(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should return 404 if conversation not found', async () => {
    mockRequest.params = { conversationId: 'nonexistent' };

    (ChatbotService as any).mockImplementation(() => ({
      getConversationHistory: jest.fn().mockResolvedValue(null),
    }));

    await ChatbotController.getConversationHistory(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(404);
  });

  it('should create FAQ successfully', async () => {
    const mockFAQ = { _id: new mongoose.Types.ObjectId(), question: 'Test?' };
    mockRequest.body = {
      question: 'Test?',
      answer: 'Test answer',
      category: 'ACADEMIC',
      keywords: ['test'],
    };

    (ChatbotService as any).mockImplementation(() => ({
      createFAQ: jest.fn().mockResolvedValue(mockFAQ),
    }));

    await ChatbotController.createFAQ(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(201);
  });

  it('should retrieve FAQs', async () => {
    const mockFAQs = [{ _id: new mongoose.Types.ObjectId(), question: 'Q1' }];
    mockRequest.query = { category: 'ACADEMIC' };

    (ChatbotService as any).mockImplementation(() => ({
      getFAQs: jest.fn().mockResolvedValue(mockFAQs),
    }));

    await ChatbotController.getFAQs(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should search FAQs by keyword', async () => {
    const mockResults = [{ _id: new mongoose.Types.ObjectId(), question: 'GPA' }];
    mockRequest.query = { keyword: 'GPA' };

    (ChatbotService as any).mockImplementation(() => ({
      searchFAQ: jest.fn().mockResolvedValue(mockResults),
    }));

    await ChatbotController.searchFAQs(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should retrieve chatbot statistics', async () => {
    const mockStats = { totalSessions: 100, activeSessions: 5 };

    (ChatbotService as any).mockImplementation(() => ({
      getConversationStats: jest.fn().mockResolvedValue(mockStats),
    }));

    await ChatbotController.getStats(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should flag an inappropriate message', async () => {
    const mockMessage = { _id: new mongoose.Types.ObjectId(), isFlagged: true };
    mockRequest.params = { messageId: 'msg123' };
    mockRequest.body = { reason: 'Spam' };

    (ChatbotService as any).mockImplementation(() => ({
      flagMessage: jest.fn().mockResolvedValue(mockMessage),
    }));

    await ChatbotController.flagMessage(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should rate FAQ as helpful', async () => {
    const mockFAQ = { _id: new mongoose.Types.ObjectId(), helpfulCount: 10 };
    mockRequest.params = { faqId: 'faq123' };
    mockRequest.body = { helpful: true };

    (ChatbotService as any).mockImplementation(() => ({
      rateFAQ: jest.fn().mockResolvedValue(mockFAQ),
    }));

    await ChatbotController.rateFAQ(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });

  it('should soft delete FAQ', async () => {
    const mockFAQ = { _id: new mongoose.Types.ObjectId(), isActive: false };
    mockRequest.params = { faqId: 'faq123' };

    (ChatbotService as any).mockImplementation(() => ({
      deleteFAQ: jest.fn().mockResolvedValue(mockFAQ),
    }));

    await ChatbotController.deleteFAQ(mockRequest as Request, mockResponse as Response);
    expect(responseStatus).toHaveBeenCalledWith(200);
  });
});
