# NotesHub

A powerful, searchable knowledge management system that helps users organize, tag, and quickly retrieve their notes across multiple collections.

## Features

### Core Functionality
- **User Authentication** - Secure registration, login, and session management
- **Collections Management** - Organize notes into projects, topics, or courses
- **Notes Management** - Create, edit, delete, and pin notes with rich content
- **Tagging System** - Predefined and custom tags for flexible organization
- **Full-Text Search** - MongoDB-powered search with advanced filtering
- **Analytics Dashboard** - Statistics and insights about your notes

### Key Capabilities
- ✅ Multi-collection note assignment (notes can belong to multiple collections)
- ✅ Full-text search across note titles and content
- ✅ Advanced filtering with AND/OR logic
- ✅ Pin important notes for quick access
- ✅ Predefined tags (decisions, action-items, research, ideas, reference)
- ✅ Custom user-created tags
- ✅ Real-time analytics and statistics
- ✅ Data export functionality
- ✅ Responsive design (desktop, tablet, mobile)

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with text indexing
- **Motor** - Async MongoDB driver
- **JWT** - Token-based authentication
- **Pydantic** - Data validation

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Project Structure

```
noteshub/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── schemas/         # Request/response schemas
│   │   ├── utils/           # Helper functions
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # MongoDB connection
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt
│   ├── run.py
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```bash
cp .env.example .env
```

6. Update `.env` with your MongoDB connection and secret key:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=noteshub
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

7. Start the backend server:
```bash
python run.py
```

Backend will run at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

### MongoDB Setup

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)

2. Start MongoDB service:
- Windows: MongoDB should start automatically as a service
- Linux: `sudo systemctl start mongod`
- Mac: `brew services start mongodb-community`

3. Verify MongoDB is running:
```bash
mongosh
```

## Usage

### Creating Your First Note

1. Register a new account or login
2. Create a collection (e.g., "Work Projects")
3. Create a note with:
   - Title
   - Content
   - Assign to one or more collections
   - Add tags (predefined or custom)
   - Pin if important
4. Use search to find notes later

### Search Tips

- **Text Search**: Enter keywords to search note titles and content
- **Filter by Collection**: Select one or more collections
- **Filter by Tag**: Select one or more tags
- **AND Logic**: Note must match ALL selected filters
- **OR Logic**: Note must match ANY selected filter
- **Sort**: By relevance (when searching) or updated date

### Dashboard

The dashboard shows:
- Total notes count
- Pinned notes for quick access
- Recent activity
- Notes per collection breakdown
- Top 10 most-used tags
- Statistics overview

## API Documentation

Full API documentation is available at `http://localhost:8000/docs` when the backend is running.

### Main Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get token
- `GET /auth/me` - Get current user

**Collections**
- `GET /collections` - List all collections
- `POST /collections` - Create collection
- `PUT /collections/{id}` - Rename collection
- `DELETE /collections/{id}` - Delete collection

**Notes**
- `GET /notes` - List notes (with filters)
- `POST /notes` - Create note
- `GET /notes/{id}` - Get note details
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note
- `POST /notes/{id}/pin` - Pin note
- `POST /notes/{id}/unpin` - Unpin note

**Tags**
- `GET /tags` - List all tags
- `POST /tags` - Create custom tag
- `DELETE /tags/{id}` - Delete custom tag

**Search**
- `POST /search` - Search notes with filters

**Analytics**
- `GET /analytics/dashboard` - Get dashboard data
- `GET /analytics/export` - Export all data

## Business Rules

### Collections
- Names must be unique per user
- Can contain letters, numbers, spaces, hyphens, underscores
- Deleting a collection hard-deletes notes that belong ONLY to that collection
- Notes in multiple collections remain in other collections

### Notes
- Must have a title (1-200 characters)
- Content optional (max 50,000 characters)
- Must belong to at least one collection
- Can have up to 20 tags
- Soft delete with 30-day recovery period
- Pinned notes appear at top of lists and on dashboard
- Maximum 1,000 notes per user

### Tags
- Predefined tags: decisions, action-items, research, ideas, reference
- Users can create custom tags
- Tag names are case-insensitive and unique
- Custom tags auto-delete when unused
- Predefined tags cannot be deleted

### Search
- Full-text search on title (weight: 10) and content (weight: 1)
- Results return within 2 seconds
- Maximum 1,000 results per query
- Pagination at 20 results per page
- AND/OR logic for multi-filter searches

## Performance

- Search queries: < 2 seconds
- Page loads: < 2 seconds
- Dashboard aggregations: < 1 second
- Supports 100-500 concurrent users

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Future Enhancements

### Version 2
- Note sharing and collaboration
- Rich media support (images, videos)
- Version history and change tracking
- Bulk operations
- Advanced search operators
- Export to PDF/Markdown/Word

### Version 3
- Native mobile apps
- Offline sync
- Real-time collaboration
- AI-powered suggestions

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
