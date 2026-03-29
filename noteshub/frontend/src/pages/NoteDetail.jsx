import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { notesAPI } from '../services/api'
import { useNotes } from '../context/NotesContext'
import ConfirmDialog from '../components/ConfirmDialog'

const NoteDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { deleteNote, togglePin, collections, tags, fetchCollections, fetchTags } = useNotes()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const closeDeleteDialog = useCallback(() => {
    if (!deleteLoading) setDeleteOpen(false)
  }, [deleteLoading])

  useEffect(() => {
    fetchCollections()
    fetchTags()
  }, [fetchCollections, fetchTags])

  useEffect(() => {
    loadNote()
  }, [id])

  const loadNote = async () => {
    try {
      setError('')
      const response = await notesAPI.getById(id)
      setNote(response.data)
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to load note.'
      setError(message)
      setNote(null)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    setDeleteLoading(true)
    const result = await deleteNote(id)
    setDeleteLoading(false)
    if (result.success) {
      setDeleteOpen(false)
      navigate('/notes')
    } else {
      setDeleteOpen(false)
      setError(result.error || 'Failed to delete note.')
    }
  }

  const handleTogglePin = async () => {
    const result = await togglePin(id, note.isPinned)
    if (!result.success) {
      setError(result.error || 'Failed to update pin status.')
      return
    }
    loadNote()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!note) {
    return <div className="text-center py-12">{error || 'Note not found'}</div>
  }

  const collectionNames = (note.collectionIds || [])
    .map((cid) => collections.find((c) => c._id === cid))
    .filter(Boolean)
  const tagNames = (note.tagIds || []).map((tid) => tags.find((t) => t._id === tid)).filter(Boolean)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/notes" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Notes
        </Link>
      </div>

      {collectionNames.length > 0 && (
        <nav className="text-sm text-gray-600 mb-4 flex flex-wrap items-center gap-1">
          {collectionNames.map((c, i) => (
            <span key={c._id} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-400">/</span>}
              <Link to={`/notes?collection=${c._id}`} className="text-primary-600 hover:underline">
                {c.name}
              </Link>
            </span>
          ))}
        </nav>
      )}

      <div className="card">
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
            {note.isPinned && (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleTogglePin}
              className="btn btn-secondary"
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              <svg className="w-5 h-5" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <Link to={`/notes/${id}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button type="button" onClick={() => setDeleteOpen(true)} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
        </div>

        <div className="border-t pt-4 space-y-4">
          {collectionNames.length > 0 && (
            <div>
              <span className="font-medium text-gray-700 text-sm">Collections: </span>
              <span className="flex flex-wrap gap-2 mt-1">
                {collectionNames.map((c) => (
                  <Link
                    key={c._id}
                    to={`/notes?collection=${c._id}`}
                    className="inline-flex px-2 py-0.5 rounded bg-primary-50 text-primary-800 text-sm font-medium hover:bg-primary-100"
                  >
                    {c.name}
                  </Link>
                ))}
              </span>
            </div>
          )}
          {tagNames.length > 0 && (
            <div>
              <span className="font-medium text-gray-700 text-sm">Tags: </span>
              <span className="flex flex-wrap gap-2 mt-1">
                {tagNames.map((t) => (
                  <Link
                    key={t._id}
                    to={`/notes?tag=${t._id}`}
                    className="inline-flex px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-sm font-medium hover:bg-purple-100"
                  >
                    {t.name}
                  </Link>
                ))}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">{new Date(note.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Updated:</span>
              <span className="ml-2 text-gray-600">{new Date(note.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete this note?"
        description="This is a soft delete: the note moves to Trash. You can restore it from Trash for up to 30 days. After that, it is permanently removed (hard delete)."
        confirmLabel="Delete note"
        cancelLabel="Cancel"
        loading={deleteLoading}
      />
    </div>
  )
}

export default NoteDetail
