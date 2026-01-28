import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  effectiveTheme: "light" | "dark" // The actual resolved theme (system resolved to light or dark)
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  effectiveTheme: "light",
  setTheme: () => {}
})

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = "system" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme")
    return (stored as Theme) || defaultTheme
  })

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    if (defaultTheme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return defaultTheme === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    const root = document.documentElement
    const updateTheme = (isDark: boolean) => {
      root.classList.remove("light", "dark")
      root.classList.add(isDark ? "dark" : "light")
      setEffectiveTheme(isDark ? "dark" : "light")
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      // Set initial theme
      updateTheme(mediaQuery.matches)

      // Listen for system preference changes
      const handleChange = (e: MediaQueryListEvent) => {
        updateTheme(e.matches)
      }

      mediaQuery.addEventListener("change", handleChange)

      // Cleanup listener on unmount or when theme changes
      return () => {
        mediaQuery.removeEventListener("change", handleChange)
      }
    } else {
      root.classList.remove("light", "dark")
      root.classList.add(theme)
      setEffectiveTheme(theme === "dark" ? "dark" : "light")
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}