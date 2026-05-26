import { useState, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Edit2, Save, ChevronDown, Plus, X, RefreshCw, Trash2, GripVertical } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_EXERCISE_LIBRARY, DEFAULT_WORKOUT_ROUTINES } from '../../store/appStore'
import ExercisePicker from './ExercisePicker'
import { useDragSort } from '../../hooks/useDragSort'
import ConfirmModal from '../ConfirmModal'
import SwipeableSetRow from '../SwipeableSetRow'

const TODAY = format(new Date(), 'yyyy-MM-dd')
function uid() { return Math.random().toString(36).slice(2) }

function buildSessionFromRoutine(routine, date) {
  return {
    id: `${date}-${routine.id}`,
    date,
    routineId: routine.id,
    routineName: routine.name,
    saved: false,
    exercises: (routine.exercises || []).map(ex => {
      const isTime = ex.trackingType === 'time'
      return {
        exerciseId: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        note: ex.note,
        trackingType: ex.trackingType || 'sets',
        sets: Array.isArray(ex.sets)
          ? ex.sets.map(s => isTime
              ? { minutes: Number(s.minutes) || 0, seconds: Number(s.seconds) || 0, done: false }
              : { reps: Number(s.reps) || 0, weight: Number(s.weight) || 0, done: false })
          : isTime
              ? Array.from({ length: ex.sets || 3 }, () => ({ minutes: 0, seconds: 0, done: false }))
              : Array.from({ length: ex.sets || 3 }, () => ({ reps: ex.reps || 10, weight: ex.weight || 0, done: false }))
      }
    })
  }
}

export default function LoggedWorkoutsView() {
  const [log, setLog]           = useLocalStorage(STORAGE_KEYS.WORKOUT_LOG, [])
  const [library]               = useLocalStorage(STORAGE_KEYS.EXERCISE_LIBRARY, DEFAULT_EXERCISE_LIBRARY)
  const [routines, setRoutines] = useLocalStorage(STORAGE_KEYS.WORKOUT_ROUTINES, DEFAULT_WORKOUT_ROUTINES)

  const [date, setDate]               = useState(TODAY)
  const [logging, setLogging]         = useState(false)
  const [draft, setDraft]             = useState(null)
  const [editingExisting, setEditingExisting] = useState(false)
  const [exPickerOpen, setExPickerOpen] = useState(false)

  const session = log.find(s => s.date === date) || null
  const isToday = date === TODAY

  // ── Date navigation ────────────────────────────────────────────────────────
  const shiftDate = (d) => {
    const dt = parseISO(date)
    dt.setDate(dt.getDate() + d)
    const next = format(dt, 'yyyy-MM-dd')
    if (next <= TODAY) {
      setDate(next)
      setLogging(false)
      setDraft(null)
      setEditingExisting(false)
    }
  }

  // ── Start editing an existing saved session ────────────────────────────────
  const startEditExisting = () => {
    setDraft({ ...session })
    setEditingExisting(true)
    setLogging(true)
  }

  // ── Draft handlers (shared for new sessions and editing existing) ──────────
  const updateDraft = (fn) => setDraft(prev => fn(prev))

  const selectRoutine = (routineId) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return
    setDraft(buildSessionFromRoutine(routine, date))
  }

  const toggleSet = (exIdx, setIdx) => {
    updateDraft(s => ({
      ...s,
      exercises: s.exercises.map((ex, ei) =>
        ei === exIdx ? { ...ex, sets: ex.sets.map((st, si) => si === setIdx ? { ...st, done: !st.done } : st) } : ex
      )
    }))
  }

  const updateSet = (exIdx, setIdx, field, val) => {
    updateDraft(s => ({
      ...s,
      exercises: s.exercises.map((ex, ei) =>
        ei === exIdx ? { ...ex, sets: ex.sets.map((st, si) => si === setIdx ? { ...st, [field]: Number(val) } : st) } : ex
      )
    }))
  }

  const addSet = (exIdx) => {
    updateDraft(s => ({
      ...s,
      exercises: s.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex
        if (ex.trackingType === 'time') {
          const last = ex.sets[ex.sets.length - 1] || { minutes: 0, seconds: 0 }
          return { ...ex, sets: [...ex.sets, { minutes: last.minutes, seconds: last.seconds, done: false }] }
        }
        const last = ex.sets[ex.sets.length - 1] || { reps: 10, weight: 0 }
        return { ...ex, sets: [...ex.sets, { reps: last.reps, weight: last.weight, done: false }] }
      })
    }))
  }

  const removeExercise = (exIdx) => {
    updateDraft(s => ({ ...s, exercises: s.exercises.filter((_, ei) => ei !== exIdx) }))
  }

  const removeSet = (exIdx, setIdx) => {
    updateDraft(s => ({
      ...s,
      exercises: s.exercises.map((ex, ei) => {
        if (ei !== exIdx || ex.sets.length <= 1) return ex
        return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
      })
    }))
  }

  // ── Confirm modal ─────────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null })
  const askConfirm = (message, fn) => setConfirm({ open: true, message, onConfirm: fn })
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null })

  const addExercise = (ex) => {
    const trackingType = ex.trackingType || 'sets'
    updateDraft(s => ({
      ...s,
      exercises: [...s.exercises, {
        exerciseId: uid(),
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        note: ex.note || '',
        trackingType,
        sets: [trackingType === 'time'
          ? { minutes: 0, seconds: 0, done: false }
          : { reps: 10, weight: 0, done: false }]
      }]
    }))
  }

  const reorderExercises = useCallback((from, to) => {
    updateDraft(s => {
      const exs = [...s.exercises]
      const [moved] = exs.splice(from, 1)
      exs.splice(to, 0, moved)
      return { ...s, exercises: exs }
    })
  }, [])

  const { dragging, dragOver, onHandleTouchStart, onListTouchMove, onListTouchEnd } = useDragSort(reorderExercises)

  const saveSession = () => {
    if (!draft) return
    const toSave = { ...draft, saved: true }
    setLog(prev => {
      const exists = prev.find(l => l.date === date)
      return exists ? prev.map(l => l.date === date ? toSave : l) : [...prev, toSave]
    })
    setDraft(null)
    setLogging(false)
    setEditingExisting(false)
  }

  const saveAndUpdateRoutine = () => {
    if (!draft) return
    const toSave = { ...draft, saved: true }
    setLog(prev => {
      const exists = prev.find(l => l.date === date)
      return exists ? prev.map(l => l.date === date ? toSave : l) : [...prev, toSave]
    })
    const routine = routines.find(r => r.id === draft.routineId)
    if (routine) {
      const updatedExercises = draft.exercises.map(sex => {
        const rex = routine.exercises.find(r => r.id === sex.exerciseId)
        const isTime = sex.trackingType === 'time'
        const setData = sex.sets.map(s => isTime
          ? { minutes: Number(s.minutes) || 0, seconds: Number(s.seconds) || 0 }
          : { reps: Number(s.reps) || 0, weight: Number(s.weight) || 0 })
        if (rex) {
          return { ...rex, trackingType: sex.trackingType || 'sets', sets: setData }
        }
        return {
          id: sex.exerciseId || uid(),
          name: sex.name,
          muscleGroup: sex.muscleGroup,
          note: sex.note || '',
          trackingType: sex.trackingType || 'sets',
          sets: setData,
        }
      })
      setRoutines(prev => prev.map(r => r.id === routine.id ? { ...r, exercises: updatedExercises } : r))
    }
    setDraft(null)
    setLogging(false)
    setEditingExisting(false)
  }

  const cancelLogging = () => {
    setDraft(null)
    setLogging(false)
    setEditingExisting(false)
  }

  const deleteSession = () => {
    setLog(prev => prev.filter(l => l.date !== date))
    setDraft(null)
    setLogging(false)
    setEditingExisting(false)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSets  = session?.exercises?.reduce((a, ex) => a + ex.sets.length, 0) || 0
  const doneSets   = session?.exercises?.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0) || 0
  const draftTotal = draft?.exercises?.reduce((a, ex) => a + ex.sets.length, 0) || 0
  const draftDone  = draft?.exercises?.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0) || 0

  // ── Routine picker ─────────────────────────────────────────────────────────
  if (logging && !draft) {
    return (
      <div className="h-full overflow-y-auto tab-content pb-safe">
        <div className="flex items-center gap-3 px-4 py-2">
          <button onClick={cancelLogging} className="p-2 rounded-xl hover:bg-cream-dark">
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {isToday ? 'Today' : format(parseISO(date), 'EEE, d MMMM')}
          </span>
        </div>
        <div className="px-4 py-1 space-y-2">
          {routines.length === 0 ? (
            <p className="text-gray-400 text-sm">Create routines in the Routines tab first.</p>
          ) : routines.map(r => (
            <button
              key={r.id}
              onClick={() => selectRoutine(r.id)}
              className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-card text-left hover:bg-cream-dark transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                <p className="text-xs text-gray-400">{(r.exercises || []).length} exercises</p>
              </div>
              <ChevronDown size={16} className="text-gray-300 -rotate-90" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Session editor (new session or editing existing) ───────────────────────
  if (logging && draft) {
    return (
      <div className="h-full overflow-y-auto tab-content pb-safe">
        <div className="flex items-center gap-3 px-4 py-2">
          <button
            onClick={() => editingExisting ? cancelLogging() : setDraft(null)}
            className="p-2 rounded-xl hover:bg-cream-dark"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {isToday ? 'Today' : format(parseISO(date), 'EEE, d MMMM')}
          </span>
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{format(parseISO(date), 'EEEE, d MMMM')}</p>
              <h2 className="text-lg font-bold text-gray-900">{draft.routineName}</h2>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-2xl p-3 mb-4 shadow-card">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Sets completed</span>
              <span className="text-xs font-bold text-gray-900">{draftDone}/{draftTotal}</span>
            </div>
            <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: draftTotal ? `${(draftDone / draftTotal) * 100}%` : '0%' }} />
            </div>
          </div>

          {/* Exercise cards */}
          <div
            className="space-y-3"
            onTouchMove={onListTouchMove}
            onTouchEnd={onListTouchEnd}
          >
            {draft.exercises.map((ex, ei) => {
              const libNote = library.find(e => e.name === ex.name)?.note || ex.note || ''
              return (
              <div
                key={ex.exerciseId || ei}
                data-drag-idx={ei}
                className={`bg-white rounded-2xl p-4 shadow-card transition-opacity ${dragging === ei ? 'opacity-40' : ''} ${dragOver === ei && dragging !== ei ? 'ring-2 ring-gray-200' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-semibold text-gray-900 text-sm">{ex.name}</p>
                    <p className="text-xs text-gray-400">{ex.muscleGroup}</p>
                    {libNote && <p className="text-xs text-gray-400 italic mt-0.5 leading-tight">{libNote}</p>}
                  </div>
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <button
                      onClick={() => askConfirm('Remove this exercise?', () => removeExercise(ei))}
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
                <div className="space-y-2">
                  {ex.sets.map((set, si) => (
                    <SwipeableSetRow
                      key={si}
                      disabled={ex.sets.length <= 1}
                      onDelete={() => askConfirm('Delete this set?', () => removeSet(ei, si))}
                    >
                    <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-colors ${set.done ? 'bg-pastel-green' : 'bg-cream-dark'}`}>
                      <button onClick={() => toggleSet(ei, si)} className="flex-shrink-0">
                        {set.done
                          ? <CheckCircle2 size={20} className="text-pastel-green-text" />
                          : <Circle size={20} className="text-gray-300" />}
                      </button>
                      <span className="text-xs text-gray-500 w-10 flex-shrink-0">Set {si + 1}</span>
                      {ex.trackingType === 'time' ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.minutes || 0}
                            onChange={e => updateSet(ei, si, 'minutes', e.target.value)}
                            className="w-12 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">min :</span>
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.seconds || 0}
                            onChange={e => updateSet(ei, si, 'seconds', e.target.value)}
                            className="w-12 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">sec</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.reps}
                            onChange={e => updateSet(ei, si, 'reps', e.target.value)}
                            className="w-12 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">reps ×</span>
                          <input
                            type="text" inputMode="numeric" pattern="[0-9]*"
                            value={set.weight}
                            onChange={e => updateSet(ei, si, 'weight', e.target.value)}
                            className="w-14 bg-white rounded-lg px-2 py-1 text-xs text-center text-gray-800 focus:outline-none"
                          />
                          <span className="text-xs text-gray-400">kg</span>
                        </div>
                      )}
                    </div>
                    </SwipeableSetRow>
                  ))}
                </div>
                {/* Add set button */}
                <button
                  onClick={() => addSet(ei)}
                  className="w-full mt-2 flex items-center justify-center py-1.5 rounded-xl text-gray-300 hover:text-gray-400 hover:bg-cream-dark transition-colors"
                >
                  <Plus size={15} />
                </button>
              </div>
              )})}
          </div>

          {/* Add Exercise */}
          <button
            onClick={() => setExPickerOpen(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-sm font-medium"
          >
            <Plus size={15} /> Add Exercise
          </button>

          {/* Save buttons */}
          <div className="space-y-2 mt-4">
            {isToday && (
              <button
                onClick={saveAndUpdateRoutine}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                <RefreshCw size={15} /> Save & Update Routine
              </button>
            )}
            <button
              onClick={saveSession}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-colors ${isToday ? 'bg-cream-dark text-gray-700 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
              <Save size={16} /> Save Session
            </button>
            <button
              onClick={() => askConfirm('Delete this entire session?', deleteSession)}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3.5 rounded-2xl text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={15} /> Delete Session
            </button>
          </div>
        </div>

        <ExercisePicker
          open={exPickerOpen}
          onClose={() => setExPickerOpen(false)}
          library={library}
          onSelect={ex => { addExercise(ex); setExPickerOpen(false) }}
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

  // ── Normal view ────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Date nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {isToday ? 'Today' : format(parseISO(date), 'EEE, d MMMM')}
        </span>
        <button onClick={() => shiftDate(1)} disabled={isToday} className="p-2 rounded-xl hover:bg-cream-dark disabled:opacity-30">
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="px-4 pb-4">
        {!session ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm mb-3">No session logged</p>
            <button
              onClick={() => setLogging(true)}
              className="p-2 rounded-xl hover:bg-cream-dark text-gray-400"
            >
              <Edit2 size={22} />
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                {format(parseISO(date), 'EEEE, d MMMM')}
              </p>
              <h2 className="text-lg font-bold text-gray-900">{session.routineName}</h2>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-2xl p-3 mb-4 shadow-card">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-600">Sets completed</span>
                <span className="text-xs font-bold text-gray-900">{doneSets}/{totalSets}</span>
              </div>
              <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                <div className="h-full bg-gray-900 rounded-full" style={{ width: totalSets ? `${(doneSets / totalSets) * 100}%` : '0%' }} />
              </div>
            </div>

            {/* Exercise cards — read-only */}
            <div className="space-y-3">
              {session.exercises.map((ex, ei) => {
                const libNote = library.find(e => e.name === ex.name)?.note || ex.note || ''
                return (
                <div key={ei} className="bg-white rounded-2xl p-4 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{ex.name}</p>
                      <p className="text-xs text-gray-400">{ex.muscleGroup}</p>
                      {libNote && <p className="text-xs text-gray-400 italic mt-0.5 leading-tight">{libNote}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {ex.sets.map((set, si) => (
                      <div key={si} className={`flex items-center gap-2.5 p-2 rounded-xl ${set.done ? 'bg-pastel-green' : 'bg-cream-dark'}`}>
                        {set.done
                          ? <CheckCircle2 size={18} className="text-pastel-green-text flex-shrink-0" />
                          : <Circle size={18} className="text-gray-300 flex-shrink-0" />}
                        <span className="text-xs text-gray-500 w-10 flex-shrink-0">Set {si + 1}</span>
                        <span className="text-xs text-gray-600">
                          {ex.trackingType === 'time'
                            ? `${set.minutes || 0} min : ${String(set.seconds || 0).padStart(2, '0')} sec`
                            : `${set.reps} reps × ${set.weight}kg`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                )})}
            </div>

            {/* Edit Session button */}
            <button
              onClick={startEditExisting}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-cream-dark text-gray-700 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <Edit2 size={15} /> Edit Session
            </button>
          </>
        )}
      </div>
    </div>
  )
}
