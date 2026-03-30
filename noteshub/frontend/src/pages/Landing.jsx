import { useNavigate } from 'react-router-dom'

const IconDatabase = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </svg>
)

const IconSparkles = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
    <path d="M19 3l.7 2.1L22 6l-2.3.9L19 9l-.7-2.1L16 6l2.3-.9L19 3z" />
    <path d="M2 14l.9 2.6L6 18l-3.1 1.4L2 22l-.9-2.6L-2 18l3.1-1.4L2 14z" transform="translate(2 0)" />
  </svg>
)

const IconSearch = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

const IconLayers = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l9 5-9 5-9-5 9-5z" />
    <path d="M3 12l9 5 9-5" />
    <path d="M3 17l9 5 9-5" />
  </svg>
)

const IconZap = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

const IconArrowRight = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
)

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <IconDatabase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">NotesHub</span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="text-slate-300 hover:text-white font-medium transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
            <IconSparkles className="w-4 h-4" />
            <span>The intelligent way to organize your thoughts</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
            Your Second Brain, <br />
            <span className="text-gradient">Perfectly Organized.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light mb-10 leading-relaxed">
            Stop losing your notes. NotesHub provides full-text search, multi-dimensional filtering, and intelligent organization to make knowledge retrieval instant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg"
            >
              Start Organizing <IconArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary w-full sm:w-auto text-lg"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="glass-card p-8 group">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <IconSearch className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Instant Retrieval</h3>
            <p className="text-slate-400 leading-relaxed">
              Full-text search across all your notes with multi-dimensional filtering by collections and tags. Find anything in milliseconds.
            </p>
          </div>

          <div className="glass-card p-8 group">
            <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <IconLayers className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Flexible Organization</h3>
            <p className="text-slate-400 leading-relaxed">
              Group related notes into collections. A single note can live in multiple collections, matching how your brain actually works.
            </p>
          </div>

          <div className="glass-card p-8 group">
            <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <IconZap className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Intelligent Tagging</h3>
            <p className="text-slate-400 leading-relaxed">
              Use predefined system tags or create your own custom taxonomy. Cross-reference ideas effortlessly across different projects.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

