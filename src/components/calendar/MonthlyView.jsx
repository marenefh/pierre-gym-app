import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
  addMonths, subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../../store/appStore'
import EventModal from './EventModal'

export default function MonthlyView() {
  const [current, setCurrent] = useState(new Date())
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.EVENTS, [])
  const [selected, setSelected] = useState(null) // date string
  const [modal, setModal] = useState(null)
  const [editEvent, setEditEvent] = useState(null)

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

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

  const selectedEvents = selected
    ? events.filter(e => { try { return isSameDay(new Date(e.date), new Date(selected)) } catch { return false } })
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    : []

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-base font-bold text-gray-900">{format(current, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 px-4 mb-1">
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, current)
          const today = isToday(day)
          const sel = selected === dateStr
          const dotCount = events.filter(e => { try { return isSameDay(new Date(e.date), day) } catch { return false } }).length

          return (
            <button
              key={dateStr}
              onClick={() => setSelected(sel ? null : dateStr)}
              className={`flex flex-col items-center py-1.5 rounded-2xl transition-all text-sm font-medium
                ${!inMonth ? 'opacity-30' : ''}
                ${today && !sel ? 'bg-gray-900 text-white' : ''}
                ${sel ? 'bg-pastel-purple text-pastel-purple-text' : ''}
                ${!today && !sel && inMonth ? 'hover:bg-cream-dark text-gray-700' : ''}
              `}
            >
              {format(day, 'd')}
              {dotCount > 0 && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${today && !sel ? 'bg-gray-400' : sel ? 'bg-pastel-purple-text' : 'bg-gray-400'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="mx-4 mt-4 bg-white rounded-3xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">
              {format(new Date(selected), 'EEEE, MMMM d')}
            </h3>
            <button
              onClick={() => setModal({ date: selected })}
              className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-xl"
            >
              + Add
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-gray-400 text-sm">No events this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map(ev => (
                <li
                  key={ev.id}
                  onClick={() => setEditEvent(ev)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-cream-dark rounded-xl px-2 py-1.5"
                >
                  <span className="text-xs font-mono text-gray-400 w-12 flex-shrink-0">{ev.time}</span>
                  <span className="flex-1 text-sm text-gray-800 truncate">{ev.title}</span>
                  {ev.tag && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tagColor(ev.tag)}`}>
                      {ev.tag}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
