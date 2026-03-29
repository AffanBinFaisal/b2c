import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.registered && location.state?.message) {
      setInfo(location.state.message)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])
  const userHasEditedRef = useRef(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    userHasEditedRef.current = false

    console.log('Submitting login...')
    const result = await login(email, password)
    
    if (result.success) {
      navigate('/')
    } else {
      console.log('Login failed, setting error:', result.error)
      setError(result.error)
      console.log('Error state set')
    }
    
    setLoading(false)
  }

  const handleEmailChange = (e) => {
    console.log('Email changed, error:', error, 'userHasEdited:', userHasEditedRef.current)
    setEmail(e.target.value)
    if (error && userHasEditedRef.current) {
      console.log('Clearing error')
      setError('')
    }
    userHasEditedRef.current = true
  }

  const handlePasswordChange = (e) => {
    console.log('Password changed, error:', error, 'userHasEdited:', userHasEditedRef.current)
    setPassword(e.target.value)
    if (error && userHasEditedRef.current) {
      console.log('Clearing error')
      setError('')
    }
    userHasEditedRef.current = true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">NotesHub</h1>
          <p className="text-gray-600">Your knowledge management system</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          {info && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
              {info}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex flex-col sm:flex-row sm:justify-center sm:gap-4 text-center text-sm">
            <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
              Forgot password?
            </Link>
            <Link to="/recover-account" className="text-gray-600 hover:text-gray-800">
              Recover deleted account
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
