import { Request, Response } from 'express';
import AIController from '../controllers/ai.controller';
import AIService from '../services/ai.service';
import { Types } from 'mongoose';

jest.mock('../services/ai.service');

describe('AIController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const tenantId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const studentId = new Types.ObjectId();
  const modelId = new Types.ObjectId().toString();

  beforeEach(() => {
    mockRequest = {
      headers: {
        'x-tenant-id': tenantId.toString(),
        'x-user-id': userId.toString(),
      },
      params: {},
      query: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('health', () => {
    it('should return healthy status', async () => {
      await AIController.health(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          service: 'ai-service',
        })
      );
    });
  });

  describe('getModels', () => {
    it('should get all prediction models', async () => {
      const mockModels = [
        { _id: modelId, name: 'Model 1', modelType: 'PERFORMANCE' },
      ];

      (AIService.getPredictionModels as jest.Mock).mockResolvedValue(mockModels);

      await AIController.getModels(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockModels,
          count: 1,
        })
      );
    });

    it('should handle errors when fetching models', async () => {
      (AIService.getPredictionModels as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await AIController.getModels(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database error',
        })
      );
    });
  });

  describe('createModel', () => {
    it('should create a new prediction model', async () => {
      mockRequest.body = {
        name: 'New Model',
        modelType: 'PERFORMANCE',
        version: '1.0.0',
        hyperparameters: {
          learningRate: 0.01,
          epochs: 100,
          batchSize: 32,
          validationSplit: 0.2,
        },
        trainingData: {
          recordsUsed: 500,
          featureCount: 15,
          targetVariable: 'gpa',
        },
      };

      const mockModel = {
        _id: modelId,
        ...mockRequest.body,
        tenantId,
        createdBy: userId,
      };

      (AIService.createPredictionModel as jest.Mock).mockResolvedValue(mockModel);

      await AIController.createModel(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockModel,
        })
      );
    });
  });

  describe('predictPerformance', () => {
    it('should predict student performance', async () => {
      mockRequest.body = {
        studentId: studentId.toString(),
        modelId,
        features: {
          gpa: 3.5,
          attendanceRate: 90,
          studyHours: 8,
        },
      };

      const mockPrediction = {
        _id: new Types.ObjectId(),
        prediction: {
          value: 0.85,
          confidence: 0.92,
          category: 'HIGH',
        },
      };

      (AIService.predictStudentPerformance as jest.Mock).mockResolvedValue(
        mockPrediction
      );

      await AIController.predictPerformance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('getStudentPredictions', () => {
    it('should get student predictions', async () => {
      mockRequest.params = { studentId: studentId.toString() };

      const mockPredictions = [
        {
          _id: new Types.ObjectId(),
          predictionType: 'PERFORMANCE',
          prediction: { value: 0.85 },
        },
      ];

      (AIService.getStudentPredictions as jest.Mock).mockResolvedValue(mockPredictions);

      await AIController.getStudentPredictions(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockPredictions,
          count: 1,
        })
      );
    });
  });

  describe('detectAnomalies', () => {
    it('should detect student anomalies', async () => {
      mockRequest.body = {
        studentId: studentId.toString(),
        metrics: {
          attendanceRate: 50,
          gpa: 1.5,
          engagementScore: 30,
        },
      };

      const mockAnomalies = [
        {
          _id: new Types.ObjectId(),
          anomalyType: 'ATTENDANCE',
          severity: 'HIGH',
        },
      ];

      (AIService.detectAnomalies as jest.Mock).mockResolvedValue(mockAnomalies);

      await AIController.detectAnomalies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 1,
        })
      );
    });
  });

  describe('getAnomalies', () => {
    it('should get student anomalies with filters', async () => {
      mockRequest.params = { studentId: studentId.toString() };
      mockRequest.query = { severity: 'HIGH' };

      const mockAnomalies = [
        {
          _id: new Types.ObjectId(),
          anomalyType: 'ATTENDANCE',
          severity: 'HIGH',
        },
      ];

      (AIService.getStudentAnomalies as jest.Mock).mockResolvedValue(mockAnomalies);

      await AIController.getAnomalies(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAnomalies,
          count: 1,
        })
      );
    });
  });

  describe('updateAnomaly', () => {
    it('should update anomaly status', async () => {
      mockRequest.params = { anomalyId: new Types.ObjectId().toString() };
      mockRequest.body = { status: 'RESOLVED', notes: 'Issue fixed' };

      const mockUpdatedAnomaly = {
        _id: mockRequest.params.anomalyId,
        investigationStatus: 'RESOLVED',
        investigationNotes: 'Issue fixed',
      };

      (AIService.updateAnomalyStatus as jest.Mock).mockResolvedValue(
        mockUpdatedAnomaly
      );

      await AIController.updateAnomaly(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should return 404 if anomaly not found', async () => {
      mockRequest.params = { anomalyId: new Types.ObjectId().toString() };
      mockRequest.body = { status: 'RESOLVED' };

      (AIService.updateAnomalyStatus as jest.Mock).mockResolvedValue(null);

      await AIController.updateAnomaly(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('assessRisk', () => {
    it('should assess student risk', async () => {
      mockRequest.body = {
        studentId: studentId.toString(),
        metrics: {
          gpa: 1.8,
          attendanceRate: 70,
          disciplineIncidents: 3,
          engagementScore: 40,
        },
      };

      const mockRiskAssessment = {
        _id: new Types.ObjectId(),
        riskLevel: 'HIGH',
        overallRiskScore: 75,
      };

      (AIService.assessStudentRisk as jest.Mock).mockResolvedValue(mockRiskAssessment);

      await AIController.assessRisk(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('getRiskAssessments', () => {
    it('should get risk assessments with filters', async () => {
      mockRequest.query = { riskLevel: 'HIGH' };

      const mockAssessments = [
        {
          _id: new Types.ObjectId(),
          riskLevel: 'HIGH',
          overallRiskScore: 75,
        },
      ];

      (AIService.getRiskAssessments as jest.Mock).mockResolvedValue(mockAssessments);

      await AIController.getRiskAssessments(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAssessments,
          count: 1,
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return AI service statistics', async () => {
      const mockStats = {
        activeModels: 5,
        totalPredictions: 120,
        openAnomalies: 8,
        studentsAssessed: 45,
      };

      (AIService.getAIStats as jest.Mock).mockResolvedValue(mockStats);

      await AIController.getStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockStats,
        })
      );
    });
  });
});
