import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'
import { useToast } from '../context/ToastContext'
import { notesAPI } from '../services/api'
import SearchableChecklist from '../components/SearchableChecklist'
import TagAutocomplete from '../components/TagAutocomplete'

const NoteEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { collections, tags, createNote, updateNote, fetchCollections, fetchTags, createCollection, createTag } =
    useNotes()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    collectionIds: [],
    tagIds: [],
    isPinned: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  useEffect(() => {
    fetchCollections()
    fetchTags()
    if (id) {
      loadNote()
    }
  }, [id])

  const loadNote = async () => {
    try {
      const response = await notesAPI.getById(id)
      const note = response.data
      setFormData({
        title: note.title,
        content: note.content,
        collectionIds: note.collectionIds,
        tagIds: note.tagIds,
        isPinned: note.isPinned,
      })
    } catch (error) {
      setError('Failed to load note')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = id ? await updateNote(id, formData) : await createNote(formData)

    if (result.success) {
      showToast(id ? 'Note updated successfully.' : 'Note created successfully.')
      navigate(id ? `/notes/${id}` : '/notes')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleCreateCollection = async (e) => {
    e.preventDefault()
    setError('')
    const result = await createCollection(newCollectionName)
    if (result.success) {
      setNewCollectionName('')
      setShowCollectionModal(false)
      if (result.data && result.data._id) {
        setFormData((prev) => ({
          ...prev,
          collectionIds: [...prev.collectionIds, result.data._id],
        }))
      }
      showToast('Collection created.')
    } else {
      setError(result.error)
    }
  }

  const handleCreateTag = async (name) => {
    setError('')
    const result = await createTag(name)
    if (result.success) {
      showToast('Tag added to this note.')
    } else {
      setError(result.error || 'Failed to create tag')
    }
    return result
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{id ? 'Edit Note' : 'Create Note'}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input min-h-[300px]"
                maxLength={50000}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Collections * (select at least one)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + New Collection
                </button>
              </div>
              {collections.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>No collections available.</strong> You need to create at least one collection before
                    creating a note.
                  </p>
                  <button type="button" onClick={() => setShowCollectionModal(true)} className="btn btn-primary btn-sm">
                    Create Your First Collection
                  </button>
                </div>
              ) : (
                <SearchableChecklist
                  label=""
                  items={collections}
                  value={formData.collectionIds}
                  onChange={(ids) => setFormData((prev) => ({ ...prev, collectionIds: ids }))}
                  searchPlaceholder="Search collections…"
                  emptyMessage="No collections match your search."
                  idPrefix="note-coll"
                  hint="Tap checkboxes to add or remove. At least one collection is required."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="note-tags-combo">
                Tags
              </label>
              <TagAutocomplete
                inputId="note-tags-combo"
                tags={tags}
                value={formData.tagIds}
                onChange={(ids) => setFormData((prev) => ({ ...prev, tagIds: ids }))}
                onCreateTag={handleCreateTag}
                disabled={loading}
                hint="Optional. Search to pick existing tags or type a new tag name and press Enter."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isPinned" className="ml-2 text-sm font-medium text-gray-700">
                Pin this note
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.collectionIds.length === 0}
            className="btn btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>

      {showCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Collection</h2>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="input"
                  placeholder="e.g., Work Projects, Personal Notes"
                  required
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCollectionModal(false)
                    setNewCollectionName('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default NoteEditor
