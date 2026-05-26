import { useState } from 'react'
import { Plus, X, ChevronRight, Trash2, Clock, Users, Flame } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, RECIPE_TAGS, UNITS } from '../../store/appStore'

function uid() { return Math.random().toString(36).slice(2) }

const BLANK_NUTRIENTS = { protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0, vitaminsMinerals: 0 }

const BLANK_RECIPE = {
  name: '', tags: [], prepTime: 30, portions: 2, calories: 0,
  ingredients: [], instructions: '',
  nutrients: { ...BLANK_NUTRIENTS },
}

const CATEGORY_FILTERS = [
  { id: 'all',       label: 'All'       },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch',     label: 'Lunch'     },
  { id: 'dinner',    label: 'Dinner'    },
  { id: 'snack',     label: 'Snacks'    },
]

const NUTRIENT_FIELDS = [
  { key: 'protein',         label: 'Protein',            unit: 'g' },
  { key: 'carbs',           label: 'Carbs',              unit: 'g' },
  { key: 'fat',             label: 'Fat',                unit: 'g' },
  { key: 'sugar',           label: 'Sugar',              unit: 'g' },
  { key: 'fiber',           label: 'Fiber',              unit: 'g' },
  { key: 'vitaminsMinerals',label: 'Vitamins / Minerals',unit: 'g' },
]

export default function Recipes() {
  const [recipes, setRecipes] = useLocalStorage(STORAGE_KEYS.RECIPES, [])
  const [view, setView] = useState('list') // list | detail | edit
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState(null)
  const [filter, setFilter] = useState('all')

  const openNew = () => { setDraft({ ...BLANK_RECIPE, id: uid(), nutrients: { ...BLANK_NUTRIENTS } }); setView('edit') }
  const openEdit = (r) => { setDraft({ ...r, nutrients: r.nutrients || { ...BLANK_NUTRIENTS } }); setView('edit') }
  const openDetail = (r) => { setSelected(r); setView('detail') }

  const save = () => {
    if (!draft.name.trim()) return
    const r = { ...draft, name: draft.name.trim() }
    setRecipes(prev => prev.find(x => x.id === r.id) ? prev.map(x => x.id === r.id ? r : x) : [...prev, r])
    setSelected(r)
    setView('detail')
  }

  const del = (id) => {
    setRecipes(prev => prev.filter(x => x.id !== id))
    setView('list')
  }

  const addIngredient = () =>
    setDraft(d => ({ ...d, ingredients: [...d.ingredients, { id: uid(), name: '', quantity: '', unit: 'g', calories: 0 }] }))

  const updIngredient = (id, patch) =>
    setDraft(d => ({ ...d, ingredients: d.ingredients.map(i => i.id === id ? { ...i, ...patch } : i) }))

  const delIngredient = (id) =>
    setDraft(d => ({ ...d, ingredients: d.ingredients.filter(i => i.id !== id) }))

  const setNutrient = (key, val) =>
    setDraft(d => ({ ...d, nutrients: { ...(d.nutrients || BLANK_NUTRIENTS), [key]: Number(val) } }))

  const toggleTag = (tag) =>
    setDraft(d => ({ ...d, tags: d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag] }))

  // --- EDIT VIEW ---
  if (view === 'edit' && draft) {
    const nutrients = draft.nutrients || BLANK_NUTRIENTS
    return (
      <div className="h-full overflow-y-auto tab-content pb-safe">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView(selected ? 'detail' : 'list')} className="text-gray-400 text-sm flex items-center gap-1"><ChevronRight size={14} className="rotate-180" /> Back</button>
            {draft.id && recipes.find(x => x.id === draft.id) && (
              <button onClick={() => del(draft.id)} className="text-red-400 p-1.5 rounded-xl hover:bg-red-50"><Trash2 size={16} /></button>
            )}
          </div>

          <div className="space-y-3">
            <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="Recipe name" className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none font-semibold text-base" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {RECIPE_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                    ${draft.tags.includes(tag) ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {tag}
                </button>
              ))}
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-3 gap-2">
              {[['Prep (min)', 'prepTime'], ['Portions', 'portions']].map(([label, key]) => (
                <div key={key} className="bg-white rounded-2xl p-3 shadow-card col-span-1">
                  <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                  <input type="number" min={0} value={draft[key]}
                    onChange={e => setDraft(d => ({ ...d, [key]: Number(e.target.value) }))}
                    className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none" />
                </div>
              ))}
              <div className="bg-white rounded-2xl p-3 shadow-card col-span-1">
                <p className="text-[10px] text-gray-400 mb-1">Calories</p>
                <input type="number" min={0} value={draft.calories}
                  onChange={e => setDraft(d => ({ ...d, calories: Number(e.target.value) }))}
                  className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none" />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ingredients</p>
              <div className="space-y-2">
                {draft.ingredients.map(ing => (
                  <div key={ing.id} className="bg-white rounded-2xl p-3 shadow-card">
                    <div className="flex gap-2 items-start">
                      <input value={ing.name} onChange={e => updIngredient(ing.id, { name: e.target.value })}
                        placeholder="Name" className="flex-1 bg-cream-dark rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none min-w-0" />
                      <button onClick={() => delIngredient(ing.id)} className="text-gray-300 hover:text-red-400 p-1 flex-shrink-0 mt-1"><X size={12} /></button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input value={ing.quantity} onChange={e => updIngredient(ing.id, { quantity: e.target.value })}
                        placeholder="Qty" className="w-16 bg-cream-dark rounded-xl px-2 py-1.5 text-xs text-gray-800 focus:outline-none text-center" />
                      <select value={ing.unit} onChange={e => updIngredient(ing.id, { unit: e.target.value })}
                        className="flex-1 bg-cream-dark rounded-xl px-2 py-1.5 text-xs text-gray-800 focus:outline-none">
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                      <input type="number" value={ing.calories} onChange={e => updIngredient(ing.id, { calories: Number(e.target.value) })}
                        placeholder="kcal" className="w-16 bg-cream-dark rounded-xl px-2 py-1.5 text-xs text-gray-800 focus:outline-none text-center" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addIngredient}
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-xs font-medium">
                <Plus size={13} /> Add ingredient
              </button>
            </div>

            {/* Nutrients */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Nutrients <span className="normal-case font-normal">(per portion)</span></p>
              <div className="grid grid-cols-2 gap-2">
                {NUTRIENT_FIELDS.map(({ key, label, unit }) => (
                  <div key={key} className="bg-white rounded-2xl p-3 shadow-card">
                    <p className="text-[10px] text-gray-400 mb-1">{label} ({unit})</p>
                    <input
                      type="number" min={0} step="0.01"
                      value={nutrients[key] || 0}
                      onChange={e => setNutrient(key, e.target.value)}
                      className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Instructions</p>
              <textarea value={draft.instructions} onChange={e => setDraft(d => ({ ...d, instructions: e.target.value }))}
                placeholder="Step-by-step instructions…" rows={5}
                className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none" />
            </div>

            <button onClick={save}
              className="w-full bg-gray-900 text-white py-3 rounded-2xl text-sm font-semibold">
              Save Recipe
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- DETAIL VIEW ---
  if (view === 'detail' && selected) {
    const r = recipes.find(x => x.id === selected.id) || selected
    const nut = r.nutrients || {}
    const hasNutrients = NUTRIENT_FIELDS.some(f => nut[f.key] > 0)
    return (
      <div className="h-full overflow-y-auto tab-content pb-safe">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setView('list')} className="text-gray-400 text-sm flex items-center gap-1"><ChevronRight size={14} className="rotate-180" /> All recipes</button>
            <button onClick={() => openEdit(r)} className="text-xs font-medium bg-cream-dark text-gray-600 px-3 py-1.5 rounded-xl">Edit</button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{r.name}</h2>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {r.tags.map(t => <span key={t} className="text-[10px] font-medium bg-pastel-purple text-pastel-purple-text px-2 py-0.5 rounded-full capitalize">{t}</span>)}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Stat icon={<Clock size={14} />} label="Prep" value={`${r.prepTime}m`} />
            <Stat icon={<Users size={14} />} label="Serves" value={r.portions} />
            <Stat icon={<Flame size={14} />} label="kcal" value={r.calories} color="text-pastel-pink-text" bg="bg-pastel-pink" />
          </div>

          {r.ingredients.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-card mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ingredients</p>
              <ul className="space-y-1.5">
                {r.ingredients.map(ing => (
                  <li key={ing.id} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-gray-800">{ing.name}</span>
                    <span className="text-gray-400 text-xs flex-shrink-0">{ing.quantity} {ing.unit} {ing.calories > 0 ? `· ${ing.calories}kcal` : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasNutrients && (
            <div className="bg-white rounded-2xl p-4 shadow-card mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Nutrients <span className="normal-case font-normal">(per portion)</span></p>
              <div className="grid grid-cols-3 gap-2">
                {NUTRIENT_FIELDS.filter(f => nut[f.key] > 0).map(({ key, label, unit }) => (
                  <div key={key} className="text-center">
                    <p className="text-sm font-bold text-gray-900">{nut[key]}{unit}</p>
                    <p className="text-[10px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.instructions && (
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Instructions</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.instructions}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- LIST VIEW ---
  const filtered = filter === 'all' ? recipes : recipes.filter(r => r.tags.includes(filter))

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      {/* Category filter tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-none">
        {CATEGORY_FILTERS.map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filter === id ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-200 shadow-sm'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 py-2 space-y-2">
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            {filter === 'all' ? 'No recipes yet. Add your first one!' : `No ${filter} recipes yet.`}
          </p>
        )}
        {filtered.map(r => (
          <button key={r.id} onClick={() => openDetail(r)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card text-left hover:bg-cream-dark transition-colors">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{r.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10}/> {r.prepTime}m</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Flame size={10}/> {r.calories}kcal</span>
                {r.tags.filter(t => ['breakfast','lunch','dinner','snack'].includes(t)).slice(0,2).map(t => (
                  <span key={t} className="text-[10px] bg-pastel-purple text-pastel-purple-text px-1.5 py-0.5 rounded-full capitalize">{t}</span>
                ))}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
        <button onClick={openNew}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-sm font-medium">
          <Plus size={16} /> New recipe
        </button>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, color = 'text-gray-700', bg = 'bg-white' }) {
  return (
    <div className={`${bg} rounded-2xl p-3 shadow-card flex flex-col items-center gap-1`}>
      <span className={`${color} opacity-60`}>{icon}</span>
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  )
}
