import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { notesAPI } from '../services/api'
import { useNotes } from '../context/NotesContext'

const NoteDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { deleteNote, togglePin } = useNotes()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const result = await deleteNote(id)
      if (result.success) {
        navigate('/notes')
      } else {
        setError(result.error || 'Failed to delete note.')
      }
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
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
        </div>

        <div className="border-t pt-4">
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
    </div>
  )
}

export default NoteDetail
