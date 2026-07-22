import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const router = Router();

// Health check
router.get('/health', ChatbotController.health);

// Conversation endpoints
router.post('/conversations', ChatbotController.startConversation);
router.post('/conversations/:conversationId/messages', ChatbotController.sendMessage);
router.put('/conversations/:conversationId', ChatbotController.endConversation);
router.get('/conversations/:conversationId', ChatbotController.getConversationHistory);

// Student conversations
router.get('/students/:studentId/conversations', ChatbotController.getStudentConversations);

// FAQ endpoints
router.post('/faqs', ChatbotController.createFAQ);
router.get('/faqs', ChatbotController.getFAQs);
router.put('/faqs/:faqId', ChatbotController.updateFAQ);
router.delete('/faqs/:faqId', ChatbotController.deleteFAQ);

// Search and rating
router.get('/search', ChatbotController.searchFAQs);
router.post('/faqs/:faqId/rate', ChatbotController.rateFAQ);

// Message moderation
router.put('/messages/:messageId/flag', ChatbotController.flagMessage);

// Statistics
router.get('/stats', ChatbotController.getStats);

export default router;
