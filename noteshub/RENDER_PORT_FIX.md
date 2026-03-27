# Render Port Binding Fix

## The Problem

Your deployment logs showed:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
==> No open ports detected on 0.0.0.0, continuing to scan...
```

**Root Cause**: Uvicorn was binding to `127.0.0.1` (localhost only) instead of `0.0.0.0` (all interfaces), preventing Render from detecting the service.

---

## The Solution

### ✅ Update Your Render Start Command

In your Render dashboard, change the **Start Command** to:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Key Changes:
- `--host 0.0.0.0` - Binds to all network interfaces (required for Render)
- `--port $PORT` - Uses Render's dynamic port assignment

---

## Files Created

### 1. `noteshub/backend/Procfile`
```
web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### 2. `noteshub/backend/render.yaml`
```yaml
services:
  - type: web
    name: noteshub-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## How to Apply the Fix

### Option 1: Update Render Dashboard (Quickest)

1. Go to your service on Render
2. Navigate to **Settings**
3. Find **Start Command**
4. Change it to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Save Changes**
6. Service will automatically redeploy

### Option 2: Use render.yaml (Recommended)

1. Commit the new files:
   ```bash
   git add noteshub/backend/render.yaml noteshub/backend/Procfile
   git commit -m "Fix: Bind uvicorn to 0.0.0.0 for Render deployment"
   git push origin main
   ```

2. Render will detect the changes and redeploy automatically

---

## Verification

After deployment, you should see in the logs:

✅ **Before (Wrong)**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
==> No open ports detected on 0.0.0.0
```

✅ **After (Correct)**:
```
INFO:     Uvicorn running on http://0.0.0.0:10000
==> Service is live
```

---

## Additional Improvements Made

### 1. Updated CORS Configuration
**File**: `noteshub/backend/app/main.py`

Now dynamically includes your production frontend URL from environment variables.

### 2. Added Configuration Settings
**File**: `noteshub/backend/app/config.py`

Added:
- `FRONTEND_URL` - For CORS configuration
- `ENVIRONMENT` - To distinguish dev/prod

---

## Environment Variables to Set in Render

| Variable | Value | Required |
|----------|-------|----------|
| `MONGODB_URL` | Your MongoDB Atlas connection string | ✅ Yes |
| `DATABASE_NAME` | `noteshub` | ✅ Yes |
| `SECRET_KEY` | Auto-generate in Render | ✅ Yes |
| `ALGORITHM` | `HS256` | ✅ Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` | ✅ Yes |
| `FRONTEND_URL` | Your frontend URL | ⚠️ After frontend deploy |
| `ENVIRONMENT` | `production` | Optional |

---

## Why This Happens

By default, uvicorn binds to `127.0.0.1:8000` when no host is specified. This works fine locally but fails in containerized/cloud environments like Render because:

1. **127.0.0.1** = localhost only (internal to the container)
2. **0.0.0.0** = all network interfaces (accessible externally)

Render's health checks look for services on `0.0.0.0`, so binding to `127.0.0.1` makes your service invisible to Render's infrastructure.

---

## Testing Locally

To test the fix locally:

```bash
# Navigate to backend directory
cd noteshub/backend

# Run with the same command Render uses
uvicorn app.main:app --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

Then test from another device on your network:
```bash
curl http://YOUR_LOCAL_IP:8000/health
```

---

## Common Mistakes to Avoid

❌ **Don't use**:
```bash
python run.py                    # Uses 127.0.0.1 by default
uvicorn app.main:app            # Uses 127.0.0.1 by default
uvicorn app.main:app --port 8000  # Still uses 127.0.0.1
```

✅ **Always use**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Next Steps

1. ✅ Apply the start command fix in Render
2. ✅ Wait for successful deployment
3. ✅ Test the health endpoint: `https://your-app.onrender.com/health`
4. ✅ Test the API docs: `https://your-app.onrender.com/docs`
5. ✅ Deploy frontend with correct backend URL
6. ✅ Update backend's `FRONTEND_URL` environment variable

---

## Quick Reference

**Problem**: Service not detected on Render
**Cause**: Binding to 127.0.0.1 instead of 0.0.0.0
**Fix**: Add `--host 0.0.0.0 --port $PORT` to start command
**Result**: Service accessible and detected by Render

---

For complete deployment instructions, see [`RENDER_DEPLOYMENT_GUIDE.md`](./RENDER_DEPLOYMENT_GUIDE.md)
