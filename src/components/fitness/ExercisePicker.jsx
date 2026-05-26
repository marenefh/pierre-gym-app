import { useState } from 'react'
import { X, Search } from 'lucide-react'

const GROUP_ORDER = ['Back', 'Biceps', 'Triceps', 'Shoulders', 'Chest', 'Core', 'Full Body', 'Glutes', 'Hamstrings', 'Quads']

export default function ExercisePicker({ open, onClose, library, onSelect }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  if (!open) return null

  const query = search.trim().toLowerCase()
  const items = library
    .filter(ex => {
      const matchGroup = filter === 'All' || ex.muscleGroup === filter
      const matchName = !query || ex.name.toLowerCase().includes(query)
      return matchGroup && matchName
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white mx-6 w-full rounded-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Choose Exercise</h3>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500">
              <X size={16} />
            </button>
          </div>
          <div className="relative mb-2.5">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises…"
              autoFocus
              className="w-full bg-cream-dark rounded-2xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {['All', ...GROUP_ORDER].map(g => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === g ? 'bg-gray-900 text-white' : 'bg-cream-dark text-gray-500'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-2">
          {items.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No exercises found.</p>
          )}
          <div className="space-y-1.5">
            {items.map(ex => (
              <button
                key={ex.id}
                onClick={() => { onSelect(ex); onClose() }}
                className="w-full flex items-center gap-3 bg-cream-dark rounded-2xl px-4 py-3 text-left hover:bg-gray-200 transition-colors active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ex.name}</p>
                  <p className="text-xs text-gray-400">{ex.muscleGroup}</p>
                </div>
                {ex.custom && (
                  <span className="text-[10px] font-medium text-pastel-blue-text bg-pastel-blue px-2 py-0.5 rounded-full flex-shrink-0">custom</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
