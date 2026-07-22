import { Router } from 'express';
import AIController from '../controllers/ai.controller';

const router = Router();

// Health check
router.get('/health', (req, res) => AIController.health(req, res));

// Prediction Models
router.get('/models', (req, res) => AIController.getModels(req, res));
router.post('/models', (req, res) => AIController.createModel(req, res));
router.get('/models/:modelId', (req, res) => AIController.getModel(req, res));
router.put('/models/:modelId', (req, res) => AIController.updateModel(req, res));

// Predictions
router.post('/predict', (req, res) => AIController.predictPerformance(req, res));
router.get('/predictions/:studentId', (req, res) =>
  AIController.getStudentPredictions(req, res)
);

// Anomalies
router.post('/anomalies/detect', (req, res) => AIController.detectAnomalies(req, res));
router.get('/anomalies/:studentId', (req, res) => AIController.getAnomalies(req, res));
router.put('/anomalies/:anomalyId', (req, res) => AIController.updateAnomaly(req, res));

// Risk Assessments
router.post('/risk-assess', (req, res) => AIController.assessRisk(req, res));
router.get('/risk-assessments', (req, res) => AIController.getRiskAssessments(req, res));

// Statistics
router.get('/stats', (req, res) => AIController.getStats(req, res));

export default router;
