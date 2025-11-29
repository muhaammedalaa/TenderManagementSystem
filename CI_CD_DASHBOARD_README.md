# 🚀 TMS CI/CD Dashboard - دليل استخدام لوحة التحكم

## 📊 نظرة عامة

لوحة تحكم CI/CD تقدم مراقبة في الوقت الفعلي لـ pipeline مع واجهة مستخدم تفاعلية وجميلة.

## 🎯 المميزات

- ✅ **Real-time Monitoring** - مراقبة فورية للـ pipeline
- ✅ **Beautiful UI** - واجهة مستخدم جميلة ومتجاوبة
- ✅ **Live Logs** - سجلات مباشرة
- ✅ **Status Indicators** - مؤشرات الحالة
- ✅ **Progress Tracking** - تتبع التقدم
- ✅ **Health Checks** - فحص صحة النظام
- ✅ **Interactive Controls** - عناصر تحكم تفاعلية

## 🚀 التشغيل السريع

### الطريقة الأولى: Make Commands
```bash
# تشغيل CI/CD مع Dashboard
make -f Makefile.windows ci-dashboard

# إيقاف CI/CD Dashboard
make -f Makefile.windows ci-dashboard-stop
```

### الطريقة الثانية: Docker Compose
```bash
# تشغيل CI/CD مع Dashboard
docker-compose -f docker-compose.ci-dashboard.windows.yml up -d

# إيقاف CI/CD Dashboard
docker-compose -f docker-compose.ci-dashboard.windows.yml down
```

### الطريقة الثالثة: PowerShell
```powershell
# تشغيل CI/CD مع Dashboard
.\scripts\ci-cd.ps1 -Action dashboard

# إيقاف CI/CD Dashboard
.\scripts\ci-cd.ps1 -Action dashboard-stop
```

## 🌐 الوصول للـ Dashboard

بعد التشغيل، افتح المتصفح وانتقل إلى:
```
http://localhost:8080
```

## 📱 واجهة المستخدم

### 1. Pipeline Status Card
- **الحالة الحالية**: تشغيل، توقف، نجح، فشل
- **التقدم**: شريط تقدم يوضح المراحل المكتملة
- **المراحل**: عدد المراحل المكتملة والمتبقية

### 2. Build Status Card
- **حالة البناء**: نجح، فشل، قيد التشغيل
- **الخدمات**: Backend, Frontend
- **الإحصائيات**: وقت البناء، حجم الصور

### 3. Test Status Card
- **حالة الاختبارات**: قيد التشغيل، نجح، فشل
- **التغطية**: نسبة تغطية الكود
- **النتائج**: عدد الاختبارات المنجزة

### 4. Security Status Card
- **فحص الأمان**: مكتمل، قيد التشغيل، معلق
- **الثغرات**: عدد الثغرات الحرجة والمتوسطة
- **التبعيات**: عدد التبعيات المفحوصة

### 5. Deployment Status Card
- **حالة النشر**: جاهز، قيد التشغيل، مكتمل
- **البيئة**: Staging, Production
- **الخدمات**: عدد الخدمات المُعدة

### 6. Health Status Card
- **صحة النظام**: جميع الأنظمة سليمة
- **الخدمات**: Backend, Frontend, Database
- **الإحصائيات**: وقت التشغيل، وقت الاستجابة

## 📝 Live Logs

### عرض السجلات المباشرة
- **الطابع الزمني**: وقت كل حدث
- **مستوى السجل**: INFO, WARNING, ERROR
- **الرسالة**: تفاصيل الحدث
- **التحديث التلقائي**: كل 30 ثانية

### أنواع السجلات
- **INFO**: معلومات عامة
- **WARNING**: تحذيرات
- **ERROR**: أخطاء
- **SUCCESS**: نجاح العمليات

## 🎮 عناصر التحكم

### 1. Start Pipeline
```bash
# بدء الـ pipeline
curl -X POST http://localhost:8080/api/pipeline/start
```

### 2. Deploy to Staging
```bash
# نشر إلى بيئة التطوير
curl -X POST http://localhost:8080/api/deploy/staging
```

### 3. Run Tests
```bash
# تشغيل الاختبارات
curl -X POST http://localhost:8080/api/tests/run
```

### 4. Stop Pipeline
```bash
# إيقاف الـ pipeline
curl -X POST http://localhost:8080/api/pipeline/stop
```

### 5. Refresh Status
```bash
# تحديث الحالة
curl -X GET http://localhost:8080/api/status
```

## 🔧 الإعدادات المتقدمة

### 1. تخصيص Dashboard
```html
<!-- تعديل monitoring/pipeline-dashboard.html -->
<div class="card">
    <h3>Custom Card</h3>
    <p>Your custom content here</p>
</div>
```

### 2. إضافة مؤشرات جديدة
```javascript
// إضافة مؤشر جديد
function addCustomMetric(name, value) {
    const metrics = document.querySelector('.metrics');
    const metric = document.createElement('div');
    metric.className = 'metric';
    metric.innerHTML = `
        <div class="metric-value">${value}</div>
        <div class="metric-label">${name}</div>
    `;
    metrics.appendChild(metric);
}
```

### 3. تخصيص الألوان
```css
/* تعديل الألوان في CSS */
:root {
    --primary-color: #667eea;
    --success-color: #4CAF50;
    --warning-color: #FF9800;
    --error-color: #F44336;
}
```

## 📊 API Endpoints

### 1. Pipeline Status
```bash
GET /api/pipeline/status
# Response: {"status": "running", "stage": "testing", "progress": 75}
```

### 2. Build Status
```bash
GET /api/build/status
# Response: {"backend": "success", "frontend": "success", "time": "2m 15s"}
```

### 3. Test Results
```bash
GET /api/tests/results
# Response: {"passed": 12, "failed": 0, "coverage": 85}
```

### 4. Security Scan
```bash
GET /api/security/scan
# Response: {"critical": 0, "high": 0, "medium": 3, "low": 5}
```

### 5. Health Check
```bash
GET /api/health/check
# Response: {"backend": "healthy", "frontend": "healthy", "database": "connected"}
```

## 🐛 حل المشاكل

### مشكلة: Dashboard لا يظهر
```bash
# تحقق من حالة الخدمات
docker-compose -f docker-compose.ci-dashboard.windows.yml ps

# تحقق من السجلات
docker-compose -f docker-compose.ci-dashboard.windows.yml logs dashboard
```

### مشكلة: Pipeline لا يبدأ
```bash
# تحقق من حالة CI/CD Runner
docker-compose -f docker-compose.ci-dashboard.windows.yml logs ci-dashboard-runner

# إعادة تشغيل الخدمات
docker-compose -f docker-compose.ci-dashboard.windows.yml restart
```

### مشكلة: السجلات لا تظهر
```bash
# تحقق من ملف السجلات
docker-compose -f docker-compose.ci-dashboard.windows.yml exec ci-dashboard-runner ls -la /app/logs

# إعادة تشغيل Pipeline Monitor
docker-compose -f docker-compose.ci-dashboard.windows.yml restart pipeline-monitor
```

## 🔄 التحديث التلقائي

### 1. تحديث الحالة
```javascript
// تحديث كل 30 ثانية
setInterval(refreshStatus, 30000);
```

### 2. تحديث السجلات
```javascript
// تحديث السجلات كل 10 ثوان
setInterval(updateLogs, 10000);
```

### 3. تحديث المؤشرات
```javascript
// تحديث المؤشرات كل 5 ثوان
setInterval(updateIndicators, 5000);
```

## 📱 الاستجابة للشاشات

### 1. Desktop (1200px+)
- 6 بطاقات في صف واحد
- عرض كامل للمؤشرات
- سجلات مفصلة

### 2. Tablet (768px - 1199px)
- 3 بطاقات في صف واحد
- مؤشرات مبسطة
- سجلات مختصرة

### 3. Mobile (< 768px)
- بطاقة واحدة في صف
- مؤشرات أساسية فقط
- سجلات مضغوطة

## 🎨 التخصيص

### 1. إضافة بطاقة جديدة
```html
<div class="card">
    <h3>🆕 New Card</h3>
    <div class="status">
        <div class="status-indicator status-info"></div>
        <span>New Feature</span>
    </div>
    <p>Description of the new feature</p>
</div>
```

### 2. إضافة مؤشر جديد
```javascript
function addStatusIndicator(status, text) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'status';
    statusDiv.innerHTML = `
        <div class="status-indicator status-${status}"></div>
        <span>${text}</span>
    `;
    return statusDiv;
}
```

### 3. إضافة زر جديد
```html
<button class="btn btn-primary" onclick="customAction()">
    🆕 Custom Action
</button>
```

## 📈 المراقبة والتحليل

### 1. إحصائيات الأداء
- وقت البناء
- وقت الاختبار
- وقت النشر
- وقت الاستجابة

### 2. مؤشرات الجودة
- تغطية الكود
- عدد الثغرات
- نجاح الاختبارات
- صحة النظام

### 3. تقارير دورية
- تقرير يومي
- تقرير أسبوعي
- تقرير شهري
- تقرير سنوي

## 🚀 النشر والإنتاج

### 1. إعدادات الإنتاج
```yaml
# docker-compose.prod.windows.yml
services:
  dashboard:
    ports:
      - "80:80"  # Port 80 for production
    environment:
      - PRODUCTION=true
```

### 2. SSL/HTTPS
```yaml
# إضافة SSL
services:
  dashboard:
    volumes:
      - ./ssl/cert.pem:/etc/ssl/cert.pem
      - ./ssl/key.pem:/etc/ssl/key.pem
```

### 3. Authentication
```javascript
// إضافة المصادقة
function requireAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
    }
}
```

---

**تم إنشاء نظام CI/CD Dashboard كامل ومتكامل! 🚀✨**

## 📞 الدعم الفني

- راجع `CI_CD_README.md` للتفاصيل الكاملة
- راجع `WINDOWS_SETUP.md` لإعداد Windows
- تحقق من السجلات مع `make -f Makefile.windows logs`
