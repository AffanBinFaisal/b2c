import { useState, useEffect } from 'react'
import { NavLink, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI, analyticsAPI } from '../services/api'

const SETTINGS_SECTIONS = ['profile', 'security', 'data']

const Settings = () => {
  const { section } = useParams()
  const { user, updateProfile, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [searchLogic, setSearchLogic] = useState(user?.preferences?.searchLogic || 'AND')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!deleteModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !deleteLoading) setDeleteModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [deleteModalOpen, deleteLoading])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setLoading(true)

    const result = await updateProfile({
      name,
      preferences: { searchLogic },
    })

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }
    setLoading(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      await authAPI.changePassword({ currentPassword, newPassword })
      setMessage({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await analyticsAPI.exportData()
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `noteshub-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      setMessage({ type: 'success', text: 'Data exported successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' })
    }
  }

  const confirmDeleteAccount = async () => {
    setDeleteLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await authAPI.deleteAccount()
      setDeleteModalOpen(false)
      logout()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!SETTINGS_SECTIONS.includes(section)) {
    return <Navigate to="/settings/profile" replace />
  }

  const activeTab = section

  const tabClass = ({ isActive }) =>
    `px-4 py-2 font-medium ${
      isActive
        ? 'border-b-2 border-primary-600 text-primary-600'
        : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      {message.text && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex space-x-4 border-b">
        <NavLink to="/settings/profile" className={tabClass} end>
          Profile
        </NavLink>
        <NavLink to="/settings/security" className={tabClass}>
          Security
        </NavLink>
        <NavLink to="/settings/data" className={tabClass}>
          Data
        </NavLink>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email} className="input" disabled />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Search Logic
            </label>
            <select
              value={searchLogic}
              onChange={(e) => setSearchLogic(e.target.value)}
              className="input"
            >
              <option value="AND">Match ALL filters (AND)</option>
              <option value="OR">Match ANY filter (OR)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="card space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>
            <p className="text-gray-600 mb-4">
              Download all your notes, collections, and tags as a JSON file.
            </p>
            <button onClick={handleExportData} className="btn btn-primary">
              Export Data
            </button>
          </div>

          <div className="card border-red-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-4">
              Account deletion is a soft delete: your account is deactivated first. You have 30 days to recover it
              before it is permanently removed.
            </p>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="btn btn-danger"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close dialog"
            disabled={deleteLoading}
            onClick={() => !deleteLoading && setDeleteModalOpen(false)}
          />
          <div
            className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-black/5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-desc"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 id="delete-account-title" className="text-lg font-semibold text-gray-900">
              Delete your account?
            </h2>
            <p id="delete-account-desc" className="mt-2 text-sm text-gray-600">
              This is a soft delete: your account is deactivated and your data is scheduled for removal. You can
              recover your account within <span className="font-medium text-gray-800">30 days</span> using the
              recovery link we send to your email. After that window, your account and data are permanently removed
              (hard delete).
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                className="btn btn-secondary w-full sm:w-auto"
                disabled={deleteLoading}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger w-full sm:w-auto"
                disabled={deleteLoading}
                onClick={confirmDeleteAccount}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
