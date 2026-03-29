import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchAPI } from '../services/api'
import { useNotes } from '../context/NotesContext'
import { useAuth } from '../context/AuthContext'
import SearchableChecklist from '../components/SearchableChecklist'

const DEBOUNCE_MS = 400

const Search = () => {
  const { user } = useAuth()
  const { collections, tags, fetchCollections, fetchTags } = useNotes()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const debounceTimerRef = useRef(null)

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    fetchCollections()
    fetchTags()
  }, [fetchCollections, fetchTags])

  useEffect(() => {
    const sl = user?.preferences?.searchLogic
    if (sl === 'AND' || sl === 'OR') {
      setFilters((prev) => ({ ...prev, logic: sl }))
    }
  }, [user])

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const runSearch = useCallback(
    async (pageNum = 1, queryOverride = undefined) => {
      const effectiveQuery = queryOverride !== undefined ? queryOverride : query
      setLoading(true)
      setSearched(true)
      setError('')

      try {
        const response = await searchAPI.search({
          query: effectiveQuery,
          ...filters,
          page: pageNum,
          limit: 20,
        })
        setResults(response.data.results)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
        setPage(pageNum)
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev)
          if (effectiveQuery.trim()) next.set('q', effectiveQuery.trim())
          else next.delete('q')
          return next
        })
      } catch (err) {
        const message = err.response?.data?.detail || 'Search failed. Please try again.'
        setError(message)
        setResults([])
        setTotal(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    },
    [query, filters, setSearchParams]
  )

  const handleSearch = (e) => {
    e.preventDefault()
    clearDebounceTimer()
    runSearch(1)
  }

  const hasSearchCriteria =
    query.trim().length > 0 || filters.collectionIds.length > 0 || filters.tagIds.length > 0

  useEffect(() => {
    if (!hasSearchCriteria) {
      clearDebounceTimer()
      return
    }
    clearDebounceTimer()
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      runSearch(1)
    }, DEBOUNCE_MS)
    return () => clearDebounceTimer()
  }, [query, filters, hasSearchCriteria, runSearch, clearDebounceTimer])

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableChecklist
            label="Collections"
            items={collections}
            value={filters.collectionIds}
            onChange={(ids) => setFilters((prev) => ({ ...prev, collectionIds: ids }))}
            searchPlaceholder="Filter collections…"
            emptyMessage="No collections match."
            noItemsMessage="No collections yet."
            idPrefix="search-coll"
            hint="Optional filter. Leave empty to search all collections."
          />

          <SearchableChecklist
            label="Tags"
            items={tags}
            value={filters.tagIds}
            onChange={(ids) => setFilters((prev) => ({ ...prev, tagIds: ids }))}
            searchPlaceholder="Filter tags…"
            emptyMessage="No tags match."
            noItemsMessage="No tags yet."
            idPrefix="search-tag"
            hint="Optional filter. Combine with logic below (AND / OR)."
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
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
            {total} result{total !== 1 ? 's' : ''} found
            {totalPages > 1 && (
              <span className="text-base font-normal text-gray-600 ml-2">
                (page {page} of {totalPages})
              </span>
            )}
          </h2>

          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No notes found matching your search criteria.</div>
          ) : (
            <>
              <div className="space-y-4">
                {results.map((note) => (
                  <Link
                    key={note._id}
                    to={`/notes/${note._id}`}
                    className="card hover:shadow-lg transition-shadow block"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                        <p className="text-gray-600 line-clamp-2 mb-3">{note.contentPreview}</p>
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

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-6">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={page <= 1 || loading}
                    onClick={() => {
                      clearDebounceTimer()
                      runSearch(page - 1)
                    }}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={page >= totalPages || loading}
                    onClick={() => {
                      clearDebounceTimer()
                      runSearch(page + 1)
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Search
