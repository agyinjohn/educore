import { Request, Response } from 'express';
import { Types } from 'mongoose';
import AIService from '../services/ai.service';

export class AIController {
  /**
   * GET /api/v1/ai/health
   */
  async health(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'healthy',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /api/v1/ai/models
   */
  async getModels(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { modelType, status } = req.query;

      const models = await AIService.getPredictionModels(tenantId, {
        modelType: modelType as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: models,
        count: models.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/ai/models
   */
  async createModel(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const userId = new Types.ObjectId(req.headers['x-user-id'] as string);
      const modelData = req.body;

      const model = await AIService.createPredictionModel(tenantId, modelData, userId);

      res.status(201).json({
        success: true,
        data: model,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/ai/models/:modelId
   */
  async getModel(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { modelId } = req.params;

      const model = await AIService.getPredictionModel(tenantId, modelId);

      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found',
        });
        return;
      }

      res.json({
        success: true,
        data: model,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/ai/models/:modelId
   */
  async updateModel(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { modelId } = req.params;

      const model = await AIService.updatePredictionModel(tenantId, modelId, req.body);

      if (!model) {
        res.status(404).json({
          success: false,
          error: 'Model not found',
        });
        return;
      }

      res.json({
        success: true,
        data: model,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/ai/predict
   */
  async predictPerformance(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { studentId, modelId, features } = req.body;

      const prediction = await AIService.predictStudentPerformance(
        tenantId,
        new Types.ObjectId(studentId),
        modelId,
        features
      );

      res.status(201).json({
        success: true,
        data: prediction,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/ai/predictions/:studentId
   */
  async getStudentPredictions(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { studentId } = req.params;
      const { predictionType } = req.query;

      const predictions = await AIService.getStudentPredictions(
        tenantId,
        new Types.ObjectId(studentId),
        { predictionType: predictionType as string }
      );

      res.json({
        success: true,
        data: predictions,
        count: predictions.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/ai/anomalies/detect
   */
  async detectAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { studentId, metrics } = req.body;

      const anomalies = await AIService.detectAnomalies(
        tenantId,
        new Types.ObjectId(studentId),
        metrics
      );

      res.status(201).json({
        success: true,
        data: anomalies,
        count: anomalies.length,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/ai/anomalies/:studentId
   */
  async getAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { studentId } = req.params;
      const { severity, status } = req.query;

      const anomalies = await AIService.getStudentAnomalies(
        tenantId,
        new Types.ObjectId(studentId),
        {
          severity: severity as string,
          status: status as string,
        }
      );

      res.json({
        success: true,
        data: anomalies,
        count: anomalies.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/ai/anomalies/:anomalyId
   */
  async updateAnomaly(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { anomalyId } = req.params;
      const { status, notes } = req.body;

      const anomaly = await AIService.updateAnomalyStatus(tenantId, anomalyId, status, notes);

      if (!anomaly) {
        res.status(404).json({
          success: false,
          error: 'Anomaly not found',
        });
        return;
      }

      res.json({
        success: true,
        data: anomaly,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/ai/risk-assess
   */
  async assessRisk(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { studentId, metrics } = req.body;

      const riskAssessment = await AIService.assessStudentRisk(
        tenantId,
        new Types.ObjectId(studentId),
        metrics
      );

      res.status(201).json({
        success: true,
        data: riskAssessment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/ai/risk-assessments
   */
  async getRiskAssessments(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const { riskLevel, studentId } = req.query;

      const assessments = await AIService.getRiskAssessments(tenantId, {
        riskLevel: riskLevel as string,
        studentId: studentId as string,
      });

      res.json({
        success: true,
        data: assessments,
        count: assessments.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/ai/stats
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = new Types.ObjectId(req.headers['x-tenant-id'] as string);
      const stats = await AIService.getAIStats(tenantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new AIController();
