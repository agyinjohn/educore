import { ConversationSession, ChatMessage, FAQ } from '../models';
import mongoose from 'mongoose';

/**
 * Chatbot Service
 * Handles conversation management, intent recognition, and FAQ matching
 */

export class ChatbotService {
  private readonly tenantId: mongoose.Types.ObjectId;

  constructor(tenantId: mongoose.Types.ObjectId) {
    this.tenantId = tenantId;
  }

  /**
   * Start a new conversation session
   */
  async startConversation(studentId: string, studentName?: string): Promise<any> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = new ConversationSession({
        tenantId: this.tenantId,
        sessionId,
        studentId: new mongoose.Types.ObjectId(studentId),
        context: { studentName },
        messages: [],
        messageCount: 0,
        status: 'ACTIVE',
      });

      return await session.save();
    } catch (error) {
      throw new Error(`Failed to start conversation: ${(error as Error).message}`);
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    content: string,
    sender: 'USER' | 'CHATBOT',
    messageType: 'TEXT' | 'QUESTION' | 'FEEDBACK' | 'INTENT' = 'TEXT'
  ): Promise<any> {
    try {
      const intent = sender === 'USER' ? this.extractIntent(content) : undefined;
      let response: string | undefined;
      let sourceType: 'FAQ' | 'SERVICE_INTEGRATION' | 'GENERATED' | undefined;
      let sourceId: string | undefined;

      if (sender === 'USER') {
        const faqMatch = await this.matchFAQ(content);
        if (faqMatch) {
          response = faqMatch.answer;
          sourceType = 'FAQ';
          sourceId = faqMatch._id.toString();
        }
      }

      const message = new ChatMessage({
        tenantId: this.tenantId,
        conversationId: new mongoose.Types.ObjectId(conversationId),
        sender,
        messageType,
        content,
        intent,
        response,
        sourceType,
        sourceId,
        timestamp: new Date(),
      });

      const savedMessage = await message.save();

      // Update conversation
      await ConversationSession.findByIdAndUpdate(conversationId, {
        $push: { messages: savedMessage._id },
        $inc: { messageCount: 1 },
        lastActivityTime: new Date(),
      });

      // Update FAQ usage if matched
      if (sourceId) {
        await FAQ.findByIdAndUpdate(sourceId, {
          $inc: { usageCount: 1 },
        });
      }

      return savedMessage;
    } catch (error) {
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }

  /**
   * End a conversation session
   */
  async endConversation(conversationId: string, satisfaction?: number): Promise<any> {
    try {
      const duration = Math.floor((Date.now() - new Date().getTime()) / 1000);

      return await ConversationSession.findByIdAndUpdate(
        conversationId,
        {
          status: 'CLOSED',
          endTime: new Date(),
          sessionDuration: duration,
          satisfaction: satisfaction || undefined,
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to end conversation: ${(error as Error).message}`);
    }
  }

  /**
   * Extract intent from message text
   */
  private extractIntent(content: string): { type: string; confidence: number; extractedEntities?: Record<string, any> } {
    const lowerContent = content.toLowerCase();
    const intents = [
      { type: 'ACADEMIC_HELP', keywords: ['assignment', 'homework', 'study', 'exam', 'grade', 'class'] },
      { type: 'ENROLLMENT', keywords: ['register', 'enroll', 'course', 'add class', 'drop'] },
      { type: 'SCHEDULE', keywords: ['schedule', 'time', 'when', 'class time', 'timetable'] },
      { type: 'PAYMENT', keywords: ['tuition', 'payment', 'bill', 'fee', 'cost'] },
      { type: 'TRANSCRIPT', keywords: ['transcript', 'record', 'grades', 'gpa'] },
      { type: 'GENERAL_INQUIRY', keywords: ['what', 'how', 'where', 'tell me', 'info'] },
    ];

    for (const intent of intents) {
      const matchCount = intent.keywords.filter(kw => lowerContent.includes(kw)).length;
      if (matchCount > 0) {
        return {
          type: intent.type,
          confidence: Math.min(matchCount / intent.keywords.length, 1),
        };
      }
    }

    return {
      type: 'GENERAL_INQUIRY',
      confidence: 0.3,
    };
  }

  /**
   * Match user message to FAQ using fuzzy matching
   */
  async matchFAQ(userMessage: string): Promise<any> {
    try {
      const faqs = await FAQ.find({
        tenantId: this.tenantId,
        isActive: true,
      }).sort({ priority: -1, usageCount: -1 });

      if (!faqs || faqs.length === 0) return null;

      let bestMatch: any = null;
      let bestScore = 0;

      for (const faq of faqs) {
        const score = this.fuzzyMatchScore(userMessage.toLowerCase(), faq.searchIndex?.toLowerCase() || '');
        if (score > bestScore && score > 0.4) {
          bestScore = score;
          bestMatch = faq;
        }
      }

      return bestMatch;
    } catch (error) {
      throw new Error(`Failed to match FAQ: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate fuzzy match score between two strings
   */
  private fuzzyMatchScore(input: string, target: string): number {
    const inputWords = input.split(/\s+/);
    const targetWords = target.split(/\s+/);
    let matches = 0;

    for (const inputWord of inputWords) {
      for (const targetWord of targetWords) {
        if (targetWord.includes(inputWord) || inputWord.includes(targetWord)) {
          matches++;
          break;
        }
      }
    }

    return Math.min(matches / Math.max(inputWords.length, targetWords.length), 1);
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string): Promise<any> {
    try {
      return await ConversationSession.findById(conversationId)
        .populate('messages')
        .exec();
    } catch (error) {
      throw new Error(`Failed to get conversation history: ${(error as Error).message}`);
    }
  }

  /**
   * Update conversation context
   */
  async updateConversationContext(conversationId: string, context: any): Promise<any> {
    try {
      return await ConversationSession.findByIdAndUpdate(
        conversationId,
        { context },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to update conversation context: ${(error as Error).message}`);
    }
  }

  /**
   * Create an FAQ entry
   */
  async createFAQ(faqData: {
    question: string;
    answer: string;
    category: string;
    keywords: string[];
    priority?: number;
    tags?: string[];
  }): Promise<any> {
    try {
      const searchIndex = `${faqData.question} ${faqData.answer} ${faqData.keywords.join(' ')}`;

      const faq = new FAQ({
        tenantId: this.tenantId,
        ...faqData,
        searchIndex,
        isActive: true,
      });

      return await faq.save();
    } catch (error) {
      throw new Error(`Failed to create FAQ: ${(error as Error).message}`);
    }
  }

  /**
   * Update an FAQ entry
   */
  async updateFAQ(faqId: string, updateData: any): Promise<any> {
    try {
      return await FAQ.findByIdAndUpdate(faqId, updateData, { new: true });
    } catch (error) {
      throw new Error(`Failed to update FAQ: ${(error as Error).message}`);
    }
  }

  /**
   * Get all FAQs with optional filters
   */
  async getFAQs(category?: string, isActive: boolean = true): Promise<any[]> {
    try {
      const query: any = { tenantId: this.tenantId, isActive };
      if (category) query.category = category;

      return await FAQ.find(query).sort({ priority: -1, usageCount: -1 });
    } catch (error) {
      throw new Error(`Failed to get FAQs: ${(error as Error).message}`);
    }
  }

  /**
   * Search FAQs by keyword
   */
  async searchFAQ(keyword: string): Promise<any[]> {
    try {
      const results = await FAQ.find({
        tenantId: this.tenantId,
        isActive: true,
        $or: [
          { searchIndex: { $regex: keyword, $options: 'i' } },
          { tags: { $in: [keyword] } },
        ],
      }).sort({ usageCount: -1 });

      return results;
    } catch (error) {
      throw new Error(`Failed to search FAQs: ${(error as Error).message}`);
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(): Promise<any> {
    try {
      const totalSessions = await ConversationSession.countDocuments({
        tenantId: this.tenantId,
      });

      const activeSessions = await ConversationSession.countDocuments({
        tenantId: this.tenantId,
        status: 'ACTIVE',
      });

      const closedSessions = await ConversationSession.countDocuments({
        tenantId: this.tenantId,
        status: 'CLOSED',
      });

      const totalMessages = await ChatMessage.countDocuments({
        tenantId: this.tenantId,
      });

      const totalFAQs = await FAQ.countDocuments({
        tenantId: this.tenantId,
        isActive: true,
      });

      const avgSatisfaction = await ConversationSession.aggregate([
        { $match: { tenantId: this.tenantId, satisfaction: { $exists: true } } },
        { $group: { _id: null, avgSatisfaction: { $avg: '$satisfaction' } } },
      ]);

      return {
        totalSessions,
        activeSessions,
        closedSessions,
        totalMessages,
        totalFAQs,
        avgSatisfaction: avgSatisfaction[0]?.avgSatisfaction || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${(error as Error).message}`);
    }
  }

  /**
   * Get student conversations
   */
  async getStudentConversations(studentId: string): Promise<any[]> {
    try {
      return await ConversationSession.find({
        tenantId: this.tenantId,
        studentId: new mongoose.Types.ObjectId(studentId),
      }).sort({ startTime: -1 });
    } catch (error) {
      throw new Error(`Failed to get student conversations: ${(error as Error).message}`);
    }
  }

  /**
   * Flag inappropriate message
   */
  async flagMessage(messageId: string, reason: string): Promise<any> {
    try {
      return await ChatMessage.findByIdAndUpdate(
        messageId,
        {
          isFlagged: true,
          flagReason: reason,
        },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to flag message: ${(error as Error).message}`);
    }
  }

  /**
   * Rate FAQ helpfulness
   */
  async rateFAQ(faqId: string, helpful: boolean): Promise<any> {
    try {
      const updateField = helpful ? 'helpfulCount' : 'unhelpfulCount';
      return await FAQ.findByIdAndUpdate(
        faqId,
        { $inc: { [updateField]: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to rate FAQ: ${(error as Error).message}`);
    }
  }

  /**
   * Delete FAQ entry
   */
  async deleteFAQ(faqId: string): Promise<any> {
    try {
      return await FAQ.findByIdAndUpdate(
        faqId,
        { isActive: false },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to delete FAQ: ${(error as Error).message}`);
    }
  }
}

export default ChatbotService;
