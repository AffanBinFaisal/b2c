import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'

const RecoverAccount = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.recoverAccount({ email, password })
      localStorage.setItem('token', res.data.access_token)
      window.location.assign('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Recovery failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recover account</h2>
          <p className="text-sm text-gray-600 mb-6">
            If your account was deleted within the last 30 days, sign in with your email and password to restore it.
          </p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
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
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full btn btn-primary disabled:opacity-50">
              {loading ? 'Recovering…' : 'Recover account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecoverAccount
