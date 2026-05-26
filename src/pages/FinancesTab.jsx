import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import SubTabBar from '../components/SubTabBar'
import Transactions from '../components/finances/Transactions'
import Overview from '../components/finances/Overview'

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
]

export default function FinancesTab({ onClose }) {
  const [subtab, setSubtab] = useState('overview')

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-cream" style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-dark text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Finances</h1>
        <span className="text-xs text-gray-400 ml-1">CHF</span>
      </div>

      <SubTabBar tabs={TABS} active={subtab} onChange={setSubtab} />

      <div className="flex-1 overflow-hidden">
        {subtab === 'overview'     && <Overview />}
        {subtab === 'transactions' && <Transactions />}
      </div>
    </div>
  )
}
