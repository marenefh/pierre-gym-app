import { createContext, useContext, useState, useEffect } from 'react'
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../store/appStore'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [settings, setSettingsRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
    } catch { return DEFAULT_SETTINGS }
  })

  const setSettings = (patch) => {
    setSettingsRaw(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next))
      return next
    })
  }

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!settings.darkMode)
  }, [settings.darkMode])

  return (
    <AppContext.Provider value={{ settings, setSettings }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
