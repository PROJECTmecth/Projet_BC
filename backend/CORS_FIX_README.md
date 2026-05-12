# CORS Fix for Bomba Cash Project

## Problem
CORS error between frontend (Vercel) and backend (Railway):
```
Access to XMLHttpRequest at 'https://projetbc-production-bombacash.up.railway.app/api/login' 
from origin 'https://projet-bc.vercel.app' has been blocked by CORS policy
```

## Solution Applied

### 1. Updated CORS Configuration (`config/cors.php`)
- Hardcoded allowed origins instead of relying on environment variables
- Added `https://projet-bc.vercel.app` and `https://projetbc-production-bombacash.up.railway.app`
- Enabled credentials support
- Explicitly defined allowed methods

### 2. Custom CORS Middleware (`app/Http/Middleware/CorsMiddleware.php`)
- Handles preflight OPTIONS requests
- Adds proper CORS headers to all responses
- Ensures credentials are supported

### 3. Apache Configuration (`public/.htaccess`)
- Added CORS headers at server level
- Handles preflight requests with 200 response
- Includes all necessary headers

### 4. Railway Configuration (`railway.json`)
- Proper build configuration
- Health check endpoint
- Correct start command

### 5. Environment Variables (`.env.railway`)
- Production-ready environment variables
- Proper CORS settings
- Railway database integration

## Deployment Steps

### On Railway:
1. Go to your Railway project settings
2. Add these environment variables:
   ```
   CORS_ALLOWED_ORIGINS=https://projet-bc.vercel.app,https://projetbc-production-bombacash.up.railway.app
   CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
   CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,X-XSRF-Token
   CORS_SUPPORTS_CREDENTIALS=true
   FRONTEND_URL=https://projet-bc.vercel.app
   SESSION_DOMAIN=vercel.app
   SANCTUM_STATEFUL_DOMAINS=projet-bc.vercel.app
   ```

3. Redeploy the application

### Testing:
1. Test the CORS debug endpoint:
   ```
   GET https://projetbc-production-bombacash.up.railway.app/api/cors-debug
   ```

2. Test the login endpoint:
   ```
   POST https://projetbc-production-bombacash.up.railway.app/api/login
   ```

3. Test the CORS test endpoints:
   ```
   OPTIONS https://projetbc-production-bombacash.up.railway.app/api/test-cors
   GET https://projetbc-production-bombacash.up.railway.app/api/test-cors
   POST https://projetbc-production-bombacash.up.railway.app/api/test-cors
   ```

## Files Modified:
- `config/cors.php` - Updated CORS configuration
- `bootstrap/app.php` - Added custom middleware
- `public/.htaccess` - Added server-level CORS headers
- `routes/api.php` - Added test routes
- `app/Http/Middleware/CorsMiddleware.php` - New custom middleware
- `railway.json` - Railway deployment configuration
- `.env.railway` - Production environment variables

## Verification:
After deployment, the login should work properly from https://projet-bc.vercel.app
