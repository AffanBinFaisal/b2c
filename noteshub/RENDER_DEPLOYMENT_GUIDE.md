# Render Deployment Guide for NotesHub

## Problem Fixed

The deployment was failing because:
1. **Uvicorn was binding to `127.0.0.1:8000`** (localhost only) instead of `0.0.0.0`
2. Render couldn't detect any open ports on `0.0.0.0`
3. The deployment would timeout after failing to detect the service

## Solution

Created proper configuration files to ensure uvicorn binds to `0.0.0.0` and uses Render's `PORT` environment variable.

---

## Backend Deployment Steps

### 1. Prerequisites
- MongoDB Atlas cluster set up and running
- MongoDB connection string ready (with SSL/TLS enabled)
- Render account created

### 2. Deploy Backend to Render

#### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `noteshub` repository

3. **Configure the Service**
   - **Name**: `noteshub-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `noteshub/backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   Click "Advanced" and add these environment variables:
   
   | Key | Value | Notes |
   |-----|-------|-------|
   | `MONGODB_URL` | `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=false` | Your MongoDB Atlas connection string |
   | `DATABASE_NAME` | `noteshub` | Your database name |
   | `SECRET_KEY` | Click "Generate" | Auto-generate a secure key |
   | `ALGORITHM` | `HS256` | JWT algorithm |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` | 30 days in minutes |
   | `FRONTEND_URL` | `https://your-frontend.onrender.com` | Your frontend URL (add after frontend deployment) |
   | `ENVIRONMENT` | `production` | Environment identifier |
   | `PYTHON_VERSION` | `3.11.0` | Python version |

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment to complete
   - Your backend will be available at: `https://noteshub-backend.onrender.com`

#### Option B: Manual Configuration

If you prefer not to use render.yaml:

1. Follow steps 1-2 from Option A
2. Manually configure all settings in the Render dashboard
3. Ensure the start command is: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3. Verify Backend Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Root endpoint
curl https://your-backend-url.onrender.com/

# API docs (should open in browser)
https://your-backend-url.onrender.com/docs
```

Expected responses:
- `/health`: `{"status": "healthy"}`
- `/`: `{"message": "Welcome to NotesHub API", "version": "1.0.0", "docs": "/docs"}`

---

## Frontend Deployment Steps

### 1. Update Frontend Environment Variables

Before deploying the frontend, update the API URL:

**File**: `noteshub/frontend/.env.production`
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### 2. Deploy Frontend to Render

1. **Create New Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `noteshub` repository

2. **Configure the Static Site**
   - **Name**: `noteshub-frontend`
   - **Branch**: `main`
   - **Root Directory**: `noteshub/frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend-url.onrender.com` |

4. **Deploy**
   - Click "Create Static Site"
   - Wait for build to complete
   - Your frontend will be available at: `https://noteshub-frontend.onrender.com`

### 3. Update Backend CORS Settings

After frontend deployment, update the backend's `FRONTEND_URL` environment variable:

1. Go to your backend service on Render
2. Navigate to "Environment"
3. Update `FRONTEND_URL` to your frontend URL: `https://noteshub-frontend.onrender.com`
4. Save changes (this will trigger a redeploy)

---

## Important Files Created/Modified

### New Files
1. **`noteshub/backend/render.yaml`** - Render service configuration
2. **`noteshub/backend/Procfile`** - Alternative start command configuration

### Modified Files
1. **`noteshub/backend/app/config.py`** - Added `FRONTEND_URL` and `ENVIRONMENT` settings
2. **`noteshub/backend/app/main.py`** - Updated CORS to use dynamic frontend URL

---

## Troubleshooting

### Issue: "No open ports detected on 0.0.0.0"

**Solution**: Ensure your start command includes `--host 0.0.0.0 --port $PORT`

✅ Correct:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

❌ Incorrect:
```bash
uvicorn app.main:app
python run.py
```

### Issue: MongoDB Connection Fails

**Checklist**:
- [ ] MongoDB Atlas cluster is running
- [ ] Connection string includes `tls=true`
- [ ] IP whitelist includes `0.0.0.0/0` (allow all) in MongoDB Atlas
- [ ] Username and password are URL-encoded
- [ ] Database name is correct

### Issue: CORS Errors

**Solution**:
1. Verify `FRONTEND_URL` environment variable is set correctly in backend
2. Check that frontend URL matches exactly (no trailing slash)
3. Ensure backend has redeployed after updating `FRONTEND_URL`

### Issue: 502 Bad Gateway

**Possible Causes**:
1. Application crashed on startup
2. MongoDB connection failed
3. Missing environment variables

**Solution**:
1. Check Render logs for error messages
2. Verify all environment variables are set
3. Test MongoDB connection string locally first

---

## Free Tier Limitations

Render's free tier has these limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month of runtime
- Automatic deploys on git push

**Tip**: For production use, consider upgrading to a paid plan for:
- No cold starts
- Better performance
- More resources

---

## Post-Deployment Checklist

- [ ] Backend health endpoint returns `{"status": "healthy"}`
- [ ] Backend API docs accessible at `/docs`
- [ ] MongoDB connection successful (check logs)
- [ ] Frontend loads without errors
- [ ] Can register a new user
- [ ] Can login with registered user
- [ ] Can create, edit, and delete notes
- [ ] Search functionality works
- [ ] Collections feature works
- [ ] Tags feature works

---

## Monitoring

### Backend Logs
```bash
# View in Render Dashboard
Services → noteshub-backend → Logs
```

### Frontend Logs
```bash
# View in Render Dashboard
Static Sites → noteshub-frontend → Logs
```

### MongoDB Logs
```bash
# View in MongoDB Atlas
Database → Clusters → Your Cluster → Metrics
```

---

## Updating Your Deployment

### Backend Updates
```bash
git add .
git commit -m "Update backend"
git push origin main
# Render will auto-deploy
```

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Render will auto-deploy
```

### Manual Redeploy
If needed, you can manually trigger a redeploy:
1. Go to Render Dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong SECRET_KEY** - Let Render generate it
3. **Rotate secrets regularly** - Update SECRET_KEY periodically
4. **Monitor access logs** - Check for suspicious activity
5. **Keep dependencies updated** - Run `pip list --outdated` regularly
6. **Use HTTPS only** - Render provides this automatically

---

## Support

- **Render Documentation**: https://render.com/docs
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/

---

## Summary

Your NotesHub application is now deployed with:
- ✅ Backend API on Render (FastAPI + MongoDB)
- ✅ Frontend on Render (React + Vite)
- ✅ Proper CORS configuration
- ✅ SSL/TLS encryption
- ✅ Environment-based configuration
- ✅ Auto-deployment on git push

**Backend URL**: `https://noteshub-backend.onrender.com`
**Frontend URL**: `https://noteshub-frontend.onrender.com`
**API Docs**: `https://noteshub-backend.onrender.com/docs`
