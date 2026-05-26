import { useState } from 'react'
import { ChevronLeft, Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_EXERCISE_LIBRARY, MUSCLE_GROUPS } from '../../store/appStore'
import ConfirmModal from '../ConfirmModal'

function uid() { return Math.random().toString(36).slice(2) }

const GROUP_ORDER = ['Back', 'Biceps', 'Triceps', 'Shoulders', 'Chest', 'Core', 'Full Body', 'Glutes', 'Hamstrings', 'Quads']

export default function ExerciseLibraryView({ onBack }) {
  const [library, setLibrary] = useLocalStorage(STORAGE_KEYS.EXERCISE_LIBRARY, DEFAULT_EXERCISE_LIBRARY)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({})
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState({ name: '', muscleGroup: '', note: '', trackingType: 'sets' })
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null })
  const askConfirm = (message, fn) => setConfirm({ open: true, message, onConfirm: fn })
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null })

  const query = search.trim().toLowerCase()

  const visible = library.filter(ex => {
    const matchesGroup = filterGroup === 'All' || ex.muscleGroup === filterGroup
    const matchesSearch = !query || ex.name.toLowerCase().includes(query)
    return matchesGroup && matchesSearch
  })

  // Group them when not searching/filtering
  const showFlat = query.length > 0
  const groups = showFlat ? null : GROUP_ORDER.reduce((acc, g) => {
    const items = visible.filter(ex => ex.muscleGroup === g)
    if (items.length) acc[g] = items
    return acc
  }, {})

  const startEdit = (ex) => {
    setEditingId(ex.id)
    setEditDraft({ name: ex.name, muscleGroup: ex.muscleGroup, note: ex.note || '' })
  }

  const saveEdit = (ex) => {
    if (!editDraft.name.trim()) return
    setLibrary(prev => prev.map(e => e.id === ex.id
      ? { ...e, name: editDraft.name.trim(), muscleGroup: editDraft.muscleGroup, note: editDraft.note || '' }
      : e
    ))
    setEditingId(null)
  }

  const deleteExercise = (id) => {
    setLibrary(prev => prev.filter(e => e.id !== id))
    setEditingId(null)
  }

  const addCustom = () => {
    if (!customDraft.name.trim() || !customDraft.muscleGroup) return
    setLibrary(prev => [...prev, { id: `custom_${uid()}`, name: customDraft.name.trim(), muscleGroup: customDraft.muscleGroup, note: customDraft.note.trim(), trackingType: customDraft.trackingType || 'sets', custom: true }])
    setCustomDraft({ name: '', muscleGroup: '', note: '', trackingType: 'sets' })
    setAddingCustom(false)
  }

  const renderItem = (ex) => {
    const isEditing = editingId === ex.id
    return (
      <div key={ex.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isEditing ? (
          <div className="p-3 space-y-2">
            <input
              value={editDraft.name}
              onChange={e => setEditDraft(d => ({ ...d, name: e.target.value }))}
              className="w-full bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none"
            />
            <select
              value={editDraft.muscleGroup}
              onChange={e => setEditDraft(d => ({ ...d, muscleGroup: e.target.value }))}
              className="w-full bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none"
            >
              {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
            <input
              value={editDraft.note}
              onChange={e => setEditDraft(d => ({ ...d, note: e.target.value }))}
              placeholder="Note (optional)"
              className="w-full bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => askConfirm(`Delete "${ex.name}"?`, () => deleteExercise(ex.id))} className="p-2 rounded-xl bg-red-50 text-red-400">
                <Trash2 size={14} />
              </button>
              <button onClick={() => setEditingId(null)} className="p-2 rounded-xl bg-cream-dark text-gray-500">
                <X size={14} />
              </button>
              <button onClick={() => saveEdit(ex)} className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                <Check size={14} /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{ex.name}</p>
              {showFlat && <p className="text-xs text-gray-400">{ex.muscleGroup}</p>}
              {ex.note && <p className="text-xs text-gray-400 italic mt-0.5 leading-tight">{ex.note}</p>}
            </div>
            {ex.custom && (
              <span className="text-[10px] font-medium text-pastel-blue-text bg-pastel-blue px-2 py-0.5 rounded-full flex-shrink-0">custom</span>
            )}
            <button onClick={() => startEdit(ex)} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-400 flex-shrink-0">
              <Edit2 size={14} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative flex items-center justify-center mb-3">
          <button onClick={onBack} className="absolute left-0 flex items-center gap-1.5 text-gray-500 text-sm">
            <ChevronLeft size={16} /> Routines
          </button>
          <h2 className="text-base font-bold text-gray-900">Exercise Library</h2>
          <button
            onClick={() => { setAddingCustom(true); setEditingId(null) }}
            className="absolute right-0 flex items-center gap-1.5 text-sm font-semibold text-gray-900 bg-cream-dark px-3 py-1.5 rounded-xl"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-cream-dark rounded-2xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Group filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {['All', ...GROUP_ORDER].map(g => (
            <button
              key={g}
              onClick={() => setFilterGroup(g)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterGroup === g ? 'bg-gray-900 text-white' : 'bg-cream-dark text-gray-500'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {/* Add custom form */}
        {addingCustom && (
          <div className="bg-white rounded-2xl shadow-card p-3 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">New custom exercise</p>
            <input
              value={customDraft.name}
              onChange={e => setCustomDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Exercise name"
              autoFocus
              className="w-full bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <select
              value={customDraft.muscleGroup}
              onChange={e => setCustomDraft(d => ({ ...d, muscleGroup: e.target.value }))}
              className={`w-full bg-cream-dark rounded-xl px-3 py-2 text-sm focus:outline-none ${customDraft.muscleGroup ? 'text-gray-800' : 'text-gray-400'}`}
            >
              <option value="" disabled>Select Muscle Group</option>
              {MUSCLE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <div className="flex bg-cream-dark rounded-xl p-1 gap-1">
              {['sets', 'time'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCustomDraft(d => ({ ...d, trackingType: t }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                    customDraft.trackingType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                  }`}
                >
                  {t === 'sets' ? 'Sets' : 'Time'}
                </button>
              ))}
            </div>
            <input
              value={customDraft.note}
              onChange={e => setCustomDraft(d => ({ ...d, note: e.target.value }))}
              placeholder="Note (optional)"
              className="w-full bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setAddingCustom(false)} className="p-2 rounded-xl bg-cream-dark text-gray-500"><X size={14} /></button>
              <button onClick={addCustom} className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                <Check size={14} /> Add to library
              </button>
            </div>
          </div>
        )}

        {/* Exercise list */}
        {showFlat ? (
          <div className="space-y-1.5">
            {visible.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No exercises found.</p>}
            {visible.map(renderItem)}
          </div>
        ) : (
          Object.entries(groups || {}).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 px-1">{group}</p>
              <div className="space-y-1.5">{items.map(renderItem)}</div>
            </div>
          ))
        )}
      </div>
      <ConfirmModal
        open={confirm.open}
        message={confirm.message}
        onConfirm={() => { confirm.onConfirm?.(); closeConfirm() }}
        onCancel={closeConfirm}
      />
    </div>
  )
}
