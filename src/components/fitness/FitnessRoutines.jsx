import { useState, useCallback } from 'react'
import { Plus, ChevronRight, Trash2, X, Check, BookOpen, GripVertical } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_WORKOUT_ROUTINES, DEFAULT_EXERCISE_LIBRARY } from '../../store/appStore'
import { useDragSort } from '../../hooks/useDragSort'
import ExerciseLibraryView from './ExerciseLibraryView'
import ExercisePicker from './ExercisePicker'
import LoggedWorkoutsView from './LoggedWorkoutsView'
import ConfirmModal from '../ConfirmModal'
import SwipeableSetRow from '../SwipeableSetRow'

function uid() { return Math.random().toString(36).slice(2) }

export default function FitnessRoutines() {
  const [routines, setRoutines] = useLocalStorage(STORAGE_KEYS.WORKOUT_ROUTINES, DEFAULT_WORKOUT_ROUTINES)
  const [library] = useLocalStorage(STORAGE_KEYS.EXERCISE_LIBRARY, DEFAULT_EXERCISE_LIBRARY)

  const [subTab, setSubTab] = useState('routines')
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null })
  const askConfirm = (message, fn) => setConfirm({ open: true, message, onConfirm: fn })
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null })
  const [showLibrary, setShowLibrary] = useState(false)
  const [selected, setSelected] = useState(null)
  const [addingRoutine, setAddingRoutine] = useState(false)
  const [newName, setNewName] = useState('')
  const [addExPickerOpen, setAddExPickerOpen] = useState(false)

  const routine = routines.find(r => r.id === selected)

  // ── Routine CRUD ───────────────────────────────────────────────────────────
  const addRoutine = () => {
    if (!newName.trim()) return
    const r = { id: uid(), name: newName.trim(), exercises: [] }
    setRoutines(prev => [...prev, r])
    setSelected(r.id)
    setAddingRoutine(false)
    setNewName('')
  }

  const deleteRoutine = (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id))
    if (selected === id) setSelected(null)
  }

  const updateRoutine = (id, patch) =>
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))

  // ── Exercise CRUD ──────────────────────────────────────────────────────────
  const handleAddExercise = (picked) => {
    const trackingType = picked.trackingType || 'sets'
    const ex = {
      id: uid(),
      name: picked.name,
      muscleGroup: picked.muscleGroup,
      note: picked.note || '',
      trackingType,
      sets: [trackingType === 'time' ? { minutes: 0, seconds: 0 } : { reps: 10, weight: 0 }]
    }
    updateRoutine(selected, { exercises: [...(routine.exercises || []), ex] })
    setAddExPickerOpen(false)
  }

  const deleteExercise = (exId) =>
    updateRoutine(selected, { exercises: routine.exercises.filter(e => e.id !== exId) })

  const reorderExercises = useCallback((from, to) => {
    if (!routine) return
    const exs = [...routine.exercises]
    const [moved] = exs.splice(from, 1)
    exs.splice(to, 0, moved)
    updateRoutine(selected, { exercises: exs })
  }, [routine, selected])

  const { dragging, dragOver, onHandleTouchStart, onListTouchMove, onListTouchEnd } = useDragSort(reorderExercises)

  // ── Set CRUD ───────────────────────────────────────────────────────────────
  const addSet = (exId) => {
    updateRoutine(selected, {
      exercises: routine.exercises.map(ex => {
        if (ex.id !== exId) return ex
        if (ex.trackingType === 'time') {
          const last = ex.sets[ex.sets.length - 1] || { minutes: 0, seconds: 0 }
          return { ...ex, sets: [...ex.sets, { minutes: last.minutes, seconds: last.seconds }] }
        }
        const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 0 }
        return { ...ex, sets: [...ex.sets, { reps: last.reps, weight: last.weight }] }
      })
    })
  }

  const updateSet = (exId, setIdx, field, val) => {
    updateRoutine(selected, {
      exercises: routine.exercises.map(ex => {
        if (ex.id !== exId) return ex
        return {
          ...ex,
          sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: Number(val) } : s)
        }
      })
    })
  }

  const removeSet = (exId, setIdx) => {
    updateRoutine(selected, {
      exercises: routine.exercises.map(ex => {
        if (ex.id !== exId || ex.sets.length <= 1) return ex
        return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
      })
    })
  }

  // ── Library view ───────────────────────────────────────────────────────────
  if (showLibrary) {
    return <ExerciseLibraryView onBack={() => setShowLibrary(false)} />
  }

  // ── Routine detail view ────────────────────────────────────────────────────
  if (selected && routine) {
    return (
      <div className="h-full overflow-y-auto tab-content pb-safe">
        <div className="px-4 py-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-gray-500 text-sm mb-4"
          >
            <ChevronRight size={14} className="rotate-180" /> All routines
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-4">{routine.name}</h2>

          {/* Exercise cards */}
          <div
            className="space-y-3 mb-3"
            onTouchMove={onListTouchMove}
            onTouchEnd={onListTouchEnd}
          >
            {(routine.exercises || []).map((ex, ei) => {
              const libNote = library.find(e => e.name === ex.name)?.note || ex.note || ''
              return (
              <div
                key={ex.id}
                data-drag-idx={ei}
                className={`bg-white rounded-2xl p-4 shadow-card transition-opacity ${dragging === ei ? 'opacity-40' : ''} ${dragOver === ei && dragging !== ei ? 'ring-2 ring-gray-200' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold text-gray-900 text-sm">{ex.name}</p>
                    <p className="text-xs text-gray-400">{ex.muscleGroup}</p>
                    {libNote && <p className="text-xs text-gray-400 italic mt-0.5 leading-tight">{libNote}</p>}
                  </div>
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <button
                      onClick={() => askConfirm('Remove this exercise?', () => deleteExercise(ex.id))}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-400 hover:bg-red-200"
                    >
                      <X size={10} />
                    </button>
                    <button
                      className="p-0.5 text-gray-300 touch-none cursor-grab"
                      onTouchStart={onHandleTouchStart(ei)}
                    >
                      <GripVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Sets */}
                <div className="space-y-2">
                  {(Array.isArray(ex.sets) ? ex.sets : []).map((set, si) => (
                    <SwipeableSetRow
                      key={si}
                      disabled={ex.sets.length <= 1}
                      onDelete={() => askConfirm('Delete this set?', () => removeSet(ex.id, si))}
                    >
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-cream-dark">
                      <span className="text-xs text-gray-500 w-10 flex-shrink-0">Set {si + 1}</span>
                      {ex.trackingType === 'time' ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.minutes || 0}
                            onChange={e => updateSet(ex.id, si, 'minutes', e.target.value)}
                            className="w-12 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">min :</span>
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.seconds || 0}
                            onChange={e => updateSet(ex.id, si, 'seconds', e.target.value)}
                            className="w-12 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">sec</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.reps}
                            onChange={e => updateSet(ex.id, si, 'reps', e.target.value)}
                            className="w-12 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">reps ×</span>
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.weight}
                            onChange={e => updateSet(ex.id, si, 'weight', e.target.value)}
                            className="w-14 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">kg</span>
                        </div>
                      )}
                    </div>
                    </SwipeableSetRow>
                  ))}
                </div>

                {/* Add set */}
                <button
                  onClick={() => addSet(ex.id)}
                  className="w-full mt-2 flex items-center justify-center py-1.5 rounded-xl text-gray-300 hover:text-gray-400 hover:bg-cream-dark transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
              )})}
          </div>

          {/* Add Exercise */}
          <button
            onClick={() => setAddExPickerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-sm font-medium mb-3"
          >
            <Plus size={16} /> Add exercise
          </button>

          {/* Save */}
          <button
            onClick={() => setSelected(null)}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            <Check size={15} /> Save
          </button>
        </div>

        <ExercisePicker
          open={addExPickerOpen}
          onClose={() => setAddExPickerOpen(false)}
          library={library}
          onSelect={handleAddExercise}
        />
        <ConfirmModal
          open={confirm.open}
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm?.(); closeConfirm() }}
          onCancel={closeConfirm}
        />
      </div>
    )
  }

  // ── Top-level with sub-tab bar ─────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="flex bg-cream-dark rounded-2xl p-1">
          {[['routines', 'Routines'], ['logged', 'Logged Workouts']].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                subTab === t ? 'bg-white text-gray-900 shadow-card' : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {subTab === 'logged' ? (
          <LoggedWorkoutsView />
        ) : (
          <div className="h-full overflow-y-auto tab-content pb-safe">
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => setShowLibrary(true)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3 text-left hover:bg-cream-dark transition-colors"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-cream-dark flex-shrink-0">
                  <BookOpen size={15} className="text-gray-500" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Exercise Library</p>
                </div>
                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
              </button>

              <div className="pt-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">My Routines</p>
                {routines.map(r => (
                  <div key={r.id} className="flex items-center bg-white rounded-2xl shadow-card overflow-hidden mb-2">
                    <button onClick={() => setSelected(r.id)} className="flex-1 flex items-center gap-3 p-4 text-left">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">{(r.exercises || []).length} exercises</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </button>
                    <button onClick={() => askConfirm(`Delete "${r.name}"?`, () => deleteRoutine(r.id))} className="px-4 py-4 text-gray-300 hover:text-red-400 border-l border-gray-100">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {addingRoutine ? (
                  <div className="bg-white rounded-2xl p-4 shadow-card">
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="Routine name (e.g. Push)"
                      className="w-full bg-cream-dark rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none mb-3"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && addRoutine()}
                    />
                    <div className="flex gap-2">
                      <button onClick={addRoutine} className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold">Create</button>
                      <button onClick={() => setAddingRoutine(false)} className="px-4 py-2 rounded-xl bg-cream-dark text-gray-600 text-sm"><X size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingRoutine(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-sm font-medium"
                  >
                    <Plus size={16} /> New routine
                  </button>
                )}
              </div>
            </div>
          </div>
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
