import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI, analyticsAPI } from '../services/api'

const Settings = () => {
  const { user, updateProfile, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [name, setName] = useState(user?.name || '')
  const [searchLogic, setSearchLogic] = useState(user?.preferences?.searchLogic || 'AND')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

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

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone after 30 days.')) {
      try {
        await authAPI.deleteAccount()
        logout()
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete account' })
      }
    }
  }

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
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'profile'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'security'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'data'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Data
        </button>
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
              Once you delete your account, there is no going back. You have 30 days to recover your account.
            </p>
            <button onClick={handleDeleteAccount} className="btn btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
