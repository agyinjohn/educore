# EduCore Kubernetes Deployment Guide

## Phase 6 Component 2: Kubernetes & Orchestration

This guide provides comprehensive instructions for deploying EduCore on Kubernetes.

## Architecture Overview

### Kubernetes Cluster Components

```
┌─────────────────────────────────────────────────────┐
│                  Kubernetes Cluster                  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  Ingress Controller (NGINX)                  │  │
│  │  Port: 80/443                               │  │
│  │  - api.educore.com                          │  │
│  │  - chatbot.educore.com                      │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  API Gateway (LoadBalancer)                 │  │
│  │  Replicas: 3                                │  │
│  │  Port: 3000                                 │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌────────────────┬─────────────────┬────────────┐  │
│  │                │                 │            │  │
│  ↓                ↓                 ↓            ↓  │
│ Auth-Svc     Student-Svc     Academic-Svc  Finance │
│ (Port 4000)  (Port 4001)      (Port 4002)  (Port 4) │
│ Replicas: 2  Replicas: 2     Replicas: 2  Replicas  │
│                                                   2  │
│  ┌────────────────┬─────────────────┬────────────┐  │
│  │                │                 │            │  │
│  ↓                ↓                 ↓            ↓  │
│Notification Analytics         Report Service   AI   │
│  (Port 4004) (Port 4008)       (Port 4009)   (Port  │
│ Replicas: 2 Replicas: 2        Replicas: 2  4009)  │
│                                               Rep   │
│                                             3      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Chatbot Service (Stateless)                 │  │
│  │  Replicas: 3                                │  │
│  │  Port: 4010                                 │  │
│  │  Auto-scaling: 3-10 pods (HPA)              │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                              │
│  ┌────────────────────────────────────────────────┐ │
│  │            Shared Services                    │ │
│  ├────────────────────────────────────────────────┤ │
│  │  MongoDB (StatefulSet - 3 replicas)          │ │
│  │  Port: 27017                                 │ │
│  │  Storage: 10Gi per replica                   │ │
│  │                                              │ │
│  │  Redis (Deployment)                         │ │
│  │  Port: 6379                                 │ │
│  │  Storage: 5Gi                               │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Tools

```bash
# Check versions
kubectl version --client
helm version
docker --version

# Minimum versions:
# - kubectl: 1.24+
# - helm: 3.10+
# - docker: 20.10+
```

### Cluster Requirements

- **Cloud Provider**: AWS (EKS), GCP (GKE), Azure (AKS), or on-premise
- **Node Count**: 3+ nodes minimum
- **Node Spec**: 4 CPU, 8GB RAM per node (production)
- **Storage**: 50GB+ available storage

### Install kubectl

```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Windows
choco install kubernetes-cli
```

### Create Kubernetes Cluster

**AWS EKS**:
```bash
eksctl create cluster --name educore --region us-east-1 --nodes 3
```

**GCP GKE**:
```bash
gcloud container clusters create educore \
  --zone us-central1-a \
  --num-nodes 3
```

**Azure AKS**:
```bash
az aks create --resource-group educore-rg \
  --name educore-cluster \
  --node-count 3
```

**Local (Minikube)**:
```bash
minikube start --cpus=4 --memory=8192
```

## Deployment Steps

### 1. Create Namespace and ConfigMaps

```bash
# Apply namespace, config, and secrets
kubectl apply -f backend/k8s/00-namespace-config.yaml

# Verify
kubectl get namespace educore
kubectl get configmap -n educore
kubectl get secrets -n educore
```

### 2. Deploy Database Services

```bash
# Create storage class
kubectl apply -f backend/k8s/00-namespace-config.yaml

# Deploy MongoDB (StatefulSet)
kubectl apply -f backend/k8s/01-mongodb-statefulset.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n educore --timeout=300s

# Verify MongoDB
kubectl logs -n educore -l app=mongodb -f

# Deploy Redis
kubectl apply -f backend/k8s/02-redis-deployment.yaml

# Verify Redis
kubectl get pods -n educore -l app=redis
```

### 3. Deploy Infrastructure Services

```bash
# Deploy API Gateway with LoadBalancer
kubectl apply -f backend/k8s/03-api-gateway-deployment.yaml

# Get LoadBalancer IP
kubectl get svc -n educore api-gateway
# Wait for EXTERNAL-IP to be assigned (may take 2-5 minutes)
```

### 4. Deploy Microservices

```bash
# Deploy core services (Auth, Student, Academic, Finance)
kubectl apply -f backend/k8s/04-core-services-deployment.yaml

# Deploy advanced services (Analytics, Report, AI, Chatbot)
kubectl apply -f backend/k8s/05-advanced-services-deployment.yaml

# Verify all deployments
kubectl get deployments -n educore
kubectl get pods -n educore
```

### 5. Configure Ingress and TLS

```bash
# Install NGINX Ingress Controller (if not pre-installed)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Install cert-manager for SSL/TLS
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0

# Apply Ingress and TLS configuration
kubectl apply -f backend/k8s/06-ingress-tls.yaml

# Verify Ingress
kubectl get ingress -n educore
```

### 6. Apply Network Policies and RBAC

```bash
# Apply network policies
kubectl apply -f backend/k8s/07-network-policies-rbac.yaml

# Verify network policies
kubectl get networkpolicies -n educore
```

## Verification and Testing

### Check Deployment Status

```bash
# Get all resources in educore namespace
kubectl get all -n educore

# Get detailed pod status
kubectl get pods -n educore -o wide

# Get services with endpoints
kubectl get endpoints -n educore

# Check events
kubectl get events -n educore --sort-by='.lastTimestamp'
```

### View Logs

```bash
# View logs for specific pod
kubectl logs -n educore <pod-name>

# Follow logs in real-time
kubectl logs -n educore <pod-name> -f

# View logs from all pods in deployment
kubectl logs -n educore -l app=chatbot-service -f

# View previous logs (if pod crashed)
kubectl logs -n educore <pod-name> --previous
```

### Test Service Connectivity

```bash
# Port-forward API Gateway to localhost
kubectl port-forward -n educore svc/api-gateway 3000:3000

# In another terminal, test API
curl http://localhost:3000/health

# Test specific service
kubectl exec -it <pod-name> -n educore -- \
  curl http://chatbot-service:4010/api/v1/chatbot/health
```

### Check Horizontal Pod Autoscaler

```bash
# View HPA status
kubectl get hpa -n educore

# Get detailed HPA info
kubectl describe hpa api-gateway-hpa -n educore

# Monitor HPA in real-time
kubectl get hpa -n educore -w
```

## Production Operations

### Scaling Services

```bash
# Scale deployment manually
kubectl scale deployment chatbot-service -n educore --replicas=5

# View HPA metrics
kubectl get hpa -n educore

# Check CPU/memory usage
kubectl top pods -n educore
kubectl top nodes
```

### Rolling Updates

```bash
# Update image for a service
kubectl set image deployment/chatbot-service \
  chatbot-service=educore/chatbot-service:v2.0.0 \
  -n educore

# Check rollout status
kubectl rollout status deployment/chatbot-service -n educore

# Rollback if needed
kubectl rollout undo deployment/chatbot-service -n educore

# View rollout history
kubectl rollout history deployment/chatbot-service -n educore
```

### Backup and Recovery

```bash
# Backup MongoDB data
kubectl exec -it <mongodb-pod> -n educore -- \
  mongodump --out /tmp/backup

# Restore MongoDB data
kubectl exec -it <mongodb-pod> -n educore -- \
  mongorestore /tmp/backup
```

## Monitoring and Debugging

### Check Pod Status

```bash
# Get pod status with details
kubectl describe pod <pod-name> -n educore

# Check if pod is ready
kubectl get pod <pod-name> -n educore -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'

# View recent events
kubectl get events -n educore --field-selector involvedObject.name=<pod-name>
```

### Debug Issues

```bash
# Execute command in pod
kubectl exec -it <pod-name> -n educore -- /bin/sh

# Inspect environment variables
kubectl exec <pod-name> -n educore -- env | grep MONGODB

# Check network connectivity
kubectl exec <pod-name> -n educore -- \
  wget -O- http://api-gateway:3000/health

# View resource limits
kubectl describe node <node-name>
```

### Resource Monitoring

```bash
# Get resource usage
kubectl top pods -n educore
kubectl top nodes

# Get detailed resource info
kubectl describe nodes | grep -A 5 "Allocated resources"
```

## Troubleshooting

### Pod Won't Start

```bash
# Check pod status
kubectl describe pod <pod-name> -n educore

# View logs
kubectl logs <pod-name> -n educore
kubectl logs <pod-name> -n educore --previous

# Check events
kubectl get events -n educore --sort-by='.lastTimestamp'
```

### Service Unreachable

```bash
# Check service exists
kubectl get svc -n educore

# Check endpoints
kubectl get endpoints -n educore

# Test DNS within cluster
kubectl run -it --rm debug --image=alpine --restart=Never \
  -n educore -- nslookup chatbot-service

# Port-forward and test
kubectl port-forward svc/chatbot-service 4010:4010 -n educore
curl http://localhost:4010/api/v1/chatbot/health
```

### Database Connection Failed

```bash
# Check MongoDB StatefulSet
kubectl get statefulset -n educore
kubectl describe statefulset mongodb -n educore

# Check MongoDB logs
kubectl logs -n educore -l app=mongodb

# Test MongoDB connection
kubectl exec -it <mongodb-pod> -n educore -- mongosh

# Check PVC status
kubectl get pvc -n educore
kubectl describe pvc mongodb-data-mongodb-0 -n educore
```

### Out of Memory/CPU

```bash
# Check node resources
kubectl describe nodes

# Scale down pods
kubectl scale deployment <deployment-name> -n educore --replicas=1

# Adjust resource limits
kubectl set resources deployment <deployment-name> -n educore \
  --limits=cpu=1,memory=1Gi \
  --requests=cpu=500m,memory=512Mi

# Check HPA
kubectl get hpa -n educore
```

## Advanced Configuration

### Persistent Volume Snapshots

```yaml
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: mongodb-snapshot
  namespace: educore
spec:
  volumeSnapshotClassName: csi-hostpath-snapclass
  source:
    persistentVolumeClaimName: mongodb-data-mongodb-0
```

### Pod Disruption Budgets

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: chatbot-service-pdb
  namespace: educore
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: chatbot-service
```

### Resource Quotas

```bash
# Set resource quotas for namespace
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: educore-quota
  namespace: educore
spec:
  hard:
    requests.cpu: "20"
    requests.memory: "40Gi"
    limits.cpu: "40"
    limits.memory: "80Gi"
EOF
```

## Performance Optimization

### Enable Horizontal Pod Autoscaling

Already configured in deployment manifests:
- API Gateway: 3-10 replicas (70% CPU threshold)
- Chatbot Service: 3-10 replicas (70% CPU, 80% memory)
- Analytics Service: 2-8 replicas (75% CPU)

### Pod Affinity Rules

Already configured:
- Pod anti-affinity: Spread pods across nodes
- Preferred: Avoid same-node scheduling

### Health Checks

All services include:
- **Liveness probe**: Checks if service is alive
- **Readiness probe**: Checks if service can accept traffic
- **Startup probe**: Optional for slow-starting apps

## Cleanup

### Delete Entire Deployment

```bash
# Delete namespace (deletes all resources)
kubectl delete namespace educore

# Delete NGINX Ingress Controller
kubectl delete namespace ingress-nginx

# Delete cert-manager
helm uninstall cert-manager -n cert-manager
```

### Delete Specific Resources

```bash
# Delete deployment
kubectl delete deployment chatbot-service -n educore

# Delete service
kubectl delete svc api-gateway -n educore

# Delete PVC (data loss!)
kubectl delete pvc mongodb-data-mongodb-0 -n educore
```

## Next Steps

1. ✅ Complete: Kubernetes manifests for all 9 services
2. ✅ Complete: MongoDB StatefulSet with 3 replicas
3. ✅ Complete: Redis Deployment
4. ✅ Complete: API Gateway with LoadBalancer
5. ✅ Complete: Auto-scaling (HPA) configuration
6. ✅ Complete: Ingress with TLS/SSL support
7. ✅ Complete: Network Policies and RBAC
8. ⏳ Phase 6 Component 3: CI/CD Pipeline Setup
9. ⏳ Phase 6 Component 4: Monitoring & Logging
10. ⏳ Phase 6 Component 5: Infrastructure & Security

## References

- [Kubernetes Official Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
