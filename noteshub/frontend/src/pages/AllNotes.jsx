import { useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'

const AllNotes = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { notes, fetchNotes, togglePin, loading, collections, tags, fetchCollections, fetchTags } = useNotes()

  useEffect(() => {
    fetchCollections()
    fetchTags()
  }, [fetchCollections, fetchTags])

  useEffect(() => {
    const params = {}
    const collection = searchParams.get('collection')
    const tag = searchParams.get('tag')
    
    if (collection) params.collection_id = collection
    if (tag) params.tag_id = tag
    
    fetchNotes(params)
  }, [searchParams, fetchNotes])

  const clearFilters = () => {
    navigate('/notes')
  }

  const activeCollection = searchParams.get('collection')
  const activeTag = searchParams.get('tag')
  const collectionName = collections.find(c => c._id === activeCollection)?.name
  const tagName = tags.find(t => t._id === activeTag)?.name

  const handleTogglePin = async (noteId, isPinned) => {
    await togglePin(noteId, isPinned)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
          {(activeCollection || activeTag) && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              {activeCollection && collectionName && (
                <span className="badge badge-primary">
                  Collection: {collectionName}
                </span>
              )}
              {activeTag && tagName && (
                <span className="badge badge-primary">
                  Tag: {tagName}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <Link to="/notes/new" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
          <div className="mt-6">
            <Link to="/notes/new" className="btn btn-primary">
              Create Note
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <Link to={`/notes/${note._id}`} className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                    {note.isPinned && (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-3">{note.contentPreview}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{note.collectionIds.length} collection(s)</span>
                    <span>•</span>
                    <span>{note.tagIds.length} tag(s)</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleTogglePin(note._id, note.isPinned)}
                  className="ml-4 p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <svg className="w-5 h-5" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllNotes
