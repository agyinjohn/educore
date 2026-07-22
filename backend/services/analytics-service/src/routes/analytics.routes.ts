import express, { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { resolveTenant } from '../middleware/resolveTenant';

const router: Router = express.Router();

// Health (no tenant header required)
router.get('/health', (req, res) => analyticsController.health(req, res));

// Everything below trusts the gateway to have authenticated the caller and
// injected x-school-id.
router.use(resolveTenant);

// Dashboard
router.get('/dashboard', (req, res) => analyticsController.getDashboard(req, res));

// Metrics
router.get('/metrics/:category', (req, res) => analyticsController.getMetricsByCategory(req, res));
router.get('/trends/:metricKey', (req, res) => analyticsController.getMetricTrends(req, res));
router.post('/metrics', (req, res) => analyticsController.upsertMetric(req, res));

// Reports
router.get('/reports', (req, res) => analyticsController.getCustomReports(req, res));
router.post('/reports', (req, res) => analyticsController.createCustomReport(req, res));
router.put('/reports/:reportId', (req, res) => analyticsController.updateCustomReport(req, res));
router.delete('/reports/:reportId', (req, res) => analyticsController.deleteCustomReport(req, res));

// Statistics
router.get('/stats', (req, res) => analyticsController.getSummaryStats(req, res));

// Events
router.post('/events', (req, res) => analyticsController.logEvent(req, res));

export default router;
