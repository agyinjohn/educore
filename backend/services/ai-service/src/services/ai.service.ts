import { Types } from 'mongoose';
import PredictionModel, { IPredictionModel } from '../models/PredictionModel';
import StudentPrediction, { IStudentPrediction } from '../models/StudentPrediction';
import AnomalyRecord, { IAnomalyRecord } from '../models/AnomalyRecord';
import RiskAssessment, { IRiskAssessment } from '../models/RiskAssessment';

export class AIService {
  /**
   * Create a new prediction model
   */
  async createPredictionModel(
    tenantId: Types.ObjectId,
    modelData: Partial<IPredictionModel>,
    userId: Types.ObjectId
  ): Promise<any> {
    const model = new PredictionModel({
      ...modelData,
      tenantId,
      createdBy: userId,
    });
    return model.save();
  }

  /**
   * Get all prediction models for a tenant
   */
  async getPredictionModels(
    tenantId: Types.ObjectId,
    filters?: { modelType?: string; status?: string }
  ): Promise<any[]> {
    const query: any = { tenantId };
    if (filters?.modelType) query.modelType = filters.modelType;
    if (filters?.status) query.status = filters.status;
    return PredictionModel.find(query).sort({ createdAt: -1 });
  }

  /**
   * Get a specific prediction model
   */
  async getPredictionModel(tenantId: Types.ObjectId, modelId: string): Promise<any> {
    return PredictionModel.findOne({
      _id: modelId,
      tenantId,
    });
  }

  /**
   * Update a prediction model
   */
  async updatePredictionModel(
    tenantId: Types.ObjectId,
    modelId: string,
    updates: Partial<IPredictionModel>
  ): Promise<any> {
    return PredictionModel.findOneAndUpdate(
      { _id: modelId, tenantId },
      updates,
      { new: true }
    );
  }

  /**
   * Predict student performance using a model
   */
  async predictStudentPerformance(
    tenantId: Types.ObjectId,
    studentId: Types.ObjectId,
    modelId: string,
    studentFeatures: Record<string, any>
  ): Promise<any> {
    const model = await this.getPredictionModel(tenantId, modelId);
    if (!model) {
      throw new Error('Prediction model not found');
    }

    // Simulate ML prediction (in production, use actual ML framework)
    const prediction = this.simulatePerformancePrediction(studentFeatures);

    const predictionRecord = new StudentPrediction({
      tenantId,
      studentId,
      modelId,
      predictionType: model.modelType,
      prediction,
      features: studentFeatures,
      predictedAt: new Date(),
      explanations: {
        topFeatures: this.extractTopFeatures(studentFeatures),
        summary: `Student has ${prediction.confidence > 0.8 ? 'high' : 'moderate'} probability of ${prediction.category} performance`,
      },
    });

    return predictionRecord.save();
  }

  /**
   * Simulate performance prediction
   */
  private simulatePerformancePrediction(features: Record<string, any>): any {
    const gpa = features.gpa || 3.0;
    const attendance = features.attendanceRate || 80;
    const studyHours = features.studyHours || 5;

    // Simple scoring algorithm
    const score = (gpa / 4.0) * 0.4 + (attendance / 100) * 0.4 + (studyHours / 20) * 0.2;
    const value = Math.min(Math.max(score, 0), 1);

    return {
      value,
      confidence: 0.75 + Math.random() * 0.25,
      category: value > 0.7 ? 'HIGH' : value > 0.4 ? 'MEDIUM' : 'LOW',
    };
  }

  /**
   * Extract top features from student data
   */
  private extractTopFeatures(
    features: Record<string, any>
  ): Array<{ name: string; importance: number; contribution: string }> {
    const topFeatures = [
      {
        name: 'GPA',
        importance: 0.4,
        contribution: `GPA of ${features.gpa || 'N/A'} strongly influences performance`,
      },
      {
        name: 'Attendance Rate',
        importance: 0.35,
        contribution: `${features.attendanceRate || 'N/A'}% attendance rate impacts outcomes`,
      },
      {
        name: 'Study Hours',
        importance: 0.25,
        contribution: `${features.studyHours || 'N/A'} study hours per week affects performance`,
      },
    ];
    return topFeatures;
  }

  /**
   * Get student predictions
   */
  async getStudentPredictions(
    tenantId: Types.ObjectId,
    studentId: Types.ObjectId,
    filters?: { predictionType?: string }
  ): Promise<any[]> {
    const query: any = { tenantId, studentId };
    if (filters?.predictionType) query.predictionType = filters.predictionType;
    return StudentPrediction.find(query).sort({ predictedAt: -1 });
  }

  /**
   * Detect anomalies in student data
   */
  async detectAnomalies(
    tenantId: Types.ObjectId,
    studentId: Types.ObjectId,
    studentMetrics: Record<string, number>
  ): Promise<any[]> {
    const anomalies = [];

    // Check attendance anomaly
    if (studentMetrics.attendanceRate < 70) {
      anomalies.push(
        await this.createAnomaly(
          tenantId,
          studentId,
          'ATTENDANCE',
          'HIGH',
          `Attendance rate ${studentMetrics.attendanceRate}% is below threshold of 70%`,
          85,
          studentMetrics.attendanceRate,
          'Statistical Threshold'
        )
      );
    }

    // Check performance anomaly
    if (studentMetrics.gpa < 2.0) {
      anomalies.push(
        await this.createAnomaly(
          tenantId,
          studentId,
          'PERFORMANCE',
          'HIGH',
          `GPA ${studentMetrics.gpa} indicates academic struggle`,
          3.5,
          studentMetrics.gpa,
          'Performance Regression'
        )
      );
    }

    // Check engagement anomaly
    if (studentMetrics.engagementScore < 40) {
      anomalies.push(
        await this.createAnomaly(
          tenantId,
          studentId,
          'ENGAGEMENT',
          'MEDIUM',
          `Low engagement score ${studentMetrics.engagementScore}%`,
          60,
          studentMetrics.engagementScore,
          'Engagement Detection'
        )
      );
    }

    return anomalies;
  }

  /**
   * Create an anomaly record
   */
  private async createAnomaly(
    tenantId: Types.ObjectId,
    studentId: Types.ObjectId,
    anomalyType: string,
    severity: string,
    description: string,
    baselineValue: number,
    observedValue: number,
    detectionMethod: string
  ): Promise<any> {
    const anomaly = new AnomalyRecord({
      tenantId,
      studentId,
      anomalyType,
      severity,
      description,
      metrics: { threshold: baselineValue },
      baselineValue,
      observedValue,
      deviation: Math.abs(((observedValue - baselineValue) / baselineValue) * 100),
      detectionMethod,
      detectedAt: new Date(),
      detectedBy: { type: 'SYSTEM' },
      recommendedActions: this.getRecommendedActions(anomalyType, severity),
    });
    return anomaly.save();
  }

  /**
   * Get recommended actions for anomaly
   */
  private getRecommendedActions(anomalyType: string, severity: string): string[] {
    const actions: Record<string, Record<string, string[]>> = {
      ATTENDANCE: {
        HIGH: [
          'Schedule meeting with student and parent',
          'Review for medical/personal issues',
          'Implement attendance improvement plan',
        ],
        MEDIUM: ['Monitor attendance closely', 'Provide supportive intervention'],
      },
      PERFORMANCE: {
        HIGH: [
          'Conduct academic assessment',
          'Provide tutoring support',
          'Review course difficulty',
        ],
        MEDIUM: ['Monitor grades', 'Offer study resources'],
      },
      ENGAGEMENT: {
        HIGH: ['Assess student wellbeing', 'Provide counseling support'],
        MEDIUM: ['Encourage participation', 'Review interests'],
      },
    };

    return actions[anomalyType]?.[severity] || ['Monitor situation closely'];
  }

  /**
   * Get anomalies for a student
   */
  async getStudentAnomalies(
    tenantId: Types.ObjectId,
    studentId: Types.ObjectId,
    filters?: { severity?: string; status?: string }
  ): Promise<any[]> {
    const query: any = { tenantId, studentId };
    if (filters?.severity) query.severity = filters.severity;
    if (filters?.status) query.investigationStatus = filters.status;
    return AnomalyRecord.find(query).sort({ detectedAt: -1 });
  }

  /**
   * Update anomaly investigation status
   */
  async updateAnomalyStatus(
    tenantId: Types.ObjectId,
    anomalyId: string,
    status: string,
    notes?: string
  ): Promise<any> {
    const update: any = { investigationStatus: status };
    if (notes) update.investigationNotes = notes;
    if (status === 'RESOLVED') update.resolvedAt = new Date();

    return AnomalyRecord.findOneAndUpdate(
      { _id: anomalyId, tenantId },
      update,
      { new: true }
    );
  }

  /**
   * Assess student risk
   */
  async assessStudentRisk(
    tenantId: Types.ObjectId,
    studentId: Types.ObjectId,
    metrics: Record<string, any>
  ): Promise<any> {
    const riskFactors = this.calculateRiskFactors(metrics);
    const overallScore = this.calculateOverallRiskScore(riskFactors);
    const riskLevel = this.determineRiskLevel(overallScore);

    const riskAssessment = new RiskAssessment({
      tenantId,
      studentId,
      overallRiskScore: overallScore,
      riskFactors,
      riskLevel,
      indicators: {
        academicRisk: metrics.gpa < 2.5,
        attendanceRisk: metrics.attendanceRate < 75,
        behavioralRisk: metrics.disciplineIncidents > 2,
        engagementRisk: metrics.engagementScore < 50,
      },
      lastAssessedAt: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return riskAssessment.save();
  }

  /**
   * Calculate risk factors
   */
  private calculateRiskFactors(
    metrics: Record<string, any>
  ): Array<{ category: string; riskScore: number; description: string; isActive: boolean }> {
    const factors = [];

    // Academic risk
    const gpaRisk = Math.max(0, (2.5 - (metrics.gpa || 3.0)) / 2.5) * 100;
    if (gpaRisk > 20) {
      factors.push({
        category: 'Academic Performance',
        riskScore: gpaRisk,
        description: `GPA ${metrics.gpa || 'N/A'} below target`,
        isActive: true,
      });
    }

    // Attendance risk
    const attendanceRisk = Math.max(0, (75 - (metrics.attendanceRate || 90)) / 75) * 100;
    if (attendanceRisk > 10) {
      factors.push({
        category: 'Attendance',
        riskScore: attendanceRisk,
        description: `Attendance ${metrics.attendanceRate || 'N/A'}% below target`,
        isActive: true,
      });
    }

    // Behavioral risk
    if ((metrics.disciplineIncidents || 0) > 2) {
      factors.push({
        category: 'Behavior',
        riskScore: Math.min(100, (metrics.disciplineIncidents - 2) * 25),
        description: `${metrics.disciplineIncidents} discipline incidents recorded`,
        isActive: true,
      });
    }

    // Engagement risk
    const engagementRisk = Math.max(0, (50 - (metrics.engagementScore || 70)) / 50) * 100;
    if (engagementRisk > 15) {
      factors.push({
        category: 'Engagement',
        riskScore: engagementRisk,
        description: `Low engagement score ${metrics.engagementScore || 'N/A'}`,
        isActive: true,
      });
    }

    return factors;
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(
    riskFactors: Array<{ riskScore: number }>
  ): number {
    if (riskFactors.length === 0) return 0;
    const sum = riskFactors.reduce((acc, f) => acc + f.riskScore, 0);
    return Math.min(100, sum / riskFactors.length);
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Get risk assessments
   */
  async getRiskAssessments(
    tenantId: Types.ObjectId,
    filters?: { riskLevel?: string; studentId?: string }
  ): Promise<any[]> {
    const query: any = { tenantId };
    if (filters?.riskLevel) query.riskLevel = filters.riskLevel;
    if (filters?.studentId) query.studentId = filters.studentId;
    return RiskAssessment.find(query).sort({ overallRiskScore: -1 });
  }

  /**
   * Get AI service statistics
   */
  async getAIStats(tenantId: Types.ObjectId): Promise<any> {
    const [modelCount, predictionCount, anomalyCount, riskCount] = await Promise.all([
      PredictionModel.countDocuments({ tenantId, status: 'ACTIVE' }),
      StudentPrediction.countDocuments({ tenantId }),
      AnomalyRecord.countDocuments({ tenantId, investigationStatus: 'NEW' }),
      RiskAssessment.countDocuments({ tenantId }),
    ]);

    return {
      activeModels: modelCount,
      totalPredictions: predictionCount,
      openAnomalies: anomalyCount,
      studentsAssessed: riskCount,
    };
  }
}

export default new AIService();
