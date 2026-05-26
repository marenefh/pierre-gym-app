import { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Link, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../../store/appStore'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEALS = ['breakfast', 'lunch', 'dinner']

function weekKey(date) {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

function buildCalendarEvent(date, mealType, recipe, portions) {
  const timeMap = { breakfast: '08:00', lunch: '12:00', dinner: '18:30' }
  const emojiMap = { breakfast: '🥣', lunch: '🥗', dinner: '🍽️' }
  return {
    id: `mealprep-${date}-${mealType}`,
    date,
    time: timeMap[mealType] || '12:00',
    title: `${emojiMap[mealType] || '🍴'} ${recipe.name} (${portions} portion${portions > 1 ? 's' : ''})`,
    tag: 'personal',
    notes: `From Meal Prep Plan`,
  }
}

export default function MealPrepPlan() {
  const [weekBase, setWeekBase] = useState(new Date())
  const [plan, setPlan] = useLocalStorage(STORAGE_KEYS.MEAL_PREP_PLAN, {})
  const [recipes] = useLocalStorage(STORAGE_KEYS.RECIPES, [])
  const [events, setEvents] = useLocalStorage(STORAGE_KEYS.EVENTS, [])
  const [picker, setPicker] = useState(null) // { dayIdx, meal }

  const wk = weekKey(weekBase)
  const weekPlan = plan[wk] || {}
  const monday = startOfWeek(weekBase, { weekStartsOn: 1 })

  const getDate = (di) => format(addDays(monday, di), 'yyyy-MM-dd')

  const setSlot = (dayIdx, meal, recipeId, portions = 1) => {
    const date = getDate(dayIdx)
    const recipe = recipes.find(r => r.id === recipeId)
    const newPlan = {
      ...plan,
      [wk]: {
        ...weekPlan,
        [dayIdx]: {
          ...(weekPlan[dayIdx] || {}),
          [meal]: recipeId ? { recipeId, portions } : null,
        }
      }
    }
    setPlan(newPlan)

    // Sync to calendar
    if (recipe && recipeId) {
      const ev = buildCalendarEvent(date, meal, recipe, portions)
      setEvents(prev => {
        const without = prev.filter(e => e.id !== ev.id)
        return [...without, ev]
      })
    } else {
      const evId = `mealprep-${date}-${meal}`
      setEvents(prev => prev.filter(e => e.id !== evId))
    }
    setPicker(null)
  }

  const clearSlot = (dayIdx, meal) => setSlot(dayIdx, meal, null)

  const updatePortions = (dayIdx, meal, portions) => {
    const date = getDate(dayIdx)
    const slot = weekPlan[dayIdx]?.[meal]
    if (!slot) return
    const recipe = recipes.find(r => r.id === slot.recipeId)
    const newPlan = {
      ...plan,
      [wk]: { ...weekPlan, [dayIdx]: { ...(weekPlan[dayIdx] || {}), [meal]: { ...slot, portions } } }
    }
    setPlan(newPlan)
    if (recipe) {
      const ev = buildCalendarEvent(date, meal, recipe, portions)
      setEvents(prev => [...prev.filter(e => e.id !== ev.id), ev])
    }
  }

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Week nav */}
      <div className="flex items-center justify-between px-4 py-2">
        <button onClick={() => setWeekBase(subWeeks(weekBase, 1))} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {format(monday, 'MMM d')} – {format(addDays(monday, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={() => setWeekBase(addWeeks(weekBase, 1))} className="p-2 rounded-xl hover:bg-cream-dark">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="px-4 space-y-2 pb-4">
        {DAYS.map((day, di) => {
          const daySlots = weekPlan[di] || {}
          return (
            <div key={day} className="bg-white rounded-3xl shadow-card overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{day} {format(addDays(monday, di), 'MMM d')}</span>
              </div>
              {MEALS.map(meal => {
                const slot = daySlots[meal]
                const recipe = slot ? recipes.find(r => r.id === slot.recipeId) : null
                return (
                  <div key={meal} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase w-12 flex-shrink-0 capitalize">{meal}</span>
                    {recipe ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-gray-800 truncate flex-1">{recipe.name}</span>
                        <input
                          type="number" min={0.5} max={10} step={0.5}
                          value={slot.portions}
                          onChange={e => updatePortions(di, meal, Number(e.target.value))}
                          className="w-10 bg-cream-dark rounded-lg text-xs text-center py-1 focus:outline-none flex-shrink-0"
                        />
                        <span className="text-xs text-gray-400 flex-shrink-0">× portions</span>
                        <button onClick={() => clearSlot(di, meal)} className="text-gray-300 hover:text-red-400 flex-shrink-0"><X size={13} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPicker({ dayIdx: di, meal })}
                        className="flex-1 text-left text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                      >
                        <Link size={11} /> Assign recipe…
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Recipe picker modal */}
      {picker && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setPicker(null) }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 space-y-3"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px),24px)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-base capitalize">{DAYS[picker.dayIdx]} {picker.meal}</h3>
              <button onClick={() => setPicker(null)} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500"><X size={16} /></button>
            </div>
            {recipes.length === 0 ? (
              <p className="text-gray-400 text-sm">No recipes yet. Add some in the Recipes tab.</p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {recipes.map(r => (
                  <button key={r.id} onClick={() => setSlot(picker.dayIdx, picker.meal, r.id, 1)}
                    className="w-full flex items-center justify-between bg-cream-dark rounded-2xl px-4 py-3 text-left hover:bg-gray-100">
                    <span className="text-sm font-medium text-gray-900">{r.name}</span>
                    <span className="text-xs text-gray-400">{r.calories}kcal / {r.portions} portions</span>
                  </button>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
