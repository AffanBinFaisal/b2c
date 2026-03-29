import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'
import { analyticsAPI, notesAPI } from '../services/api'

const Dashboard = () => {
  const { fetchNotes, fetchCollections, fetchTags } = useNotes()
  const [analytics, setAnalytics] = useState(null)
  const [pinnedNotes, setPinnedNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch analytics data
      const analyticsResponse = await analyticsAPI.getDashboard()
      setAnalytics(analyticsResponse.data)
      
      // Fetch pinned notes
      const pinnedResponse = await notesAPI.getAll({ pinned_only: true, limit: 6 })
      const pd = pinnedResponse.data
      const pinnedList = Array.isArray(pd) ? pd : pd?.items ?? []
      setPinnedNotes(pinnedList)
      
      // Load collections and tags for sidebar
      await fetchCollections()
      await fetchTags()
    } catch (error) {
      console.error('Dashboard error:', error)
      const message = error.response?.data?.detail || error.message || 'Failed to load dashboard data.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const response = await analyticsAPI.exportData()
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `noteshub-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed:', e)
      setError(e.response?.data?.detail || 'Failed to export data.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your knowledge overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="btn btn-secondary"
          >
            {exporting ? 'Exporting…' : 'Export data'}
          </button>
          <Link to="/notes/new" className="btn btn-primary">
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalNotes || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pinned Notes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.pinnedNotes || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collections</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalCollections || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Custom Tags</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.customTags || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pinned Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <Link
                key={note._id}
                to={`/notes/${note._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{note.title}</h3>
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{note.contentPreview}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity & Top Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {analytics?.recentActivity?.slice(0, 5).map((activity) => (
              <Link
                key={activity.noteId}
                to={`/notes/${activity.noteId}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.updatedAt).toLocaleString()}
                  </p>
                </div>
                {activity.isPinned && (
                  <svg className="w-4 h-4 text-yellow-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Top Tags */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Tags</h2>
          <div className="flex flex-wrap gap-2">
            {analytics?.topTags?.map((tag) => (
              <Link
                key={tag.tagId}
                to={`/notes?tag=${tag.tagId}`}
                className="badge badge-primary hover:bg-primary-200 transition-colors cursor-pointer"
              >
                {tag.tagName}
                <span className="ml-1 text-primary-600 font-semibold">({tag.usageCount})</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Notes per Collection */}
      {analytics?.notesPerCollection?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notes by Collection</h2>
          <div className="space-y-3">
            {analytics.notesPerCollection.map((item) => (
              <div key={item.collectionId} className="flex items-center justify-between">
                <Link
                  to={`/notes?collection=${item.collectionId}`}
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  {item.collectionName}
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${(item.noteCount / analytics.totalNotes) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 w-8 text-right">
                    {item.noteCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
