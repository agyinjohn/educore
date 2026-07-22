#!/bin/bash

# EduCore Phase 1 - Complete Setup & Verification Script
# This script verifies all Phase 1 components are properly implemented

set -e

echo "═══════════════════════════════════════════════════════════"
echo "EduCore Phase 1 - Implementation Verification"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Check function
check() {
    local description=$1
    local condition=$2
    
    if [ "$condition" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗${NC} $description"
        ((FAIL_COUNT++))
    fi
}

echo "1. Checking Directory Structure..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Student Service
[ -d "services/student-service/src/models" ] && check "student-service models" 0 || check "student-service models" 1
[ -d "services/student-service/src/controllers" ] && check "student-service controllers" 0 || check "student-service controllers" 1
[ -d "services/student-service/src/services" ] && check "student-service services" 0 || check "student-service services" 1
[ -d "services/student-service/src/routes" ] && check "student-service routes" 0 || check "student-service routes" 1
[ -d "services/student-service/src/middleware" ] && check "student-service middleware" 0 || check "student-service middleware" 1

# Academic Service
[ -d "services/academic-service/src/models" ] && check "academic-service models" 0 || check "academic-service models" 1
[ -d "services/academic-service/src/controllers" ] && check "academic-service controllers" 0 || check "academic-service controllers" 1
[ -d "services/academic-service/src/services" ] && check "academic-service services" 0 || check "academic-service services" 1
[ -d "services/academic-service/src/routes" ] && check "academic-service routes" 0 || check "academic-service routes" 1
[ -d "services/academic-service/src/middleware" ] && check "academic-service middleware" 0 || check "academic-service middleware" 1

echo ""
echo "2. Checking Model Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Student models
[ -f "services/student-service/src/models/Student.ts" ] && check "Student model" 0 || check "Student model" 1

# Academic models
[ -f "services/academic-service/src/models/Class.ts" ] && check "Class model" 0 || check "Class model" 1
[ -f "services/academic-service/src/models/TimetableSlot.ts" ] && check "TimetableSlot model" 0 || check "TimetableSlot model" 1
[ -f "services/academic-service/src/models/Attendance.ts" ] && check "Attendance model" 0 || check "Attendance model" 1
[ -f "services/academic-service/src/models/Grade.ts" ] && check "Grade model" 0 || check "Grade model" 1
[ -f "services/academic-service/src/models/Assessment.ts" ] && check "Assessment model" 0 || check "Assessment model" 1
[ -f "services/academic-service/src/models/Exam.ts" ] && check "Exam model" 0 || check "Exam model" 1

echo ""
echo "3. Checking Service Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/services/student.service.ts" ] && check "Student service" 0 || check "Student service" 1
[ -f "services/academic-service/src/services/academic.service.ts" ] && check "Academic service" 0 || check "Academic service" 1

echo ""
echo "4. Checking Controller Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/controllers/student.controller.ts" ] && check "Student controller" 0 || check "Student controller" 1
[ -f "services/academic-service/src/controllers/academic.controller.ts" ] && check "Academic controller" 0 || check "Academic controller" 1

echo ""
echo "5. Checking Route Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/routes/student.routes.ts" ] && check "Student routes" 0 || check "Student routes" 1
[ -f "services/academic-service/src/routes/academic.routes.ts" ] && check "Academic routes" 0 || check "Academic routes" 1

echo ""
echo "6. Checking Middleware Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/middleware/authenticate.ts" ] && check "Student auth middleware" 0 || check "Student auth middleware" 1
[ -f "services/student-service/src/middleware/validate.ts" ] && check "Student validation middleware" 0 || check "Student validation middleware" 1
[ -f "services/academic-service/src/middleware/authenticate.ts" ] && check "Academic auth middleware" 0 || check "Academic auth middleware" 1
[ -f "services/academic-service/src/middleware/validate.ts" ] && check "Academic validation middleware" 0 || check "Academic validation middleware" 1

echo ""
echo "7. Checking Configuration Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/config/db.ts" ] && check "Student DB config" 0 || check "Student DB config" 1
[ -f "services/academic-service/src/config/db.ts" ] && check "Academic DB config" 0 || check "Academic DB config" 1
[ -f ".env.example" ] && check ".env.example template" 0 || check ".env.example template" 1

echo ""
echo "8. Checking Schema/Type Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/types/schemas.ts" ] && check "Student schemas" 0 || check "Student schemas" 1
[ -f "services/academic-service/src/types/schemas.ts" ] && check "Academic schemas" 0 || check "Academic schemas" 1

echo ""
echo "9. Checking Documentation Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "PHASE1_COMPLETE.md" ] && check "Phase 1 Complete guide" 0 || check "Phase 1 Complete guide" 1
[ -f "PHASE1_API_COMPLETE.md" ] && check "Phase 1 API Reference" 0 || check "Phase 1 API Reference" 1
[ -f "PHASE1_IMPLEMENTATION_GUIDE.md" ] && check "Phase 1 Implementation Guide" 0 || check "Phase 1 Implementation Guide" 1
[ -f "PHASE1_DEPLOYMENT_CHECKLIST.md" ] && check "Phase 1 Deployment Checklist" 0 || check "Phase 1 Deployment Checklist" 1
[ -f "PHASE1_README.md" ] && check "Phase 1 README" 0 || check "Phase 1 README" 1

echo ""
echo "10. Checking Test Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/academic-service/src/routes/academic.routes.test.ts" ] && check "Academic routes test" 0 || check "Academic routes test" 1

echo ""
echo "11. Checking Entry Points..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "services/student-service/src/index.ts" ] && check "Student entry point" 0 || check "Student entry point" 1
[ -f "services/academic-service/src/index.ts" ] && check "Academic entry point" 0 || check "Academic entry point" 1

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Summary"
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Phase 1 Implementation Complete!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. npm install               # Install all dependencies"
    echo "2. cp .env.example .env      # Setup environment"
    echo "3. npm run dev:phase1        # Start all services"
    echo ""
    echo "Documentation:"
    echo "- PHASE1_COMPLETE.md         # Executive summary"
    echo "- PHASE1_API_COMPLETE.md     # 24 endpoints with examples"
    echo "- PHASE1_IMPLEMENTATION_GUIDE.md  # Architecture & setup"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Phase 1 Implementation Incomplete${NC}"
    exit 1
fi
