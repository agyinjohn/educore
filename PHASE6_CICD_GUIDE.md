# Phase 6 Component 3: CI/CD Pipeline Guide

## Overview

This guide covers the complete CI/CD pipeline setup for EduCore using GitHub Actions. The pipeline automates testing, Docker image building, security scanning, and Kubernetes deployment.

**Last Updated**: May 24, 2026

---

## Table of Contents

1. [Architecture](#architecture)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Secrets Configuration](#secrets-configuration)
4. [Setup Instructions](#setup-instructions)
5. [Deployment Workflow](#deployment-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Architecture

### CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Repository                         │
└─────────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        Push to Develop      Push to Main / Tag Release
                │                     │
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │  test.yml    │      │  build.yml   │
        │ (Run Tests)  │      │(Build Images)│
        └──────────────┘      └──────────────┘
                │                     │
                ▼                     ▼
        ┌──────────────┐      ┌──────────────────┐
        │  Coverage    │      │ Trivy Scan       │
        │  Reports     │      │ Docker Scout     │
        └──────────────┘      └──────────────────┘
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   deploy.yml         │
                │ (Kubernetes Deploy)  │
                └──────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐        ┌─────────┐       ┌──────────┐
    │Staging │        │Canary   │       │Production│
    │(Auto)  │        │(Monitor)│       │(Approved)│
    └────────┘        └─────────┘       └──────────┘
        │                  │                  │
        ▼                  ▼                  ▼
    ┌─────────────────────────────────────────────────┐
    │         Kubernetes Cluster (EKS/GKE/AKS)       │
    │  • 26-78 pods running                           │
    │  • Auto-scaling enabled                         │
    │  • Health checks monitoring                      │
    └─────────────────────────────────────────────────┘
```

### Workflow Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test.yml` | Push to main/develop, PR creation | Automated testing |
| `build.yml` | Push to main/develop, git tags | Docker image building |
| `deploy.yml` | Push to main, version tags | Kubernetes deployment |

---

## GitHub Actions Workflows

### 1. test.yml - Automated Testing

**Location**: `.github/workflows/test.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Jobs**:
1. **test**: Runs Jest tests on all services
   - MongoDB and Redis services included
   - Parallel test execution across 10 services
   - Coverage report generation
   - Codecov integration

2. **quality**: Code quality checks
   - TypeScript strict mode compilation
   - Docker file verification
   - Kubernetes manifest validation

**Outputs**:
- Test results in GitHub Actions UI
- Coverage reports to Codecov
- GitHub Step Summary with results

**Example Output**:
```
✅ Auth Service tests: 18/18 PASS
✅ Student Service tests: 20/20 PASS
✅ Academic Service tests: 16/16 PASS
✅ Finance Service tests: 15/15 PASS
✅ Notification Service tests: 12/12 PASS
✅ Report Service tests: 25/25 PASS
✅ Analytics Service tests: 23/23 PASS
✅ AI Service tests: 28/28 PASS
✅ Chatbot Service tests: 29/29 PASS
✅ API Gateway tests: 14/14 PASS

Total: 200/200 tests passing
Coverage: 85%+
```

### 2. build.yml - Docker Image Building

**Location**: `.github/workflows/build.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Git version tags (v*.*.*)
- Manual dispatch (workflow_dispatch)

**Jobs**:
1. **setup**: Matrix job configuration
   - Defines 10 services to build
   - Sets registry (GitHub Container Registry, Docker Hub, or AWS ECR)
   - Determines image version/tag

2. **build**: Docker image building (parallel)
   - Builds multi-stage images
   - Pushes to selected registry
   - Tags with git SHA and semantic version
   - Caches layers for performance

3. **security-scan**: Vulnerability scanning
   - Trivy image scanning
   - Docker Scout comparison
   - SARIF results uploaded to GitHub Security

4. **summary**: Build completion summary

**Image Registry Support**:
- **GitHub Container Registry (ghcr.io)** - Default, no setup needed
- **Docker Hub** - Requires DOCKERHUB_USERNAME + DOCKERHUB_TOKEN
- **AWS ECR** - Requires AWS credentials

**Image Tagging Strategy**:
```
# Development build
ghcr.io/owner/educore-auth-service:develop-abc123

# Production release
ghcr.io/owner/educore-auth-service:v1.2.3
ghcr.io/owner/educore-auth-service:latest
```

### 3. deploy.yml - Kubernetes Deployment

**Location**: `.github/workflows/deploy.yml`

**Triggers**:
- Push to `main` branch (staging deployment)
- Git version tags (production deployment)
- Manual dispatch with environment selection

**Jobs**:

#### deploy-staging
- **Trigger**: Every push to develop
- **Automatic**: No approval needed
- **Steps**:
  1. Checkout code
  2. Configure AWS credentials (optional)
  3. Update kubeconfig
  4. Create namespace
  5. Update deployment images
  6. Monitor rollout (5 minute timeout)
  7. Run smoke tests
  8. Verify deployment

#### deploy-production
- **Trigger**: Version tags (v*.*.*)
- **Approval**: Manual environment approval required
- **Steps**:
  1. Checkout code
  2. Extract version from git tag
  3. Configure AWS credentials (production)
  4. Update kubeconfig
  5. **Backup current deployment**
  6. Update all service images
  7. **Canary deployment** (1 replica monitoring)
  8. **Full rollout** (all replicas)
  9. Run production smoke tests
  10. **Auto-rollback on failure**
  11. Verify deployment

---

## Secrets Configuration

### Required GitHub Secrets

#### 1. Container Registry (Pick One)

**Option A: GitHub Container Registry (Recommended)**
- Automatically available as `GITHUB_TOKEN`
- No configuration needed
- Images stored in GitHub

**Option B: Docker Hub**
```
DOCKERHUB_USERNAME: your-dockerhub-username
DOCKERHUB_TOKEN: your-dockerhub-access-token
```

**Option C: AWS ECR**
```
AWS_REGION: us-east-1
AWS_ACCOUNT_ID: 123456789012
AWS_ECR_REGISTRY_NAME: educore
```

#### 2. Kubernetes Cluster Access

**For Staging**:
```
AWS_ROLE_TO_ASSUME: arn:aws:iam::123456789012:role/github-actions-staging
```

Or base64-encoded kubeconfig:
```
KUBECONFIG_STAGING: <base64-encoded-kubeconfig>
```

**For Production**:
```
AWS_ROLE_TO_ASSUME_PROD: arn:aws:iam::123456789012:role/github-actions-production
```

Or base64-encoded kubeconfig:
```
KUBECONFIG_PRODUCTION: <base64-encoded-kubeconfig>
```

#### 3. Optional: Security Tools

```
SNYK_TOKEN: your-snyk-token (for Snyk scanning)
```

### How to Add Secrets in GitHub

1. Go to GitHub Repository → Settings → Secrets and Variables → Actions
2. Click "New repository secret"
3. Enter secret name and value
4. Click "Add secret"

**Example: DOCKERHUB_TOKEN**
```
Name: DOCKERHUB_TOKEN
Value: dckr_pat_abc123xyz...
```

### Encoding kubeconfig for GitHub Secret

```bash
# Create base64-encoded kubeconfig
cat ~/.kube/config | base64 | pbcopy

# In GitHub Secrets, paste the base64-encoded content
# Workflow will decode it: 
# echo "$KUBECONFIG_CONTENT" | base64 -d > ~/.kube/config
```

---

## Setup Instructions

### Step 1: Verify Workflows Exist

```bash
cd /Users/apexcode/Desktop/EduCore
ls -la .github/workflows/
```

Expected files:
- `.github/workflows/test.yml`
- `.github/workflows/build.yml`
- `.github/workflows/deploy.yml`

### Step 2: Configure GitHub Repository

1. **Enable GitHub Actions**
   - Repository → Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected

2. **Configure Branch Protection Rules**
   - Repository → Settings → Branches
   - Add rule for `main` branch
   - Require status checks to pass (test.yml)

3. **Enable Environments** (for production approval)
   - Repository → Environments → New environment
   - Create "production" environment
   - Add required reviewers (optional)

### Step 3: Add Container Registry Secrets

**For GitHub Container Registry (Default)**:
- No action needed - uses GITHUB_TOKEN automatically

**For Docker Hub**:
```bash
# Get Docker Hub token
# 1. Go to Docker Hub → Account Settings → Security → New Access Token
# 2. Copy the token

# Add to GitHub Secrets:
# DOCKERHUB_USERNAME: your-username
# DOCKERHUB_TOKEN: <paste-token-here>
```

### Step 4: Add Kubernetes Credentials

**For AWS EKS with OIDC**:
```bash
# Create IAM role for GitHub Actions
aws iam create-role \
  --role-name github-actions-staging \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
          }
        }
      }
    ]
  }'

# Add policy for cluster access
aws iam attach-role-policy \
  --role-name github-actions-staging \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy
```

**Or use kubeconfig**:
```bash
# Get kubeconfig and encode
kubectl config view --flatten | base64

# Add to GitHub Secrets as:
# KUBECONFIG_STAGING: <base64-encoded-content>
# KUBECONFIG_PRODUCTION: <base64-encoded-content>
```

### Step 5: Test the Pipeline

#### Test Workflow
```bash
# Push to develop branch to trigger tests
git add .
git commit -m "test: trigger CI pipeline"
git push origin develop

# Watch at: GitHub Repository → Actions
```

#### Build Workflow
```bash
# Create a version tag to trigger build
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Watch at: GitHub Repository → Actions → build.yml
```

#### Deploy Workflow
```bash
# Create production tag (requires main branch)
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Monitor at: GitHub Repository → Actions
# Go to "deploy-production" job → Approve deployment
```

---

## Deployment Workflow

### Development → Staging (Automatic)

1. **Developer pushes code to `develop` branch**
   ```bash
   git checkout develop
   git commit -m "feature: add new functionality"
   git push origin develop
   ```

2. **test.yml runs automatically**
   - Tests all services (10 services × 20 tests avg)
   - Coverage reporting
   - Failure stops pipeline

3. **build.yml runs on successful tests**
   - Builds Docker images for all 10 services
   - Tags with: `develop-<git-sha>`
   - Pushes to container registry
   - Scans for vulnerabilities

4. **deploy.yml triggers staging deployment**
   - Updates staging Kubernetes cluster
   - All 10 services deployed
   - Smoke tests verify functionality
   - Automatic rollout

5. **Staging environment ready for QA**
   - API available at: `https://api.staging.educore.local`
   - Full feature testing

### Feature Branch → Review → Main (Manual)

1. **Developer creates feature branch**
   ```bash
   git checkout -b feature/new-service
   git commit -m "feat: implement new service"
   git push origin feature/new-service
   ```

2. **Create Pull Request on GitHub**
   - test.yml runs automatically
   - Coverage requirements checked
   - Code review required

3. **Merge to main after approval**
   ```bash
   # After PR approval, merge to main
   ```

4. **Create version tag for release**
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.2.3 -m "Release 1.2.3"
   git push origin v1.2.3
   ```

5. **build.yml triggers**
   - Builds images tagged: `v1.2.3` and `latest`
   - Full security scanning
   - Images pushed to registry

6. **deploy.yml triggers production deployment**
   - Requires manual approval in GitHub UI
   - Staging deployment automatically created
   - Production deployment waits for approval
   - Click "Review deployments" → Select environment → "Approve"

7. **Canary deployment in production**
   - 1 replica of API Gateway deployed first
   - Monitored for 30 seconds
   - Smoke tests verify health
   - Full rollout if successful
   - Auto-rollback if failed

---

## Troubleshooting

### Tests Failing

**Problem**: test.yml shows "FAIL" status

**Solutions**:
1. Check test logs:
   ```bash
   # Locally reproduce the issue
   npm test -- --coverage
   ```

2. Common issues:
   - MongoDB not running: Ensure test db is accessible
   - Redis not running: Check redis connectivity
   - Missing env variables: Check .env.example

3. Review GitHub Actions logs:
   - Go to Actions → test.yml → Failed run → Click job
   - Check "Run Tests" section for errors

### Docker Build Failing

**Problem**: build.yml shows Docker build error

**Solutions**:
1. Verify Dockerfile:
   ```bash
   docker build -f Dockerfile .
   ```

2. Check registry credentials:
   - Verify GitHub Secrets configured
   - Test Docker Hub login: `docker login`

3. Review build logs in GitHub Actions

### Deployment Failing

**Problem**: deploy.yml shows rollout failure

**Solutions**:
1. Check Kubernetes cluster:
   ```bash
   kubectl get pods -n educore
   kubectl logs -n educore <pod-name>
   ```

2. Verify image availability:
   ```bash
   # Pull image locally to verify
   docker pull ghcr.io/owner/educore-api-gateway:latest
   ```

3. Check resource quotas:
   ```bash
   kubectl describe node
   kubectl top nodes
   ```

4. Review deployment status:
   ```bash
   kubectl rollout status deployment/api-gateway -n educore
   kubectl describe deployment api-gateway -n educore
   ```

### Secrets Not Working

**Problem**: "Authentication failed" in logs

**Solutions**:
1. Verify GitHub Secrets exist:
   - Settings → Secrets and variables → Actions
   - Check secret names match workflow file

2. Verify secret encoding (for kubeconfig):
   ```bash
   # Decode to verify
   echo "KUBECONFIG_VALUE" | base64 -d | head
   ```

3. Check workflow permissions:
   - Settings → Actions → General
   - Ensure service account has required permissions

---

## Best Practices

### 1. Version Strategy

**Semantic Versioning**:
```
v<MAJOR>.<MINOR>.<PATCH>

v1.0.0  - Major: Breaking changes
v1.1.0  - Minor: New features
v1.0.1  - Patch: Bug fixes
```

**Tagging**:
```bash
# Release version
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Pre-release
git tag -a v1.2.3-beta.1 -m "Beta release"
git push origin v1.2.3-beta.1
```

### 2. Testing Strategy

**Before pushing**:
```bash
# Run tests locally
npm test -- --coverage

# Ensure coverage threshold met (80%+)
# Run linting
npx tsc --noEmit

# Build Docker image
docker build .
```

### 3. Code Review Process

1. Developer creates feature branch
2. Push to GitHub (triggers test.yml)
3. Create Pull Request
4. Wait for test results (must pass)
5. Code review approval required
6. Merge to main
7. Create version tag → triggers build/deploy

### 4. Production Deployment Checklist

Before tagging for production:
- [ ] All tests passing (100%)
- [ ] Code reviewed and approved
- [ ] Staging deployment verified
- [ ] Changelog updated
- [ ] Version number decided
- [ ] Team notified

### 5. Monitoring Production Deployments

```bash
# Watch rollout progress
watch kubectl rollout status deployment/api-gateway -n educore

# Check pod status
kubectl get pods -n educore -w

# View logs
kubectl logs -f -n educore deployment/api-gateway

# Monitor resources
kubectl top pods -n educore
```

### 6. Rollback Procedures

**Automatic rollback** (on failure):
- Triggered by failed smoke tests
- `kubectl rollout undo deployment/<service>`

**Manual rollback** (if needed):
```bash
# Undo last deployment
kubectl rollout undo deployment/api-gateway -n educore

# Undo to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n educore

# Verify rollback
kubectl rollout status deployment/api-gateway -n educore
```

---

## Common Commands

### GitHub Actions

```bash
# View workflow status
gh run list

# View latest workflow results
gh run view --latest

# Trigger workflow manually
gh workflow run test.yml
```

### Docker

```bash
# Build image locally
docker build -t educore-api-gateway:latest .

# Push to registry
docker tag educore-api-gateway:latest ghcr.io/owner/educore-api-gateway:latest
docker push ghcr.io/owner/educore-api-gateway:latest

# Run vulnerability scan
trivy image ghcr.io/owner/educore-api-gateway:latest
```

### Kubernetes

```bash
# Watch deployments
kubectl get deployments -n educore -w

# View pod logs
kubectl logs -f -n educore pod/<pod-name>

# Describe pod for events
kubectl describe pod -n educore <pod-name>

# Port forward for local testing
kubectl port-forward -n educore svc/api-gateway 3000:3000

# Check resource usage
kubectl top pods -n educore
kubectl top nodes
```

---

## Workflow Examples

### Example 1: Release New Version

```bash
# 1. Ensure main branch is up to date
git checkout main
git pull origin main

# 2. Update version in package.json (optional)
# vim package.json

# 3. Create annotated tag
git tag -a v1.2.3 -m "Release v1.2.3: New features and bug fixes"

# 4. Push tag (triggers build & deploy workflows)
git push origin v1.2.3

# 5. Monitor progress
open https://github.com/your-org/educore/actions

# 6. Approve production deployment when prompted
```

### Example 2: Hotfix for Production

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix the issue
# ... code changes ...

# 3. Commit and push
git add .
git commit -m "fix: critical security issue"
git push origin hotfix/critical-bug

# 4. Create PR, get review, merge to main

# 5. Tag release
git tag -a v1.2.1 -m "Hotfix: Critical security update"
git push origin v1.2.1

# 6. Monitor deployment
```

### Example 3: Test New Feature in Staging

```bash
# 1. Create feature branch
git checkout -b feature/new-service

# 2. Implement feature
# ... code changes ...

# 3. Commit and push to trigger tests
git add .
git commit -m "feat: add new microservice"
git push origin feature/new-service

# 4. Create PR
git push origin feature/new-service
# Go to GitHub and create PR to develop

# 5. Wait for tests
# Monitor: GitHub → Actions → test.yml

# 6. If tests pass, merge to develop
# This triggers staging deployment

# 7. Test in staging
curl https://api.staging.educore.local/health
```

---

## Success Criteria

✅ **CI/CD Pipeline Complete When**:
1. All 3 workflows exist and validate without errors
2. Secrets configured in GitHub repository
3. At least one successful test.yml run
4. At least one successful build.yml run
5. Staging deployment successful
6. Smoke tests passing

---

## Next Steps

1. **Configure Secrets** - Add container registry and K8s credentials
2. **Test Pipeline** - Push to develop branch to verify workflows
3. **Setup Monitoring** - Phase 6 Component 4
4. **Security Hardening** - Phase 6 Component 5

---

**Component 3 Completion Target**: ~90% complete
- test.yml: ✅ Complete
- build.yml: ✅ Complete  
- deploy.yml: ✅ Complete
- Secrets setup: 🔄 In progress
- Documentation: ✅ Complete

