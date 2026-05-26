import { useState } from 'react'
import { format, parseISO, getISOWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, JOURNAL_PROMPTS } from '../../store/appStore'

const TODAY = format(new Date(), 'yyyy-MM-dd')

function getPrompt(dateStr) {
  const week = getISOWeek(parseISO(dateStr))
  return JOURNAL_PROMPTS[week % JOURNAL_PROMPTS.length]
}

export default function Journal() {
  const [entries, setEntries] = useLocalStorage(STORAGE_KEYS.JOURNAL_ENTRIES, {})
  const [date, setDate] = useState(TODAY)
  const [showHistory, setShowHistory] = useState(false)

  const isToday = date === TODAY
  const entry = entries[date] || { text: '', prompt: getPrompt(date) }
  const prompt = entry.prompt || getPrompt(date)

  const setText = (text) =>
    setEntries(prev => ({ ...prev, [date]: { ...(prev[date] || {}), text, prompt } }))

  const shiftDate = (d) => {
    const dt = parseISO(date)
    dt.setDate(dt.getDate() + d)
    const next = format(dt, 'yyyy-MM-dd')
    if (next <= TODAY) setDate(next)
  }

  const pastEntries = Object.entries(entries)
    .filter(([d, e]) => d !== date && e.text?.trim())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 20)

  if (showHistory) {
    return (
      <div className="h-full overflow-y-auto tab-content pb-safe">
        <div className="px-4 py-3">
          <button onClick={() => setShowHistory(false)} className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
            <ChevronLeft size={14} /> Back
          </button>
          <h2 className="text-base font-bold text-gray-900 mb-3">Past entries</h2>
          {pastEntries.length === 0 ? (
            <p className="text-gray-400 text-sm">No past entries yet.</p>
          ) : (
            <div className="space-y-3">
              {pastEntries.map(([d, e]) => (
                <button key={d} onClick={() => { setDate(d); setShowHistory(false) }}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-card hover:bg-cream-dark transition-colors">
                  <p className="text-xs font-semibold text-gray-400 mb-1">{format(parseISO(d), 'EEEE, MMMM d yyyy')}</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{e.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col pb-safe">
      {/* Date nav */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {isToday ? 'Today' : format(parseISO(date), 'EEE, MMMM d')}
        </span>
        <button onClick={() => shiftDate(1)} disabled={isToday} className="p-2 rounded-xl hover:bg-cream-dark disabled:opacity-30">
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto tab-content px-4 space-y-3 pb-4">
        {/* Prompt */}
        <div className="bg-pastel-purple rounded-3xl p-4">
          <div className="flex items-start gap-3">
            <BookOpen size={16} className="text-pastel-purple-text mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-pastel-purple-text uppercase tracking-wide mb-1">This week's prompt</p>
              <p className="text-sm text-pastel-purple-text font-medium leading-snug italic">"{prompt}"</p>
            </div>
          </div>
        </div>

        {/* Entry */}
        <div className="bg-white rounded-3xl p-4 shadow-card flex-1">
          <textarea
            value={entry.text}
            onChange={e => setText(e.target.value)}
            placeholder="Write freely…"
            className="w-full min-h-52 text-sm text-gray-800 placeholder-gray-300 bg-transparent resize-none focus:outline-none leading-relaxed"
          />
        </div>

        {/* Past entries link */}
        {pastEntries.length > 0 && (
          <button onClick={() => setShowHistory(true)}
            className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-card text-sm">
            <span className="text-gray-500">Past entries</span>
            <span className="text-gray-400 flex items-center gap-1">{pastEntries.length} <ChevronRight size={14} /></span>
          </button>
        )}
      </div>
    </div>
  )
}
