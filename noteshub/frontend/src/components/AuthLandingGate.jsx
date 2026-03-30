import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'
import Landing from '../pages/Landing'

const AuthLandingGate = () => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Public landing page only on the root URL.
    if (location.pathname === '/') return <Landing />
    return <Navigate to="/login" replace />
  }

  return <Layout />
}

export default AuthLandingGate

