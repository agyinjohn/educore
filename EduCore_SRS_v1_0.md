# EduCore — School Management System
## Software Requirements Specification (SRS)

> **CONFIDENTIAL**

| Field | Value |
|---|---|
| **Document Version** | 1.0 |
| **Status** | Draft — Pending Review |
| **Date** | 10 May 2026 |
| **Target Market** | K-12 Schools (Primary & Secondary) |
| **Deployment Model** | Cloud-Only SaaS (Multi-Tenant) |
| **Launch Scope** | Full Platform — All Modules |
| **Tech Stack** | Next.js (Frontend) · Node.js (Backend) |
| **Classification** | Confidential |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall System Description](#2-overall-system-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [System Architecture Overview](#5-system-architecture-overview)
6. [Data Requirements](#6-data-requirements)
7. [Integration Requirements](#7-integration-requirements)
8. [Deployment & Infrastructure](#8-deployment--infrastructure)
9. [Quality Assurance](#9-quality-assurance)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Risk Register](#11-risk-register)
12. [Appendix & Glossary](#12-appendix--glossary)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for EduCore — a cloud-hosted, multi-tenant School Management System (SMS) designed for K-12 institutions (primary and secondary schools). This document serves as the primary agreement between the product team, engineering team, and all stakeholders. It provides a definitive reference for design, development, testing, and delivery of the platform.

### 1.2 Scope

EduCore is a full-featured SaaS platform that digitises and automates every administrative, academic, financial, and communication function of a K-12 school. The system will be accessible via web browsers and native mobile applications (iOS and Android). It will support multiple schools on a shared infrastructure with strict data isolation, custom branding, and configurable academic settings per tenant.

The platform will cover:

- **Academic management:** enrolment, timetabling, attendance, gradebooks, examinations, curriculum
- **Administrative operations:** HR & payroll, finance & fees, transport, hostel, inventory, library
- **Communication:** parent portal & mobile app, student portal, messaging hub, announcements
- **Intelligence:** analytics dashboards, AI-powered insights, custom reporting
- **Platform:** multi-tenancy, white-labelling, role-based access, API, SSO

### 1.3 Definitions & Acronyms

| Term / Acronym | Definition |
|---|---|
| SaaS | Software as a Service — cloud-hosted software licensed on a subscription basis |
| SRS | Software Requirements Specification |
| K-12 | Kindergarten through Grade 12 — primary and secondary education levels |
| Multi-tenant | Single infrastructure serving multiple school clients with data isolation |
| Tenant | An individual school or school group subscribing to EduCore |
| LMS | Learning Management System |
| SSO | Single Sign-On — one authentication credential across integrated systems |
| RBAC | Role-Based Access Control |
| API | Application Programming Interface |
| JWT | JSON Web Token — used for secure authentication |
| MFA | Multi-Factor Authentication |
| GDPR | General Data Protection Regulation |
| CI/CD | Continuous Integration / Continuous Deployment |
| SMS (comms) | Short Message Service — text messages sent to parents/staff |
| PII | Personally Identifiable Information |

### 1.4 Document Conventions

- **SHALL** — mandatory requirement
- **SHOULD** — strongly recommended requirement
- **MAY** — optional feature
- All IDs follow the format: `[MODULE]-[NUMBER]`, e.g. `STU-001`, `FIN-012`

### 1.5 Intended Audience

- Product Owner & Stakeholders
- Engineering & Architecture Team
- UX/UI Designers
- QA & Testing Team
- DevOps & Infrastructure Team
- Compliance & Legal Review

### 1.6 References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Node.js Documentation](https://nodejs.org/en/docs)
- [OWASP Security Guidelines](https://owasp.org)
- [GDPR Compliance](https://gdpr.eu)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/TR/WCAG21/)

---

## 2. Overall System Description

### 2.1 Product Overview

EduCore is a cloud-native, multi-tenant SaaS platform built to serve K-12 schools of any size — from a single 200-student primary school to a network of 50+ schools under a single education group. The platform eliminates the need for schools to manage on-premise software, hardware, or IT maintenance.

Every school (tenant) receives a fully isolated environment with its own subdomain, branding, data, user accounts, and configuration — all running on a shared cloud infrastructure to minimise cost and maximise reliability.

### 2.2 System Context

EduCore interfaces with the following external actors and systems:

| Actor / System | Role | Interface |
|---|---|---|
| School Administrator | Configures system, manages staff and students | Web dashboard |
| Teacher | Manages classes, attendance, grades, lesson plans | Web + mobile app |
| Student | Views timetable, grades, submits assignments | Web + mobile app |
| Parent / Guardian | Monitors child progress, pays fees, tracks bus | Mobile app + web |
| School Accountant | Manages fees, payroll, financial reports | Web dashboard |
| Super Admin (EduCore) | Manages all tenants, billing, platform health | Admin console |
| Payment Gateway | Processes fee & subscription payments | REST API (Stripe/Paystack) |
| SMS Provider | Sends text notifications to parents/staff | REST API (Twilio/Africa's Talking) |
| Email Provider | Delivers transactional and bulk emails | SMTP / SendGrid API |
| Map / GPS Service | Real-time bus tracking for transport module | Google Maps API |
| SSO Providers | Google, Microsoft — identity federation | OAuth 2.0 / SAML |
| LMS (optional) | Moodle, Google Classroom integration | REST API / LTI |

### 2.3 User Classes & Characteristics

| User Role | Access Level | Primary Concern |
|---|---|---|
| Super Admin | Full platform access across all tenants | Tenant management, billing, uptime |
| School Owner / Director | Full access within own school tenant | Performance overview, compliance |
| School Administrator | All modules within school | Day-to-day operations, configuration |
| Academic Head / HOD | Academic modules, reports | Curriculum, teacher performance |
| Teacher | Own classes, attendance, grades, plans | Efficiency, ease of grading |
| Accountant | Finance, fees, payroll | Accuracy, audit trails |
| HR Manager | Staff records, leave, payroll | Staff lifecycle management |
| Librarian | Library catalog and circulation | Book management |
| Transport Coordinator | Routes, vehicles, driver management | Safety, real-time tracking |
| Student | Own academic data, portal | Grades, timetable, assignments |
| Parent / Guardian | Child(ren) data, fees, communication | Child's progress, safety, payments |
| Warden / Hostel Staff | Boarding module | Room allocation, safety |

### 2.4 Assumptions & Dependencies

- All users have access to a modern web browser (Chrome, Firefox, Safari, Edge) or a smartphone (iOS 14+ / Android 8+)
- The system relies on stable internet connectivity; offline mode is limited to attendance capture with sync
- Schools will provide accurate initial data during onboarding for data migration
- Third-party APIs (payment, SMS, GPS) are subject to their own availability SLAs
- Compliance with local education data regulations is the school's administrative responsibility; EduCore provides the technical controls

### 2.5 Constraints

- Platform must be GDPR-compliant and support data residency preferences
- System must support concurrent access by up to 10,000 users per tenant
- Mobile apps must function on 3G network connections
- All student data must be encrypted at rest (AES-256) and in transit (TLS 1.3)
- The system must achieve 99.9% monthly uptime (SLA)

---

## 3. Functional Requirements

### 3.1 Authentication & Access Control

*Ref: AUTH-001 to AUTH-020*

#### 3.1.1 User Authentication

- **AUTH-001:** The system SHALL support email/password login with bcrypt password hashing (min cost factor 12)
- **AUTH-002:** The system SHALL support OAuth 2.0 SSO via Google Workspace and Microsoft Azure AD
- **AUTH-003:** The system SHALL enforce Multi-Factor Authentication (MFA) via TOTP authenticator app for admin roles
- **AUTH-004:** The system SHALL issue JWT access tokens (15-min expiry) and HTTP-only refresh tokens (7-day expiry)
- **AUTH-005:** The system SHALL lock an account after 5 consecutive failed login attempts for 30 minutes
- **AUTH-006:** The system SHALL provide a secure password reset flow via time-limited email token (30-min expiry)
- **AUTH-007:** The system SHALL maintain a login audit log including IP address, device, and timestamp
- **AUTH-008:** All passwords MUST meet minimum complexity (8+ chars, uppercase, lowercase, digit, special character)

#### 3.1.2 Role-Based Access Control (RBAC)

- **AUTH-010:** The system SHALL implement RBAC with predefined roles: Super Admin, School Admin, Academic Head, Teacher, Accountant, HR Manager, Librarian, Transport Coordinator, Student, Parent, Warden
- **AUTH-011:** The system SHALL allow custom role creation with granular permission assignment per module and action (view, create, edit, delete, approve)
- **AUTH-012:** Permission changes SHALL take effect immediately without requiring re-login
- **AUTH-013:** Every API endpoint SHALL validate the caller's role and permissions before processing
- **AUTH-014:** The system SHALL support data scope restrictions (e.g. a teacher can only see their own classes)

---

### 3.2 Multi-Tenancy & School Configuration

*Ref: TENANT-001 to TENANT-020*

#### 3.2.1 Tenant Management (Super Admin)

- **TENANT-001:** The system SHALL support provisioning of a new school tenant via an admin console in under 5 minutes
- **TENANT-002:** Each tenant SHALL have a unique subdomain (e.g. `greenfield.educore.app`) or custom domain
- **TENANT-003:** All tenant data SHALL be logically isolated — no cross-tenant data access at any layer
- **TENANT-004:** The system SHALL support suspension and soft-deletion of tenants with 90-day data retention
- **TENANT-005:** Super Admin SHALL be able to impersonate a tenant admin for support purposes, with full audit logging
- **TENANT-006:** Tenant billing, subscription tier, and usage metrics SHALL be visible in the super admin dashboard

#### 3.2.2 School Configuration

- **TENANT-010:** Each school SHALL configure academic year start/end dates, term/semester structure, and holiday calendars
- **TENANT-011:** Schools SHALL configure their grading scale (percentage, GPA, letter grades, custom)
- **TENANT-012:** Schools SHALL configure school logo, primary colour, and name for white-label appearance
- **TENANT-013:** Schools SHALL configure active modules — unused modules are hidden from all users
- **TENANT-014:** Schools SHALL define school sections (Primary, Junior Secondary, Senior Secondary) and classes within each
- **TENANT-015:** The system SHALL support multiple campuses under one school tenant

---

### 3.3 Student Management

*Ref: STU-001 to STU-040*

#### 3.3.1 Enrolment & Profiles

- **STU-001:** The system SHALL support online student application forms with configurable fields per school
- **STU-002:** Each student SHALL have a unique, system-generated student ID
- **STU-003:** Student profiles SHALL store: full name, date of birth, gender, nationality, religion (optional), address, photo
- **STU-004:** The system SHALL support linking multiple guardians/parents to a single student
- **STU-005:** The system SHALL support sibling linking for shared parent accounts and fee discounts
- **STU-006:** Document uploads (birth certificate, immunisation records, prior school reports) SHALL be supported per student
- **STU-007:** Medical information (conditions, allergies, medications, emergency contacts) SHALL be stored securely
- **STU-008:** Student class assignments SHALL be tracked per academic year with a full history
- **STU-009:** The system SHALL support bulk student import via CSV with validation and error reporting
- **STU-010:** Student data SHALL be exportable to CSV and PDF formats

#### 3.3.2 Admissions Workflow

- **STU-020:** The system SHALL provide a configurable multi-stage admissions pipeline (Applied, Shortlisted, Interviewed, Offered, Accepted, Enrolled)
- **STU-021:** Each stage SHALL support assigned reviewers and approval actions
- **STU-022:** Offer letters SHALL be auto-generated from templates and delivered by email
- **STU-023:** Acceptance fees SHALL be payable online during the acceptance stage
- **STU-024:** Waitlist management SHALL be supported with automatic promotion when a spot becomes available
- **STU-025:** Admissions conversion funnel reports SHALL be available per academic year

#### 3.3.3 Alumni & Transfers

- **STU-030:** Graduating students SHALL be automatically transitioned to alumni status at year-end
- **STU-031:** Transferred students SHALL have a transfer record with destination school and date
- **STU-032:** Transcripts and school-leaving certificates SHALL be generated as sealed PDFs

---

### 3.4 Staff & HR Management

*Ref: HR-001 to HR-040*

#### 3.4.1 Staff Profiles & Onboarding

- **HR-001:** Each staff member SHALL have a profile containing: full name, employee ID, role, department, qualification, contact, photo, emergency contacts
- **HR-002:** Document uploads per staff member SHALL be supported (degree certificates, government IDs, contracts)
- **HR-003:** The system SHALL track employment type (full-time, part-time, contract) and contract end dates
- **HR-004:** Automated contract expiry reminders SHALL notify HR 60 and 30 days before expiry
- **HR-005:** Staff onboarding checklists SHALL be configurable and trackable

#### 3.4.2 Attendance & Leave

- **HR-010:** Staff attendance SHALL be tracked daily with clock-in/clock-out support
- **HR-011:** The system SHALL support configurable leave types (annual, sick, maternity, paternity, study, unpaid)
- **HR-012:** Leave requests SHALL go through a configurable approval workflow (direct line manager, then HR)
- **HR-013:** Leave balances SHALL be auto-calculated per employee per leave type per year
- **HR-014:** A leave calendar SHALL display approved and pending leaves across the department

#### 3.4.3 Payroll

- **HR-020:** The system SHALL calculate monthly payroll based on: base salary, allowances (housing, transport, medical), deductions (tax, pension, loan repayments, absences)
- **HR-021:** Tax computation SHALL be configurable to match local tax bands (e.g. PAYE in Ghana/Nigeria/UK)
- **HR-022:** Payslips SHALL be generated as downloadable PDFs and accessible in the staff portal
- **HR-023:** Payroll history SHALL be auditable with change logs
- **HR-024:** Bulk salary disbursement reports SHALL be exportable for bank processing

#### 3.4.4 Performance & Appraisal

- **HR-030:** The system SHALL support configurable KPI-based appraisal templates per role
- **HR-031:** Appraisal cycles (annual, semi-annual) SHALL be schedulable with automated reminders
- **HR-032:** Appraisal results SHALL feed into professional development recommendations
- **HR-033:** Professional development logs (training, workshops, certifications) SHALL be tracked per staff

---

### 3.5 Academic Management

*Ref: ACAD-001 to ACAD-060*

#### 3.5.1 Timetable & Scheduling

- **ACAD-001:** The system SHALL auto-generate timetables based on: available teachers, rooms, subjects, periods, and constraints
- **ACAD-002:** The system SHALL detect and prevent scheduling conflicts (teacher double-booking, room over-capacity, class clashes)
- **ACAD-003:** Manual drag-and-drop timetable editing SHALL be supported after auto-generation
- **ACAD-004:** Substitute teacher assignment SHALL be supported with automatic notification
- **ACAD-005:** Timetables SHALL be viewable per class, per teacher, and per room
- **ACAD-006:** Multiple period types SHALL be supported: single, double, block, split
- **ACAD-007:** Timetables SHALL be publishable, making them visible to students and parents

#### 3.5.2 Attendance

- **ACAD-010:** Attendance SHALL be recorded per subject per period (not just daily)
- **ACAD-011:** Teachers SHALL mark attendance via the web dashboard or mobile app
- **ACAD-012:** The system SHALL support QR code and RFID-based check-in as optional methods
- **ACAD-013:** Absent students SHALL trigger automated SMS and push notifications to parents within 15 minutes
- **ACAD-014:** Late arrival and early departure SHALL be recordable separately from absence
- **ACAD-015:** The system SHALL track and display attendance percentage per student per subject
- **ACAD-016:** Attendance thresholds (e.g. below 75%) SHALL trigger warnings to parents and academic heads
- **ACAD-017:** Leave applications (school trips, medical) SHALL be approvable and reflected in attendance
- **ACAD-018:** Bulk attendance entry (mark all present, then unmark absentees) SHALL be supported
- **ACAD-019:** Offline attendance capture with automatic sync on reconnection SHALL be supported on mobile

#### 3.5.3 Grades & Assessment

- **ACAD-020:** The system SHALL support configurable assessment types: coursework, tests, exams, practicals, projects
- **ACAD-021:** Assessment weighting (e.g. 30% coursework, 70% exam) SHALL be configurable per subject per term
- **ACAD-022:** Grades SHALL be enterable by subject teachers and subject to approval by academic head
- **ACAD-023:** Multiple grading scales SHALL be supported simultaneously: percentage, letter grade, GPA, custom
- **ACAD-024:** Class and subject rankings SHALL be auto-computed
- **ACAD-025:** Report cards SHALL be auto-generated as styled PDFs at term end, including teacher comments
- **ACAD-026:** The system SHALL prevent grade entry after a configurable submission deadline unless overridden by admin
- **ACAD-027:** Grade moderation (bulk upward/downward adjustment) SHALL be supported by academic heads
- **ACAD-028:** Student grade history across all years SHALL be viewable and exportable as a transcript

#### 3.5.4 Curriculum & Lesson Planning

- **ACAD-030:** The system SHALL support a subject and syllabus library with topics and sub-topics per term
- **ACAD-031:** Teachers SHALL create lesson plans against syllabus topics, marking topics as covered
- **ACAD-032:** Lesson plans SHALL support file attachments (slides, worksheets, videos)
- **ACAD-033:** Lesson plan templates SHALL be shareable across teachers in the same department
- **ACAD-034:** Syllabus progress (% of topics covered) SHALL be tracked and visible to academic heads
- **ACAD-035:** Learning objectives SHALL be taggable to national curriculum standards

#### 3.5.5 Examination Management

- **ACAD-040:** The system SHALL manage an exam calendar with subject, date, time, duration, and venue
- **ACAD-041:** The system SHALL detect and alert on exam schedule clashes
- **ACAD-042:** Automated seating plan generation SHALL be supported with room capacity constraints
- **ACAD-043:** Admit cards / hall tickets SHALL be auto-generated per student per exam
- **ACAD-044:** Invigilation duty assignment to teachers SHALL be supported with notifications
- **ACAD-045:** The system SHALL support online exams with MCQ, short-answer, and essay question types
- **ACAD-046:** Online exams SHALL include basic anti-cheat controls: tab-switch detection, countdown timer, question randomisation
- **ACAD-047:** Exam results tabulation and moderation SHALL be supported
- **ACAD-048:** Item analysis reports (difficulty index, discrimination index) SHALL be generated post-exam

---

### 3.6 Finance & Fee Management

*Ref: FIN-001 to FIN-040*

#### 3.6.1 Fee Structure

- **FIN-001:** Schools SHALL define fee structures with multiple fee types: tuition, activity, transport, meals, boarding, ICT, uniform, examination
- **FIN-002:** Fee structures SHALL be configurable per class, section, or individually per student
- **FIN-003:** Discount and concession categories (scholarship, sibling, staff child, bursary) SHALL be definable with percentage or fixed amount
- **FIN-004:** Fee structures SHALL be versionable per academic year

#### 3.6.2 Invoicing & Payment

- **FIN-010:** Invoices SHALL be auto-generated per student per term based on their applicable fee structure
- **FIN-011:** Parents SHALL receive fee invoices by email and SMS with a payment link
- **FIN-012:** Online payment SHALL be supported via: Stripe (international), Paystack (West Africa), Flutterwave, and bank transfer with manual confirmation
- **FIN-013:** Receipts SHALL be auto-generated and delivered to parents upon payment
- **FIN-014:** Partial payments SHALL be recorded with outstanding balance tracking
- **FIN-015:** Automated overdue reminders (Day 0, Day 7, Day 14, Day 30) SHALL be sent to parents with outstanding fees
- **FIN-016:** Fee defaulter reports SHALL be available with filtering by class, amount, and days overdue
- **FIN-017:** School management SHALL be able to block portal access or report card access for students with overdue fees (configurable)

#### 3.6.3 Financial Reporting

- **FIN-020:** The system SHALL provide a real-time financial dashboard showing: total collected, outstanding, expected, and collection rate
- **FIN-021:** Income and expenditure ledger SHALL be maintained
- **FIN-022:** Budget planning SHALL be supported with variance tracking against actuals
- **FIN-023:** Petty cash management with vouchers and approval workflow SHALL be supported
- **FIN-024:** Financial reports SHALL be exportable to Excel and PDF
- **FIN-025:** VAT/tax reports SHALL be generatable based on configured tax rates

---

### 3.7 Transport Management

*Ref: TRANS-001 to TRANS-020*

#### 3.7.1 Routes & Assignment

- **TRANS-001:** The system SHALL support creation of routes with named stops, GPS coordinates, and estimated arrival times
- **TRANS-002:** Students SHALL be assignable to specific routes and bus stops
- **TRANS-003:** Vehicle profiles SHALL store: vehicle number plate, capacity, make/model, insurance expiry, roadworthiness expiry
- **TRANS-004:** Driver profiles SHALL link to a vehicle and store licence number, expiry, and conduct history
- **TRANS-005:** Automated reminders SHALL alert transport coordinator when vehicle documents are within 30 days of expiry

#### 3.7.2 Live Tracking & Notifications

- **TRANS-010:** GPS live tracking SHALL be displayed on an interactive map for transport coordinators
- **TRANS-011:** Parents SHALL receive push notifications when the bus is 10 minutes away from their child's stop (configurable distance)
- **TRANS-012:** Geo-fenced school arrival and departure alerts SHALL notify parents automatically
- **TRANS-013:** Emergency SOS from the driver SHALL alert the transport coordinator and designated admin immediately
- **TRANS-014:** Bus attendance (student boarding confirmation) SHALL be recordable by the driver via mobile app

---

### 3.8 Hostel & Boarding Management

*Ref: HOST-001 to HOST-020*

#### 3.8.1 Room Management

- **HOST-001:** The system SHALL support a hierarchical structure: Building > Floor > Room > Bed
- **HOST-002:** Students SHALL be allocatable to specific beds with a full allocation history
- **HOST-003:** Room occupancy and availability SHALL be displayed on a visual floor-plan-style dashboard
- **HOST-004:** Hostel fees SHALL integrate with the main finance module

#### 3.8.2 Boarding Operations

- **HOST-010:** Wardens SHALL record daily boarding attendance (present, absent, leave-out)
- **HOST-011:** Leave-out requests (weekend exeats) SHALL go through a parent-initiated, warden-approved workflow
- **HOST-012:** Visitor logs (name, purpose, student visited, time in/out) SHALL be maintained
- **HOST-013:** Incident reports SHALL be loggable per student with severity levels and follow-up actions
- **HOST-014:** Meal plan assignment (vegetarian, standard, allergies) SHALL be configurable per student

---

### 3.9 Library Management

*Ref: LIB-001 to LIB-020*

#### 3.9.1 Catalog & Circulation

- **LIB-001:** The system SHALL maintain a book catalog with: ISBN, title, author, publisher, year, category, copies
- **LIB-002:** Book lookup by ISBN SHALL auto-populate metadata via Google Books API
- **LIB-003:** Book issue and return SHALL be recordable with due date calculation
- **LIB-004:** Overdue fines SHALL be auto-calculated based on configurable per-day rates
- **LIB-005:** Students SHALL be able to search the catalog and place holds via the student portal
- **LIB-006:** eBook and digital resource links SHALL be storable in the catalog
- **LIB-007:** Circulation reports (most issued books, overdue members, fine collected) SHALL be available

---

### 3.10 Inventory & Asset Management

*Ref: INV-001 to INV-020*

#### 3.10.1 Asset Tracking

- **INV-001:** The system SHALL maintain an asset register with: asset name, category, serial number, purchase date, value, location, assigned user
- **INV-002:** Assets SHALL be taggable with QR codes for physical scanning
- **INV-003:** Asset assignment history and custody transfers SHALL be tracked
- **INV-004:** Maintenance schedules and repair logs SHALL be associated per asset
- **INV-005:** Depreciation calculation (straight-line) SHALL be supported for reporting

#### 3.10.2 Procurement

- **INV-010:** Purchase requisitions SHALL be raiseable by any staff and subject to admin approval
- **INV-011:** Vendor profiles SHALL be maintained with contact and payment details
- **INV-012:** Purchase orders SHALL be generated and tracked with delivery confirmation
- **INV-013:** Stock levels for consumables SHALL be trackable with low-stock alerts

---

### 3.11 Communication Hub

*Ref: COMM-001 to COMM-030*

#### 3.11.1 Messaging & Announcements

- **COMM-001:** Admins SHALL be able to send bulk SMS, email, and push notifications to configurable audience groups (all parents, specific class, specific grade, all staff)
- **COMM-002:** Announcement templates SHALL be saveable and reusable
- **COMM-003:** Scheduled announcements SHALL be supported (write now, send later)
- **COMM-004:** Delivery status (sent, delivered, read) SHALL be trackable per message
- **COMM-005:** An emergency broadcast channel SHALL be available for critical communications (e.g. school closure, lockdown) with mandatory read receipt
- **COMM-006:** Multi-language support for communications SHALL be available (configurable per school)

#### 3.11.2 Two-Way Messaging

- **COMM-010:** Parents SHALL be able to send messages directly to their child's subject teachers
- **COMM-011:** Teachers SHALL respond to parent messages within the platform
- **COMM-012:** Message threads SHALL be archived and searchable
- **COMM-013:** Internal staff messaging (individual and group channels) SHALL be supported
- **COMM-014:** All messages SHALL be moderated — neither students nor parents can message outside approved channels

#### 3.11.3 Parent Portal & App

- **COMM-020:** The parent mobile app (iOS & Android) SHALL display: child's attendance, grades, timetable, outstanding fees, school notices
- **COMM-021:** Parents SHALL pay fees directly from the mobile app
- **COMM-022:** Bus live location SHALL be viewable on the parent app map
- **COMM-023:** Parents SHALL digitally sign permission slips and consent forms
- **COMM-024:** Push notifications SHALL be delivered for attendance, grades, fees, and announcements
- **COMM-025:** Multiple children under one parent account SHALL be supported with easy switching

#### 3.11.4 Student Portal

- **COMM-026:** Students SHALL view: their timetable, attendance record, grades, exam schedule, assignments, and library account
- **COMM-027:** Assignment submission (file upload) SHALL be supported from the student portal
- **COMM-028:** Report cards SHALL be downloadable by students from the portal
- **COMM-029:** Students SHALL receive notifications for exam schedules, assignment deadlines, and general announcements

---

### 3.12 Events & Activities

*Ref: EVT-001 to EVT-015*

- **EVT-001:** A school events calendar SHALL be manageable by admins with RSVP tracking
- **EVT-002:** Clubs and co-curricular activities SHALL be createable with student membership management
- **EVT-003:** Inter-house and inter-school competition results SHALL be recordable
- **EVT-004:** Student achievements (sports, arts, leadership) SHALL be loggable against their profile
- **EVT-005:** Certificates and award letters SHALL be auto-generated from templates
- **EVT-006:** Volunteer sign-up for events SHALL be manageable through the staff portal
- **EVT-007:** Per-event budget tracking SHALL be supported and linked to the finance module

---

### 3.13 Analytics & Reporting

*Ref: RPT-001 to RPT-025*

#### 3.13.1 Dashboards

- **RPT-001:** Every role SHALL have a personalised dashboard showing their most relevant KPIs on login
- **RPT-002:** The school admin dashboard SHALL display: total enrolment, attendance rate, fee collection rate, outstanding fees, upcoming events
- **RPT-003:** Academic head dashboard SHALL display: grade distribution, class rankings, attendance alerts, syllabus coverage
- **RPT-004:** Financial dashboard SHALL display: revenue chart (monthly), outstanding fees by class, payroll cost trend

#### 3.13.2 Standard Reports

- **RPT-010:** The system SHALL include 30+ pre-built report templates covering all modules
- **RPT-011:** All reports SHALL be filterable by date range, class, grade, and other relevant dimensions
- **RPT-012:** Reports SHALL be exportable to PDF and Excel
- **RPT-013:** Report delivery SHALL be schedulable via email (daily, weekly, monthly)

#### 3.13.3 Custom Report Builder

- **RPT-015:** Admins SHALL be able to build custom reports by selecting fields from any module via a drag-and-drop interface
- **RPT-016:** Custom reports SHALL be saveable and shareable with specific roles
- **RPT-017:** Cross-module reports (e.g. attendance vs grade performance correlation) SHALL be supported

#### 3.13.4 AI-Powered Intelligence

- **RPT-020:** The system SHALL flag at-risk students based on: attendance below threshold, grade decline, and engagement drop — using a configurable ML scoring model
- **RPT-021:** At-risk alerts SHALL be visible to class teachers and academic heads with recommended interventions
- **RPT-022:** Grade trend prediction (projected term-end grade based on current performance) SHALL be displayed per student
- **RPT-023:** Fee defaulter prediction (students likely to default based on payment history) SHALL surface in the finance module
- **RPT-024:** An AI chatbot for parents and students SHALL answer FAQ questions (timetable, fees, attendance) without requiring staff interaction
- **RPT-025:** Assignment submission plagiarism detection SHALL flag high-similarity submissions

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Requirement | Target |
|---|---|
| Page load time (web, 4G) | < 2.5 seconds (First Contentful Paint) |
| API response time (P95) | < 300ms for read operations, < 500ms for writes |
| Concurrent users per tenant | Up to 10,000 simultaneous active sessions |
| Platform concurrent users | Up to 500,000 simultaneous across all tenants |
| Report generation (standard) | < 5 seconds for reports up to 10,000 records |
| File upload (documents) | Up to 50 MB per file, progress indicator required |
| Mobile app startup time | < 3 seconds on mid-range Android device |
| Database query response | < 100ms for indexed queries, < 500ms for aggregations |

### 4.2 Availability & Reliability

- The system SHALL maintain 99.9% monthly uptime (max 43.8 minutes downtime/month)
- Planned maintenance windows SHALL occur between 02:00–04:00 UTC on Sundays with 72-hour advance notice
- The system SHALL implement automatic failover with RTO (Recovery Time Objective) < 15 minutes
- RPO (Recovery Point Objective) SHALL be < 1 hour using continuous database replication
- Full database backups SHALL run daily with 30-day retention; incremental backups every 6 hours
- A status page (`status.educore.app`) SHALL provide real-time incident reporting

### 4.3 Security

- All data in transit SHALL be encrypted with TLS 1.3 minimum
- All data at rest SHALL be encrypted with AES-256
- Student PII SHALL be stored in compliance with GDPR and local data protection laws
- The system SHALL pass an annual penetration test by a certified third-party security firm
- OWASP Top 10 vulnerability mitigations SHALL be implemented and maintained
- Rate limiting SHALL be applied to all authentication and public-facing API endpoints
- All admin actions SHALL be logged to a tamper-evident audit trail with 2-year retention
- Content Security Policy (CSP) headers SHALL prevent XSS attacks
- SQL injection prevention via parameterised queries and ORM use is mandatory
- File upload scanning (antivirus) SHALL be performed on all uploaded documents
- CORS policy SHALL restrict API access to whitelisted domains only

### 4.4 Scalability

- The backend SHALL be designed as stateless microservices to enable horizontal scaling
- Database read replicas SHALL serve all read-heavy operations
- CDN SHALL serve all static assets and media files
- Background jobs (report generation, bulk emails) SHALL be processed via a message queue (Redis/BullMQ)
- Auto-scaling SHALL be configured to respond to CPU > 70% or memory > 80% within 2 minutes

### 4.5 Usability & Accessibility

- The UI SHALL comply with WCAG 2.1 Level AA accessibility guidelines
- The system SHALL support screen readers (ARIA labels on all interactive elements)
- All forms SHALL provide inline validation with clear error messages
- The system SHALL be fully responsive across desktop, tablet, and mobile screen sizes
- Critical user workflows (mark attendance, record grade, pay fee) SHALL complete in 3 steps or fewer
- The system SHALL support Right-to-Left (RTL) layout for Arabic/Urdu-speaking schools
- Onboarding tutorials and contextual help tooltips SHALL be available for all major features

### 4.6 Compatibility

- Web app SHALL support: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- Mobile app SHALL support: iOS 14+ and Android 8.0+ (Oreo and above)
- The system SHALL degrade gracefully on slow network connections (3G, minimum 1 Mbps)
- Data exports SHALL be compatible with Microsoft Excel 2016+ and Google Sheets

### 4.7 Maintainability

- All backend services SHALL have unit test coverage of at least 80%
- All frontend components SHALL have integration test coverage of at least 70%
- API documentation SHALL be auto-generated and maintained via OpenAPI 3.0 (Swagger)
- Code SHALL follow agreed style guides enforced by ESLint and Prettier in CI
- Every deployment SHALL pass automated CI tests before reaching production
- Feature flags SHALL allow gradual rollout of new features per tenant

---

## 5. System Architecture Overview

### 5.1 Architecture Style

EduCore SHALL be built as a modular monolith with a clear domain separation, designed to extract microservices incrementally as load demands. The initial architecture prioritises development speed and operational simplicity while maintaining modularity.

### 5.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router, React 18) | SSR, SEO, performance, ecosystem |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, consistent design system |
| State Management | Zustand + React Query (TanStack) | Lightweight, server-state caching |
| Backend API | Node.js + Express.js / Fastify | Non-blocking I/O, large ecosystem, JS consistency |
| Database (primary) | PostgreSQL 15 (via Supabase or managed RDS) | ACID, JSON support, multi-tenant row isolation |
| Database (cache) | Redis 7 | Session store, job queues, rate limiting, caching |
| File Storage | AWS S3 / Cloudflare R2 | Scalable, cheap, CDN-ready object storage |
| Authentication | NextAuth.js (frontend) + custom JWT (API) | SSO, session management, MFA |
| Background Jobs | BullMQ (Redis-backed) | Reliable job queues, retries, scheduling |
| Real-time | Socket.io (WebSockets) | Live attendance, notifications, chat |
| Email | Resend / SendGrid | Transactional and bulk email delivery |
| SMS | Twilio / Africa's Talking | SMS delivery, USSD support for Africa |
| Push Notifications | Firebase Cloud Messaging (FCM) | iOS and Android push delivery |
| Mobile App | React Native (Expo) | Cross-platform iOS + Android from one codebase |
| Maps / GPS | Google Maps Platform | Route display, live bus tracking |
| AI / ML | OpenAI API + custom Python microservice | At-risk flagging, chatbot, predictions |
| Infrastructure | AWS / GCP (Terraform-managed) | Scalable cloud infrastructure, global regions |
| CI/CD | GitHub Actions | Automated test, build, and deploy pipelines |
| Monitoring | Datadog / Grafana + Sentry | APM, error tracking, uptime alerts |
| Container | Docker + Kubernetes (EKS/GKE) | Container orchestration, auto-scaling |

### 5.3 Database Strategy

All tenant data resides in a single PostgreSQL database with Row-Level Security (RLS) policies enforced at the database layer using a `school_id` column on every tenant-scoped table. This provides logical isolation without the operational overhead of per-tenant databases, while allowing easy extraction to per-tenant databases at scale.

- Schema migrations SHALL be managed via Prisma Migrate
- Database connection pooling SHALL use PgBouncer
- Read replicas SHALL serve dashboard and reporting queries
- Soft deletes (`deleted_at` timestamp) SHALL be used across all entities

### 5.4 API Design

- The backend SHALL expose a RESTful JSON API following OpenAPI 3.0 specification
- All endpoints SHALL be versioned: `/api/v1/...`
- Pagination SHALL use cursor-based pagination for large collections
- A public webhook system SHALL notify third parties of key events (payment received, student enrolled)
- A documented public API SHALL be available for school-specific integrations

---

## 6. Data Requirements

### 6.1 Data Entities (High-Level)

| Entity | Key Attributes | Relationships |
|---|---|---|
| School (Tenant) | id, name, subdomain, logo, config, subscription_tier | Has many: Staff, Students, Classes |
| Student | id, school_id, name, dob, class_id, enrolment_date, status | Belongs to: Class, School; Has many: Grades, Attendance |
| Staff | id, school_id, name, role, department, employment_type | Belongs to: School; Has many: Classes (as teacher) |
| Class | id, school_id, name, section, academic_year, teacher_id | Belongs to: School; Has many: Students |
| Timetable Slot | id, class_id, subject_id, teacher_id, room_id, day, period | Belongs to: Class, Subject, Teacher |
| Attendance | id, student_id, class_id, subject_id, date, period, status | Belongs to: Student, Subject |
| Grade | id, student_id, subject_id, assessment_id, score, term | Belongs to: Student, Assessment |
| Invoice | id, student_id, school_id, term, items, total, status | Belongs to: Student; Has many: Payments |
| Payment | id, invoice_id, amount, method, gateway_ref, paid_at | Belongs to: Invoice |
| Notification | id, school_id, type, audience, content, sent_at, status | Belongs to: School |
| Route | id, school_id, name, stops[], vehicle_id, driver_id | Belongs to: School, Vehicle, Driver |
| Asset | id, school_id, name, category, serial_no, location, status | Belongs to: School |

### 6.2 Data Privacy & Compliance

- All PII (names, dates of birth, addresses, medical data) SHALL be classified and access-controlled
- Data SHALL be encrypted at rest (AES-256) and in transit (TLS 1.3)
- Parents/guardians SHALL be able to request data export (GDPR Article 20 — right to portability)
- Schools SHALL be able to trigger student data anonymisation after a configurable retention period
- A Data Processing Agreement (DPA) SHALL be signed with every school tenant
- Audit logs of data access to sensitive fields (medical, financial) SHALL be maintained

### 6.3 Data Retention Policy

| Data Type | Retention Period | Action at Expiry |
|---|---|---|
| Active student records | Duration of enrolment + 7 years | Archive, then anonymise |
| Financial records | 7 years after generation | Archive to cold storage |
| Audit logs | 2 years | Delete permanently |
| Staff records | Duration of employment + 5 years | Archive, then anonymise |
| Communication logs | 1 year | Delete permanently |
| Deleted tenant data | 90 days after deletion | Permanent deletion |
| Backups | 30 days (daily), 1 year (monthly) | Automatic rotation |

---

## 7. Integration Requirements

### 7.1 Payment Gateways

- **Stripe:** international card payments, subscription billing, webhook events
- **Paystack:** Ghanaian cedi, Nigerian naira, and Kenyan shilling payments
- **Flutterwave:** pan-African mobile money and card payments
- All payment integrations SHALL handle webhook signature verification to prevent fraud

### 7.2 Communication Integrations

- **Twilio:** SMS delivery with delivery status callbacks; WhatsApp Business API
- **Africa's Talking:** USSD and SMS for low-cost African markets
- **Resend / SendGrid:** transactional email (receipts, alerts) and bulk email (newsletters)
- **Firebase Cloud Messaging:** iOS and Android push notifications

### 7.3 Learning Management

- **Google Classroom:** single sign-on passthrough and assignment sync (optional add-on)
- **Moodle:** LTI 1.3 integration for launching Moodle courses from EduCore student portal

### 7.4 Identity & Directory

- **Google Workspace:** OAuth 2.0 SSO and optional Google Directory sync for staff accounts
- **Microsoft Azure AD:** SAML 2.0 SSO for schools using Microsoft 365
- **LDAP:** on-premise directory integration for enterprise school groups

### 7.5 External API

- EduCore SHALL expose a public REST API for approved third-party integrations
- API keys SHALL be generated per school with configurable rate limits and scope restrictions
- Webhook subscriptions SHALL be configurable per school for: `payment_received`, `student_enrolled`, `attendance_marked`, `grade_published`

---

## 8. Deployment & Infrastructure

### 8.1 Environments

| Environment | Purpose | Access |
|---|---|---|
| Development (dev) | Active feature development and local testing | Engineering team only |
| Staging (staging) | Pre-release integration testing, QA, UAT | Engineering + QA + Product |
| Production (prod) | Live system serving all school tenants | Automated deployment only |
| Demo | Sales demos — pre-seeded with sample data | Sales team + prospects |

### 8.2 CI/CD Pipeline

1. Developer pushes code to feature branch on GitHub
2. GitHub Actions runs: ESLint, Prettier, unit tests, integration tests
3. Pull request opened — automated preview deployment to staging subdomain
4. Code review and approval by minimum 1 senior engineer
5. Merge to main — automated staging deployment
6. QA sign-off in staging
7. Release tag created — automated production deployment with zero-downtime rolling update
8. Post-deploy smoke tests run automatically; rollback triggered if any fail

### 8.3 Infrastructure

- Multi-region deployment (primary: EU-West or Africa; DR: US-East or EU-Central)
- Kubernetes (EKS/GKE) for container orchestration with horizontal pod autoscaling
- Managed PostgreSQL (AWS RDS or Supabase) with automated failover and read replicas
- CloudFront / Cloudflare CDN for static assets and media delivery
- AWS S3 / Cloudflare R2 for document and media storage
- Terraform for all infrastructure-as-code

---

## 9. Quality Assurance

### 9.1 Testing Strategy

| Test Type | Tooling | Coverage Target |
|---|---|---|
| Unit tests (backend) | Jest + Supertest | >= 80% line coverage |
| Unit tests (frontend) | Jest + React Testing Library | >= 70% component coverage |
| Integration tests | Playwright (E2E) + Supertest (API) | All critical user journeys |
| Performance tests | k6 load testing | 1,000 concurrent users without degradation |
| Security testing | OWASP ZAP (automated) + annual pen test | Zero critical/high vulnerabilities |
| Accessibility testing | axe-core + manual screen reader review | WCAG 2.1 AA compliance |
| Mobile testing | Detox (React Native) + physical device lab | Top 5 device/OS combinations |
| Regression testing | Automated suite runs on every PR merge | Full regression < 30 minutes |

### 9.2 Acceptance Criteria

Each functional requirement is considered **DONE** when:

- Unit/integration tests written and passing
- Code reviewed and approved by at least one senior engineer
- Feature tested against acceptance criteria on staging by QA
- Product owner has signed off the feature in staging
- Documentation updated (API docs, user guide)
- Performance benchmarks verified (no regression introduced)

---

## 10. Implementation Roadmap

### 10.1 Phase Overview

| Phase | Duration | Deliverables |
|---|---|---|
| Phase 0 — Foundation | Weeks 1–3 | Project setup, CI/CD, auth, RBAC, multi-tenancy core, DB schema, design system |
| Phase 1 — Academic Core | Weeks 4–10 | Student management, timetabling, attendance, grades, curriculum, exam management |
| Phase 2 — Finance & HR | Weeks 11–16 | Fee management, online payments, payroll, leave management, staff HR |
| Phase 3 — Operations | Weeks 17–21 | Transport + GPS, hostel/boarding, library, inventory, admissions pipeline |
| Phase 4 — Communication | Weeks 22–26 | Parent portal, student portal, messaging hub, push notifications, mobile apps |
| Phase 5 — Intelligence | Weeks 27–30 | Analytics dashboards, custom report builder, AI at-risk model, chatbot |
| Phase 6 — Polish & Launch | Weeks 31–34 | Performance optimisation, security audit, pen test, UAT, onboarding, go-live |

### 10.2 Team Structure (Recommended)

| Role | Count | Responsibility |
|---|---|---|
| Product Owner | 1 | Requirements, prioritisation, stakeholder communication |
| Tech Lead / Architect | 1 | Architecture decisions, code quality, technical direction |
| Full-Stack Engineers (Next.js + Node.js) | 4 | Feature development across frontend and backend |
| Mobile Developer (React Native) | 1 | iOS and Android parent/student app |
| DevOps / Infrastructure Engineer | 1 | CI/CD, cloud infrastructure, monitoring, security |
| QA Engineer | 1 | Test planning, automation, UAT coordination |
| UI/UX Designer | 1 | Design system, wireframes, prototypes, usability testing |
| AI/ML Engineer (part-time) | 1 | At-risk model, grade prediction, chatbot integration |

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scope creep expanding MVP | High | High | Strict change control process; all new features deferred to post-launch backlog |
| Payment gateway API instability | Medium | High | Integrate 2+ gateways; implement fallback; monitor with alerting |
| GDPR / data privacy non-compliance | Low | Critical | Legal review of DPA; privacy-by-design architecture; annual audits |
| Key personnel departure | Medium | High | Full documentation; knowledge-sharing sessions; cross-training |
| Performance degradation at scale | Medium | High | Load test from Phase 1; implement caching early; DB indexing strategy |
| Mobile app store rejection | Low | Medium | Follow Apple/Google guidelines strictly; allow 4-week buffer before launch |
| SMS/email deliverability issues | Medium | Medium | Use reputable providers; monitor delivery rates; implement fallback channels |
| Security breach / data leak | Low | Critical | Pen testing, encryption, RBAC, audit logs, incident response plan |

---

## 12. Appendix & Glossary

### 12.1 Revision History

| Version | Date | Author | Change Summary |
|---|---|---|---|
| 1.0 | 10/05/2026 | Product Team | Initial draft — full platform SRS |

### 12.2 Approval Sign-Off

| Stakeholder | Role | Signature | Date |
|---|---|---|---|
|  | Product Owner |  |  |
|  | Technical Lead |  |  |
|  | QA Lead |  |  |
|  | Business Owner |  |  |

---

*— End of Document —*

*Version 1.0 | K-12 School Management SaaS*
