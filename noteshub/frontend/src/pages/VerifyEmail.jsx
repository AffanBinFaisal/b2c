import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!token) {
        setError('Missing verification token.')
        setLoading(false)
        return
      }
      try {
        const res = await authAPI.verifyEmail({ token })
        if (!cancelled) setMessage(res.data?.message || 'Email verified.')
      } catch (err) {
        if (!cancelled) {
          const detail = err.response?.data?.detail
          setError(typeof detail === 'string' ? detail : 'Verification failed.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email verification</h2>
          {loading && <p className="text-gray-600">Verifying…</p>}
          {message && <p className="text-emerald-800">{message}</p>}
          {error && <p className="text-red-700">{error}</p>}
          <p className="mt-6">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Go to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
