import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AllNotes from './pages/AllNotes'
import NoteDetail from './pages/NoteDetail'
import NoteEditor from './pages/NoteEditor'
import Collections from './pages/Collections'
import Search from './pages/Search'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotesProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="notes" element={<AllNotes />} />
                <Route path="notes/new" element={<NoteEditor />} />
                <Route path="notes/:id" element={<NoteDetail />} />
                <Route path="notes/:id/edit" element={<NoteEditor />} />
                <Route path="collections" element={<Collections />} />
                <Route path="search" element={<Search />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotesProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
