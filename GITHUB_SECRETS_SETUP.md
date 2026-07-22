# GitHub Actions Secrets Setup Guide

## Overview

This guide provides step-by-step instructions for configuring GitHub Actions secrets required for the CI/CD pipeline to work with container registries and Kubernetes clusters.

---

## GitHub Secrets Quick Reference

| Secret Name | Value | Purpose | Required |
|---|---|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username | Push to Docker Hub | Optional |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Authenticate with Docker Hub | Optional |
| `AWS_ROLE_TO_ASSUME` | ARN of staging IAM role | Deploy to staging EKS | Optional |
| `AWS_ROLE_TO_ASSUME_PROD` | ARN of production IAM role | Deploy to production EKS | Optional |
| `KUBECONFIG_STAGING` | Base64-encoded kubeconfig | Kubernetes staging access | Optional |
| `KUBECONFIG_PRODUCTION` | Base64-encoded kubeconfig | Kubernetes production access | Optional |
| `SNYK_TOKEN` | Snyk API token | Security scanning | Optional |
| `GITHUB_TOKEN` | Auto-provided by GitHub | Push to GitHub Container Registry | Auto (built-in) |

---

## Default: GitHub Container Registry (GHCR)

GitHub automatically provides `GITHUB_TOKEN` for container registry access. **No configuration needed!**

**Registry URL**: `ghcr.io/{owner}/{repository}/{image}:{tag}`

**Example**:
```
ghcr.io/your-org/educore-api-gateway:v1.2.3
ghcr.io/your-org/educore-student-service:develop-abc123
```

---

## Optional: Docker Hub Setup

### Step 1: Create Docker Hub Access Token

1. Go to [Docker Hub](https://hub.docker.com)
2. Sign in to your account
3. Navigate to **Account Settings** → **Security** → **Access Tokens**
4. Click **Generate New Token**
5. Enter token name: `github-actions`
6. Set permissions: **Read & Write**
7. Click **Generate**
8. Copy the token (save it, won't be shown again)

### Step 2: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter:
   - **Name**: `DOCKERHUB_USERNAME`
   - **Value**: Your Docker Hub username
6. Click **Add secret**

7. Create second secret:
   - **Name**: `DOCKERHUB_TOKEN`
   - **Value**: The token from Step 1
8. Click **Add secret**

### Step 3: Verify Secrets

1. In Secrets section, you should see:
   - ✅ `DOCKERHUB_USERNAME` (with updated indicator)
   - ✅ `DOCKERHUB_TOKEN` (with updated indicator)

2. To use in workflow, set registry input:
   ```yaml
   - name: Login to Docker Hub
     if: needs.setup.outputs.registry == 'dockerhub'
     uses: docker/login-action@v2
     with:
       username: ${{ secrets.DOCKERHUB_USERNAME }}
       password: ${{ secrets.DOCKERHUB_TOKEN }}
   ```

---

## AWS EKS with OIDC (Recommended for Production)

This approach is secure and doesn't require storing credentials.

### Step 1: Enable OIDC Provider in AWS

```bash
# Verify OIDC provider exists
aws iam list-open-id-connect-providers

# Expected output:
# {
#   "OpenIDConnectProviderList": [
#     {
#       "Arn": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
#     }
#   ]
# }

# If not present, create it:
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### Step 2: Create IAM Role for GitHub Actions

```bash
# Set variables
export GITHUB_ORG="your-github-org"
export GITHUB_REPO="educore"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create trust policy JSON
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/*"
        }
      }
    }
  ]
}
EOF

# Create staging role
aws iam create-role \
  --role-name github-actions-staging \
  --assume-role-policy-document file:///tmp/trust-policy.json

# Create production role
sed "s/refs\/heads\/\*/ref:refs\/tags\/*/" /tmp/trust-policy.json > /tmp/trust-policy-prod.json
aws iam create-role \
  --role-name github-actions-production \
  --assume-role-policy-document file:///tmp/trust-policy-prod.json
```

### Step 3: Add IAM Policies

```bash
# Policy for EKS access (staging)
cat > /tmp/eks-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach policy to both roles
aws iam put-role-policy \
  --role-name github-actions-staging \
  --policy-name eks-access \
  --policy-document file:///tmp/eks-policy.json

aws iam put-role-policy \
  --role-name github-actions-production \
  --policy-name eks-access \
  --policy-document file:///tmp/eks-policy.json

# Create service account in K8s cluster for deployments
kubectl create serviceaccount github-actions -n educore
kubectl create clusterrolebinding github-actions \
  --clusterrole=cluster-admin \
  --serviceaccount=educore:github-actions
```

### Step 4: Add to GitHub Secrets

1. Get the ARNs:
```bash
echo "Staging Role ARN:"
aws iam get-role --role-name github-actions-staging \
  --query 'Role.Arn' --output text

echo "Production Role ARN:"
aws iam get-role --role-name github-actions-production \
  --query 'Role.Arn' --output text
```

2. Add to GitHub:
   - Go to Settings → Secrets and variables → Actions
   - **New secret**: `AWS_ROLE_TO_ASSUME`
     - Value: `arn:aws:iam::ACCOUNT_ID:role/github-actions-staging`
   - **New secret**: `AWS_ROLE_TO_ASSUME_PROD`
     - Value: `arn:aws:iam::ACCOUNT_ID:role/github-actions-production`

---

## kubeconfig Method (Alternative)

Use this if you don't have AWS OIDC setup or prefer direct kubeconfig access.

### Step 1: Export kubeconfig

```bash
# Get kubeconfig from your cluster
kubectl config view --flatten > /tmp/kubeconfig

# For EKS:
aws eks update-kubeconfig \
  --region us-east-1 \
  --name educore-staging-cluster \
  --kubeconfig /tmp/kubeconfig-staging

# Verify it works:
kubectl --kubeconfig=/tmp/kubeconfig-staging cluster-info
```

### Step 2: Encode kubeconfig

```bash
# Create base64-encoded version
cat /tmp/kubeconfig-staging | base64 > /tmp/kubeconfig-staging.b64

# Copy to clipboard (macOS)
cat /tmp/kubeconfig-staging.b64 | pbcopy

# Or display for copy-paste
cat /tmp/kubeconfig-staging.b64
```

### Step 3: Add to GitHub Secrets

1. Go to Settings → Secrets and variables → Actions
2. **New secret**: `KUBECONFIG_STAGING`
   - Value: Paste the base64-encoded content from clipboard
3. **New secret**: `KUBECONFIG_PRODUCTION`
   - Value: Paste the base64-encoded production kubeconfig

### Step 4: Verify in Workflow

The workflow will decode and use it:
```yaml
- name: Create kubeconfig secret
  env:
    KUBECONFIG_CONTENT: ${{ secrets.KUBECONFIG_STAGING }}
  run: |
    mkdir -p ~/.kube
    echo "$KUBECONFIG_CONTENT" | base64 -d > ~/.kube/config
    chmod 600 ~/.kube/config
```

---

## Verification

### Verify Docker Hub Secrets

```bash
# Check GitHub Actions can authenticate
# This is automatic in workflow, but you can test locally:

export DOCKERHUB_USERNAME="your-username"
export DOCKERHUB_TOKEN="your-token"

docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_TOKEN
docker pull $DOCKERHUB_USERNAME/test:latest
```

### Verify AWS Credentials

```bash
# Test OIDC token generation (GitHub Actions does this automatically)
# Simulate locally:

export GITHUB_TOKEN=$(curl -s http://169.254.169.254/latest/api/token)

# The workflow handles this automatically using:
# - uses: aws-actions/configure-aws-credentials@v2
#   with:
#     role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
```

### Verify kubeconfig Secret

```bash
# Decode the secret to verify format
echo "KUBECONFIG_CONTENT" | base64 -d | head -20

# Should show valid kubeconfig structure:
# apiVersion: v1
# clusters:
# - cluster:
#     certificate-authority-data: ...
#     server: ...
```

---

## Troubleshooting Secrets

### Secret Not Found

**Error**: `Could not find secret 'DOCKERHUB_USERNAME'`

**Solution**:
1. Verify secret name matches exactly (case-sensitive)
2. Check it's in the correct repository
3. Refresh browser and verify it exists

### Authentication Failed

**Error**: `401 Unauthorized` when pushing to Docker Hub

**Solution**:
1. Verify token hasn't expired in Docker Hub
2. Create new token and update secret
3. Verify `DOCKERHUB_USERNAME` is correct

### kubeconfig Decode Error

**Error**: `base64: invalid input`

**Solution**:
1. Verify entire base64 content was copied
2. Check for line breaks in the secret
3. Re-encode without extra whitespace:
   ```bash
   cat /tmp/kubeconfig | base64 -w 0 > /tmp/kubeconfig.b64
   cat /tmp/kubeconfig.b64 | pbcopy
   ```

### AWS OIDC Not Working

**Error**: `AccessDenied` when assuming role

**Solution**:
1. Verify OIDC provider exists in AWS
2. Check trust policy includes correct GitHub org/repo
3. Verify service account permissions in cluster
4. Test locally:
   ```bash
   aws sts assume-role-with-web-identity \
     --role-arn arn:aws:iam::ACCOUNT_ID:role/github-actions-staging \
     --role-session-name test \
     --web-identity-token $GITHUB_TOKEN
   ```

---

## Security Best Practices

1. **Use OIDC when possible** - No long-lived credentials needed
2. **Rotate tokens regularly** - Set reminders to refresh
3. **Limit permissions** - Use least-privilege IAM policies
4. **Separate staging/production** - Different credentials for each
5. **Monitor secret usage** - Check GitHub Actions logs
6. **Use branch conditions** - Production secrets only on main branch
7. **Don't log secrets** - Workflows automatically mask secrets in logs

---

## Next Steps

1. ✅ Configure container registry (GitHub Container Registry default)
2. ✅ Add Docker Hub secrets (if using)
3. ✅ Setup Kubernetes credentials (AWS OIDC or kubeconfig)
4. ✅ Test pipeline with `git push`
5. 🔄 Monitor first workflow run
6. Continue with Monitoring & Logging (Component 4)

---

**Last Updated**: May 24, 2026

