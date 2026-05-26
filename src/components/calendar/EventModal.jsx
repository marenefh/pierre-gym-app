import { useState, useEffect } from 'react'
import { X, Trash2, MapPin, Clock } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_ROUTINES } from '../../store/appStore'

const LOCATIONS = [
  { id: 'gym',     label: 'Gym',     travelKey: 'gymTravelMinutes',    tag: 'gym'      },
  { id: 'hongg',   label: 'Höngg',   travelKey: 'schoolTravelMinutes', tag: 'school'   },
  { id: 'zentrum', label: 'Zentrum', travelKey: 'campusTravelMinutes', tag: 'school'   },
  { id: 'work',    label: 'Work',    travelKey: 'workTravelMinutes',   tag: 'work'     },
  { id: 'home',    label: 'Home',    travelKey: null, fixed: 0,        tag: 'personal' },
  { id: 'other',   label: 'Other',   travelKey: null, custom: true,    tag: 'personal' },
]

export default function EventModal({ initialDate, event, onSave, onDelete, onClose }) {
  const [routines] = useLocalStorage(STORAGE_KEYS.ROUTINES, DEFAULT_ROUTINES)

  const [title,         setTitle]         = useState(event?.title    || '')
  const [date,          setDate]          = useState(event?.date     || initialDate || '')
  const [time,          setTime]          = useState(event?.time     || '')
  const [notes,         setNotes]         = useState(event?.notes    || '')
  const [location,      setLocation]      = useState(event?.location || '')
  const [travelMinutes, setTravelMinutes] = useState(event?.travelMinutes ?? 0)
  const [customTravel,  setCustomTravel]  = useState(
    event?.location === 'other' ? (event?.travelMinutes ?? 0) : 0
  )

  useEffect(() => {
    if (location === 'other') setTravelMinutes(customTravel)
  }, [customTravel, location])

  const selectLocation = (locId) => {
    if (locId === location) {
      setLocation('')
      setTravelMinutes(0)
      return
    }
    setLocation(locId)
    const loc = LOCATIONS.find(l => l.id === locId)
    if (loc.travelKey) {
      const mins = routines[loc.travelKey] ?? DEFAULT_ROUTINES[loc.travelKey] ?? 0
      setTravelMinutes(mins)
    } else if (loc.fixed !== undefined) {
      setTravelMinutes(loc.fixed)
    } else {
      setTravelMinutes(customTravel)
    }
  }

  const handleSave = () => {
    if (!title.trim() || !date) return
    const loc = LOCATIONS.find(l => l.id === location)
    onSave({
      id: event?.id,
      title: title.trim(),
      date, time, notes,
      location:      location || undefined,
      travelMinutes: location ? travelMinutes : undefined,
      tag:           loc?.tag || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-base">{event ? 'Edit Event' : 'New Event'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          autoFocus
        />

        {/* Date + Time row */}
        <div className="flex gap-3">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="flex-1 bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="flex-1 bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={13} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Location</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map(loc => (
              <button
                key={loc.id}
                onClick={() => selectLocation(loc.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${location === loc.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-cream-dark text-gray-600 hover:bg-gray-200'}`}
              >
                {loc.label}
              </button>
            ))}
          </div>

          {/* Travel time display / custom input */}
          {location && (
            <div className="mt-2 flex items-center gap-2">
              <Clock size={12} className="text-gray-400 flex-shrink-0" />
              {location === 'other' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Travel time:</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={customTravel}
                    onChange={e => setCustomTravel(Number(e.target.value))}
                    className="w-16 bg-cream-dark rounded-xl px-2 py-1 text-xs font-bold text-gray-900 text-center focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">min</span>
                </div>
              ) : location === 'home' ? (
                <span className="text-xs text-gray-400">No travel time needed</span>
              ) : (
                <span className="text-xs text-gray-400">
                  {travelMinutes} min travel
                  <span className="text-gray-300 ml-1">(from Routines)</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
        />

        {/* Actions */}
        <div className="flex gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-red-50 text-red-500 text-sm font-medium"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim() || !date}
            className="flex-1 py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40"
          >
            {event ? 'Update' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  )
}
