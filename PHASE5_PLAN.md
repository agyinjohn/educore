# 🚀 PHASE 5 — INTELLIGENCE & ANALYTICS

**EduCore School Management System**  
**Phase:** 5 (Intelligence & Advanced Features)  
**Duration:** Weeks 27–30 (4 weeks)  
**Scope:** Analytics dashboards, custom report builder, AI at-risk model, chatbot  
**Status:** 🚀 **READY TO START**

---

## 📋 Phase 5 Overview

### Objectives
1. **Analytics Dashboard** — Real-time insights into school operations
2. **Custom Report Builder** — User-friendly report generation
3. **AI At-Risk Model** — Identify at-risk students early
4. **Chatbot Integration** — Automated student/parent support

### Previous Phase Completion
✅ Phase 4 (Communication Hub Backend) — **100% COMPLETE**
- 18 REST API endpoints
- 6 database models
- 21 passing tests
- 5,000+ lines documentation
- Ready for frontend development

---

## 🎯 Phase 5 Scope

### 1️⃣ Analytics Dashboard (New Microservice)

**Service Name:** `analytics-service` (Port 4007)

#### Features
- Real-time school performance metrics
- Attendance trends & analytics
- Grade distribution analysis
- Finance & revenue tracking
- Student engagement metrics
- Customizable dashboards

#### API Endpoints (8-10)
```
GET    /api/v1/analytics/dashboard             — Main dashboard data
GET    /api/v1/analytics/attendance            — Attendance analytics
GET    /api/v1/analytics/grades                — Grade analytics
GET    /api/v1/analytics/finance               — Finance metrics
GET    /api/v1/analytics/engagement            — Engagement metrics
GET    /api/v1/analytics/trends/:metric        — Trend analysis
POST   /api/v1/analytics/export                — Export data
GET    /api/v1/analytics/custom-reports        — List saved reports
POST   /api/v1/analytics/custom-reports        — Create custom report
DELETE /api/v1/analytics/custom-reports/:id    — Delete report
```

#### Database Models (3-4)
- `DashboardMetric` — Aggregated metrics
- `CustomReport` — User-generated reports
- `AnalyticsEvent` — Event tracking
- `DataCache` — Performance optimization

#### Key Metrics
- Student attendance rate
- Average grades by subject/class
- Fee collection rate
- Student engagement score
- At-risk student count

### 2️⃣ Custom Report Builder

**Features**
- Drag-and-drop report designer
- Pre-built templates (attendance, grades, finance)
- Flexible data filtering
- Export to PDF/Excel/CSV
- Email delivery scheduling
- Report sharing & permissions

**API Endpoints (5-6)**
```
GET    /api/v1/reports/templates               — Available templates
POST   /api/v1/reports/create                  — Create custom report
GET    /api/v1/reports/:reportId               — Get report details
POST   /api/v1/reports/:reportId/execute       — Generate report
POST   /api/v1/reports/:reportId/schedule      — Schedule delivery
GET    /api/v1/reports/:reportId/download      — Download report
```

**Export Formats**
- PDF (with branding/headers)
- Excel (with formulas)
- CSV (for analysis)
- JSON (for integrations)

### 3️⃣ AI At-Risk Model

**Purpose:** Identify students likely to drop out, fail, or disengage

**Features**
- Multi-factor risk assessment
- Real-time flagging
- Historical trend analysis
- Intervention recommendations
- Risk scoring algorithm

**Risk Factors (10+)**
- Attendance rate < 80%
- 2+ failing grades
- No assignment submissions (3+ weeks)
- No parent engagement
- Behavioral incidents (>3)
- Payment delays
- Subject-specific struggles
- Time-based patterns (mid-semester slumps)
- Peer comparison metrics
- External signals (life events)

**API Endpoints (4-5)**
```
GET    /api/v1/ai/at-risk-students            — List at-risk students
GET    /api/v1/ai/at-risk/:studentId          — Student risk profile
POST   /api/v1/ai/at-risk/:studentId/intervention — Log intervention
GET    /api/v1/ai/risk-factors                 — Model parameters
POST   /api/v1/ai/train-model                  — Retrain model
```

**Implementation**
- Python ML service (TensorFlow/scikit-learn)
- Weekly model retraining
- Confidence scores
- Explainability (feature importance)
- Integration with notification service (auto-alerts)

### 4️⃣ Chatbot Integration

**Purpose:** 24/7 student & parent support

**Features**
- FAQ automation
- Fee inquiry handling
- Attendance checking
- Assignment status
- Academic performance queries
- Escalation to human support

**Platforms**
- WhatsApp Business API
- SMS/Text
- Web widget
- Mobile app integration

**Common Queries (20+)**
- "What's my attendance?"
- "How are my grades?"
- "When is the fee due?"
- "What's my assignment?"
- "Am I at risk?"
- "Can I contact my teacher?"
- "What's the exam schedule?"

**API Endpoints (3-4)**
```
POST   /api/v1/chat/message                    — Handle chat message
GET    /api/v1/chat/history/:userId            — Chat history
POST   /api/v1/chat/train-intent                — Train intent model
POST   /api/v1/chat/escalate                    — Escalate to human
```

**Implementation**
- Dialogflow / Rasa NLU
- Intent classification
- Entity extraction
- Knowledge base integration
- Human handoff

---

## 📊 Technical Architecture

```
Phase 5 Services:

┌──────────────────────────────────────────┐
│       API Gateway (Port 3001)            │
│  /api/v1/analytics/*                     │
│  /api/v1/reports/*                       │
│  /api/v1/ai/*                            │
│  /api/v1/chat/*                          │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────┬──────────┬────────────┐
    │             │          │            │
    ▼             ▼          ▼            ▼
┌────────┐  ┌─────────┐  ┌──────┐  ┌──────────┐
│Analytics│ │Report   │  │AI    │  │Chatbot   │
│Service  │ │Builder  │  │Model │  │Service   │
│(4007)   │ │(4008)   │  │(4009)│  │(4010)    │
└────────┘  └─────────┘  └──────┘  └──────────┘
    │             │          │            │
    └─────────────┴──────────┴────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │MongoDB │ │Redis   │ │Python  │
    │(data)  │ │(cache) │ │(ML)    │
    └────────┘ └────────┘ └────────┘
```

---

## 🗂️ File Structure Plan

### analytics-service (Similar to notification-service)
```
analytics-service/
├── src/
│   ├── config/
│   ├── models/      (3-4 files)
│   ├── services/    (4-5 files)
│   ├── controllers/ (3-4 files)
│   ├── routes/      (3-4 files)
│   ├── middleware/
│   ├── types/
│   ├── __tests__/   (3 files)
│   └── index.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```

### report-service
```
report-service/
├── src/
│   ├── config/
│   ├── models/      (2-3 files)
│   ├── services/    (3-4 files)
│   ├── controllers/ (2-3 files)
│   ├── routes/      (2-3 files)
│   ├── templates/   (PDF/Excel templates)
│   ├── __tests__/   (2 files)
│   └── index.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```

### ai-service (Python)
```
ai-service/
├── src/
│   ├── models/      (TensorFlow models)
│   ├── services/    (ML service)
│   ├── routes/      (Flask/FastAPI)
│   ├── training/    (Training pipeline)
│   ├── utils/
│   ├── __tests__/
│   └── main.py
├── requirements.txt
├── Dockerfile
└── README.md
```

### chatbot-service
```
chatbot-service/
├── src/
│   ├── intents/     (Intent definitions)
│   ├── entities/    (Entity extraction)
│   ├── handlers/    (Message handlers)
│   ├── integrations/ (WhatsApp, SMS)
│   ├── services/    (3-4 files)
│   ├── routes/      (2-3 files)
│   ├── __tests__/   (2 files)
│   └── index.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

## 📊 Database Schema Plan

### Analytics Service Models
1. **DashboardMetric**
   - school_id, metric_type, value, timestamp, createdAt

2. **CustomReport**
   - school_id, name, createdBy, filters, columns, template, createdAt

3. **AnalyticsEvent**
   - school_id, event_type, data, timestamp

### Report Service Models
1. **ReportTemplate**
   - name, schema, sample_data, createdAt

2. **ScheduledReport**
   - reportId, schedule, recipients, format, lastRun, nextRun

### AI Service Models
1. **StudentRiskProfile**
   - school_id, studentId, risk_score, risk_factors, updated_at

2. **RiskIntervention**
   - studentId, intervention_type, description, createdAt, status

---

## 🧪 Testing Strategy

### Unit Tests (40+ tests)
- Analytics calculation logic (10)
- Report generation (10)
- AI model predictions (10)
- Chatbot intent recognition (10)

### Integration Tests (20+ tests)
- Service-to-service communication
- Database interactions
- API endpoint validation

### End-to-End Tests (10+ tests)
- Full dashboard flow
- Report generation & download
- At-risk student identification
- Chat interaction flow

---

## 📚 Documentation Plan

### For Phase 5
1. **PHASE5_QUICK_START.md** — Setup & running
2. **PHASE5_API_REFERENCE.md** — All endpoints documented
3. **PHASE5_ARCHITECTURE.md** — Design & implementation
4. **PHASE5_AI_MODEL.md** — ML model details
5. **PHASE5_CHATBOT_GUIDE.md** — Chatbot configuration
6. **PHASE5_ANALYTICS_GUIDE.md** — Dashboard usage

---

## 🎯 Priority Order

### Week 1: Analytics Service (Core)
- [ ] Service setup & scaffolding
- [ ] Database models
- [ ] Core metrics calculation
- [ ] Dashboard endpoints
- [ ] Initial tests

### Week 2: Report Builder & Export
- [ ] Report model & templates
- [ ] Report generation logic
- [ ] PDF/Excel export
- [ ] Email scheduling
- [ ] Tests

### Week 3: AI At-Risk Model
- [ ] Risk scoring algorithm
- [ ] Model training pipeline
- [ ] Integration with notification service
- [ ] API endpoints
- [ ] Tests

### Week 4: Chatbot & Polish
- [ ] Intent definitions
- [ ] Message handlers
- [ ] Integration (WhatsApp/SMS)
- [ ] Testing & documentation

---

## 🔄 Integration Points

### With Phase 4 (Notification Service)
- Auto-send at-risk alerts
- Schedule report delivery
- Chatbot escalations to messaging

### With Existing Services
- **Student Service:** Get student data
- **Academic Service:** Get grades/attendance
- **Finance Service:** Get payment info
- **Auth Service:** JWT validation

---

## 📈 Success Criteria

### Analytics Dashboard
- [x] Load time < 2 seconds
- [x] Support 100+ concurrent users
- [x] Real-time data updates
- [x] Customizable widgets

### Report Builder
- [x] Generate reports < 30 seconds
- [x] Support multiple export formats
- [x] Email delivery 99.9% uptime
- [x] Scheduled reports run on time

### AI At-Risk Model
- [x] Accuracy > 85%
- [x] Identify 90% of actual at-risk students
- [x] Low false positive rate (< 10%)
- [x] Model retraining automated

### Chatbot
- [x] Intent recognition > 90% accuracy
- [x] Response time < 1 second
- [x] Handle 100+ concurrent conversations
- [x] Escalation within 1 minute

---

## 💼 Resource Requirements

### Team
- 2-3 Backend Engineers (Node.js)
- 1 ML Engineer (Python)
- 1 Frontend Engineer (Dashboard UI)
- 1 QA Engineer

### Infrastructure
- 4 additional microservices (analytics, report, AI, chatbot)
- Additional MongoDB collections
- Redis for caching
- Python ML runtime
- PDF/Excel generation libraries

### External Services
- Dialogflow / Rasa (chatbot)
- Twilio (WhatsApp/SMS)
- SendGrid (email delivery)
- Report generation library (LibreOffice, Puppeteer)

---

## ⚠️ Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| ML model accuracy | Extensive testing, continuous retraining |
| Chatbot false positives | Human review, escalation mechanism |
| Report generation performance | Async jobs, caching, pagination |
| Data privacy in analytics | Anonymization, GDPR compliance |

---

## 🚀 Getting Started Checklist

### Preparation
- [x] Review Phase 4 completion status
- [x] Understand Phase 5 scope
- [ ] Assign team members
- [ ] Prepare development environment
- [ ] Review existing API patterns
- [ ] Plan database schema

### Quick Tasks
- [ ] Create analytics-service directory structure
- [ ] Setup microservice boilerplate
- [ ] Configure API gateway routes
- [ ] Begin dashboard endpoint implementation

---

## 📋 Next Steps

1. **Confirm Phase 5 scope** with team
2. **Assign resources** to each service
3. **Begin analytics-service** implementation
4. **Follow Phase 4 patterns** for consistency
5. **Create Phase 5 documentation** as we go

---

## 📞 Questions to Consider

1. **Analytics Priority:** Which metrics are most critical?
2. **Report Templates:** What reports should be pre-built?
3. **AI Scope:** Should we start with basic model or advanced?
4. **Chatbot Platform:** WhatsApp, SMS, or both?
5. **Timeline:** Can we compress to 3 weeks?

---

**Phase 5 Plan Ready!**

Ready to begin implementation? Confirm scope and let's start with **analytics-service**! 🚀

