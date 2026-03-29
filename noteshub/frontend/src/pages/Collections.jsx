import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'
import ConfirmDialog from '../components/ConfirmDialog'

const Collections = () => {
  const { collections, fetchCollections, createCollection, updateCollection, deleteCollection } = useNotes()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const closeDeleteDialog = useCallback(() => {
    if (!deleteLoading) setPendingDelete(null)
  }, [deleteLoading])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    if (searchParams.get('new') !== '1') return
    setShowCreateModal(true)
    const next = new URLSearchParams(searchParams)
    next.delete('new')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || !collections.length) return
    const col = collections.find((c) => c._id === editId)
    const next = new URLSearchParams(searchParams)
    next.delete('edit')
    setSearchParams(next, { replace: true })
    if (col) {
      setEditingId(editId)
      setName(col.name)
    }
  }, [collections, searchParams, setSearchParams])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    const result = await createCollection(name)
    if (result.success) {
      setName('')
      setShowCreateModal(false)
    } else {
      setError(result.error)
    }
  }

  const handleUpdate = async (id) => {
    setError('')
    const result = await updateCollection(id, name)
    if (result.success) {
      setEditingId(null)
      setName('')
    } else {
      setError(result.error)
    }
  }

  const handleDeleteRequest = (id, collectionName, noteCount) => {
    setError('')
    setPendingDelete({ id, name: collectionName, noteCount })
  }

  const handleConfirmDeleteCollection = async () => {
    if (!pendingDelete) return
    setDeleteLoading(true)
    const result = await deleteCollection(pendingDelete.id)
    setDeleteLoading(false)
    if (result.success) {
      setPendingDelete(null)
    } else {
      setPendingDelete(null)
      setError(result.error || 'Failed to delete collection.')
    }
  }

  const startEdit = (collection) => {
    setEditingId(collection._id)
    setName(collection.name)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Collection
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <div key={collection._id} className="card">
            {editingId === collection._id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(collection._id)}
                    className="btn btn-primary flex-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setName('')
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{collection.name}</h3>
                  <span className="badge badge-primary">{collection.noteCount}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(collection)}
                    className="btn btn-secondary flex-1 text-sm"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRequest(collection._id, collection.name, collection.noteCount)}
                    className="btn btn-danger flex-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Collection</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g., Work Projects"
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
                    setShowCreateModal(false)
                    setName('')
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

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDeleteCollection}
        title="Delete collection?"
        description={
          pendingDelete && pendingDelete.noteCount > 0
            ? `Delete "${pendingDelete.name}"? The collection is removed permanently. Notes that exist only in this collection are hard deleted (gone immediately, not moved to Trash). Notes that also belong to other collections are not deleted—they are only unlinked from this collection.`
            : pendingDelete
              ? `Delete "${pendingDelete.name}"? The collection is removed permanently. There are no notes in this collection.`
              : ''
        }
        confirmLabel="Delete collection"
        cancelLabel="Cancel"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Collections
