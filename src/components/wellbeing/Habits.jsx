import { format, parseISO, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Droplets, Pill, StretchHorizontal, Footprints, Sun, Dumbbell, Heart, Flame } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useAppContext } from '../../context/AppContext'
import { STORAGE_KEYS, DEFAULT_HABITS_CONFIG, MOOD_LABELS, ENERGY_LABELS } from '../../store/appStore'

const TODAY = format(new Date(), 'yyyy-MM-dd')

const HABIT_PALETTE = [
  { Icon: Pill,              color: 'text-pastel-pink-text',   bg: 'bg-pastel-pink'   },
  { Icon: StretchHorizontal, color: 'text-pastel-green-text',  bg: 'bg-pastel-green'  },
  { Icon: Sun,               color: 'text-pastel-yellow-text', bg: 'bg-pastel-yellow' },
  { Icon: Dumbbell,          color: 'text-pastel-blue-text',   bg: 'bg-pastel-blue'   },
  { Icon: Heart,             color: 'text-pastel-purple-text', bg: 'bg-pastel-purple' },
  { Icon: Flame,             color: 'text-pastel-coral-text',  bg: 'bg-pastel-coral'  },
]

export default function Habits() {
  const { settings } = useAppContext()
  const [habitsLog, setHabitsLog] = useLocalStorage(STORAGE_KEYS.HABITS_LOG, {})
  const [habitsConfig] = useLocalStorage(STORAGE_KEYS.HABITS_CONFIG, DEFAULT_HABITS_CONFIG)
  const [date, setDate] = useState(TODAY)

  const waterGoal = settings.waterGoalMl || 2000
  const stepsGoal = settings.stepsGoal || 10000

  const dayOfWeek = getDay(parseISO(date))
  const todayHabits = habitsConfig.filter(h => !h.days || h.days.length === 0 || h.days.includes(dayOfWeek))

  const day = habitsLog[date] || { water: 0, steps: 0, mood: 0, energy: 0 }

  const set = (key, value) =>
    setHabitsLog(prev => ({ ...prev, [date]: { ...(prev[date] || {}), [key]: value } }))

  const shiftDate = (d) => {
    const dt = parseISO(date)
    dt.setDate(dt.getDate() + d)
    const next = format(dt, 'yyyy-MM-dd')
    if (next <= TODAY) setDate(next)
  }

  const isToday = date === TODAY
  const waterPct = Math.min((day.water / waterGoal) * 100, 100)

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Date nav */}
      <div className="flex items-center justify-between px-4 py-2">
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

      <div className="px-4 space-y-3 pb-4">

        {/* Water */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={18} className="text-pastel-blue-text" />
              <span className="text-sm font-semibold text-gray-900">Water</span>
            </div>
            <span className="text-sm font-bold text-pastel-blue-text">{day.water}ml / {waterGoal}ml</span>
          </div>
          <div className="h-3 bg-cream-dark rounded-full overflow-hidden mb-3">
            <div className="h-full bg-pastel-blue-text rounded-full transition-all duration-300" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[250, 500].map(amt => (
              <button key={amt}
                onClick={() => set('water', Math.min(day.water + amt, waterGoal))}
                className="flex-1 py-2 bg-pastel-blue text-pastel-blue-text text-xs font-semibold rounded-xl">
                +{amt}ml
              </button>
            ))}
            <button onClick={() => set('water', 0)} className="py-2 px-3 bg-cream-dark text-gray-500 text-xs rounded-xl">Reset</button>
          </div>
          {day.water >= waterGoal && <p className="text-xs text-pastel-green-text font-semibold mt-2 text-center">Goal reached! 💧</p>}
        </div>

        {/* Dynamic habit checkboxes */}
        {todayHabits.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-card space-y-3">
            {todayHabits.map((habit, idx) => {
              const { Icon, color, bg } = HABIT_PALETTE[idx % HABIT_PALETTE.length]
              const checked = !!day[habit.id]
              return (
                <button key={habit.id} onClick={() => set(habit.id, !checked)}
                  className="w-full flex items-center gap-3">
                  <span className={`flex items-center justify-center w-9 h-9 rounded-2xl flex-shrink-0 ${checked ? bg : 'bg-cream-dark'}`}>
                    <span className={checked ? color : 'text-gray-400'}>
                      <Icon size={16} />
                    </span>
                  </span>
                  <span className={`flex-1 text-sm font-medium text-left ${checked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {habit.name}
                  </span>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                    {checked && <span className="text-white text-[10px] font-bold">✓</span>}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Steps */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Footprints size={16} className="text-pastel-yellow-text" />
            <span className="text-sm font-semibold text-gray-900">Steps</span>
            <span className="ml-auto text-xs text-gray-400">Goal: {stepsGoal.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number" min={0} max={99999}
              value={day.steps || ''}
              onChange={e => set('steps', Number(e.target.value))}
              placeholder="0"
              className="flex-1 bg-cream-dark rounded-2xl px-4 py-3 text-2xl font-bold text-gray-900 text-center focus:outline-none"
            />
          </div>
          {day.steps >= stepsGoal && <p className="text-xs text-pastel-green-text font-semibold mt-2 text-center">Goal reached! 🚶</p>}
          {day.steps > 0 && day.steps < stepsGoal && (
            <p className="text-xs text-gray-400 text-center mt-1">{(stepsGoal - day.steps).toLocaleString()} to go</p>
          )}
        </div>

        {/* Mood */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <p className="text-sm font-semibold text-gray-900 mb-3">Mood</p>
          <div className="flex justify-between">
            {MOOD_LABELS.map((sym, i) => (
              <button key={i} onClick={() => set('mood', i + 1)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all ${day.mood === i + 1 ? 'bg-pastel-purple' : 'hover:bg-cream-dark'}`}>
                <span className={`leading-none transition-transform select-none ${day.mood === i + 1 ? 'scale-125' : ''} ${day.mood === i + 1 ? 'text-pastel-purple-text' : 'text-gray-500'}`}
                  style={{ fontSize: i === 4 ? '1.4rem' : '1.25rem' }}>{sym}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="bg-white rounded-3xl p-4 shadow-card">
          <p className="text-sm font-semibold text-gray-900 mb-3">Energy</p>
          <div className="flex justify-between">
            {ENERGY_LABELS.map((sym, i) => (
              <button key={i} onClick={() => set('energy', i + 1)}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all ${day.energy === i + 1 ? 'bg-pastel-yellow' : 'hover:bg-cream-dark'}`}>
                <span className={`leading-none transition-transform select-none ${day.energy === i + 1 ? 'scale-125' : ''} ${day.energy === i + 1 ? 'text-pastel-yellow-text' : 'text-gray-500'}`}
                  style={{ fontSize: i === 4 ? '1.4rem' : '1.25rem' }}>{sym}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
