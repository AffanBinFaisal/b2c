# NotesHub Backend

FastAPI backend for NotesHub - A powerful, searchable knowledge management system.

## Features

- User authentication with JWT tokens
- Collections management
- Notes CRUD operations with multi-collection support
- Tagging system (predefined + custom tags)
- Full-text search with MongoDB text indexing
- Advanced filtering (AND/OR logic)
- Analytics dashboard
- Data export

## Setup

### Prerequisites

- Python 3.8+
- MongoDB 4.4+

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Update `.env` with your configuration:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=noteshub
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
```

### Running the Server

```bash
python run.py
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update user profile
- `POST /auth/change-password` - Change password
- `DELETE /auth/me` - Delete account

### Collections
- `POST /collections` - Create collection
- `GET /collections` - Get all collections
- `GET /collections/{id}` - Get collection by ID
- `PUT /collections/{id}` - Update collection
- `DELETE /collections/{id}` - Delete collection

### Notes
- `POST /notes` - Create note
- `GET /notes` - Get all notes (with filters)
- `GET /notes/{id}` - Get note by ID
- `PUT /notes/{id}` - Update note
- `DELETE /notes/{id}` - Delete note
- `POST /notes/{id}/pin` - Pin note
- `POST /notes/{id}/unpin` - Unpin note

### Tags
- `POST /tags` - Create custom tag
- `GET /tags` - Get all tags
- `GET /tags/{id}` - Get tag by ID
- `DELETE /tags/{id}` - Delete custom tag

### Search
- `POST /search` - Search notes with filters

### Analytics
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/export` - Export user data

## Database Schema

### Users
- email (unique)
- passwordHash
- name
- preferences
- createdAt, updatedAt, lastLoginAt, deletedAt

### Collections
- name (unique per user)
- ownerId
- createdAt, updatedAt

### Notes
- title
- content
- ownerId
- collectionIds (array)
- tagIds (array)
- isPinned
- createdAt, updatedAt, deletedAt

### Tags
- name (unique)
- type (predefined/custom)
- ownerId (null for predefined)
- createdAt

## Development

### Project Structure
```
backend/
├── app/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── schemas/         # Pydantic schemas
│   ├── utils/           # Utility functions
│   ├── config.py        # Configuration
│   ├── database.py      # Database connection
│   └── main.py          # FastAPI app
├── requirements.txt
├── run.py
└── README.md
```

## License

MIT
