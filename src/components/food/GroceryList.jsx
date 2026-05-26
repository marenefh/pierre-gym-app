import { useState, useMemo } from 'react'
import { format, startOfWeek } from 'date-fns'
import { Plus, X, ShoppingCart, RefreshCw } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, UNITS } from '../../store/appStore'

function uid() { return Math.random().toString(36).slice(2) }
function weekKey(d) { return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd') }

const GROCERY_TYPES = ['Produce', 'Frozen', 'Dairy', 'Meat & Fish', 'Bakery', 'Pantry', 'Drinks', 'Other']

export default function GroceryList() {
  const [plan] = useLocalStorage(STORAGE_KEYS.MEAL_PREP_PLAN, {})
  const [recipes] = useLocalStorage(STORAGE_KEYS.RECIPES, [])
  const [extras, setExtras] = useLocalStorage(STORAGE_KEYS.GROCERY_EXTRAS, {})
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: 'piece', type: '' })
  const [addingItem, setAddingItem] = useState(false)

  const wk = weekKey(new Date())
  const weekExtras = extras[wk] || []

  // Auto-generate from meal prep plan
  const generated = useMemo(() => {
    const weekPlan = plan[wk] || {}
    const agg = {}
    Object.values(weekPlan).forEach(daySlots => {
      ['lunch', 'dinner'].forEach(meal => {
        const slot = daySlots?.[meal]
        if (!slot) return
        const recipe = recipes.find(r => r.id === slot.recipeId)
        if (!recipe) return
        const scale = (slot.portions || 1) / (recipe.portions || 1)
        recipe.ingredients?.forEach(ing => {
          const key = `${ing.name.toLowerCase()}|${ing.unit}`
          if (!agg[key]) agg[key] = { id: key, name: ing.name, unit: ing.unit, quantity: 0, checked: false, auto: true }
          const qty = parseFloat(ing.quantity) || 0
          agg[key].quantity += qty * scale
        })
      })
    })
    return Object.values(agg).map(item => ({ ...item, quantity: Math.round(item.quantity * 10) / 10 }))
  }, [plan, recipes, wk])

  const [checkedAuto, setCheckedAuto] = useState({})

  const toggleAuto   = (key) => setCheckedAuto(prev => ({ ...prev, [key]: !prev[key] }))
  const toggleExtra  = (id)  => setExtras(prev => ({ ...prev, [wk]: (prev[wk] || []).map(i => i.id === id ? { ...i, checked: !i.checked } : i) }))
  const deleteExtra  = (id)  => setExtras(prev => ({ ...prev, [wk]: (prev[wk] || []).filter(i => i.id !== id) }))

  const addExtra = () => {
    if (!newItem.name.trim()) return
    setExtras(prev => ({
      ...prev,
      [wk]: [...(prev[wk] || []), { ...newItem, id: uid(), name: newItem.name.trim(), checked: false, type: newItem.type || 'Other' }]
    }))
    setNewItem({ name: '', quantity: '', unit: 'piece', type: '' })
    setAddingItem(false)
  }

  const resetChecked = () => setCheckedAuto({})

  const checkedAutoItems = generated.filter(i => checkedAuto[i.id])
  const checkedExtras    = weekExtras.filter(i => i.checked)
  const uncheckedExtras  = weekExtras.filter(i => !i.checked)
  const totalUnchecked   = generated.filter(i => !checkedAuto[i.id]).length + uncheckedExtras.length

  // Group unchecked extras by type
  const extrasByType = useMemo(() => {
    const groups = {}
    uncheckedExtras.forEach(item => {
      const t = item.type || 'Other'
      if (!groups[t]) groups[t] = []
      groups[t].push(item)
    })
    // Return in GROCERY_TYPES order
    return GROCERY_TYPES.filter(t => groups[t]?.length > 0).map(t => ({ type: t, items: groups[t] }))
  }, [uncheckedExtras])

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-600" />
            <h2 className="text-base font-bold text-gray-900">This week's list</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{totalUnchecked} items left</span>
            <button onClick={resetChecked} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-400" title="Reset checks">
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Auto-generated from meal plan */}
        {generated.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">From meal plan</p>
            <div className="space-y-1.5">
              {generated.map(item => (
                <GroceryItem
                  key={item.id}
                  item={{ ...item, checked: !!checkedAuto[item.id] }}
                  onToggle={() => toggleAuto(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Extra items grouped by type */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Extra items</p>

          {extrasByType.length > 0 ? (
            <div className="space-y-3">
              {extrasByType.map(({ type, items }) => (
                <div key={type}>
                  <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5 px-1">{type}</p>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <GroceryItem key={item.id} item={item} onToggle={() => toggleExtra(item.id)} onDelete={() => deleteExtra(item.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !addingItem && <p className="text-xs text-gray-400 text-center py-2">No extra items yet.</p>
          )}

          {/* Add form */}
          {addingItem ? (
            <div className="bg-white rounded-2xl p-3 shadow-card mt-2">
              <div className="flex gap-2 mb-2">
                <input
                  value={newItem.name}
                  onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addExtra()}
                  placeholder="Item name"
                  autoFocus
                  className="flex-1 bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none"
                />
                <select
                  value={newItem.type}
                  onChange={e => setNewItem(p => ({ ...p, type: e.target.value }))}
                  className="w-28 bg-cream-dark rounded-xl px-2 py-2 text-xs text-gray-700 focus:outline-none"
                >
                  <option value="">Type</option>
                  {GROCERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  value={newItem.quantity}
                  onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
                  placeholder="Qty"
                  className="w-16 bg-cream-dark rounded-xl px-2 py-2 text-xs text-center focus:outline-none"
                />
                <select
                  value={newItem.unit}
                  onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))}
                  className="flex-1 bg-cream-dark rounded-xl px-2 py-2 text-xs focus:outline-none"
                >
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
                <button onClick={addExtra} className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold">Add</button>
                <button onClick={() => setAddingItem(false)} className="px-2 py-2 bg-cream-dark rounded-xl text-gray-500"><X size={13} /></button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-xs font-medium hover:border-gray-300"
            >
              <Plus size={13} /> Add item
            </button>
          )}
        </div>

        {/* Checked / done */}
        {(checkedAutoItems.length + checkedExtras.length) > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Already have / done</p>
            <div className="space-y-1.5 opacity-50">
              {checkedAutoItems.map(item => (
                <GroceryItem key={item.id} item={{ ...item, checked: true }} onToggle={() => toggleAuto(item.id)} />
              ))}
              {checkedExtras.map(item => (
                <GroceryItem key={item.id} item={item} onToggle={() => toggleExtra(item.id)} onDelete={() => deleteExtra(item.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GroceryItem({ item, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-card">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${item.checked ? 'bg-gray-900 border-gray-900' : 'border-gray-300 hover:border-gray-400'}`}
      >
        {item.checked && <span className="text-white text-[10px] font-bold">✓</span>}
      </button>
      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {item.name}
      </span>
      {(item.quantity || item.unit) && (
        <span className="text-xs text-gray-400 flex-shrink-0">{item.quantity} {item.unit}</span>
      )}
      {onDelete && (
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400 flex-shrink-0 p-0.5">
          <X size={12} />
        </button>
      )}
    </div>
  )
}
