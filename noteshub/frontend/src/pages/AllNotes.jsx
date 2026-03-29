import { useEffect, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useNotes } from '../context/NotesContext'

const PAGE_SIZE = 20

const AllNotes = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { notes, notesTotal, fetchNotes, togglePin, loading, collections, tags, fetchCollections, fetchTags } =
    useNotes()

  const collection = searchParams.get('collection') || ''
  const tag = searchParams.get('tag') || ''
  const sort = searchParams.get('sort') === 'created' ? 'createdAt' : 'updatedAt'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  const totalPages = Math.max(1, Math.ceil(notesTotal / PAGE_SIZE))

  useEffect(() => {
    fetchCollections()
    fetchTags()
  }, [fetchCollections, fetchTags])

  useEffect(() => {
    const params = {
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      sort_by: sort,
    }
    if (collection) params.collection_id = collection
    if (tag) params.tag_id = tag
    fetchNotes(params)
  }, [collection, tag, sort, page, fetchNotes])

  const setParam = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k)
      else next.set(k, String(v))
    })
    setSearchParams(next)
  }

  const clearFilters = () => {
    navigate('/notes')
  }

  const collectionName = collections.find((c) => c._id === collection)?.name
  const tagName = tags.find((t) => t._id === tag)?.name

  const handleTogglePin = async (noteId, isPinned) => {
    await togglePin(noteId, isPinned)
  }

  const quickSearchSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const q = (fd.get('q') || '').toString().trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const rangeLabel = useMemo(() => {
    if (notesTotal === 0) return '0 results'
    const start = (page - 1) * PAGE_SIZE + 1
    const end = Math.min(page * PAGE_SIZE, notesTotal)
    return `Showing ${start}–${end} of ${notesTotal}`
  }, [page, notesTotal])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
          <p className="text-sm text-gray-600 mt-1">{rangeLabel}</p>
          {(collection || tag) && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">Filtered by:</span>
              {collection && collectionName && (
                <span className="badge badge-primary">Collection: {collectionName}</span>
              )}
              {tag && tagName && <span className="badge badge-primary">Tag: {tagName}</span>}
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <Link to="/notes/new" className="btn btn-primary shrink-0">
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </Link>
      </div>

      <div className="card space-y-4">
        <form onSubmit={quickSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <input name="q" type="search" className="input flex-1" placeholder="Search notes (full-text)…" />
          <button type="submit" className="btn btn-secondary whitespace-nowrap">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collection</label>
            <select
              className="input w-full"
              value={collection}
              onChange={(e) => setParam({ collection: e.target.value, page: '1' })}
            >
              <option value="">All collections</option>
              {collections.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              className="input w-full"
              value={tag}
              onChange={(e) => setParam({ tag: e.target.value, page: '1' })}
            >
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              className="input w-full"
              value={sort === 'createdAt' ? 'created' : 'updated'}
              onChange={(e) =>
                setParam({ sort: e.target.value === 'created' ? 'created' : 'updated', page: '1' })
              }
            >
              <option value="updated">Last updated</option>
              <option value="created">Date created</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
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
        <>
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
                    type="button"
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setParam({ page: String(page - 1) })}
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
                onClick={() => setParam({ page: String(page + 1) })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AllNotes
