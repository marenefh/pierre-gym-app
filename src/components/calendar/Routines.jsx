import { useState, useEffect, useRef, useCallback } from 'react'
import { Moon, Sunrise, Clock, MapPin, GraduationCap, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, parseISO, isWithinInterval } from 'date-fns'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_ROUTINES } from '../../store/appStore'

// ─── Value arrays ────────────────────────────────────────────────────────────
const SLEEP_VALS  = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]
const PREP_VALS   = Array.from({ length: (90 - 15) / 5 + 1 }, (_, i) => 15 + i * 5)
const TRAVEL_VALS = Array.from({ length: (90 -  0) / 5 + 1 }, (_, i) =>  0 + i * 5)

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ─── Utility ─────────────────────────────────────────────────────────────────
function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}
function formatTime12(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}
function uid() { return Math.random().toString(36).slice(2) }

// ─── Drum Picker ─────────────────────────────────────────────────────────────
const ITEM_H = 44

function DrumPicker({ values, current, displayFn, onClose, onSelect }) {
  const listRef = useRef(null)
  const idx = values.indexOf(current)
  const [sel, setSel] = useState(idx < 0 ? 0 : idx)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = sel * ITEM_H
    }
  }, []) // eslint-disable-line

  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const raw = listRef.current.scrollTop / ITEM_H
    setSel(Math.round(raw))
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white w-full rounded-t-3xl"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px),24px)' }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button onClick={onClose} className="text-sm text-gray-400 font-medium">Cancel</button>
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
          <button
            onClick={() => { onSelect(values[sel]); onClose() }}
            className="text-sm text-gray-900 font-semibold"
          >
            Done
          </button>
        </div>

        <div className="relative mx-auto" style={{ width: 200, height: ITEM_H * 5 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-10"
            style={{ background: 'linear-gradient(to bottom, white 0%, transparent 100%)' }} />
          <div className="pointer-events-none absolute inset-x-0 z-10 border-y border-gray-200 bg-cream-dark/60"
            style={{ top: ITEM_H * 2, height: ITEM_H }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-10"
            style={{ background: 'linear-gradient(to top, white 0%, transparent 100%)' }} />
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="h-full overflow-y-scroll scrollbar-none"
            style={{ scrollSnapType: 'y mandatory', paddingTop: ITEM_H * 2, paddingBottom: ITEM_H * 2 }}
          >
            {values.map((v, i) => (
              <div
                key={v}
                onClick={() => {
                  setSel(i)
                  listRef.current.scrollTo({ top: i * ITEM_H, behavior: 'smooth' })
                }}
                style={{ scrollSnapAlign: 'center', height: ITEM_H }}
                className={`flex items-center justify-center text-lg font-semibold cursor-pointer transition-colors
                  ${i === sel ? 'text-gray-900' : 'text-gray-300'}`}
              >
                {displayFn(v)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Spinner Row ─────────────────────────────────────────────────────────────
function SpinnerRow({ label, value, values, displayFn, onChange }) {
  const [open, setOpen] = useState(false)
  const idx = values.indexOf(value)

  const dec = () => { if (idx > 0) onChange(values[idx - 1]) }
  const inc = () => { if (idx < values.length - 1) onChange(values[idx + 1]) }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={dec}
            disabled={idx <= 0}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-cream-dark disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setOpen(true)}
            className="min-w-[56px] text-center px-2 py-1 rounded-xl bg-cream-dark text-xs font-bold text-gray-900 hover:bg-gray-200 transition-colors"
          >
            {displayFn(value)}
          </button>
          <button
            onClick={inc}
            disabled={idx >= values.length - 1}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-cream-dark disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      {open && (
        <DrumPicker
          values={values}
          current={value}
          displayFn={displayFn}
          onClose={() => setOpen(false)}
          onSelect={onChange}
        />
      )}
    </>
  )
}

// ─── School Schedule helpers ──────────────────────────────────────────────────
const BLANK_SLOT = () => ({ id: uid(), day: 0, location: '', startTime: '08:15', endTime: '10:00' })

function buildSchoolEvents(classes) {
  const events = []
  classes.forEach(cls => {
    if (!cls.startDate || !cls.endDate || !cls.slots?.length) return
    let start, end
    try {
      start = parseISO(cls.startDate)
      end   = parseISO(cls.endDate)
    } catch { return }
    // Iterate week by week from the Monday of the start week to end date
    const firstMonday = startOfWeek(start, { weekStartsOn: 1 })
    let weekMonday = firstMonday
    while (weekMonday <= end) {
      cls.slots.forEach(slot => {
        const date = addDays(weekMonday, slot.day)
        if (date < start || date > end) return
        const dateStr = format(date, 'yyyy-MM-dd')
        events.push({
          id:    `school-${cls.id}-${slot.id}-${dateStr}`,
          date:  dateStr,
          time:  slot.startTime,
          title: `🎓 ${cls.name}${slot.location ? ` · ${slot.location}` : ''}`,
          tag:   'study',
          notes: slot.endTime ? `Until ${formatTime12(slot.endTime)}` : '',
        })
      })
      weekMonday = addWeeks(weekMonday, 1)
    }
  })
  return events
}

// ─── Class Form ───────────────────────────────────────────────────────────────
function ClassForm({ initial, onSave, onCancel, onDelete }) {
  const [name,      setName]      = useState(initial?.name      || '')
  const [startDate, setStartDate] = useState(initial?.startDate || '')
  const [endDate,   setEndDate]   = useState(initial?.endDate   || '')
  const [slots,     setSlots]     = useState(
    initial?.slots?.length > 0 ? initial.slots : [BLANK_SLOT()]
  )

  const addSlot    = () => setSlots(s => [...s, BLANK_SLOT()])
  const delSlot    = (id) => setSlots(s => s.filter(sl => sl.id !== id))
  const patchSlot  = (id, patch) => setSlots(s => s.map(sl => sl.id === id ? { ...sl, ...patch } : sl))

  const canSave = name.trim() && startDate && endDate && slots.length > 0

  return (
    <div className="space-y-3">
      {/* Name */}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Class name (e.g. Calculus)"
        className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
      />

      {/* Date range */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Schedule period</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-2xl p-3 shadow-card">
            <p className="text-[10px] text-gray-400 mb-1">From</p>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none"
            />
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-card">
            <p className="text-[10px] text-gray-400 mb-1">Until</p>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Slots */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Weekly schedule</p>
        <div className="space-y-2">
          {slots.map((slot, i) => (
            <div key={slot.id} className="bg-white rounded-2xl p-3 shadow-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400">Slot {i + 1}</span>
                {slots.length > 1 && (
                  <button onClick={() => delSlot(slot.id)} className="text-gray-300 hover:text-red-400 p-0.5">
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Day</p>
                  <select
                    value={slot.day}
                    onChange={e => patchSlot(slot.id, { day: Number(e.target.value) })}
                    className="w-full text-xs font-semibold text-gray-900 bg-cream-dark rounded-xl px-2 py-1.5 focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Location</p>
                  <input
                    value={slot.location}
                    onChange={e => patchSlot(slot.id, { location: e.target.value })}
                    placeholder="e.g. HG G3"
                    className="w-full text-xs font-semibold text-gray-900 bg-cream-dark rounded-xl px-2 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Start</p>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={e => patchSlot(slot.id, { startTime: e.target.value })}
                    className="w-full text-xs font-semibold text-gray-900 bg-cream-dark rounded-xl px-2 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">End</p>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={e => patchSlot(slot.id, { endTime: e.target.value })}
                    className="w-full text-xs font-semibold text-gray-900 bg-cream-dark rounded-xl px-2 py-1.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSlot}
          className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-xs font-medium"
        >
          <Plus size={13} /> Add another slot
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {onDelete && (
          <button onClick={onDelete} className="p-2.5 rounded-2xl bg-red-50 text-red-400 hover:bg-red-100">
            <Trash2 size={15} />
          </button>
        )}
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-2xl bg-cream-dark text-gray-600 text-sm font-medium">
          Cancel
        </button>
        <button
          onClick={() => canSave && onSave({ id: initial?.id || uid(), name, startDate, endDate, slots })}
          disabled={!canSave}
          className="flex-1 py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}

// ─── School Schedule View ─────────────────────────────────────────────────────
function SchoolScheduleView({ onBack }) {
  const [classes, setClasses] = useLocalStorage(STORAGE_KEYS.SCHOOL_SCHEDULE, [])
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.EVENTS, [])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const syncToCalendar = (updatedClasses) => {
    setEvents(prev => {
      const stripped = prev.filter(e => !e.id.startsWith('school-'))
      return [...stripped, ...buildSchoolEvents(updatedClasses)]
    })
  }

  const saveClass = (cls) => {
    setClasses(prev => {
      const exists = prev.find(c => c.id === cls.id)
      const updated = exists ? prev.map(c => c.id === cls.id ? cls : c) : [...prev, cls]
      syncToCalendar(updated)
      return updated
    })
    setAdding(false)
    setEditingId(null)
  }

  const deleteClass = (id) => {
    setClasses(prev => {
      const updated = prev.filter(c => c.id !== id)
      syncToCalendar(updated)
      return updated
    })
    setEditingId(null)
  }

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-400">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-base font-bold text-gray-900">School Schedule</h2>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Add your classes with their schedule period and weekly slots. Changes sync to your calendar automatically.
        </p>

        {/* Class list */}
        <div className="space-y-2 mb-3">
          {classes.map(cls => (
            <div key={cls.id}>
              {editingId === cls.id ? (
                <div className="bg-white rounded-3xl p-4 shadow-card">
                  <ClassForm
                    initial={cls}
                    onSave={saveClass}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => deleteClass(cls.id)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setEditingId(cls.id)}
                  className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-card text-left hover:bg-cream-dark transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{cls.name}</p>
                    {cls.startDate && cls.endDate && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {format(parseISO(cls.startDate), 'MMM d')} – {format(parseISO(cls.endDate), 'MMM d, yyyy')}
                      </p>
                    )}
                    {cls.slots?.map(slot => (
                      <p key={slot.id} className="text-xs text-gray-500 mt-0.5">
                        {DAYS_OF_WEEK[slot.day].slice(0, 3)} · {formatTime12(slot.startTime)}–{formatTime12(slot.endTime)}
                        {slot.location ? ` · ${slot.location}` : ''}
                      </p>
                    ))}
                  </div>
                  <ChevronRight size={15} className="text-gray-300 flex-shrink-0 ml-2" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add form */}
        {adding ? (
          <div className="bg-white rounded-3xl p-4 shadow-card">
            <ClassForm
              onSave={saveClass}
              onCancel={() => setAdding(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-sm font-medium"
          >
            <Plus size={15} /> Add class
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Routines ────────────────────────────────────────────────────────────
export default function Routines() {
  const [routines, setRoutines] = useLocalStorage(STORAGE_KEYS.ROUTINES, DEFAULT_ROUTINES)
  const [sleepTarget, setSleepTarget] = useLocalStorage(STORAGE_KEYS.SLEEP_TARGET, { hour: 22, minute: 30, sleepHours: 8 })
  const [firstCommitment, setFirstCommitment] = useState('07:00')
  const [showSchool, setShowSchool] = useState(false)

  useEffect(() => {
    const commitMinutes = timeToMinutes(firstCommitment)
    const prepMinutes   = routines.morningPrepMinutes
    const wakeMinutes   = commitMinutes - prepMinutes
    const sleepMinutes  = wakeMinutes - routines.sleepHours * 60
    const normalised    = ((sleepMinutes % 1440) + 1440) % 1440
    const h = Math.floor(normalised / 60)
    const m = normalised % 60
    setSleepTarget({ hour: h, minute: m, sleepHours: routines.sleepHours })
  }, [firstCommitment, routines.morningPrepMinutes, routines.sleepHours])

  const update = (key, val) => setRoutines(prev => ({ ...prev, [key]: val }))

  const calcSleepDisplay = () => formatTime12(minutesToTime(sleepTarget.hour * 60 + sleepTarget.minute))

  const calcWakeDisplay = () => {
    const commitMinutes = timeToMinutes(firstCommitment)
    const wakeMinutes   = commitMinutes - routines.morningPrepMinutes
    const normalised    = ((wakeMinutes % 1440) + 1440) % 1440
    return formatTime12(minutesToTime(normalised))
  }

  if (showSchool) return <SchoolScheduleView onBack={() => setShowSchool(false)} />

  const fmtH   = v => `${v}h`
  const fmtMin = v => `${v}m`

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3 space-y-4">

        {/* Sleep calculation result */}
        <div className="bg-gray-900 text-white rounded-3xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Calculated from your schedule</p>
          <div className="flex justify-between">
            <div className="text-center">
              <Moon size={20} className="mx-auto mb-1 text-pastel-purple" />
              <p className="text-xl font-bold">{calcSleepDisplay()}</p>
              <p className="text-xs text-gray-400">Sleep by</p>
            </div>
            <div className="text-center">
              <Sunrise size={20} className="mx-auto mb-1 text-pastel-yellow-text" />
              <p className="text-xl font-bold">{calcWakeDisplay()}</p>
              <p className="text-xs text-gray-400">Wake up</p>
            </div>
            <div className="text-center">
              <Clock size={20} className="mx-auto mb-1 text-pastel-green-text" />
              <p className="text-xl font-bold">{routines.sleepHours}h</p>
              <p className="text-xs text-gray-400">Sleep goal</p>
            </div>
          </div>
        </div>

        {/* First commitment */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Productivity starting time</h3>
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="time"
              value={firstCommitment}
              onChange={e => setFirstCommitment(e.target.value)}
              className="flex-1 bg-cream-dark rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        {/* Sleep hours */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Sleep goal</h3>
          <SpinnerRow
            label="Sleep hours"
            value={routines.sleepHours}
            values={SLEEP_VALS}
            displayFn={fmtH}
            onChange={v => update('sleepHours', v)}
          />
        </div>

        {/* Morning & Evening */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Daily buffers</h3>
          <div className="space-y-5">
            <SpinnerRow
              label="Morning prep"
              value={routines.morningPrepMinutes}
              values={PREP_VALS}
              displayFn={fmtMin}
              onChange={v => update('morningPrepMinutes', v)}
            />
            <SpinnerRow
              label="Evening wind-down"
              value={routines.eveningWindDownMinutes}
              values={PREP_VALS}
              displayFn={fmtMin}
              onChange={v => update('eveningWindDownMinutes', v)}
            />
          </div>
        </div>

        {/* Travel times */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-gray-400" />
            <h3 className="font-semibold text-gray-900 text-sm">Travel times</h3>
          </div>
          <div className="space-y-5">
            <SpinnerRow
              label="To Gym"
              value={routines.gymTravelMinutes}
              values={TRAVEL_VALS}
              displayFn={fmtMin}
              onChange={v => update('gymTravelMinutes', v)}
            />
            <SpinnerRow
              label="To Höngg"
              value={routines.schoolTravelMinutes}
              values={TRAVEL_VALS}
              displayFn={fmtMin}
              onChange={v => update('schoolTravelMinutes', v)}
            />
            <SpinnerRow
              label="To Zentrum"
              value={routines.campusTravelMinutes}
              values={TRAVEL_VALS}
              displayFn={fmtMin}
              onChange={v => update('campusTravelMinutes', v)}
            />
            <SpinnerRow
              label="To Work"
              value={routines.workTravelMinutes ?? 20}
              values={TRAVEL_VALS}
              displayFn={fmtMin}
              onChange={v => update('workTravelMinutes', v)}
            />
          </div>
        </div>

        {/* School Schedule */}
        <button
          onClick={() => setShowSchool(true)}
          className="w-full flex items-center justify-between bg-white rounded-3xl p-4 shadow-card hover:bg-cream-dark transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pastel-purple flex items-center justify-center flex-shrink-0">
              <GraduationCap size={17} className="text-pastel-purple-text" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">School Schedule</p>
              <p className="text-xs text-gray-400">Manage weekly classes</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>

      </div>
    </div>
  )
}
