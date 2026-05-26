import { useState, useMemo } from 'react'
import { format, addDays, startOfISOWeek } from 'date-fns'
import { X, ChevronRight, Check, Moon, Sparkles } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_SLEEP_TARGET } from '../store/appStore'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STEPS = 5

function uid() { return Math.random().toString(36).slice(2) }

export default function WeeklyReset({ onClose }) {
  const [step, setStep] = useState(1)

  // Step 1 — reflection
  const [reflection, setReflection] = useState('')

  // Step 2 — todos carry-forward
  const [todos, setTodos] = useLocalStorage(STORAGE_KEYS.TODOS, [])
  const pending = todos.filter(t => !t.done)
  const [carry, setCarry] = useState(() => pending.map(t => t.id))

  // Step 3 — meal prep preview
  const [mealPlan] = useLocalStorage(STORAGE_KEYS.MEAL_PREP_PLAN, {})
  const [recipes] = useLocalStorage(STORAGE_KEYS.RECIPES, [])
  const nextWeekStart = startOfISOWeek(addDays(new Date(), 7))
  const nextWeekKey = format(nextWeekStart, "yyyy-'W'II")

  // Step 4 — intentions
  const [intentions, setIntentions] = useState(['', '', ''])
  const [weeklyGoals, setWeeklyGoals] = useLocalStorage(STORAGE_KEYS.WEEKLY_GOALS, {})
  const [weeklyReset, setWeeklyReset] = useLocalStorage(STORAGE_KEYS.WEEKLY_RESET, {})

  // Step 5 — closing
  const [sleepTarget] = useLocalStorage(STORAGE_KEYS.SLEEP_TARGET, DEFAULT_SLEEP_TARGET)
  const sleepTimeStr = `${String(sleepTarget.hour).padStart(2, '0')}:${String(sleepTarget.minute).padStart(2, '0')}`

  const toggleCarry = (id) =>
    setCarry(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleNext = () => {
    if (step === 2) {
      // Archive todos not carried forward
      setTodos(prev =>
        prev.filter(t => t.done || carry.includes(t.id))
      )
    }
    if (step === 4) {
      // Save intentions
      const now = new Date()
      const weekKey = format(startOfISOWeek(now), "yyyy-'W'II")
      const filled = intentions.filter(i => i.trim())
      setWeeklyGoals(prev => ({ ...prev, [weekKey]: filled }))
      setWeeklyReset(prev => ({ ...prev, [weekKey]: { done: true, date: now.toISOString() } }))
    }
    if (step < STEPS) setStep(s => s + 1)
    else onClose()
  }

  const nextWeekMeals = useMemo(() => {
    const result = []
    DAYS.forEach((day, i) => {
      const dateStr = format(addDays(nextWeekStart, i), 'yyyy-MM-dd')
      const recipeId = mealPlan[dateStr]
      if (recipeId) {
        const recipe = recipes.find(r => r.id === recipeId)
        if (recipe) result.push({ day, name: recipe.name, kcal: recipe.calories })
      }
    })
    return result
  }, [mealPlan, recipes])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream" style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: STEPS }).map((_, i) => (
              <div key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-gray-900 w-6' : 'bg-gray-200 w-3'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">{step}/{STEPS}</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-dark text-gray-500">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2">

        {/* Step 1: Reflection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Weekly reflection</h2>
              <p className="text-gray-400 text-sm mt-1">Take a moment to look back at your week.</p>
            </div>
            <div className="bg-pastel-purple rounded-3xl p-4">
              <p className="text-pastel-purple-text text-sm font-medium italic leading-relaxed">
                "What did this week teach me about what I need?"
              </p>
            </div>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              rows={7}
              placeholder="Write freely — no pressure to be perfect…"
              className="w-full bg-white rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none shadow-card"
            />
          </div>
        )}

        {/* Step 2: Todos */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Carry forward</h2>
              <p className="text-gray-400 text-sm mt-1">Which tasks do you want to keep for next week?</p>
            </div>
            {pending.length === 0 ? (
              <div className="bg-white rounded-3xl p-5 shadow-card text-center">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-sm font-medium text-gray-700">You finished everything!</p>
                <p className="text-xs text-gray-400 mt-1">Your to-do list is clear.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-card divide-y divide-cream-dark overflow-hidden">
                {pending.map(t => (
                  <button key={t.id} onClick={() => toggleCarry(t.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream-dark transition-colors">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${carry.includes(t.id) ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                      {carry.includes(t.id) && <Check size={11} strokeWidth={3} className="text-white" />}
                    </div>
                    <span className="text-sm text-gray-800 flex-1">{t.text}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 text-center">
              Unchecked tasks will be removed · {carry.length} tasks kept
            </p>
          </div>
        )}

        {/* Step 3: Meal prep preview */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Next week's meals</h2>
              <p className="text-gray-400 text-sm mt-1">Here's what's planned in your meal prep.</p>
            </div>
            {nextWeekMeals.length === 0 ? (
              <div className="bg-white rounded-3xl p-5 shadow-card text-center">
                <p className="text-2xl mb-2">🥗</p>
                <p className="text-sm font-medium text-gray-700">No meals planned yet</p>
                <p className="text-xs text-gray-400 mt-1">Add meals in the Food → Meal Prep tab</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-card divide-y divide-cream-dark overflow-hidden">
                {nextWeekMeals.map(({ day, name, kcal }) => (
                  <div key={day} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-8">{day}</span>
                      <span className="text-sm text-gray-800">{name}</span>
                    </div>
                    {kcal > 0 && <span className="text-xs text-gray-400">{kcal} kcal</span>}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 text-center">
              Week of {format(nextWeekStart, 'MMM d')}
            </p>
          </div>
        )}

        {/* Step 4: Intentions */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">Set intentions</h2>
              <p className="text-gray-400 text-sm mt-1">3 intentions for the week ahead.</p>
            </div>
            <div className="space-y-2.5">
              {intentions.map((val, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-2xl px-4 shadow-card">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <input
                    value={val}
                    onChange={e => setIntentions(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                    placeholder={`Intention ${i + 1}…`}
                    className="flex-1 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Closing */}
        {step === 5 && (
          <div className="flex flex-col items-center text-center space-y-5 py-8">
            <div className="w-20 h-20 bg-pastel-purple rounded-3xl flex items-center justify-center">
              <Moon size={36} className="text-pastel-purple-text" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All done ✨</h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                You've set your intentions and cleared the decks. Rest well — tomorrow begins a fresh week.
              </p>
            </div>
            <div className="bg-gray-900 text-white rounded-3xl px-6 py-4 w-full max-w-xs">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tonight's bedtime</p>
              <p className="text-3xl font-bold">{sleepTimeStr}</p>
              <p className="text-xs text-gray-500 mt-0.5">{sleepTarget.sleepHours || 8}h of sleep</p>
            </div>
            {intentions.filter(i => i.trim()).length > 0 && (
              <div className="bg-pastel-purple rounded-3xl p-4 w-full max-w-xs text-left">
                <p className="text-xs font-bold text-pastel-purple-text uppercase tracking-wide mb-2">Next week's focus</p>
                <ul className="space-y-1">
                  {intentions.filter(i => i.trim()).map((goal, i) => (
                    <li key={i} className="text-sm text-pastel-purple-text flex items-start gap-2">
                      <span className="mt-0.5">·</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer button */}
      <div className="px-4 py-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px),16px)' }}>
        <button onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2">
          {step < STEPS ? (
            <>Continue <ChevronRight size={16} /></>
          ) : (
            <>Close & sleep well <Moon size={16} /></>
          )}
        </button>
      </div>
    </div>
  )
}
