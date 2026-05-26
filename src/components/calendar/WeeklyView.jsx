import { useState } from 'react'
import {
  startOfWeek, endOfWeek, eachDayOfInterval, format, isToday,
  addWeeks, subWeeks, isSameDay
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../../store/appStore'
import EventModal from './EventModal'

export default function WeeklyView() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.EVENTS, [])
  const [modal, setModal] = useState(null) // { date } or null
  const [editEvent, setEditEvent] = useState(null)

  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) })

  const saveEvent = (ev) => {
    if (ev.id && events.find(e => e.id === ev.id)) {
      setEvents(prev => prev.map(e => e.id === ev.id ? ev : e))
    } else {
      setEvents(prev => [...prev, { ...ev, id: Date.now() }])
    }
    setModal(null)
    setEditEvent(null)
  }

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setEditEvent(null)
  }

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Week nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {format(weekStart, 'MMM d')} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
        </span>
        <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Day columns */}
      <div className="px-4 space-y-3 pb-4">
        {days.map(day => {
          const dayEvents = events
            .filter(e => { try { return isSameDay(new Date(e.date), day) } catch { return false } })
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
          const today = isToday(day)

          return (
            <div key={day.toISOString()} className={`rounded-3xl p-3.5 ${today ? 'bg-gray-900 text-white' : 'bg-white shadow-card'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${today ? 'text-gray-400' : 'text-gray-400'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-base font-bold ${today ? 'text-white' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <button
                  onClick={() => setModal({ date: format(day, 'yyyy-MM-dd') })}
                  className={`p-1 rounded-lg ${today ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-cream-dark text-gray-500 hover:bg-gray-200'}`}
                  aria-label="Add event"
                >
                  <Plus size={14} />
                </button>
              </div>
              {dayEvents.length === 0 ? (
                <p className={`text-xs ${today ? 'text-gray-500' : 'text-gray-400'}`}>No events</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayEvents.map(ev => (
                    <li
                      key={ev.id}
                      onClick={() => setEditEvent(ev)}
                      className={`flex items-start gap-2 cursor-pointer rounded-xl px-2 py-1.5 transition-colors
                        ${today ? 'hover:bg-white/10' : 'hover:bg-cream-dark'}`}
                    >
                      <span className={`text-xs font-mono w-12 flex-shrink-0 pt-0.5 ${today ? 'text-gray-400' : 'text-gray-400'}`}>
                        {ev.time}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm truncate block ${today ? 'text-white' : 'text-gray-800'}`}>
                          {ev.title}
                        </span>
                        {ev.travelMinutes > 0 && (
                          <span className={`flex items-center gap-1 text-[10px] mt-0.5 ${today ? 'text-gray-500' : 'text-gray-400'}`}>
                            <Clock size={9} />
                            {ev.travelMinutes} min travel
                          </span>
                        )}
                      </div>
                      {ev.tag && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5
                          ${today ? 'bg-white/20 text-white' : tagColor(ev.tag)}`}>
                          {ev.tag}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {(modal || editEvent) && (
        <EventModal
          initialDate={modal?.date || editEvent?.date}
          event={editEvent}
          onSave={saveEvent}
          onDelete={editEvent ? () => deleteEvent(editEvent.id) : null}
          onClose={() => { setModal(null); setEditEvent(null) }}
        />
      )}
    </div>
  )
}

function tagColor(tag) {
  const map = {
    gym: 'bg-pastel-blue text-pastel-blue-text',
    school: 'bg-pastel-yellow text-pastel-yellow-text',
    campus: 'bg-pastel-green text-pastel-green-text',
    personal: 'bg-pastel-pink text-pastel-pink-text',
    work: 'bg-pastel-purple text-pastel-purple-text',
  }
  return map[tag?.toLowerCase()] || 'bg-cream-dark text-gray-600'
}
