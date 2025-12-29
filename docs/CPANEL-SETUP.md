# راهنمای نصب و راه‌اندازی در cPanel

## مقدمه

این راهنما برای deploy کردن GMEL Technology Ecosystem در cPanel hosting آماده شده است.

## پیش‌نیازها

### دسترسی‌های مورد نیاز:
- دسترسی به cPanel (port 2083)
- دسترسی SSH (اختیاری اما توصیه می‌شود)
- دسترسی به File Manager
- Node.js support در hosting

### اطلاعات سرور:
- **Server**: server261.web-hosting.com
- **cPanel URL**: https://server261.web-hosting.com:2083
- **Domain**: gmel.kkm-intl.org
- **Path**: public_html

## مراحل نصب

### مرحله 1: ورود به cPanel

1. به آدرس cPanel مراجعه کنید:
   ```
   https://server261.web-hosting.com:2083
   ```

2. با username و password خود وارد شوید

3. از بخش "Software" گزینه "Git Version Control" را انتخاب کنید

### مرحله 2: Clone کردن Repository

1. در صفحه Git Version Control، روی "Create" کلیک کنید

2. اطلاعات زیر را وارد کنید:
   - **Clone URL**: `https://github.com/gino-ayyoubian/GMEL-TECHNOLOGY-ECOSYSTEM.git`
   - **Repository Path**: `public_html/gmel`
   - **Repository Name**: `GMEL-TECHNOLOGY-ECOSYSTEM`

3. روی "Create" کلیک کنید و منتظر بمانید تا clone کامل شود

### مرحله 3: نصب Dependencies

#### روش 1: استفاده از Terminal (توصیه می‌شود)

اگر دسترسی SSH دارید:

```bash
# اتصال به سرور
ssh username@server261.web-hosting.com

# رفتن به پوشه پروژه
cd public_html/gmel

# نصب dependencies
npm install

# یا استفاده از yarn
yarn install
```

#### روش 2: استفاده از Node.js Selector در cPanel

1. از cPanel به بخش "Software" → "Setup Node.js App" بروید

2. روی "Create Application" کلیک کنید

3. اطلاعات زیر را وارد کنید:
   - **Node.js version**: انتخاب آخرین نسخه (18.x یا بالاتر)
   - **Application mode**: Production
   - **Application root**: `public_html/gmel`
   - **Application URL**: `gmel.kkm-intl.org`
   - **Application startup file**: `dist/index.html` (بعد از build)

4. "Create" را کلیک کنید

5. بعد از ایجاد، در همان صفحه:
   - وارد Virtual Environment شوید
   - دستور `npm install` را اجرا کنید

### مرحله 4: تنظیم Environment Variables

1. در cPanel File Manager به پوشه `public_html/gmel` بروید

2. فایل `.env` ایجاد کنید (اگر وجود ندارد)

3. محتوای زیر را وارد کنید:

```env
# Production Environment Variables
NODE_ENV=production

# Gemini API Configuration
VITE_GEMINI_API_KEY=your_production_api_key_here
VITE_API_BASE_URL=https://gmel.kkm-intl.org

# Application Settings
VITE_APP_NAME="GMEL Technology Ecosystem"
VITE_APP_VERSION="1.0.0"
```

**⚠️ مهم**: 
- API Key را از Google AI Studio دریافت کنید
- این فایل را NEVER در Git commit نکنید
- از File Permissions مناسب (644) استفاده کنید

### مرحله 5: Build کردن پروژه

```bash
# در پوشه پروژه
cd public_html/gmel

# اجرای build
npm run build

# یا با yarn
yarn build
```

این دستور پوشه `dist/` را ایجاد می‌کند که شامل فایل‌های آماده برای production است.

### مرحله 6: تنظیم Document Root

#### روش 1: از طریق cPanel Domains

1. به "Domains" در cPanel بروید

2. دامنه `gmel.kkm-intl.org` را پیدا کنید

3. روی "Manage" کلیک کنید

4. "Document Root" را به این مسیر تغییر دهید:
   ```
   public_html/gmel/dist
   ```

5. تغییرات را ذخیره کنید

#### روش 2: استفاده از .htaccess

در پوشه `public_html/` فایل `.htaccess` ایجاد یا ویرایش کنید:

```apache
# GMEL Technology Ecosystem Configuration
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Redirect to dist folder
    RewriteCond %{HTTP_HOST} ^gmel\.kkm-intl\.org$ [NC]
    RewriteCond %{REQUEST_URI} !^/gmel/dist/
    RewriteRule ^(.*)$ /gmel/dist/$1 [L]
    
    # Handle React Router
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /gmel/dist/index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "no-referrer-when-downgrade"
</IfModule>

# Enable GZIP Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
</IfModule>
```

### مرحله 7: تنظیم SSL Certificate

1. در cPanel به "Security" → "SSL/TLS" بروید

2. اگر SSL نصب نیست:
   - "Let's Encrypt" را انتخاب کنید
   - Domain `gmel.kkm-intl.org` را انتخاب کنید
   - "Issue" را کلیک کنید

3. Force HTTPS:
   - به "Domains" بروید
   - روی دامنه کلیک کنید
   - "Force HTTPS Redirect" را فعال کنید

### مرحله 8: تست و راه‌اندازی نهایی

1. مرورگر را باز کنید و به آدرس زیر بروید:
   ```
   https://gmel.kkm-intl.org
   ```

2. باید صفحه authentication اپلیکیشن را ببینید

3. تست کنید که:
   - ✅ صفحه لود می‌شود
   - ✅ SSL کار می‌کند (قفل سبز)
   - ✅ منوها و دکمه‌ها کار می‌کنند
   - ✅ API calls به Gemini موفق است

## عیب‌یابی (Troubleshooting)

### مشکل 1: صفحه 404 نمایش می‌دهد

**راه حل**:
- Document Root را چک کنید
- فایل `.htaccess` را بررسی کنید
- Permissions فایل‌ها را چک کنید (755 برای folders، 644 برای files)

### مشکل 2: npm install کار نمی‌کند

**راه حل**:
- نسخه Node.js را چک کنید (باید 18.x یا بالاتر باشد)
- فضای دیسک کافی داشته باشید
- از دستور `npm cache clean --force` استفاده کنید

### مشکل 3: API errors

**راه حل**:
- Environment variables را بررسی کنید
- API key را در Google AI Studio چک کنید
- CORS settings را بررسی کنید

### مشکل 4: Build errors

**راه حل**:
```bash
# پاک کردن cache و rebuild
rm -rf node_modules dist
npm install
npm run build
```

## بروزرسانی (Updates)

### بروزرسانی خودکار از Git:

1. در cPanel به Git Version Control بروید

2. روی "Manage" کنار repository کلیک کنید

3. "Pull or Deploy" را انتخاب کنید

4. "Update from Remote" را کلیک کنید

5. بعد از pull:
   ```bash
   cd public_html/gmel
   npm install  # برای dependencies جدید
   npm run build
   ```

### بروزرسانی دستی:

```bash
cd public_html/gmel
git pull origin main
npm install
npm run build
```

## Backup Strategy

### 1. Code Backup (Git)
- همه چیز در GitHub است
- Branch‌های مختلف برای versions

### 2. Files Backup (cPanel)
1. به "Files" → "Backup" بروید
2. "Download a Full Website Backup" را انتخاب کنید
3. Backup را به صورت هفتگی download کنید

### 3. Database Backup
اگر در آینده database اضافه شد:
1. از phpMyAdmin export بگیرید
2. یا از cPanel Backup wizard استفاده کنید

## Performance Optimization

### 1. Enable Caching
```apache
# در .htaccess اضافه کنید
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</IfModule>
```

### 2. Image Optimization
- از WebP format استفاده کنید
- تصاویر را compress کنید
- Lazy loading را فعال کنید

### 3. CDN Integration
برای بهبود سرعت:
- Cloudflare CDN
- یا استفاده همزمان از Vercel برای static assets

## Security Checklist

- [ ] SSL Certificate نصب و فعال است
- [ ] Force HTTPS فعال است
- [ ] API keys در environment variables هستند (نه در code)
- [ ] File permissions صحیح هستند
- [ ] .env فایل در .gitignore است
- [ ] Security headers در .htaccess تنظیم شده‌اند
- [ ] Regular backups انجام می‌شود
- [ ] Firewall rules بررسی شده‌اند

## Monitoring

### cPanel Built-in Tools:
1. **Metrics** → Website Traffic
2. **Errors** → Error Log
3. **Resource Usage** → CPU/Memory monitoring

### External Monitoring (توصیه):
- **UptimeRobot**: برای uptime monitoring
- **Google Analytics**: برای user behavior
- **Sentry**: برای error tracking

## Support & Resources

### مستندات:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - معماری سیستم
- [DEPLOYMENT.md](../DEPLOYMENT.md) - راهنمای deployment Vercel
- GitHub Repository: [GMEL-TECHNOLOGY-ECOSYSTEM](https://github.com/gino-ayyoubian/GMEL-TECHNOLOGY-ECOSYSTEM)

### Contact:
- GitHub Issues: برای گزارش مشکلات
- cPanel Support: برای مشکلات hosting

---

**آخرین بروزرسانی**: January 2025  
**نسخه**: 1.0.0  
**نگهداری توسط**: KKM International GMEL Technology Team
