import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../context/NotesContext'
import { useEffect, useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const { collections, fetchCollections } = useNotes()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    if (location.pathname !== '/search') return
    const q = new URLSearchParams(location.search).get('q') || ''
    setHeaderSearch(q)
  }, [location.pathname, location.search])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-md hover:bg-gray-100 lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">NotesHub</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const q = headerSearch.trim()
                  navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
                }}
                className="hidden md:flex items-center max-w-xs lg:max-w-md flex-1 min-w-0"
              >
                <input
                  type="search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search notes…"
                  className="input py-1.5 text-sm w-full rounded-r-none border-r-0"
                  aria-label="Search notes"
                />
                <button
                  type="submit"
                  className="btn btn-primary py-1.5 px-3 rounded-l-none shrink-0"
                  title="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              <Link
                to="/search"
                className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
                title="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name}</span>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <Link
                      to="/settings/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-screen`}>
          <nav className="p-4 space-y-2">
            <Link
              to="/"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to="/notes"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                location.pathname === '/notes'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">All Notes</span>
            </Link>

            <Link
              to="/notes/trash"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                location.pathname === '/notes/trash'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="font-medium">Trash</span>
            </Link>

            <Link
              to="/collections"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                isActive('/collections')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-medium">Collections</span>
            </Link>

            <div className="pt-4">
              <div className="flex items-center justify-between px-4 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase">Collections</span>
                <Link
                  to="/collections?new=1"
                  className="text-primary-600 hover:text-primary-700 p-1 -m-1 rounded inline-flex"
                  title="New collection"
                  aria-label="New collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
              </div>
              
              <div className="space-y-1">
                {(Array.isArray(collections) ? collections : []).map((collection) => (
                  <div key={collection._id} className="flex items-center gap-1 pr-1">
                    <Link
                      to={`/notes?collection=${collection._id}`}
                      className="flex flex-1 items-center justify-between min-w-0 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <span className="text-sm truncate">{collection.name}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{collection.noteCount}</span>
                    </Link>
                    <Link
                      to={`/collections?edit=${collection._id}`}
                      className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary-600 shrink-0"
                      title="Rename collection"
                      aria-label={`Rename ${collection.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
