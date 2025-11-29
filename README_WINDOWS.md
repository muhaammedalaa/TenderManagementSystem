# 🪟 TMS Windows Setup - دليل التشغيل على Windows

## 🚀 التشغيل السريع (3 أوامر فقط)

### الطريقة الأولى: ملف Batch (الأسهل)
```cmd
# 1. فتح Command Prompt
# 2. الانتقال إلى مجلد المشروع
cd D:\Foe

# 3. تشغيل التطبيق
start.bat
```

### الطريقة الثانية: PowerShell
```powershell
# 1. فتح PowerShell
# 2. الانتقال إلى مجلد المشروع
cd D:\Foe

# 3. تشغيل التطبيق
.\scripts\start.ps1 -Windows
```

### الطريقة الثالثة: Git Bash
```bash
# 1. فتح Git Bash
# 2. الانتقال إلى مجلد المشروع
cd /d/Foe

# 3. تشغيل التطبيق
make -f Makefile.windows setup
```

## 📋 المتطلبات

### 1. Docker Desktop for Windows
- تحميل من: https://www.docker.com/products/docker-desktop/
- تأكد من تفعيل WSL 2 Backend
- تأكد من تفعيل Hyper-V

### 2. Git for Windows
- تحميل من: https://git-scm.com/download/win
- اختر "Git Bash" أثناء التثبيت

## 🛠️ الأوامر المتاحة

### أوامر سريعة
```cmd
start.bat start     # تشغيل التطبيق
start.bat stop      # إيقاف التطبيق
start.bat restart   # إعادة تشغيل التطبيق
start.bat logs      # عرض السجلات
start.bat status    # حالة الخدمات
start.bat clean     # تنظيف كل شيء
```

### أوامر CI/CD
```cmd
ci-cd.bat -Action build      # بناء الصور
ci-cd.bat -Action test       # تشغيل الاختبارات
ci-cd.bat -Action security   # فحص الأمان
ci-cd.bat -Action deploy     # نشر التطبيق
ci-cd.bat -Action health     # فحص الصحة
ci-cd.bat -Action full       # pipeline كامل
ci-cd.bat -Action cleanup    # تنظيف CI/CD
```

### أوامر PowerShell
```powershell
.\scripts\start.ps1 -Windows start     # تشغيل التطبيق
.\scripts\start.ps1 -Windows stop      # إيقاف التطبيق
.\scripts\start.ps1 -Windows restart   # إعادة تشغيل التطبيق
.\scripts\start.ps1 -Windows logs      # عرض السجلات
.\scripts\start.ps1 -Windows status    # حالة الخدمات
.\scripts\start.ps1 -Windows clean     # تنظيف كل شيء
```

### أوامر Git Bash
```bash
make -f Makefile.windows dev        # وضع التطوير
make -f Makefile.windows prod       # وضع الإنتاج
make -f Makefile.windows db-backup  # نسخ احتياطي
make -f Makefile.windows db-restore # استعادة
make -f Makefile.windows clean      # تنظيف كل شيء
```

## 🔧 إعدادات Windows المخصصة

### 1. إعدادات Docker Desktop
- افتح Docker Desktop
- اذهب إلى Settings > General
- فعّل "Use WSL 2 based engine"
- فعّل "Use Docker Compose V2"

### 2. إعدادات WSL 2
```powershell
# تشغيل PowerShell كمدير
wsl --install
wsl --set-default-version 2
```

### 3. إعدادات Windows Defender
- أضف مجلد المشروع إلى استثناءات Windows Defender
- أضف Docker Desktop إلى استثناءات Windows Defender

## 📁 هيكل المشروع على Windows

```
D:\Foe\
├── start.bat                    # ملف التشغيل السريع
├── Makefile.windows            # أوامر Git Bash
├── docker-compose.windows.yml  # إعدادات Docker للويندوز
├── env.windows                 # متغيرات البيئة للويندوز
├── TMS.API\                    # Backend
├── Frontend\                   # Frontend
├── scripts\                    # سكريبتات مساعدة
└── monitoring\                 # إعدادات المراقبة
```

## 🐛 حل المشاكل الشائعة

### مشكلة: Docker Desktop لا يعمل
```cmd
# الحل:
# 1. تأكد من تفعيل Virtualization في BIOS
# 2. تأكد من تفعيل Hyper-V
# 3. أعد تشغيل الكمبيوتر
# 4. أعد تشغيل Docker Desktop
```

### مشكلة: Port already in use
```cmd
# الحل:
# 1. تحقق من المنافذ المستخدمة
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# 2. أو غير المنافذ في docker-compose.windows.yml
```

### مشكلة: Services not starting
```cmd
# الحل:
# 1. تحقق من السجلات
start.bat logs

# 2. أعد تشغيل الخدمات
start.bat restart

# 3. نظف كل شيء وأعد المحاولة
start.bat clean
start.bat start
```

## 🔒 إعدادات الأمان

### 1. تغيير كلمات المرور الافتراضية
```cmd
# عدّل ملف .env
POSTGRES_PASSWORD=your_strong_password
JWT_KEY=your_very_strong_jwt_secret_key
```

### 2. إعدادات Windows Firewall
- أضف استثناءات للمنافذ 3000, 5000, 5432
- أضف استثناءات لـ Docker Desktop

## 📊 المراقبة والمراجعة

### 1. مراقبة الخدمات
```cmd
# حالة الخدمات
start.bat status

# السجلات
start.bat logs

# استخدام الموارد
docker stats
```

### 2. نسخ احتياطي
```cmd
# نسخ احتياطي لقاعدة البيانات
make -f Makefile.windows db-backup

# نسخ احتياطي للملفات
xcopy uploads backups\uploads /E /I
```

## 🚀 النشر على Windows Server

### 1. إعداد Windows Server
- تثبيت Docker Desktop
- تثبيت Git
- إعداد Windows Firewall

### 2. تشغيل التطبيق
```cmd
# نسخ المشروع
git clone <repository-url>
cd tms

# تشغيل التطبيق
start.bat start
```

### 3. إعدادات الإنتاج
```cmd
# نسخ ملف الإنتاج
copy env.production .env

# تعديل المتغيرات
notepad .env

# تشغيل وضع الإنتاج
docker-compose up -d
```

## 📞 الدعم الفني

### 1. التحقق من الحالة
```cmd
# حالة Docker
docker --version
docker-compose --version

# حالة الخدمات
start.bat status

# السجلات
start.bat logs
```

### 2. إعادة التشغيل الكامل
```cmd
# إيقاف كل شيء
start.bat stop

# تنظيف كل شيء
start.bat clean

# إعادة التشغيل
start.bat start
```

### 3. الحصول على المساعدة
- راجع `WINDOWS_SETUP.md` للتفاصيل الكاملة
- راجع `QUICK_START.md` للبدء السريع
- تحقق من السجلات مع `start.bat logs`

---

**تم التطوير خصيصاً لـ Windows! 🪟✨**
