import { Bell, BellOff, Moon, Sunrise, Utensils, Dumbbell } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_NOTIFICATIONS } from '../../store/appStore'

const REMINDER_CONFIG = [
  {
    key: 'sleepReminder',
    label: 'Sleep reminder',
    desc: 'Wind down and prepare for bed',
    Icon: Moon,
    color: 'bg-pastel-purple text-pastel-purple-text',
  },
  {
    key: 'morningReminder',
    label: 'Morning reminder',
    desc: 'Start your morning routine',
    Icon: Sunrise,
    color: 'bg-pastel-yellow text-pastel-yellow-text',
  },
  {
    key: 'mealReminder',
    label: 'Meal reminder',
    desc: 'Log your meals and hit your calorie goal',
    Icon: Utensils,
    color: 'bg-pastel-green text-pastel-green-text',
  },
  {
    key: 'workoutReminder',
    label: 'Workout reminder',
    desc: 'Time to move and exercise',
    Icon: Dumbbell,
    color: 'bg-pastel-blue text-pastel-blue-text',
  },
]

export default function Notifications() {
  const [notifs, setNotifs] = useLocalStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS)

  const toggle = (key) =>
    setNotifs(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))

  const setTime = (key, time) =>
    setNotifs(prev => ({ ...prev, [key]: { ...prev[key], time } }))

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-gray-400 px-1">
          Notification times are saved locally. Enable browser notifications when prompted to receive them.
        </p>

        {REMINDER_CONFIG.map(({ key, label, desc, Icon, color }) => {
          const notif = notifs[key] || { enabled: false, time: '09:00' }
          return (
            <div key={key} className={`bg-white rounded-3xl p-4 shadow-card transition-opacity ${notif.enabled ? '' : 'opacity-70'}`}>
              <div className="flex items-center gap-3">
                <span className={`flex items-center justify-center w-10 h-10 rounded-2xl flex-shrink-0 ${color.split(' ')[0]}`}>
                  <Icon size={18} className={color.split(' ')[1]} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
                    ${notif.enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
                  aria-label={notif.enabled ? 'Disable' : 'Enable'}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                      ${notif.enabled ? 'translate-x-5.5' : 'translate-x-0.5'}`}
                    style={{ transform: notif.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>

              {notif.enabled && (
                <div className="mt-3 flex items-center gap-2 pl-13">
                  <Bell size={13} className="text-gray-400 flex-shrink-0 ml-[52px]" />
                  <input
                    type="time"
                    value={notif.time}
                    onChange={e => setTime(key, e.target.value)}
                    className="flex-1 bg-cream-dark rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
