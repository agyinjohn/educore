import ChatbotService from '../services';
import { ConversationSession, ChatMessage, FAQ } from '../models';
import mongoose from 'mongoose';

jest.mock('../models');

describe('ChatbotService', () => {
  const tenantId = new mongoose.Types.ObjectId();
  let service: ChatbotService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ChatbotService(tenantId);
  });

  it('should start a new conversation session', async () => {
    const mockSession = { _id: new mongoose.Types.ObjectId(), sessionId: 'test_session' };
    (ConversationSession as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSession),
    }));

    const studentId = new mongoose.Types.ObjectId().toString();
    const result = await service.startConversation(studentId, 'John Doe');
    expect(result).toEqual(mockSession);
  });

  it('should send a user message and extract intent', async () => {
    const mockMessage = {
      _id: new mongoose.Types.ObjectId(),
      content: 'When is my next exam?',
    };

    (ChatMessage as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockMessage),
    }));

    const conversationId = new mongoose.Types.ObjectId().toString();
    (ConversationSession.findByIdAndUpdate as any) = jest.fn().mockResolvedValue({});
    (FAQ.find as any) = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    });

    const result = await service.sendMessage(conversationId, 'When is my next exam?', 'USER');
    expect(result).toEqual(mockMessage);
  });

  it('should end a conversation session', async () => {
    const mockSession = { _id: new mongoose.Types.ObjectId(), status: 'CLOSED' };
    (ConversationSession.findByIdAndUpdate as any) = jest.fn().mockResolvedValue(mockSession);

    const conversationId = new mongoose.Types.ObjectId().toString();
    const result = await service.endConversation(conversationId, 5);
    expect(result).toEqual(mockSession);
  });

  it('should match user message to FAQ using fuzzy matching', async () => {
    const mockFAQ = {
      _id: new mongoose.Types.ObjectId(),
      question: 'How do I register?',
      answer: 'Go to the registration portal',
      searchIndex: 'how register registration portal',
    };

    (FAQ.find as any) = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([mockFAQ]),
    });

    const result = await service.matchFAQ('how to register');
    expect(result).toEqual(mockFAQ);
  });

  it('should retrieve conversation history with messages', async () => {
    const mockHistory = {
      _id: new mongoose.Types.ObjectId(),
      messages: [{ _id: new mongoose.Types.ObjectId(), content: 'Hello' }],
    };

    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockHistory),
    };

    (ConversationSession.findById as any) = jest.fn().mockReturnValue(mockQuery);

    const conversationId = new mongoose.Types.ObjectId().toString();
    const result = await service.getConversationHistory(conversationId);
    expect(result).toEqual(mockHistory);
  });

  it('should update conversation context', async () => {
    const mockSession = { context: { currentTopic: 'ACADEMIC' } };
    (ConversationSession.findByIdAndUpdate as any) = jest.fn().mockResolvedValue(mockSession);

    const conversationId = new mongoose.Types.ObjectId().toString();
    const result = await service.updateConversationContext(conversationId, { currentTopic: 'ACADEMIC' });
    expect(result.context.currentTopic).toBe('ACADEMIC');
  });

  it('should create a new FAQ entry', async () => {
    const mockFAQ = {
      _id: new mongoose.Types.ObjectId(),
      question: 'New question?',
      answer: 'New answer',
    };

    (FAQ as any).mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockFAQ),
    }));

    const faqData = {
      question: 'New question?',
      answer: 'New answer',
      category: 'ACADEMIC',
      keywords: ['test', 'question'],
    };

    const result = await service.createFAQ(faqData);
    expect(result).toEqual(mockFAQ);
  });

  it('should update FAQ entry', async () => {
    const mockFAQ = { question: 'Updated question', answer: 'Updated answer' };
    
    (FAQ.findById as any) = jest.fn().mockResolvedValue({ question: 'Old question' });
    (FAQ.findByIdAndUpdate as any) = jest.fn().mockResolvedValue(mockFAQ);

    const faqId = new mongoose.Types.ObjectId().toString();
    const result = await service.updateFAQ(faqId, { question: 'Updated question' });
    expect(result).toEqual(mockFAQ);
  });

  it('should retrieve all FAQs', async () => {
    const mockFAQs = [
      { _id: new mongoose.Types.ObjectId(), question: 'Q1', category: 'ACADEMIC' },
      { _id: new mongoose.Types.ObjectId(), question: 'Q2', category: 'ENROLLMENT' },
    ];

    (FAQ.find as any) = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockFAQs),
    });

    const result = await service.getFAQs();
    expect(result.length).toBe(2);
  });

  it('should search FAQs by keyword', async () => {
    const mockResults = [{ _id: new mongoose.Types.ObjectId(), question: 'GPA question' }];

    (FAQ.find as any) = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockResults),
    });

    const result = await service.searchFAQ('GPA');
    expect(result).toEqual(mockResults);
  });

  it('should retrieve conversation statistics', async () => {
    (ConversationSession.countDocuments as any) = jest.fn().mockResolvedValue(10);
    (ChatMessage.countDocuments as any) = jest.fn().mockResolvedValue(50);
    (FAQ.countDocuments as any) = jest.fn().mockResolvedValue(25);
    (ConversationSession.aggregate as any) = jest.fn().mockResolvedValue([{ avgSatisfaction: 4.2 }]);

    const result = await service.getConversationStats();
    expect(result.totalSessions).toBe(10);
  });

  it('should retrieve all conversations for a student', async () => {
    const mockConversations = [
      { _id: new mongoose.Types.ObjectId(), sessionId: 'session1' },
      { _id: new mongoose.Types.ObjectId(), sessionId: 'session2' },
    ];

    const studentId = new mongoose.Types.ObjectId().toString();

    (ConversationSession.find as any) = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockConversations),
    });

    const result = await service.getStudentConversations(studentId);
    expect(result.length).toBe(2);
  });

  it('should flag an inappropriate message', async () => {
    const mockMessage = { _id: new mongoose.Types.ObjectId(), isFlagged: true };
    (ChatMessage.findByIdAndUpdate as any) = jest.fn().mockResolvedValue(mockMessage);

    const result = await service.flagMessage('msg123', 'Spam');
    expect(result.isFlagged).toBe(true);
  });

  it('should rate FAQ as helpful', async () => {
    const mockFAQ = { _id: new mongoose.Types.ObjectId(), helpfulCount: 11 };
    (FAQ.findByIdAndUpdate as any) = jest.fn().mockResolvedValue(mockFAQ);

    const result = await service.rateFAQ('faq123', true);
    expect(result.helpfulCount).toBe(11);
  });

  it('should soft delete an FAQ entry', async () => {
    const mockFAQ = { _id: new mongoose.Types.ObjectId(), isActive: false };
    (FAQ.findByIdAndUpdate as any) = jest.fn().mockResolvedValue(mockFAQ);

    const result = await service.deleteFAQ('faq123');
    expect(result.isActive).toBe(false);
  });
});
