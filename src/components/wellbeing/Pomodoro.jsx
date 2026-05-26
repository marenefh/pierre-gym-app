import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings, X } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { STORAGE_KEYS, DEFAULT_POMODORO } from '../../store/appStore'

export default function Pomodoro() {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO)
  const [isBreak, setIsBreak] = useState(false)
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [draft, setDraft] = useState(settings)
  const intervalRef = useRef(null)

  // Reset when settings change
  useEffect(() => {
    setTimeLeft((isBreak ? settings.breakMinutes : settings.workMinutes) * 60)
    setIsRunning(false)
  }, [settings])

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t > 1) return t - 1
          return 0
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  // Handle completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      if (!isBreak) setSessions(s => s + 1)
      const nextBreak = !isBreak
      setIsBreak(nextBreak)
      setTimeLeft((nextBreak ? settings.breakMinutes : settings.workMinutes) * 60)
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
    }
  }, [timeLeft, isRunning])

  const reset = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(settings.workMinutes * 60)
  }

  const saveSettings = () => {
    setSettings(draft)
    setShowSettings(false)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const totalSecs = (isBreak ? settings.breakMinutes : settings.workMinutes) * 60
  const progress = 1 - timeLeft / totalSecs
  const circumference = 2 * Math.PI * 90

  const workColor = '#7c5cbf'   // pastel purple
  const breakColor = '#3d9c5a'  // pastel green
  const color = isBreak ? breakColor : workColor
  const bgColor = isBreak ? '#e2f5e8' : '#e8e0f5'
  const textColor = isBreak ? 'text-pastel-green-text' : 'text-pastel-purple-text'
  const bgClass = isBreak ? 'bg-pastel-green' : 'bg-pastel-purple'

  return (
    <div className="h-full overflow-y-auto tab-content pb-safe">
      <div className="flex flex-col items-center px-4 py-4 gap-4">

        {/* Mode badge */}
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${bgClass} ${textColor}`}>
          {isBreak ? 'Break time' : 'Focus'}
        </div>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          <svg width="220" height="220" className="absolute inset-0 -rotate-90">
            <circle cx="110" cy="110" r="90" fill="none" stroke={bgColor} strokeWidth="8" />
            <circle
              cx="110" cy="110" r="90" fill="none"
              stroke={color} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="text-center z-10">
            <p className={`text-5xl font-bold tabular-nums tracking-tight ${textColor}`}>{mm}:{ss}</p>
            <p className="text-xs text-gray-400 mt-1">
              {isBreak ? `${settings.breakMinutes}m break` : `${settings.workMinutes}m session`}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-soft text-gray-500 hover:bg-cream-dark">
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setIsRunning(r => !r)}
            className={`w-16 h-16 flex items-center justify-center rounded-3xl shadow-card text-white transition-colors ${isBreak ? 'bg-pastel-green-text' : 'bg-pastel-purple-text'}`}
          >
            {isRunning ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" />}
          </button>
          <button onClick={() => { setDraft(settings); setShowSettings(true) }}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-soft text-gray-500 hover:bg-cream-dark">
            <Settings size={20} />
          </button>
        </div>

        {/* Session count */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < sessions ? 'bg-pastel-purple-text' : 'bg-gray-200'}`} />
          ))}
          {sessions > 0 && <span className="text-xs text-gray-400 ml-1">{sessions} session{sessions !== 1 ? 's' : ''}</span>}
        </div>

        {/* Tip */}
        <div className="bg-white rounded-3xl p-4 shadow-card w-full text-center">
          <p className="text-xs text-gray-400">
            {isBreak
              ? 'Step away, stretch, drink water. You earned it.'
              : 'Close distractions. One task at a time.'}
          </p>
        </div>

      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowSettings(false) }}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 space-y-4"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom,0px),24px)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-base">Timer settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 rounded-xl hover:bg-cream-dark text-gray-500"><X size={16} /></button>
            </div>
            {[['Work duration', 'workMinutes', 5, 60], ['Break duration', 'breakMinutes', 1, 30]].map(([label, key, min, max]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{draft[key]}m</span>
                </div>
                <input type="range" min={min} max={max} step={1}
                  value={draft[key]}
                  onChange={e => setDraft(d => ({ ...d, [key]: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-cream-dark rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full" />
              </div>
            ))}
            <button onClick={saveSettings} className="w-full bg-gray-900 text-white py-3 rounded-2xl text-sm font-semibold">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
