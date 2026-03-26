# NotesHub - Quick Start Guide

Get NotesHub up and running in 5 minutes!

## Prerequisites Check

Ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ MongoDB running locally

## Quick Setup

### 1. Backend (Terminal 1)

```bash
# Navigate to backend
cd noteshub/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start server
python run.py
```

✅ Backend running at: http://localhost:8000

### 2. Frontend (Terminal 2)

```bash
# Navigate to frontend
cd noteshub/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend running at: http://localhost:5173

### 3. Start Using NotesHub

1. Open http://localhost:5173
2. Click "Sign up" to create an account
3. Create your first collection
4. Start taking notes!

## Default Credentials

There are no default credentials. You must register a new account.

## What's Included

### Backend Features
- ✅ User authentication with JWT
- ✅ Collections management
- ✅ Notes CRUD operations
- ✅ Tagging system (5 predefined + custom tags)
- ✅ Full-text search with MongoDB
- ✅ Advanced filtering (AND/OR logic)
- ✅ Analytics dashboard
- ✅ Data export

### Frontend Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dashboard with statistics
- ✅ Notes management
- ✅ Collections organization
- ✅ Advanced search interface
- ✅ Settings and profile management
- ✅ Pin important notes
- ✅ Multi-collection note assignment

## Predefined Tags

The system comes with 5 predefined tags:
- `decisions` - For decision-making notes
- `action-items` - For tasks and action items
- `research` - For research notes
- `ideas` - For brainstorming and ideas
- `reference` - For reference materials

You can also create unlimited custom tags!

## API Documentation

Once the backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## Common Commands

### Backend
```bash
# Start server
python run.py

# Check if MongoDB is running
mongosh

# View logs
# Logs appear in terminal
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting

### MongoDB not running?
```bash
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community
```

### Port already in use?
- Backend: Edit `backend/run.py` and change port
- Frontend: Edit `frontend/vite.config.js` and change port

### Can't connect to API?
- Ensure backend is running on port 8000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:8000`

## Next Steps

1. **Customize**: Edit colors in `frontend/tailwind.config.js`
2. **Add Tags**: Modify predefined tags in `backend/app/database.py`
3. **Deploy**: See `SETUP_GUIDE.md` for production deployment
4. **Backup**: Set up MongoDB backups (see `SETUP_GUIDE.md`)

## File Structure

```
noteshub/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── models/    # Database models
│   │   ├── routes/    # API endpoints
│   │   ├── schemas/   # Pydantic schemas
│   │   └── utils/     # Helper functions
│   └── run.py         # Start script
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
└── README.md
```

## Support

- 📖 Full documentation: See `README.md` and `SETUP_GUIDE.md`
- 🐛 Issues: Check troubleshooting sections
- 💡 Features: All features from PRD are implemented

## Success Criteria ✅

Your NotesHub installation is successful when:
- ✅ You can register and login
- ✅ You can create collections
- ✅ You can create and edit notes
- ✅ Search returns results within 2 seconds
- ✅ Dashboard shows statistics
- ✅ You can pin/unpin notes
- ✅ Multi-filter search works with AND/OR logic

Happy note-taking! 📝
