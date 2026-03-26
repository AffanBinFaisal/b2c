import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { searchAPI } from '../services/api'
import { useNotes } from '../context/NotesContext'

const Search = () => {
  const { collections, tags, fetchCollections, fetchTags } = useNotes()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    collectionIds: [],
    tagIds: [],
    logic: 'AND',
    sortBy: 'relevance',
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCollections()
    fetchTags()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    setError('')

    try {
      const response = await searchAPI.search({
        query,
        ...filters,
        page: 1,
        limit: 20,
      })
      setResults(response.data.results)
    } catch (error) {
      const message = error.response?.data?.detail || 'Search failed. Please try again.'
      setError(message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = (type, id) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((item) => item !== id)
        : [...prev[type], id],
    }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Search Notes</h1>

      <form onSubmit={handleSearch} className="card space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input text-lg"
            placeholder="Search notes..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collections
            </label>
            <div className="flex flex-wrap gap-2">
              {collections.map((collection) => (
                <button
                  key={collection._id}
                  type="button"
                  onClick={() => toggleFilter('collectionIds', collection._id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.collectionIds.includes(collection._id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => toggleFilter('tagIds', tag._id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.tagIds.includes(tag._id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter Logic:</label>
            <select
              value={filters.logic}
              onChange={(e) => setFilters({ ...filters, logic: e.target.value })}
              className="input py-1"
            >
              <option value="AND">Match ALL (AND)</option>
              <option value="OR">Match ANY (OR)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort By:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input py-1"
            >
              <option value="relevance">Relevance</option>
              <option value="updatedAt">Updated Date</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searched && (
        <div>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No notes found matching your search criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((note) => (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="card hover:shadow-lg transition-shadow block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {note.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 mb-3">
                        {note.contentPreview}
                      </p>
                      <div className="text-sm text-gray-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {note.isPinned && (
                      <svg className="w-5 h-5 text-yellow-500 ml-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
