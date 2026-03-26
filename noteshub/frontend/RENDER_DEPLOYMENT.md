# Render Deployment Guide for NotesHub Frontend

## Deployment Options

### Option 1: Static Site (Recommended)

This is the most efficient and cost-effective option for a React/Vite application.

#### Steps:

1. **Push your code to GitHub** (if not already done)

2. **Create a new Static Site on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select the `noteshub/frontend` directory

3. **Configure the Static Site:**
   - **Name:** `noteshub-frontend` (or your preferred name)
   - **Root Directory:** `noteshub/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Add Environment Variable:**
   - Click "Advanced" or go to "Environment" tab after creation
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Replace with your actual backend URL

5. **Deploy:**
   - Click "Create Static Site"
   - Render will automatically build and deploy your app

#### Auto-Deploy Configuration:
- Render will automatically redeploy when you push to your main branch
- The `_redirects` file ensures React Router works correctly

---

### Option 2: Web Service (If Static Site doesn't work)

If you need to use a web service instead:

#### Steps:

1. **Create a new Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service:**
   - **Name:** `noteshub-frontend`
   - **Root Directory:** `noteshub/frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`

3. **Add Environment Variable:**
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`

4. **Deploy:**
   - Click "Create Web Service"

---

## Important Notes

### Environment Variables
- **VITE_API_URL**: Must point to your deployed backend URL
- Environment variables prefixed with `VITE_` are embedded at build time
- After changing `VITE_API_URL`, you must rebuild the app

### CORS Configuration
Make sure your backend allows requests from your frontend domain:
```python
# In your backend app/main.py
origins = [
    "http://localhost:5173",
    "https://your-frontend-url.onrender.com",  # Add this
]
```

### Build Output
- Vite builds to the `dist` directory
- This contains optimized static files (HTML, CSS, JS)
- The `_redirects` file ensures all routes go to `index.html` for client-side routing

### Troubleshooting

#### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node version compatibility (Render uses Node 14+ by default)
- Check build logs for specific errors

#### App Loads but API Calls Fail
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings
- Verify backend is running and accessible

#### Routes Don't Work (404 on refresh)
- Ensure `_redirects` file is in the root directory
- For static sites, Render should automatically handle this
- For web services, the start command should serve the SPA correctly

#### Environment Variables Not Working
- Remember: `VITE_` prefixed variables are build-time only
- After changing them, trigger a new build
- Check they're set in Render dashboard under "Environment"

---

## Local Testing of Production Build

Before deploying, test the production build locally:

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

This will serve the built files at `http://localhost:4173`

---

## Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] `VITE_API_URL` points to backend URL
- [ ] Backend CORS allows frontend domain
- [ ] Code is pushed to GitHub
- [ ] Build command is correct
- [ ] Publish/start command is correct
- [ ] `_redirects` file exists for SPA routing
- [ ] Test production build locally first

---

## Updating Your Deployment

1. Push changes to GitHub
2. Render will automatically detect and redeploy
3. Monitor the build logs for any errors
4. Test the deployed app

---

## Cost

- **Static Site:** Free tier available (100 GB bandwidth/month)
- **Web Service:** Free tier available (750 hours/month)

Static sites are recommended as they're more efficient for React apps.
