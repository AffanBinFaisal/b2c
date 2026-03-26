# NotesHub Frontend

React frontend for NotesHub knowledge management system.

## Features

- User authentication (login/register)
- Dashboard with analytics
- Notes management (create, edit, delete, pin)
- Collections organization
- Tagging system
- Advanced search with filters
- Responsive design
- Settings management

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- Vite for build tooling

## Setup

### Prerequisites

- Node.js 16+
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` if needed:
```
VITE_API_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.jsx
│   └── PrivateRoute.jsx
├── pages/           # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── AllNotes.jsx
│   ├── NoteDetail.jsx
│   ├── NoteEditor.jsx
│   ├── Collections.jsx
│   ├── Search.jsx
│   └── Settings.jsx
├── context/         # React context
│   ├── AuthContext.jsx
│   └── NotesContext.jsx
├── services/        # API services
│   └── api.js
├── App.jsx          # Main app component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Features Overview

### Authentication
- Secure login and registration
- JWT token-based authentication
- Persistent sessions
- Profile management

### Dashboard
- Total notes count
- Pinned notes display
- Recent activity
- Top tags
- Notes per collection breakdown

### Notes Management
- Create, edit, delete notes
- Pin/unpin important notes
- Multi-collection assignment
- Tag management
- Rich text content

### Search
- Full-text search
- Filter by collections
- Filter by tags
- AND/OR logic toggle
- Sort by relevance or date

### Collections
- Create and manage collections
- Rename collections
- Delete collections (with warning)
- View note counts

### Settings
- Update profile
- Change password
- Export data as JSON
- Delete account

## API Integration

The frontend communicates with the backend API using Axios. All API calls are centralized in `src/services/api.js`.

Authentication is handled via JWT tokens stored in localStorage and automatically attached to requests via Axios interceptors.

## Styling

The app uses Tailwind CSS for styling with a custom color scheme based on primary blue tones. Custom utility classes are defined in `index.css`.

## License

MIT
