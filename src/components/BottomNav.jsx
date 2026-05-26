import { Dumbbell, Home, TrendingUp } from 'lucide-react'

const tabs = [
  { id: 'routines', Icon: Dumbbell,   label: 'Routines' },
  { id: 'home',     Icon: Home,       label: 'Home',    center: true },
  { id: 'progress', Icon: TrendingUp, label: 'Progress' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      className="flex-shrink-0 flex items-end justify-around bg-white border-t border-gray-100 shadow-soft"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      {tabs.map(({ id, Icon, label, center }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center justify-center pt-2 pb-1 transition-all duration-150 focus:outline-none"
            style={{ minWidth: 56, minHeight: 52 }}
            aria-label={label}
          >
            {center ? (
              <span
                className={`flex items-center justify-center rounded-2xl shadow-card transition-all duration-200 w-12 h-10
                  ${active
                    ? 'bg-gray-900 text-white'
                    : 'bg-cream-dark text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              </span>
            ) : (
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.6}
                className={active ? 'text-gray-900' : 'text-gray-400'}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
