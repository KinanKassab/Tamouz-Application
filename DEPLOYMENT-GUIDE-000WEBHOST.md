# دليل النشر على 000webhost - ScoutPluse

## 📋 الملفات المطلوبة للرفع

### 1. الملفات في جذر public_html:
```
public_html/
├── index.html              ← صفحة التحويل الرئيسية
├── read.php               ← API قراءة البيانات
├── write.php              ← API كتابة البيانات
├── data.json              ← قاعدة البيانات
├── test-connection.php    ← اختبار الاتصال
├── setup.php              ← الإعداد الأولي
└── .htaccess              ← إعدادات الخادم
```

### 2. المجلدات والملفات:
```
public_html/
├── HTML/
│   ├── index.html         ← الصفحة الرئيسية للتطبيق
│   ├── events-new.html    ← صفحة الأحداث الجديدة
│   └── events-enhanced.html ← صفحة الأحداث المحسنة
├── CSS/
│   ├── main.css
│   ├── components.css
│   ├── responsive.css
│   ├── auth.css
│   ├── events-new.css
│   └── api-enhancements.css
├── JS/
│   ├── main.js
│   ├── auth.js
│   ├── events.js
│   ├── events-enhanced.js
│   ├── api-service.js
│   ├── dashboard.js
│   ├── information.js
│   ├── profile.js
│   ├── settings.js
│   ├── navigation.js
│   ├── theme.js
│   ├── translations.js
│   ├── data.js
│   └── users.json
└── backups/               ← مجلد النسخ الاحتياطية (فارغ)
```

## 🔧 خطوات النشر

### الخطوة 1: رفع الملفات
1. سجل دخول إلى لوحة تحكم 000webhost
2. اذهب إلى File Manager
3. ادخل إلى مجلد public_html
4. ارفع جميع الملفات والمجلدات المذكورة أعلاه

### الخطوة 2: ضبط صلاحيات الملفات
**للملفات (.php, .json, .html, .css, .js):**
- كليك يمين → Change Permissions → 644

**للمجلدات (HTML/, CSS/, JS/, backups/):**
- كليك يمين → Change Permissions → 755

### الخطوة 3: تشغيل الإعداد
1. اذهب إلى: `https://yoursite.000webhostapp.com/setup.php`
2. تأكد أن جميع الاختبارات تظهر ✅

### الخطوة 4: اختبار الاتصال
1. اذهب إلى: `https://yoursite.000webhostapp.com/test-connection.php`
2. يجب أن ترى استجابة JSON مع `"success": true`

### الخطوة 5: اختبار التطبيق
1. اذهب إلى: `https://yoursite.000webhostapp.com/`
2. سيتم تحويلك تلقائياً إلى `/HTML/index.html`
3. جرب تسجيل الدخول وإنشاء حدث جديد

## ✅ التحقق من النجاح

### علامات النجاح:
- ✅ صفحة setup.php تظهر جميع الاختبارات بنجاح
- ✅ test-connection.php يعطي `"success": true`
- ✅ التطبيق يعمل على `/HTML/index.html`
- ✅ يمكن إنشاء أحداث جديدة وحفظها
- ✅ لا توجد أخطاء CORS أو Mixed Content

### الروابط المهمة:
- **التطبيق الرئيسي**: `https://yoursite.000webhostapp.com/`
- **صفحة الأحداث**: `https://yoursite.000webhostapp.com/HTML/index.html#events`
- **اختبار API**: `https://yoursite.000webhostapp.com/test-connection.php`
- **الإعداد**: `https://yoursite.000webhostapp.com/setup.php`

## 🐛 حل المشاكل

### مشكلة "File not found":
- تأكد أن جميع الملفات مرفوعة في المكان الصحيح
- تحقق من أسماء الملفات والمجلدات

### مشكلة "Permission denied":
- اضبط صلاحيات الملفات على 644
- اضبط صلاحيات المجلدات على 755

### مشكلة "API not working":
- شغل setup.php مرة أخرى
- تحقق من test-connection.php
- تأكد أن data.json موجود وقابل للكتابة

## 🎉 تم!

الآن تطبيق ScoutPluse يعمل بالكامل على 000webhost بدون مشاكل CORS أو Mixed Content!

**رابط التطبيق**: `https://yoursite.000webhostapp.com/`