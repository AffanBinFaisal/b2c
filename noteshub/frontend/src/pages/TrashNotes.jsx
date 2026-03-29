import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { notesAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

const PAGE_SIZE = 20

const TrashNotes = () => {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [restoringId, setRestoringId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await notesAPI.getTrash({
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      const data = response.data
      setItems(data.items ?? [])
      setTotal(typeof data.total === 'number' ? data.total : 0)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load trash.')
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleRestore = async (id) => {
    setRestoringId(id)
    try {
      await notesAPI.restore(id)
      showToast('Note restored.')
      await load()
    } catch (err) {
      const d = err.response?.data?.detail
      const message =
        typeof d === 'string' ? d : Array.isArray(d) ? d.map((x) => x?.msg).filter(Boolean).join(', ') : 'Could not restore note.'
      showToast(message)
    } finally {
      setRestoringId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
        <p className="text-gray-600 mt-1">
          Deleted notes stay here for 30 days, then are permanently removed. Restore a note to bring it back to
          your library.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">Trash is empty.</div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((note) => (
              <li key={note._id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{note.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{note.contentPreview}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Deleted {note.deletedAt ? new Date(note.deletedAt).toLocaleString() : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(note._id)}
                  disabled={restoringId === note._id}
                  className="btn btn-primary shrink-0"
                >
                  {restoringId === note._id ? 'Restoring…' : 'Restore'}
                </button>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <p className="text-sm text-gray-500">
        <Link to="/notes" className="text-primary-600 hover:text-primary-700">
          ← Back to all notes
        </Link>
      </p>
    </div>
  )
}

export default TrashNotes
