import { useMemo, useState } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { TrendingUp } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../../store/appStore'
import LineChart from './LineChart'

const MUSCLE_COLORS = {
  Back:        '#F09EA7',
  Biceps:      '#F6CA94',
  Triceps:     '#F6CA94',
  Shoulders:   '#D4C97A',
  Chest:       '#D4C97A',
  Core:        '#7DC97B',
  'Full Body': '#8A8EE8',
  Glutes:      '#E89AE4',
  Hamstrings:  '#E89AE4',
  Quads:       '#E89AE4',
}

const ORDERED_GROUPS = ['Back', 'Biceps', 'Triceps', 'Shoulders', 'Chest', 'Core', 'Full Body', 'Glutes', 'Hamstrings', 'Quads']

export default function FitnessProgress() {
  const [log] = useLocalStorage(STORAGE_KEYS.WORKOUT_LOG, [])
  const [view, setView] = useState('current') // 'current' | 'alltime'

  const { grouped, stagnant, inactive } = useMemo(() => {
    const exMap = {}
    const sortedLog = [...log].sort((a, b) => a.date.localeCompare(b.date))

    sortedLog.forEach(session => {
      session.exercises?.forEach(ex => {
        const key = ex.name
        if (!exMap[key]) exMap[key] = { name: key, muscleGroup: ex.muscleGroup, entries: [] }
        const maxW = Math.max(...ex.sets.map(s => s.weight || 0))
        const existing = exMap[key].entries.find(e => e.date === session.date)
        if (!existing) {
          exMap[key].entries.push({ date: session.date, weight: maxW, label: format(parseISO(session.date), 'dd/MM') })
        } else {
          existing.weight = Math.max(existing.weight, maxW)
        }
      })
    })

    const grouped = {}
    Object.values(exMap).forEach(ex => {
      if (!grouped[ex.muscleGroup]) grouped[ex.muscleGroup] = []
      grouped[ex.muscleGroup].push(ex)
    })

    const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd')

    const inactive = new Set()
    Object.values(exMap).forEach(ex => {
      const lastDate = ex.entries[ex.entries.length - 1]?.date
      if (lastDate && lastDate < twoWeeksAgo) inactive.add(ex.name)
    })

    const stagnant = new Set()
    Object.values(exMap).forEach(ex => {
      if (inactive.has(ex.name)) return
      if (ex.entries.length < 5) return
      const last5 = ex.entries.slice(-5)
      const weights = last5.map(e => e.weight)
      if (weights[0] > 0 && weights.every(w => w === weights[0])) stagnant.add(ex.name)
    })

    return { grouped, stagnant, inactive }
  }, [log])

  // For Current: filter to only exercises active in last 14 days
  const visibleGrouped = useMemo(() => {
    if (view === 'alltime') return grouped
    const filtered = {}
    Object.entries(grouped).forEach(([group, exercises]) => {
      const active = exercises.filter(ex => !inactive.has(ex.name))
      if (active.length > 0) filtered[group] = active
    })
    return filtered
  }, [grouped, inactive, view])

  const orderedGroups = ORDERED_GROUPS.filter(g => visibleGrouped[g])
  const otherGroups = Object.keys(visibleGrouped).filter(g => !ORDERED_GROUPS.includes(g)).sort()
  const muscleGroups = [...orderedGroups, ...otherGroups]

  const isEmpty = muscleGroups.length === 0

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Tab bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex bg-cream-dark rounded-2xl p-1">
          {['current', 'alltime'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                view === v ? 'bg-white text-gray-900 shadow-card' : 'text-gray-400'
              }`}
            >
              {v === 'current' ? 'Current' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 px-8 text-center py-20">
          <TrendingUp size={40} className="text-gray-200" />
          <p className="text-gray-400 text-sm">
            {view === 'current'
              ? 'No exercises logged in the last 14 days. Switch to All Time or log a session.'
              : 'No workout data yet. Log your first session to start tracking progress.'}
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-4">
          {view === 'current' && (
            <p className="text-xs text-gray-400 px-1">Showing exercises logged in the last 14 days.</p>
          )}
          {muscleGroups.map(group => (
            <div key={group}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">{group}</h3>
              <div className="space-y-2">
                {visibleGrouped[group].map(ex => {
                  const isInactive = inactive.has(ex.name)
                  const showInactiveLabel = view === 'alltime' && isInactive
                  const showStagnant = view === 'current' && stagnant.has(ex.name)
                  const color = MUSCLE_COLORS[ex.muscleGroup] || '#888'
                  const points = ex.entries.map(e => ({ y: e.weight, label: e.label }))
                  return (
                    <div key={ex.name} className="bg-white rounded-2xl p-4 shadow-card">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">{ex.name}</p>
                        {showStagnant && (
                          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Time to level up?
                          </span>
                        )}
                        {showInactiveLabel && (
                          <span className="text-[10px] font-medium text-gray-900">not active</span>
                        )}
                      </div>
                      <LineChart points={points} color={color} height={80} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
