import { useState } from 'react'
import WeeklyView from '../components/calendar/WeeklyView'
import Routines from '../components/calendar/Routines'
import SubTabBar from '../components/SubTabBar'
import Overview from '../components/finances/Overview'
import Transactions from '../components/finances/Transactions'

const SUBTABS = [
  { id: 'weekly',   label: 'Week'     },
  { id: 'routines', label: 'Routines' },
  { id: 'finances', label: 'Finances' },
]

const FINANCE_TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'transactions', label: 'Transactions' },
]

export default function CalendarTab() {
  const [subtab, setSubtab] = useState('weekly')
  const [financeTab, setFinanceTab] = useState('overview')

  return (
    <div className="h-full flex flex-col bg-cream">
      {/* Subtab bar */}
      <div className="flex gap-1.5 px-4 pt-5 pb-3 bg-cream safe-top flex-shrink-0">
        {SUBTABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubtab(id)}
            className={`flex-1 py-2 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-150
              ${subtab === id
                ? 'bg-gray-900 text-white shadow-soft'
                : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Subtab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {subtab === 'weekly'   && <WeeklyView />}
        {subtab === 'routines' && <Routines />}
        {subtab === 'finances' && (
          <div className="flex flex-col h-full">
            <div className="px-4 pt-1 pb-2 flex items-center gap-2 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900">Finances</h2>
              <span className="text-xs text-gray-400">CHF</span>
            </div>
            <SubTabBar tabs={FINANCE_TABS} active={financeTab} onChange={setFinanceTab} />
            <div className="flex-1 overflow-hidden">
              {financeTab === 'overview'     && <Overview />}
              {financeTab === 'transactions' && <Transactions />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
