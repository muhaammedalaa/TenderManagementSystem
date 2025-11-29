# 🚀 TMS CI/CD Pipeline Guide

دليل شامل لنظام CI/CD لنظام إدارة المناقصات (TMS) مع Docker و GitHub Actions.

## 📋 نظرة عامة

نظام CI/CD يوفر:
- ✅ **Build Automation** - بناء تلقائي للصور
- ✅ **Testing** - اختبارات شاملة
- ✅ **Security Scanning** - فحص الأمان
- ✅ **Deployment** - نشر تلقائي
- ✅ **Health Checks** - فحص صحة النظام
- ✅ **Local Pipeline** - تشغيل محلي للـ pipeline

## 🛠️ المكونات

### 1. GitHub Actions Workflows
- `ci-cd.yml` - Pipeline رئيسي للـ Linux
- `ci-cd-windows.yml` - Pipeline للـ Windows
- `docker-ci.yml` - Docker build/push

### 2. Local CI/CD Scripts
- `scripts/ci-cd.ps1` - PowerShell script
- `ci-cd.bat` - Batch script
- `Makefile.windows` - Make commands

### 3. Docker Compose Files
- `docker-compose.test.windows.yml` - Test environment
- `docker-compose.staging.windows.yml` - Staging environment
- `docker-compose.prod.windows.yml` - Production environment

## 🚀 التشغيل المحلي

### الطريقة الأولى: PowerShell Script
```powershell
# Build images
.\scripts\ci-cd.ps1 -Action build

# Run tests
.\scripts\ci-cd.ps1 -Action test

# Run security scan
.\scripts\ci-cd.ps1 -Action security

# Deploy to staging
.\scripts\ci-cd.ps1 -Action deploy -Environment staging

# Run full pipeline
.\scripts\ci-cd.ps1 -Action full -Environment staging -Tag v1.0.0
```

### الطريقة الثانية: Batch Script
```cmd
# Build images
ci-cd.bat -Action build

# Run tests
ci-cd.bat -Action test

# Run security scan
ci-cd.bat -Action security

# Deploy to staging
ci-cd.bat -Action deploy -Environment staging

# Run full pipeline
ci-cd.bat -Action full -Environment staging -Tag v1.0.0
```

### الطريقة الثالثة: Make Commands
```bash
# Build images
make -f Makefile.windows ci-build

# Run tests
make -f Makefile.windows ci-test

# Run security scan
make -f Makefile.windows ci-security

# Deploy application
make -f Makefile.windows ci-deploy

# Run health checks
make -f Makefile.windows ci-health

# Run full pipeline
make -f Makefile.windows ci-full
```

## 🔧 الأوامر المتاحة

### Build Commands
```bash
ci-build    # Build Docker images
ci-test     # Run tests
ci-security # Run security scan
ci-deploy   # Deploy application
ci-health   # Run health checks
ci-full     # Run full pipeline
ci-cleanup  # Clean up resources
```

### Environment Options
- `staging` - بيئة التطوير
- `production` - بيئة الإنتاج
- `development` - بيئة التطوير المحلية

### Tag Options
- `latest` - Latest version
- `v1.0.0` - Specific version
- `feature-branch` - Feature branch
- `commit-hash` - Git commit hash

## 📊 مراحل الـ Pipeline

### 1. Build Stage
```bash
# Build backend image
docker build -f TMS.API/Dockerfile.windows -t tms-backend:latest .

# Build frontend image
docker build -f Frontend/Dockerfile.windows -t tms-frontend:latest ./Frontend
```

### 2. Test Stage
```bash
# Start test environment
docker-compose -f docker-compose.test.windows.yml up -d

# Run backend tests
docker-compose -f docker-compose.test.windows.yml exec -T backend-test dotnet test

# Run frontend tests
docker-compose -f docker-compose.test.windows.yml exec -T frontend-test npm test
```

### 3. Security Stage
```bash
# Scan backend image
trivy image tms-backend:latest --format table --exit-code 0

# Scan frontend image
trivy image tms-frontend:latest --format table --exit-code 0
```

### 4. Deploy Stage
```bash
# Deploy to staging
docker-compose -f docker-compose.staging.windows.yml up -d

# Deploy to production
docker-compose -f docker-compose.prod.windows.yml up -d
```

### 5. Health Check Stage
```bash
# Check frontend
curl -f http://localhost:3000

# Check backend
curl -f http://localhost:3000/api/health
```

## 🔒 إعدادات الأمان

### 1. Environment Variables
```bash
# Production
POSTGRES_PASSWORD=your_strong_password
JWT_KEY=your_very_strong_jwt_secret_key
REDIS_PASSWORD=your_redis_password
```

### 2. Security Scanning
```bash
# Install Trivy
# Windows: Download from https://github.com/aquasecurity/trivy/releases
# Or use: winget install aquasecurity.trivy

# Run scan
trivy image tms-backend:latest
```

### 3. Docker Security
```bash
# Scan for vulnerabilities
docker scan tms-backend:latest

# Check image layers
docker history tms-backend:latest
```

## 📈 Monitoring والمراجعة

### 1. Pipeline Status
```bash
# Check pipeline status
make -f Makefile.windows status

# View logs
make -f Makefile.windows logs

# Check health
make -f Makefile.windows ci-health
```

### 2. Resource Usage
```bash
# Check Docker resources
docker stats

# Check disk usage
docker system df

# Check image sizes
docker images
```

### 3. Logs Analysis
```bash
# Backend logs
make -f Makefile.windows logs-backend

# Frontend logs
make -f Makefile.windows logs-frontend

# Database logs
make -f Makefile.windows logs-db
```

## 🐛 حل المشاكل

### مشكلة: Build فشل
```bash
# Check Docker logs
docker logs tms-backend

# Check build context
docker build --no-cache -f TMS.API/Dockerfile.windows -t tms-backend:latest .

# Check disk space
docker system df
```

### مشكلة: Tests فشلت
```bash
# Check test logs
docker-compose -f docker-compose.test.windows.yml logs backend-test

# Run tests manually
docker-compose -f docker-compose.test.windows.yml exec backend-test dotnet test --verbosity normal
```

### مشكلة: Deployment فشل
```bash
# Check deployment logs
docker-compose -f docker-compose.staging.windows.yml logs

# Check service status
docker-compose -f docker-compose.staging.windows.yml ps

# Restart services
docker-compose -f docker-compose.staging.windows.yml restart
```

## 🚀 النشر على GitHub Actions

### 1. إعداد Secrets
```bash
# في GitHub Repository Settings > Secrets
GITHUB_TOKEN=your_github_token
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
```

### 2. إعداد Environments
```bash
# في GitHub Repository Settings > Environments
staging
production
staging-windows
production-windows
```

### 3. تشغيل Pipeline
```bash
# Push to main branch
git push origin main

# Push to develop branch
git push origin develop

# Manual trigger
# Go to Actions tab > Run workflow
```

## 📝 Best Practices

### 1. Versioning
```bash
# Use semantic versioning
v1.0.0
v1.0.1
v1.1.0
v2.0.0
```

### 2. Tagging
```bash
# Tag images with commit hash
docker tag tms-backend:latest tms-backend:$(git rev-parse --short HEAD)

# Tag images with version
docker tag tms-backend:latest tms-backend:v1.0.0
```

### 3. Cleanup
```bash
# Regular cleanup
make -f Makefile.windows ci-cleanup

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f
```

## 📞 الدعم الفني

### 1. التحقق من الحالة
```bash
# Check pipeline status
make -f Makefile.windows status

# Check logs
make -f Makefile.windows logs

# Check health
make -f Makefile.windows ci-health
```

### 2. إعادة التشغيل
```bash
# Restart pipeline
make -f Makefile.windows ci-cleanup
make -f Makefile.windows ci-full
```

### 3. الحصول على المساعدة
- راجع `WINDOWS_SETUP.md` للتفاصيل الكاملة
- راجع `DOCKER_README.md` للـ Docker setup
- تحقق من السجلات مع `make -f Makefile.windows logs`

---

**تم تطوير نظام CI/CD كامل ومتكامل! 🚀✨**
