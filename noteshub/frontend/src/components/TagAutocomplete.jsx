import { useEffect, useId, useMemo, useRef, useState } from 'react'

const DEFAULT_MAX = 20
const SUGGESTION_LIMIT = 40

/**
 * Tag multi-select with typeahead: chips + filtered suggestions + Enter to create custom tags.
 */
const TagAutocomplete = ({
  tags = [],
  value = [],
  onChange,
  onCreateTag,
  disabled = false,
  maxTags = DEFAULT_MAX,
  hint,
  inputId,
}) => {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const listboxId = useId()

  const available = useMemo(() => {
    const sel = new Set(value)
    return tags.filter((t) => t._id && !sel.has(t._id))
  }, [tags, value])

  const needle = q.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!needle) {
      return available.slice(0, SUGGESTION_LIMIT)
    }
    return available.filter((t) => t.name.toLowerCase().includes(needle)).slice(0, SUGGESTION_LIMIT)
  }, [available, needle])

  useEffect(() => {
    setActiveIndex(-1)
  }, [q])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const atLimit = value.length >= maxTags

  const addById = (id) => {
    if (atLimit || value.includes(id)) return
    onChange([...value, id])
    setQ('')
    setActiveIndex(-1)
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeById = (id) => {
    onChange(value.filter((x) => x !== id))
  }

  const handlePick = (id) => {
    addById(id)
  }

  const handleKeyDown = async (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (atLimit || filtered.length === 0) return
      setOpen(true)
      setActiveIndex((i) => {
        if (filtered.length === 0) return -1
        if (i < 0) return 0
        return Math.min(i + 1, filtered.length - 1)
      })
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? -1 : i - 1))
      return
    }

    if (e.key !== 'Enter') return
    e.preventDefault()
    if (atLimit) return

    if (activeIndex >= 0 && filtered[activeIndex]) {
      addById(filtered[activeIndex]._id)
      return
    }

    const raw = q.trim()
    if (!raw) return

    const lower = raw.toLowerCase()
    const exact = available.find((t) => t.name.toLowerCase() === lower)
    if (exact) {
      addById(exact._id)
      return
    }

    const result = await onCreateTag(raw)
    if (result.success && result.data?._id && !value.includes(result.data._id)) {
      onChange([...value, result.data._id])
      setQ('')
      setOpen(false)
    }
  }

  const selectedTags = useMemo(
    () => value.map((id) => tags.find((t) => t._id === id)).filter(Boolean),
    [value, tags]
  )

  return (
    <div ref={containerRef} className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Selected tags">
          {selectedTags.map((t) => (
            <span
              key={t._id}
              className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-sm font-medium text-purple-900 border border-purple-100"
            >
              {t.name}
              <button
                type="button"
                onClick={() => removeById(t._id)}
                disabled={disabled}
                className="rounded p-0.5 text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                aria-label={`Remove ${t.name}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled || atLimit}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={open && filtered.length > 0 ? listboxId : undefined}
          className="input"
          placeholder={atLimit ? `Maximum ${maxTags} tags` : 'Search tags or type a new tag and press Enter'}
          maxLength={50}
        />

        {open && !atLimit && filtered.length > 0 && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {filtered.map((t, idx) => (
              <li key={t._id} role="option" aria-selected={idx === activeIndex}>
                <button
                  type="button"
                  className={`flex w-full px-3 py-2 text-left text-sm ${
                    idx === activeIndex ? 'bg-emerald-500/20 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePick(t._id)}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <p className="text-xs text-gray-500">
        Lowercase letters, numbers, and hyphens for new tags (1–50 characters). Up to {maxTags} tags per note.
      </p>
    </div>
  )
}

export default TagAutocomplete
