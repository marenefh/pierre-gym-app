import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, X, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../../store/appStore'

function uid() { return Math.random().toString(36).slice(2) }

const CALORIE_GOAL = 1800

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack']

const NUTRIENT_CONFIG = [
  { key: 'protein',         label: 'Protein',           color: '#FFADAD' },
  { key: 'carbs',           label: 'Carbs',             color: '#FDFFB6' },
  { key: 'fat',             label: 'Fat',               color: '#CAFFBF' },
  { key: 'sugar',           label: 'Sugar',             color: '#9BF6FF' },
  { key: 'fiber',           label: 'Fiber',             color: '#BDB2FF' },
  { key: 'vitaminsMinerals',label: 'Vitamins / Min.',   color: '#FFC6FF' },
]

function MacroPie({ totals }) {
  const { protein, carbs, fat } = totals
  const total = protein + carbs + fat
  const cx = 40, cy = 40, r = 30
  const C = 2 * Math.PI * r

  const pieSegs = [
    { v: protein, color: '#60a5fa' },
    { v: carbs,   color: '#a78bfa' },
    { v: fat,     color: '#34d399' },
  ].filter(s => s.v > 0)

  let cumLen = 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <svg width={80} height={80} viewBox="0 0 80 80">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0ede8" strokeWidth={10} />
          {total > 0 && (
            <g transform={`rotate(-90, ${cx}, ${cy})`}>
              {pieSegs.map((seg, i) => {
                const dash = (seg.v / total) * C
                const offset = -cumLen
                cumLen += dash
                return (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={seg.color} strokeWidth={10}
                    strokeDasharray={`${dash} ${C}`}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dasharray 0.4s ease' }}
                  />
                )
              })}
            </g>
          )}
        </svg>
      </div>
      <div className="flex-1 space-y-1.5">
        {NUTRIENT_CONFIG.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-500 flex-1">{label}</span>
            <span className="text-xs font-bold text-gray-900">{Math.round((totals[key] || 0) * 10) / 10}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CalorieTracker() {
  const [foodLog, setFoodLog] = useLocalStorage(STORAGE_KEYS.FOOD_LOG, {})
  const [calorieGoal] = useLocalStorage(STORAGE_KEYS.CALORIE_GOAL, CALORIE_GOAL)
  const [recipes] = useLocalStorage(STORAGE_KEYS.RECIPES, [])
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [logOpen, setLogOpen] = useState(false)
  const [logCategory, setLogCategory] = useState(null)

  const dayLog = foodLog[date] || []

  const totals = NUTRIENT_CONFIG.reduce((acc, { key }) => {
    acc[key] = Math.round(dayLog.reduce((s, i) => s + (i[key] || 0), 0) * 10) / 10
    return acc
  }, {})
  const totalCals = Math.round(dayLog.reduce((s, i) => s + i.calories, 0))

  const progress = Math.min((totalCals / calorieGoal) * 100, 100)
  const over = totalCals > calorieGoal

  const openLog = () => { setLogOpen(true); setLogCategory(null) }
  const closeLog = () => { setLogOpen(false); setLogCategory(null) }

  const addFromRecipe = (recipe) => {
    const nut = recipe.nutrients || {}
    const entry = {
      id: uid(),
      name: recipe.name,
      calories: recipe.calories || 0,
      protein: nut.protein || 0,
      carbs: nut.carbs || 0,
      fat: nut.fat || 0,
      sugar: nut.sugar || 0,
      fiber: nut.fiber || 0,
      vitaminsMinerals: nut.vitaminsMinerals || 0,
      source: 'recipe',
    }
    setFoodLog(prev => ({ ...prev, [date]: [...(prev[date] || []), entry] }))
    closeLog()
  }

  const removeEntry = (id) =>
    setFoodLog(prev => ({ ...prev, [date]: (prev[date] || []).filter(i => i.id !== id) }))

  const shiftDate = (d) => {
    const dt = parseISO(date)
    dt.setDate(dt.getDate() + d)
    setDate(format(dt, 'yyyy-MM-dd'))
  }

  const categoryRecipes = logCategory ? recipes.filter(r => r.tags.includes(logCategory)) : []

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3">
        {/* Date nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => shiftDate(-1)} className="p-2 rounded-xl hover:bg-cream-dark"><ChevronLeft size={16} className="text-gray-600" /></button>
          <span className="text-sm font-semibold text-gray-900">
            {date === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(parseISO(date), 'EEE, MMM d')}
          </span>
          <button onClick={() => shiftDate(1)} className="p-2 rounded-xl hover:bg-cream-dark"><ChevronRight size={16} className="text-gray-600" /></button>
        </div>

        {/* Calorie + progress bar card */}
        <div className={`rounded-3xl p-4 mb-3 ${over ? 'bg-pastel-pink' : 'bg-gray-900'}`}>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className={`text-3xl font-bold ${over ? 'text-pastel-pink-text' : 'text-white'}`}>{totalCals}</p>
              <p className={`text-xs ${over ? 'text-pastel-pink-text opacity-70' : 'text-gray-400'}`}>of {calorieGoal} kcal goal</p>
            </div>
            <div className={`text-right ${over ? 'text-pastel-pink-text' : 'text-gray-400'}`}>
              <p className="text-sm font-semibold">{over ? `+${totalCals - calorieGoal}` : calorieGoal - totalCals} kcal</p>
              <p className="text-xs">{over ? 'over' : 'remaining'}</p>
            </div>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${over ? 'bg-pastel-pink-text/20' : 'bg-white/10'}`}>
            <div className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-pastel-pink-text' : 'bg-white'}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Nutrient breakdown card */}
        <div className="bg-white rounded-3xl p-4 shadow-card mb-4">
          <MacroPie totals={totals} />
        </div>

        {/* Log food button */}
        <button onClick={openLog}
          className="w-full flex items-center gap-2 bg-white rounded-2xl p-3.5 shadow-card text-left mb-3 hover:bg-cream-dark transition-colors">
          <Plus size={15} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-400">Log food…</span>
        </button>

        {/* Food log */}
        <div className="space-y-1.5">
          {dayLog.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Nothing logged yet today.</p>
          ) : (
            dayLog.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-card">
                <Flame size={14} className="text-pastel-pink-text flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{entry.name}</p>
                  <p className="text-xs text-gray-400">
                    P {entry.protein || 0}g · C {entry.carbs || 0}g · F {entry.fat || 0}g
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">{entry.calories}</span>
                <button onClick={() => removeEntry(entry.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0 p-0.5"><X size={13} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log food modal */}
      {logOpen && (
        <div className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeLog() }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 space-y-3"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px),24px)' }}>

            <div className="flex items-center justify-between">
              {logCategory ? (
                <button onClick={() => setLogCategory(null)} className="flex items-center gap-1 text-gray-500 text-sm">
                  <ChevronLeft size={14} /> Back
                </button>
              ) : (
                <h3 className="font-semibold text-gray-900 text-base">What did you eat?</h3>
              )}
              <button onClick={closeLog} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500"><X size={16} /></button>
            </div>

            {!logCategory ? (
              <div className="grid grid-cols-2 gap-3">
                {MEAL_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setLogCategory(cat)}
                    className="py-5 rounded-2xl bg-cream-dark text-gray-800 text-sm font-semibold capitalize hover:bg-gray-100 transition-colors">
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 capitalize">{logCategory}</p>
                {categoryRecipes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No {logCategory} recipes yet.<br />
                    <span className="text-xs">Add some in the Recipes tab first.</span>
                  </p>
                ) : (
                  <ul className="space-y-1.5 max-h-80 overflow-y-auto">
                    {categoryRecipes.map(r => (
                      <button key={r.id} onClick={() => addFromRecipe(r)}
                        className="w-full flex items-center justify-between bg-cream-dark rounded-2xl px-4 py-3 text-left hover:bg-gray-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium truncate">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.calories} kcal
                            {r.nutrients?.protein > 0 ? ` · P ${r.nutrients.protein}g` : ''}
                            {r.nutrients?.carbs > 0 ? ` · C ${r.nutrients.carbs}g` : ''}
                            {r.nutrients?.fat > 0 ? ` · F ${r.nutrients.fat}g` : ''}
                          </p>
                        </div>
                        <Plus size={15} className="text-gray-400 flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
