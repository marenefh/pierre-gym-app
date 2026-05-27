import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) return JSON.parse(item)
      // Key doesn't exist yet — persist the initial value so other
      // components reading the same key see it immediately.
      window.localStorage.setItem(key, JSON.stringify(initialValue))
      return initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      setStoredValue(valueToStore)
    } catch (error) {
      console.error('localStorage write failed for key:', key, error)
      // Do NOT update React state — keeps in-memory state consistent with storage
    }
  }

  return [storedValue, setValue]
}
