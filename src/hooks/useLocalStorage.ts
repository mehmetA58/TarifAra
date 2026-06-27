import { useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initial
    } catch {
      return initial
    }
  })

  function setValue(val: T | ((prev: T) => T)) {
    try {
      const next = typeof val === 'function' ? (val as (prev: T) => T)(stored) : val
      setStored(next)
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // ignore write errors
    }
  }

  return [stored, setValue]
}
