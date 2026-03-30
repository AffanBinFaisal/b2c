import { useMemo, useState } from 'react'

/**
 * Multi-select via checkboxes + filter — better UX than native <select multiple>.
 * `items`: { _id, name }[]
 * `value`: string[] of selected ids
 */
const SearchableChecklist = ({
  label,
  items = [],
  value = [],
  onChange,
  searchPlaceholder = 'Search…',
  emptyMessage = 'Nothing matches your search.',
  noItemsMessage = 'No items available.',
  idPrefix = 'chk',
  hint,
}) => {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return items
    return items.filter((it) => it.name.toLowerCase().includes(needle))
  }, [items, q])

  const toggle = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else {
      onChange([...value, id])
    }
  }

  const selectedInFilter = filtered.filter((it) => value.includes(it._id)).length

  return (
    <div className="space-y-2">
      {(label || value.length > 0) && (
        <div
          className={`flex flex-wrap items-baseline gap-2 ${label ? 'justify-between' : 'justify-end'}`}
        >
          {label && <span className="block text-sm font-medium text-gray-700">{label}</span>}
          {value.length > 0 && (
            <span className="text-xs font-medium text-primary-600">{value.length} selected</span>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">{noItemsMessage}</p>
      ) : (
        <>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input py-2 text-sm"
            placeholder={searchPlaceholder}
            autoComplete="off"
            aria-label={label ? `${label} filter` : 'Filter list'}
          />

          <div
            className="rounded-lg border border-gray-200 bg-white shadow-sm max-h-52 overflow-y-auto divide-y divide-gray-100"
            role="group"
            aria-label={label || 'Options'}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-500 text-center">{emptyMessage}</p>
            ) : (
              filtered.map((it) => {
                const checked = value.includes(it._id)
                const cid = `${idPrefix}-${it._id}`
                return (
                  <label
                    key={it._id}
                    htmlFor={cid}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                      checked ? 'bg-emerald-500/20 hover:bg-emerald-500/25' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      id={cid}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(it._id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                    />
                    <span className={`text-sm flex-1 ${checked ? 'font-medium text-white' : 'text-gray-700'}`}>
                      {it.name}
                    </span>
                  </label>
                )
              })
            )}
          </div>

          {q.trim() && filtered.length > 0 && (
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {items.length}
              {selectedInFilter > 0 && ` · ${selectedInFilter} visible & selected`}
            </p>
          )}
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </>
      )}
    </div>
  )
}

export default SearchableChecklist
