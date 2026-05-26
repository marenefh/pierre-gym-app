import { useState } from 'react'
import { ChevronLeft, Moon, Sun, User, Flame, Droplets, BedDouble, Footprints, Plus, Trash2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_HABITS_CONFIG } from '../store/appStore'

function uid() { return Math.random().toString(36).slice(2) }

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function SettingsScreen({ onClose }) {
  const { settings, setSettings } = useAppContext()
  const [local, setLocal] = useState({ ...settings })
  const [habitsConfig, setHabitsConfig] = useLocalStorage(STORAGE_KEYS.HABITS_CONFIG, DEFAULT_HABITS_CONFIG)

  const set = (key, val) => setLocal(prev => ({ ...prev, [key]: val }))

  const save = () => {
    setSettings(local)
    onClose()
  }

  const addHabit = () => {
    setHabitsConfig(prev => [...prev, { id: uid(), name: '', days: [] }])
  }

  const updateHabit = (id, patch) => {
    setHabitsConfig(prev => prev.map(h => h.id === id ? { ...h, ...patch } : h))
  }

  const deleteHabit = (id) => {
    setHabitsConfig(prev => prev.filter(h => h.id !== id))
  }

  const toggleDay = (id, dayIdx) => {
    setHabitsConfig(prev => prev.map(h => {
      if (h.id !== id) return h
      const days = h.days.includes(dayIdx)
        ? h.days.filter(d => d !== dayIdx)
        : [...h.days, dayIdx].sort((a, b) => a - b)
      return { ...h, days }
    }))
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-cream" style={{ paddingTop: 'env(safe-area-inset-top,0px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-dark text-gray-500">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Settings</h1>
        <button onClick={save}
          className="px-4 py-1.5 rounded-xl bg-gray-900 text-white text-sm font-semibold">
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-safe">

        {/* Profile */}
        <Section label="Profile">
          <Row icon={<User size={16} className="text-pastel-purple-text" />} label="Your name">
            <input
              value={local.name}
              onChange={e => set('name', e.target.value)}
              className="flex-1 text-right text-sm text-gray-800 focus:outline-none bg-transparent"
              placeholder="Name"
            />
          </Row>
        </Section>

        {/* Goals */}
        <Section label="Goals">
          <Row icon={<Flame size={16} className="text-pastel-coral-text" />} label="Calorie goal">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={local.calorieGoal}
                onChange={e => set('calorieGoal', Number(e.target.value))}
                className="w-20 text-right text-sm text-gray-800 focus:outline-none bg-transparent"
                min={0} step={50}
              />
              <span className="text-xs text-gray-400">kcal</span>
            </div>
          </Row>
          <Row icon={<Droplets size={16} className="text-pastel-blue-text" />} label="Water goal">
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={local.waterGoalMl}
                onChange={e => set('waterGoalMl', Number(e.target.value))}
                className="w-20 text-right text-sm text-gray-800 focus:outline-none bg-transparent"
                min={0} step={100}
              />
              <span className="text-xs text-gray-400">ml</span>
            </div>
          </Row>
          <Row icon={<Footprints size={16} className="text-pastel-yellow-text" />} label="Steps goal" divider={false}>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={local.stepsGoal}
                onChange={e => set('stepsGoal', Number(e.target.value))}
                className="w-24 text-right text-sm text-gray-800 focus:outline-none bg-transparent"
                min={0} step={500}
              />
              <span className="text-xs text-gray-400">steps</span>
            </div>
          </Row>
        </Section>

        {/* Habits */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1 mb-1.5">Habits</p>
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {habitsConfig.map((habit, idx) => (
              <div key={habit.id} className={`px-4 py-3 ${idx < habitsConfig.length - 1 ? 'border-b border-cream-dark' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={habit.name}
                    onChange={e => updateHabit(habit.id, { name: e.target.value })}
                    placeholder="Habit name"
                    className="flex-1 text-sm font-medium text-gray-800 focus:outline-none bg-transparent"
                  />
                  <button onClick={() => deleteHabit(habit.id)} className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DAY_LABELS.map((label, dayIdx) => {
                    const active = habit.days.includes(dayIdx)
                    return (
                      <button
                        key={dayIdx}
                        onClick={() => toggleDay(habit.id, dayIdx)}
                        className={`w-8 h-7 rounded-lg text-xs font-semibold transition-colors
                          ${active ? 'bg-gray-900 text-white' : 'bg-cream-dark text-gray-400'}`}
                      >
                        {label}
                      </button>
                    )
                  })}
                  <span className="text-[10px] text-gray-300 ml-1">
                    {habit.days.length === 0 ? 'every day' : ''}
                  </span>
                </div>
              </div>
            ))}
            <button
              onClick={addHabit}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:bg-cream-dark transition-colors border-t border-cream-dark"
            >
              <Plus size={14} /> Add habit
            </button>
          </div>
        </div>

        {/* Sleep */}
        <Section label="Sleep">
          <Row icon={<BedDouble size={16} className="text-pastel-purple-text" />} label="Sleep hours" divider={false}>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={local.sleepHours}
                onChange={e => set('sleepHours', Number(e.target.value))}
                className="w-16 text-right text-sm text-gray-800 focus:outline-none bg-transparent"
                min={4} max={12} step={0.5}
              />
              <span className="text-xs text-gray-400">hrs</span>
            </div>
          </Row>
        </Section>

        {/* Appearance */}
        <Section label="Appearance">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className={`flex items-center justify-center w-8 h-8 rounded-xl ${local.darkMode ? 'bg-gray-700' : 'bg-pastel-yellow'}`}>
                {local.darkMode
                  ? <Moon size={16} className="text-white" />
                  : <Sun size={16} className="text-pastel-yellow-text" />
                }
              </span>
              <span className="text-sm font-medium text-gray-800">Dark mode</span>
            </div>
            <Toggle value={local.darkMode} onChange={v => set('darkMode', v)} />
          </div>
        </Section>

        {/* App info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-300 font-medium">My Planner</p>
          <p className="text-xs text-gray-300 mt-0.5">All your data lives on-device</p>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1 mb-1.5">{label}</p>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden divide-y divide-cream-dark">
        {children}
      </div>
    </div>
  )
}

function Row({ icon, label, children, divider = true }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-cream-dark flex-shrink-0">
          {icon}
        </span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-gray-900' : 'bg-gray-200'}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 absolute top-0.5
        ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )
}
