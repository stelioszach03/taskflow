# TaskFlow Backend Security Documentation

## Security Features Implemented

### 1. Security Headers (Helmet.js)
- **Content Security Policy**: Restricts sources for scripts, styles, images, etc.
- **HSTS**: Forces HTTPS connections with preload
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Additional XSS protection

### 2. Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes
- **Registration**: 3 account creations per hour
- **Password Reset**: 3 requests per 15 minutes
- **API Endpoints**: 60 requests per minute

### 3. Input Validation & Sanitization
- **express-validator**: Validates all input data
- **mongo-sanitize**: Prevents NoSQL injection attacks
- **XSS protection**: Sanitizes user input to prevent XSS attacks
- **Custom validation rules**: Email, password strength, etc.

### 4. Authentication & Authorization
- **JWT Access Tokens**: Short-lived (15 minutes)
- **Refresh Tokens**: Long-lived (7 days) with rotation
- **Account Lockout**: After 5 failed login attempts (2 hours)
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Email Verification**: Required for certain actions
- **Role-based Access Control**: User and Admin roles

### 5. Password Security
- **Bcrypt**: 12 salt rounds for password hashing
- **Password History**: Tracks password changes
- **Password Reset Tokens**: Expire after 30 minutes
- **Account Recovery**: Secure password reset flow

### 6. Session Security
- **HTTP-Only Cookies**: For refresh tokens
- **Secure Cookies**: In production environment
- **SameSite**: Strict policy to prevent CSRF
- **Session Secret**: Required environment variable

### 7. CORS Configuration
- **Whitelisted Origins**: Only allowed origins can access API
- **Credentials Support**: For cookie-based authentication
- **Restricted Methods**: Only necessary HTTP methods allowed

### 8. Error Handling
- **Global Error Handler**: Catches all errors
- **Production Error Messages**: No sensitive information leaked
- **Validation Errors**: Consistent error format
- **Async Error Handling**: All async routes wrapped

### 9. Logging & Monitoring
- **Morgan**: Request logging
- **Environment-based Logging**: Different formats for dev/prod
- **Error Logging**: All errors logged with stack traces

### 10. Environment Security
- **Environment Validation**: Required variables checked on startup
- **Secure Defaults**: Production-ready default values
- **Configuration Management**: Centralized config module

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Required Variables
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
SESSION_SECRET=<strong-random-string>

# Optional Variables
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Best Practices

1. **Keep Dependencies Updated**: Regularly run `npm audit` and update packages
2. **Use HTTPS**: Always use HTTPS in production
3. **Secure MongoDB**: Use authentication and encryption for database
4. **Monitor Logs**: Regularly check logs for suspicious activity
5. **Backup Data**: Regular automated backups of database
6. **Security Headers**: Additional headers can be configured in Helmet
7. **API Documentation**: Keep API docs updated but not publicly accessible
8. **Penetration Testing**: Regular security audits recommended

## API Security Checklist

- ✅ All routes require authentication (except public auth routes)
- ✅ Input validation on all endpoints
- ✅ Rate limiting implemented
- ✅ CORS properly configured
- ✅ Error messages don't leak sensitive info
- ✅ SQL/NoSQL injection protection
- ✅ XSS protection
- ✅ CSRF protection (via SameSite cookies)
- ✅ Proper error handling
- ✅ Request logging
- ✅ Environment variables validated
- ✅ Password security enforced
- ✅ Account lockout mechanism
- ✅ Secure session management
- ✅ Token rotation implemented

## Deployment Security

1. Use environment variables for all secrets
2. Enable HTTPS with valid SSL certificate
3. Set `NODE_ENV=production`
4. Use a reverse proxy (nginx) with security headers
5. Enable firewall rules
6. Regular security updates
7. Monitor application logs
8. Set up alerts for suspicious activity