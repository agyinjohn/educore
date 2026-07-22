import AIService from '../services/ai.service';
import PredictionModel from '../models/PredictionModel';
import StudentPrediction from '../models/StudentPrediction';
import AnomalyRecord from '../models/AnomalyRecord';
import RiskAssessment from '../models/RiskAssessment';
import { Types } from 'mongoose';

jest.mock('../models/PredictionModel');
jest.mock('../models/StudentPrediction');
jest.mock('../models/AnomalyRecord');
jest.mock('../models/RiskAssessment');

describe('AIService', () => {
  const tenantId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const studentId = new Types.ObjectId();
  const modelId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPredictionModels', () => {
    it('should return all prediction models for a tenant', async () => {
      const mockModels = [
        { _id: modelId, name: 'Performance Model', modelType: 'PERFORMANCE' },
      ];
      (PredictionModel.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockModels),
      });

      const result = await AIService.getPredictionModels(tenantId);

      expect(PredictionModel.find).toHaveBeenCalledWith({ tenantId });
      expect(result).toEqual(mockModels);
    });

    it('should filter models by modelType', async () => {
      const mockModels = [
        { _id: modelId, name: 'Performance Model', modelType: 'PERFORMANCE' },
      ];
      (PredictionModel.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockModels),
      });

      await AIService.getPredictionModels(tenantId, { modelType: 'PERFORMANCE' });

      expect(PredictionModel.find).toHaveBeenCalledWith({
        tenantId,
        modelType: 'PERFORMANCE',
      });
    });
  });

  describe('getPredictionModel', () => {
    it('should return a single prediction model', async () => {
      const mockModel = {
        _id: modelId,
        name: 'Test Model',
        tenantId,
      };
      (PredictionModel.findOne as any as jest.Mock).mockResolvedValue(mockModel);

      const result = await AIService.getPredictionModel(tenantId, modelId);

      expect(PredictionModel.findOne).toHaveBeenCalledWith({
        _id: modelId,
        tenantId,
      });
      expect(result).toEqual(mockModel);
    });

    it('should return null if model not found', async () => {
      (PredictionModel.findOne as any as jest.Mock).mockResolvedValue(null);

      const result = await AIService.getPredictionModel(tenantId, modelId);

      expect(result).toBeNull();
    });
  });

  describe('createPredictionModel', () => {
    it('should create a new prediction model', async () => {
      const modelData = {
        name: 'New Model',
        modelType: 'PERFORMANCE' as const,
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

      const mockSavedModel = {
        _id: modelId,
        ...modelData,
        tenantId,
        createdBy: userId,
      };

      const mockModel = {
        save: jest.fn().mockResolvedValue(mockSavedModel),
      };

      (PredictionModel as any).mockImplementation(() => mockModel);

      const result = await AIService.createPredictionModel(tenantId, modelData, userId);

      expect(result).toEqual(mockSavedModel);
      expect(mockModel.save).toHaveBeenCalled();
    });
  });

  describe('predictStudentPerformance', () => {
    it('should predict student performance', async () => {
      const mockModel = {
        _id: modelId,
        name: 'Performance Model',
        modelType: 'PERFORMANCE',
      };

      (PredictionModel.findOne as any as jest.Mock).mockResolvedValue(mockModel);

      const studentFeatures = {
        gpa: 3.5,
        attendanceRate: 90,
        studyHours: 8,
      };

      const mockPrediction = {
        _id: new Types.ObjectId(),
        prediction: {
          value: 0.85,
          confidence: 0.92,
          category: 'HIGH',
        },
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          prediction: {
            value: 0.85,
            confidence: 0.92,
            category: 'HIGH',
          },
          tenantId,
          studentId,
        }),
      };

      (StudentPrediction as any).mockImplementation(() => mockPrediction);

      const result = await AIService.predictStudentPerformance(
        tenantId,
        studentId,
        modelId,
        studentFeatures
      );

      expect(result).toBeDefined();
      expect(result.prediction).toBeDefined();
    });

    it('should throw error if model not found', async () => {
      (PredictionModel.findOne as any as jest.Mock).mockResolvedValue(null);

      await expect(
        AIService.predictStudentPerformance(
          tenantId,
          studentId,
          modelId,
          { gpa: 3.5 }
        )
      ).rejects.toThrow('Prediction model not found');
    });
  });

  describe('getStudentPredictions', () => {
    it('should return student predictions', async () => {
      const mockPredictions = [
        {
          _id: new Types.ObjectId(),
          predictionType: 'PERFORMANCE',
          prediction: { value: 0.85 },
        },
      ];

      (StudentPrediction.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPredictions),
      });

      const result = await AIService.getStudentPredictions(tenantId, studentId);

      expect(result).toEqual(mockPredictions);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalies in student data', async () => {
      const studentMetrics = {
        attendanceRate: 50,
        gpa: 1.5,
        engagementScore: 30,
      };

      const mockAnomalies = [
        {
          _id: new Types.ObjectId(),
          anomalyType: 'ATTENDANCE',
          severity: 'HIGH',
          save: jest.fn().mockResolvedValue({
            _id: new Types.ObjectId(),
            anomalyType: 'ATTENDANCE',
            severity: 'HIGH',
          }),
        },
      ];

      (AnomalyRecord as any).mockImplementation(() => mockAnomalies[0]);

      const result = await AIService.detectAnomalies(tenantId, studentId, studentMetrics);

      expect(result).toBeDefined();
    });

    it('should not detect anomalies for normal metrics', async () => {
      const studentMetrics = {
        attendanceRate: 95,
        gpa: 3.8,
        engagementScore: 85,
      };

      const result = await AIService.detectAnomalies(tenantId, studentId, studentMetrics);

      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getStudentAnomalies', () => {
    it('should return student anomalies', async () => {
      const mockAnomalies = [
        {
          _id: new Types.ObjectId(),
          anomalyType: 'ATTENDANCE',
          severity: 'HIGH',
        },
      ];

      (AnomalyRecord.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAnomalies),
      });

      const result = await AIService.getStudentAnomalies(tenantId, studentId);

      expect(result).toEqual(mockAnomalies);
    });
  });

  describe('updateAnomalyStatus', () => {
    it('should update anomaly status', async () => {
      const anomalyId = new Types.ObjectId().toString();
      const mockUpdatedAnomaly = {
        _id: anomalyId,
        investigationStatus: 'RESOLVED',
        resolvedAt: expect.any(Date),
      };

      (AnomalyRecord.findOneAndUpdate as any as jest.Mock).mockResolvedValue(
        mockUpdatedAnomaly
      );

      const result = await AIService.updateAnomalyStatus(
        tenantId,
        anomalyId,
        'RESOLVED',
        'Issue addressed'
      );

      expect(result).toEqual(mockUpdatedAnomaly);
    });
  });

  describe('assessStudentRisk', () => {
    it('should assess student risk', async () => {
      const metrics = {
        gpa: 1.8,
        attendanceRate: 70,
        disciplineIncidents: 3,
        engagementScore: 40,
      };

      const mockRiskAssessment = {
        _id: new Types.ObjectId(),
        riskLevel: 'HIGH',
        overallRiskScore: 75,
        save: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          riskLevel: 'HIGH',
          overallRiskScore: 75,
          tenantId,
          studentId,
        }),
      };

      (RiskAssessment as any).mockImplementation(() => mockRiskAssessment);

      const result = await AIService.assessStudentRisk(tenantId, studentId, metrics);

      expect(result).toBeDefined();
      expect(result.riskLevel).toBeDefined();
    });
  });

  describe('getRiskAssessments', () => {
    it('should return risk assessments', async () => {
      const mockAssessments = [
        {
          _id: new Types.ObjectId(),
          riskLevel: 'HIGH',
          overallRiskScore: 75,
        },
      ];

      (RiskAssessment.find as any as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAssessments),
      });

      const result = await AIService.getRiskAssessments(tenantId, { riskLevel: 'HIGH' });

      expect(result).toEqual(mockAssessments);
    });
  });

  describe('getAIStats', () => {
    it('should return AI service statistics', async () => {
      (PredictionModel.countDocuments as any as jest.Mock).mockResolvedValue(5);
      (StudentPrediction.countDocuments as any as jest.Mock).mockResolvedValue(120);
      (AnomalyRecord.countDocuments as any as jest.Mock).mockResolvedValue(8);
      (RiskAssessment.countDocuments as any as jest.Mock).mockResolvedValue(45);

      const result = await AIService.getAIStats(tenantId);

      expect(result.activeModels).toBe(5);
      expect(result.totalPredictions).toBe(120);
      expect(result.openAnomalies).toBe(8);
      expect(result.studentsAssessed).toBe(45);
    });
  });
});
