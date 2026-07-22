import { Request, Response } from 'express';
import ChatbotService from '../services';
import mongoose from 'mongoose';

/**
 * Chatbot Controller
 * Handles HTTP requests for chatbot operations
 */

export class ChatbotController {
  /**
   * Health check endpoint
   */
  static async health(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'healthy',
      service: 'chatbot-service',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start a new conversation
   */
  static async startConversation(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, studentName } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!studentId || !tenantId) {
        res.status(400).json({ error: 'Missing studentId or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const session = await service.startConversation(studentId, studentName);

      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { content, sender, messageType } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!conversationId || !content || !sender || !tenantId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const message = await service.sendMessage(conversationId, content, sender, messageType);

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * End a conversation
   */
  static async endConversation(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { satisfaction } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!conversationId || !tenantId) {
        res.status(400).json({ error: 'Missing conversationId or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const session = await service.endConversation(conversationId, satisfaction);

      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!conversationId || !tenantId) {
        res.status(400).json({ error: 'Missing conversationId or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const history = await service.getConversationHistory(conversationId);

      if (!history) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Get student conversations
   */
  static async getStudentConversations(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!studentId || !tenantId) {
        res.status(400).json({ error: 'Missing studentId or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const conversations = await service.getStudentConversations(studentId);

      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Create FAQ entry
   */
  static async createFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { question, answer, category, keywords, priority, tags } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!question || !answer || !category || !keywords || !tenantId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const faq = await service.createFAQ({ question, answer, category, keywords, priority, tags });

      res.status(201).json(faq);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Update FAQ entry
   */
  static async updateFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { faqId } = req.params;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!faqId || !tenantId) {
        res.status(400).json({ error: 'Missing faqId or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const updatedFAQ = await service.updateFAQ(faqId, req.body);

      res.status(200).json(updatedFAQ);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Get FAQs
   */
  static async getFAQs(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(400).json({ error: 'Missing tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const faqs = await service.getFAQs(category as string);

      res.status(200).json(faqs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Search FAQs
   */
  static async searchFAQs(req: Request, res: Response): Promise<void> {
    try {
      const { keyword } = req.query;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!keyword || !tenantId) {
        res.status(400).json({ error: 'Missing keyword or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const results = await service.searchFAQ(keyword as string);

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Get chatbot statistics
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(400).json({ error: 'Missing tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const stats = await service.getConversationStats();

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Flag inappropriate message
   */
  static async flagMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { reason } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!messageId || !reason || !tenantId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const flaggedMessage = await service.flagMessage(messageId, reason);

      res.status(200).json(flaggedMessage);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Rate FAQ helpfulness
   */
  static async rateFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { faqId } = req.params;
      const { helpful } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (faqId === undefined || helpful === undefined || !tenantId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const ratedFAQ = await service.rateFAQ(faqId, helpful);

      res.status(200).json(ratedFAQ);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Delete FAQ entry
   */
  static async deleteFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { faqId } = req.params;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!faqId || !tenantId) {
        res.status(400).json({ error: 'Missing faqId or tenantId' });
        return;
      }

      const service = new ChatbotService(new mongoose.Types.ObjectId(tenantId));
      const deletedFAQ = await service.deleteFAQ(faqId);

      res.status(200).json(deletedFAQ);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export default ChatbotController;
