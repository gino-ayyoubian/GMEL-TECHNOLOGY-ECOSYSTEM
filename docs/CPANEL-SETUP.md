# cPanel Setup and Deployment Guide

## Introduction

This guide provides complete instructions for deploying the GMEL Technology Ecosystem on cPanel hosting.

## Prerequisites

### Required Access:

- cPanel access (port 2083)
- SSH access (optional but recommended)
- File Manager access
- Node.js support in hosting

### Server Information:

- **Server**: server261.web-hosting.com
- **cPanel URL**: https://server261.web-hosting.com:2083
- **Domain**: gmel.kkm-intl.org
- **Path**: public_html

## Installation Steps

### Step 1: Login to cPanel

1. Navigate to cPanel:
   ```
   https://server261.web-hosting.com:2083
   ```

2. Login with your username and password

3. From the "Software" section, select "Git Version Control"

### Step 2: Clone the Repository

1. In the Git Version Control page, click "Create"

2. Enter the following information:
   - **Clone URL**: `https://github.com/gino-ayyoubian/GMEL-TECHNOLOGY-ECOSYSTEM.git`
   - **Repository Path**: `public_html/gmel`
   - **Repository Name**: `GMEL-TECHNOLOGY-ECOSYSTEM`

3. Click "Create" and wait for the clone to complete

### Step 3: Install Dependencies

#### Method 1: Using Terminal (Recommended)

If you have SSH access:

```bash
# Connect to server
ssh username@server261.web-hosting.com

# Navigate to project folder
cd public_html/gmel

# Install dependencies
npm install

# Build the project
npm run build
```

#### Method 2: Using File Manager

1. Open File Manager in cPanel
2. Navigate to `public_html/gmel`
3. Use Terminal within cPanel to run:
   ```bash
   npm install
   npm run build
   ```

### Step 4: Environment Configuration

1. Create a `.env` file in the project root

2. Add required environment variables:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. Save the file

### Step 5: Build Configuration

1. Ensure the `dist` folder is created after build

2. Verify the build output:
   ```bash
   ls -la dist/
   ```

### Step 6: Domain Configuration

1. In cPanel, go to "Domains" section

2. Set the document root for your domain:
   - Domain: `gmel.kkm-intl.org`
   - Document Root: `public_html/gmel/dist`

3. Save changes

### Step 7: SSL/HTTPS Setup

1. In cPanel, navigate to "SSL/TLS"

2. Install SSL certificate:
   - Use AutoSSL (recommended) or
   - Upload custom SSL certificate

3. Enable "Force HTTPS Redirect"

## Deployment Updates

### Using Git Version Control

1. Go to Git Version Control in cPanel

2. Find your repository in the list

3. Click "Manage"

4. Click "Pull or Deploy" tab

5. Click "Update from Remote" to pull latest changes

6. Rebuild the project:
   ```bash
   cd public_html/gmel
   npm install
   npm run build
   ```

### Manual Update

1. Login to cPanel File Manager

2. Navigate to project folder

3. Upload changed files

4. Run build command via Terminal

## Troubleshooting

### Issue: Node.js not found

**Solution**: Contact hosting provider to enable Node.js or use Node Version Manager (nvm)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 18
nvm use 18
```

### Issue: Build fails

**Solution**: Check for:
- Sufficient disk space
- Correct Node.js version
- All dependencies installed
- Environment variables configured

### Issue: 404 errors

**Solution**: 
1. Verify document root points to `dist` folder
2. Check `.htaccess` file for routing rules
3. Ensure all files are uploaded

### Issue: API calls fail

**Solution**:
1. Verify environment variables are set
2. Check API keys are valid
3. Ensure CORS is configured
4. Check browser console for errors

## Verification

### Test Deployment

1. Visit your domain:
   ```
   https://gmel.kkm-intl.org
   ```

2. Check that:
   - ✅ Page loads correctly
   - ✅ Logo displays
   - ✅ No console errors
   - ✅ API connections work
   - ✅ SSL certificate is valid

### Performance Check

1. Test page load speed
2. Check mobile responsiveness
3. Verify all features work
4. Test on different browsers

## Maintenance

### Regular Tasks

1. **Weekly**: Check for updates
   ```bash
   cd public_html/gmel
   git pull origin main
   npm install
   npm run build
   ```

2. **Monthly**: 
   - Review error logs
   - Check SSL certificate expiry
   - Update dependencies
   - Monitor disk usage

3. **As Needed**:
   - Clear cache
   - Backup files
   - Update Node.js version

## Backup Strategy

### Automated Backups

1. Use cPanel Backup feature
2. Schedule automatic backups
3. Store backups off-site

### Manual Backup

```bash
# Create backup
tar -czf gmel-backup-$(date +%Y%m%d).tar.gz public_html/gmel/

# Download backup via File Manager
```

## Security Recommendations

1. **Keep Updated**: Regularly update all dependencies
2. **Use HTTPS**: Always force SSL/HTTPS
3. **Secure API Keys**: Never commit keys to repository
4. **Access Control**: Limit cPanel access
5. **Monitor Logs**: Check access and error logs regularly

## Support

**Technical Lead**: CTO Tech Lead  
**Organization**: KKM International  
**Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for system details

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
