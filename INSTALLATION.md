# ShiftMaster Installation Guide

This guide provides step-by-step instructions for installing ShiftMaster on shared hosting.

## Prerequisites

- PHP 8.0 or higher
- MySQL 5.7 or higher
- Node.js 18.0 or higher (for building the frontend)
- A shared hosting account with:
  - SSH access (recommended)
  - FTP/SFTP access
  - Ability to create MySQL databases
  - Support for running Node.js applications or at least serving static files

## Installation Steps

### 1. Database Setup

1. Create a new MySQL database through your hosting control panel
2. Note down the following credentials:
   - Database name
   - Database username
   - Database password
   - Database host (usually localhost)

### 2. Application Files

#### Option A: Using SSH (Recommended)

```bash
# 1. Connect to your hosting via SSH
ssh username@your-hosting.com

# 2. Navigate to your public directory (varies by host)
cd public_html   # or www, htdocs, etc.

# 3. Clone the repository
git clone https://github.com/your-repo/shiftmaster.git .

# 4. Install dependencies
npm install

# 5. Build the frontend
npm run build
```

#### Option B: Using FTP/SFTP

1. On your local machine:
   ```bash
   # Clone the repository
   git clone https://github.com/your-repo/shiftmaster.git
   cd shiftmaster

   # Install dependencies
   npm install

   # Build the frontend
   npm run build
   ```

2. Using your FTP client (FileZilla, Cyberduck, etc.):
   - Upload the contents of the `dist` directory to your public directory
   - Upload the `server` directory to a location outside your public directory
   - Upload the `.env` file (after configuration) outside your public directory

### 3. Environment Configuration

1. Create/edit the `.env` file:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # JWT Configuration
   JWT_SECRET=your-secure-secret-key-here

   # Database Configuration (if using external database)
   DB_HOST=localhost
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   ```

2. Update your hosting configuration:
   - Set up URL rewriting (if needed)
   - Configure SSL certificates
   - Set up proper file permissions:
     ```bash
     chmod 755 public_html
     chmod 644 public_html/*.html
     chmod 644 public_html/*.js
     chmod 644 public_html/*.css
     ```

### 4. Server Configuration

#### For Apache (.htaccess)

Create/edit the `.htaccess` file in your public directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle frontend routes
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.html [QSA,L]

  # Proxy API requests to Node.js server
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^api/(.*) http://localhost:3000/api/$1 [P,L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

#### For Nginx (nginx.conf)

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 5. Starting the Server

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start server/index.js --name shiftmaster

# Ensure PM2 starts on system reboot
pm2 startup
pm2 save
```

#### Using Node.js directly (if PM2 is not available)

```bash
# Start the server in the background
nohup node server/index.js &
```

### 6. Final Steps

1. Test the application by visiting your domain
2. Default admin credentials:
   - Email: admin@example.com
   - Password: admin
   - **IMPORTANT**: Change these credentials immediately after first login!

## Security Considerations

1. Always use HTTPS in production
2. Change the default admin password immediately
3. Keep the `.env` file secure and outside public access
4. Regularly update dependencies:
   ```bash
   npm audit
   npm update
   ```
5. Set up proper backups for your database and files
6. Configure proper CORS settings in server/index.js

## Troubleshooting

### Common Issues

1. **API 404 Errors**
   - Check .htaccess/nginx configuration
   - Verify Node.js server is running
   - Check proxy settings

2. **Database Connection Issues**
   - Verify database credentials
   - Check database host accessibility
   - Confirm database user permissions

3. **Blank Page After Deployment**
   - Check browser console for errors
   - Verify all static files are properly uploaded
   - Check file permissions

### Getting Help

- Open an issue on GitHub
- Check the documentation
- Contact support at support@shiftmaster.com

## Updating the Application

1. Backup your data:
   ```bash
   # Backup database
   mysqldump -u username -p database_name > backup.sql
   
   # Backup files
   tar -czf backup.tar.gz public_html
   ```

2. Pull updates:
   ```bash
   git pull origin main
   ```

3. Rebuild and restart:
   ```bash
   npm install
   npm run build
   pm2 restart shiftmaster
   ```

## Performance Optimization

1. Enable gzip compression
2. Configure browser caching
3. Optimize database queries
4. Use a CDN for static assets

## Maintenance

Regular maintenance tasks:

1. Monitor server logs
2. Update dependencies
3. Backup data
4. Check security updates
5. Monitor disk space
6. Review access logs

## Support

For additional support:
- Documentation: https://docs.shiftmaster.com
- Email: support@shiftmaster.com
- Community Forum: https://community.shiftmaster.com