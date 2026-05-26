import { useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, FINANCE_CATEGORIES, FINANCE_CATEGORY_COLORS } from '../../store/appStore'

export default function Overview() {
  const [txns] = useLocalStorage(STORAGE_KEYS.TRANSACTIONS, [])
  const [monthOffset, setMonthOffset] = useState(0)

  const base = new Date()
  const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1)
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const monthLabel = format(month, 'MMMM yyyy')

  const monthTxns = useMemo(() => txns.filter(t => {
    try {
      const d = parseISO(t.date)
      return d >= monthStart && d <= monthEnd
    } catch { return false }
  }), [txns, monthOffset])

  const totalIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = totalIncome - totalExpense

  // Spending by category (expenses only)
  const byCategory = useMemo(() => {
    const map = {}
    monthTxns.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map)
      .map(([cat, amount]) => ({ cat, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthTxns])

  const maxBar = byCategory[0]?.amount || 1

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3 space-y-4">

        {/* Month selector */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMonthOffset(o => o - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark text-gray-500">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-800">{monthLabel}</span>
          <button
            onClick={() => setMonthOffset(o => o + 1)}
            disabled={monthOffset >= 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-dark text-gray-500 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <SummaryCard
            label="Income"
            value={totalIncome}
            icon={<TrendingUp size={14} className="text-pastel-green-text" />}
            bg="bg-pastel-green"
            textColor="text-pastel-green-text"
            prefix="+"
          />
          <SummaryCard
            label="Expenses"
            value={totalExpense}
            icon={<TrendingDown size={14} className="text-pastel-coral-text" />}
            bg="bg-pastel-coral"
            textColor="text-pastel-coral-text"
            prefix="−"
          />
          <SummaryCard
            label="Net"
            value={Math.abs(net)}
            icon={<Minus size={14} className={net >= 0 ? 'text-pastel-green-text' : 'text-pastel-coral-text'} />}
            bg={net >= 0 ? 'bg-pastel-green' : 'bg-pastel-coral'}
            textColor={net >= 0 ? 'text-pastel-green-text' : 'text-pastel-coral-text'}
            prefix={net >= 0 ? '+' : '−'}
          />
        </div>

        {/* Spending by category */}
        {byCategory.length > 0 ? (
          <div className="bg-white rounded-3xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Spending by category</h3>
            <div className="space-y-2.5">
              {byCategory.map(({ cat, amount }) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{cat}</span>
                    <span className="text-xs font-bold text-gray-800">CHF {amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / maxBar) * 100}%`,
                        backgroundColor: FINANCE_CATEGORY_COLORS[cat] || '#888',
                        opacity: 0.75,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-4 shadow-card text-center">
            <p className="text-gray-400 text-sm py-4">No transactions this month</p>
          </div>
        )}

        {/* Recent transactions preview */}
        {monthTxns.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">This month</h3>
            <div className="space-y-1">
              {[...monthTxns]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map(t => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-cream-dark last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{t.description || t.category}</p>
                      <p className="text-[10px] text-gray-400">{format(parseISO(t.date), 'MMM d')} · {t.category}</p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ml-2 ${t.type === 'income' ? 'text-pastel-green-text' : 'text-pastel-coral-text'}`}>
                      {t.type === 'income' ? '+' : '−'} CHF {t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
            {monthTxns.length > 5 && (
              <p className="text-xs text-gray-400 text-center mt-2">+{monthTxns.length - 5} more — see Transactions tab</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon, bg, textColor, prefix }) {
  return (
    <div className={`${bg} rounded-2xl p-3`}>
      <div className="flex items-center gap-1 mb-1.5">
        {icon}
        <span className={`text-[10px] font-semibold ${textColor} uppercase tracking-wide`}>{label}</span>
      </div>
      <p className={`text-sm font-bold ${textColor} leading-tight`}>
        {prefix} {value.toFixed(0)}
      </p>
      <p className={`text-[10px] ${textColor} opacity-70`}>CHF</p>
    </div>
  )
}
