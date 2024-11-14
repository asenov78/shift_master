# ShiftMaster Installation Guide

## Shared Hosting Installation

1. Download the latest release of ShiftMaster
2. Upload all files to your web hosting directory
3. Create a MySQL database through your hosting control panel
4. Visit `yourdomain.com/install` in your web browser
5. Follow the web-based installer steps:
   - System requirements check
   - Database configuration
   - Admin account setup

## Requirements

- PHP 8.0 or higher
- MySQL 5.7 or higher
- PDO PHP Extension
- OpenSSL PHP Extension
- JSON PHP Extension
- Writable permissions on:
  - .env file
  - uploads directory
  - logs directory

## Manual Installation (Alternative)

If you prefer manual installation:

1. Create a MySQL database
2. Import `install/schema.sql`
3. Copy `.env.example` to `.env`
4. Update `.env` with your database credentials
5. Create an admin user directly in the database
6. Remove the `install` directory

## Security

After installation:

1. Delete the `install` directory
2. Ensure `.env` is not publicly accessible
3. Set up proper file permissions
4. Configure SSL/HTTPS
5. Change the default admin password

## Support

For support:
- Documentation: https://docs.shiftmaster.com
- Email: support@shiftmaster.com
- Community Forum: https://community.shiftmaster.com