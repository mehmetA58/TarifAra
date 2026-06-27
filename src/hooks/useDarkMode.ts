import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useDarkMode(): [boolean, () => void] {
  const prefersDark =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  const [dark, setDark] = useLocalStorage<boolean>('dark-mode', prefersDark)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : ''
  }, [dark])

  const toggle = () => setDark((d: boolean) => !d)
  return [dark, toggle]
}
