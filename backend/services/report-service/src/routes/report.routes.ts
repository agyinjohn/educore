import { Router } from 'express';
import ReportController from '../controllers/report.controller';
import { resolveTenant } from '../middleware/resolveTenant';

const router = Router();

// Health check (no tenant header required)
router.get('/health', (req, res) => ReportController.health(req, res));

// Everything below trusts the gateway to have authenticated the caller and
// injected x-school-id.
router.use(resolveTenant);

// Report Templates
router.get('/templates', (req, res) => ReportController.getTemplates(req, res));
router.post('/templates', (req, res) => ReportController.createTemplate(req, res));
router.get('/templates/:templateId', (req, res) => ReportController.getTemplate(req, res));
router.put('/templates/:templateId', (req, res) => ReportController.updateTemplate(req, res));
router.delete('/templates/:templateId', (req, res) =>
  ReportController.deleteTemplate(req, res)
);

// Generate Reports
router.post('/generate', (req, res) => ReportController.generateReport(req, res));
router.get('/generated', (req, res) => ReportController.getGeneratedReports(req, res));
router.get('/generated/:reportId', (req, res) =>
  ReportController.getGeneratedReport(req, res)
);
router.delete('/generated/:reportId', (req, res) =>
  ReportController.deleteGeneratedReport(req, res)
);

// Scheduled Reports
router.post('/scheduled', (req, res) => ReportController.createScheduledReport(req, res));
router.get('/scheduled', (req, res) => ReportController.getScheduledReports(req, res));
router.put('/scheduled/:scheduleId', (req, res) =>
  ReportController.updateScheduledReport(req, res)
);
router.delete('/scheduled/:scheduleId', (req, res) =>
  ReportController.deleteScheduledReport(req, res)
);

// Statistics
router.get('/stats', (req, res) => ReportController.getStats(req, res));

export default router;
