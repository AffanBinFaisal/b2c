import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotesProvider } from './context/NotesContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import RecoverAccount from './pages/RecoverAccount'
import Dashboard from './pages/Dashboard'
import AllNotes from './pages/AllNotes'
import TrashNotes from './pages/TrashNotes'
import NoteDetail from './pages/NoteDetail'
import NoteEditor from './pages/NoteEditor'
import Collections from './pages/Collections'
import Search from './pages/Search'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import AuthLandingGate from './components/AuthLandingGate'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <NotesProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/recover-account" element={<RecoverAccount />} />

                <Route path="/" element={<AuthLandingGate />}>
                  <Route index element={<Dashboard />} />
                  <Route path="notes" element={<AllNotes />} />
                  <Route path="notes/trash" element={<TrashNotes />} />
                  <Route path="notes/new" element={<NoteEditor />} />
                  <Route path="notes/:id" element={<NoteDetail />} />
                  <Route path="notes/:id/edit" element={<NoteEditor />} />
                  <Route path="collections" element={<Collections />} />
                  <Route path="search" element={<Search />} />
                  <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
                  <Route path="settings/:section" element={<Settings />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </NotesProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
