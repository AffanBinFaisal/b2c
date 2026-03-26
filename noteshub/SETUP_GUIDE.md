# NotesHub - Complete Setup Guide

This guide will walk you through setting up the complete NotesHub application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **MongoDB 4.4+** - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)

## Step 1: MongoDB Setup

### Windows

1. Download and install MongoDB Community Edition
2. MongoDB should start automatically as a Windows service
3. Verify installation:
```cmd
mongosh
```

### Linux

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
mongosh
```

### Mac

```bash
brew services start mongodb-community
mongosh
```

## Step 2: Backend Setup

### 1. Navigate to backend directory

```bash
cd noteshub/backend
```

### 2. Create virtual environment

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and update:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=noteshub
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

**Important:** Generate a secure SECRET_KEY for production:
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 5. Start the backend server

```bash
python run.py
```

The backend API will be available at:
- API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## Step 3: Frontend Setup

### 1. Open a new terminal and navigate to frontend directory

```bash
cd noteshub/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env` file:
```bash
cp .env.example .env
```

The default configuration should work:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Step 4: First Time Usage

### 1. Register a new account

1. Open `http://localhost:5173` in your browser
2. Click "Sign up"
3. Fill in your details:
   - Name (minimum 2 characters)
   - Email (valid email format)
   - Password (minimum 8 characters, must include a number and special character)
4. Click "Create Account"

### 2. Create your first collection

1. After login, click "Collections" in the sidebar
2. Click "New Collection"
3. Enter a name (e.g., "Work Projects")
4. Click "Create"

### 3. Create your first note

1. Click "New Note" button
2. Enter a title
3. Add content
4. Select at least one collection
5. Optionally add tags (predefined or create custom)
6. Click "Create Note"

### 4. Explore features

- **Dashboard**: View statistics and pinned notes
- **All Notes**: Browse all your notes
- **Search**: Use advanced search with filters
- **Collections**: Manage your collections
- **Settings**: Update profile, change password, export data

## Troubleshooting

### Backend Issues

**MongoDB connection error:**
```
Error: Could not connect to MongoDB
```
Solution: Ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community
```

**Port 8000 already in use:**
```
Error: Address already in use
```
Solution: Change the port in `backend/run.py`:
```python
uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
```

**Import errors:**
```
ModuleNotFoundError: No module named 'fastapi'
```
Solution: Ensure virtual environment is activated and dependencies installed:
```bash
pip install -r requirements.txt
```

### Frontend Issues

**Port 5173 already in use:**

Edit `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5174,  // Change port
  }
})
```

**API connection error:**

Check that:
1. Backend is running on `http://localhost:8000`
2. `.env` file has correct `VITE_API_URL`
3. No CORS errors in browser console

**Dependencies installation fails:**

Try:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Backend

1. Set environment variables:
```env
MONGODB_URL=mongodb://your-production-db
SECRET_KEY=your-secure-production-key
```

2. Use a production WSGI server:
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

3. Set up reverse proxy (nginx/Apache)

### Frontend

1. Build for production:
```bash
npm run build
```

2. Serve the `dist` folder with a web server (nginx, Apache, or CDN)

3. Update API URL in production `.env`:
```env
VITE_API_URL=https://your-api-domain.com
```

## Database Backup

### Backup MongoDB

```bash
mongodump --db noteshub --out ./backup
```

### Restore MongoDB

```bash
mongorestore --db noteshub ./backup/noteshub
```

## Performance Tips

1. **MongoDB Indexes**: Already created automatically on startup
2. **Search Performance**: Limit to 1000 notes per user (configurable)
3. **Frontend Caching**: React context caches collections and tags
4. **API Rate Limiting**: Consider adding rate limiting for production

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Keep dependencies updated

## Support

For issues and questions:
- Check the troubleshooting section above
- Review API documentation at `/docs`
- Check MongoDB logs
- Review browser console for frontend errors

## Next Steps

- Customize the color scheme in `tailwind.config.js`
- Add more predefined tags in `backend/app/database.py`
- Configure email notifications (future feature)
- Set up automated backups
- Add monitoring and logging

Enjoy using NotesHub! 🎉
