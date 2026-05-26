import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, X, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, FINANCE_CATEGORIES } from '../../store/appStore'

function uid() { return Math.random().toString(36).slice(2) }

const TODAY = format(new Date(), 'yyyy-MM-dd')

const BLANK = {
  date: TODAY, amount: '', category: '',
  description: '', type: 'expense',
}

export default function Transactions() {
  const [txns, setTxns] = useLocalStorage(STORAGE_KEYS.TRANSACTIONS, [])
  const [modal, setModal] = useState(null)
  const [draft, setDraft] = useState(BLANK)

  const sorted = [...txns].sort((a, b) => b.date.localeCompare(a.date))

  const openNew = () => { setDraft({ ...BLANK, id: uid() }); setModal('new') }
  const openEdit = (t) => { setDraft({ ...t }); setModal(t.id) }

  const save = () => {
    if (!draft.amount || isNaN(Number(draft.amount))) return
    const t = { ...draft, amount: Math.abs(Number(draft.amount)), category: draft.category || 'Other' }
    setTxns(prev =>
      prev.find(x => x.id === t.id) ? prev.map(x => x.id === t.id ? t : x) : [...prev, t]
    )
    setModal(null)
  }

  const del = (id) => { setTxns(prev => prev.filter(x => x.id !== id)); setModal(null) }

  const groups = sorted.reduce((acc, t) => {
    const key = t.date
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3 space-y-4">

        {/* Add button at top */}
        <button onClick={openNew}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 text-sm font-medium">
          <Plus size={16} /> Add transaction
        </button>

        {Object.keys(groups).length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
        )}

        {Object.entries(groups).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
              {format(parseISO(date), 'EEEE, MMMM d')}
            </p>
            <div className="space-y-1.5">
              {items.map(t => (
                <button key={t.id} onClick={() => openEdit(t)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-card text-left hover:bg-cream-dark transition-colors">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${t.type === 'income' ? 'bg-pastel-green' : 'bg-pastel-coral'}`}>
                    {t.type === 'income'
                      ? <TrendingUp size={14} className="text-pastel-green-text" />
                      : <TrendingDown size={14} className="text-pastel-coral-text" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.description || t.category}</p>
                    <p className="text-xs text-gray-400">{t.category}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-pastel-green-text' : 'text-pastel-coral-text'}`}>
                    {t.type === 'income' ? '+' : '−'} CHF {Number(t.amount).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 space-y-3.5"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px),24px)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{modal === 'new' ? 'New transaction' : 'Edit transaction'}</h3>
              <div className="flex items-center gap-2">
                {modal !== 'new' && (
                  <button onClick={() => del(draft.id)} className="p-1.5 rounded-xl bg-red-50 text-red-400"><Trash2 size={15} /></button>
                )}
                <button onClick={() => setModal(null)} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500"><X size={16} /></button>
              </div>
            </div>

            {/* Type toggle */}
            <div className="flex gap-2">
              {['expense', 'income'].map(t => (
                <button key={t} onClick={() => setDraft(d => ({ ...d, type: t }))}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold capitalize transition-all
                    ${draft.type === t
                      ? t === 'income' ? 'bg-pastel-green text-pastel-green-text' : 'bg-pastel-coral text-pastel-coral-text'
                      : 'bg-cream-dark text-gray-500'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">CHF</span>
              <input
                type="number" min={0} step={0.05}
                value={draft.amount}
                onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-cream-dark rounded-2xl pl-14 pr-4 py-3 text-lg font-bold text-gray-900 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Category */}
            <select
              value={draft.category}
              onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
              className={`w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm focus:outline-none
                ${draft.category ? 'text-gray-800' : 'text-gray-400'}`}
            >
              <option value="" disabled>Category</option>
              {FINANCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Description */}
            <input
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              placeholder="Description"
              className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />

            {/* Date */}
            <input type="date" value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
              className="w-full bg-cream-dark rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none" />

            <button onClick={save}
              disabled={!draft.amount || isNaN(Number(draft.amount))}
              className="w-full py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40">
              {modal === 'new' ? 'Add transaction' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
